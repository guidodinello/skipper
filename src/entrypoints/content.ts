import { defineContentScript } from 'wxt/utils/define-content-script';
import { clickSkipButton, clickContinueWatching, waitForYouTubePlayer, getPlayerContainer } from '@/lib/youtube';
import { getEnabled, watchEnabled } from '@/lib/storage';
import { logger } from '@/lib/utils/logger';
import { TIMINGS } from '@/lib/constants';

export default defineContentScript({
	matches: ['https://www.youtube.com/*'],

	async main() {
		logger.info('Content script initialized');

		// State
		let isEnabled = await getEnabled();
		let observer: MutationObserver | null = null;
		let initialCheckInterval: number | null = null;

		// Wait for YouTube player to load
		try {
			await waitForYouTubePlayer();
			logger.info('YouTube player detected');
		} catch (err) {
			logger.error('Failed to detect YouTube player', err);
			return;
		}

		/**
		 * Attempts to click skip buttons and continue watching buttons
		 */
		function tryClickButtons() {
			if (!isEnabled) return;

			const skipped = clickSkipButton();
			if (!skipped) {
				clickContinueWatching();
			}
		}

		/**
		 * Sets up the MutationObserver to watch for ad skip buttons
		 */
		function setupMutationObserver() {
			if (observer) {
				observer.disconnect();
			}

			const playerContainer = getPlayerContainer();
			if (!playerContainer) {
				logger.warn('Player container not found, cannot setup observer');
				return;
			}

			let debounceTimeout: number | null = null;

			observer = new MutationObserver(() => {
				if (!isEnabled) return;

				// Debounce to avoid excessive checks
				if (debounceTimeout) {
					clearTimeout(debounceTimeout);
				}

				debounceTimeout = window.setTimeout(() => {
					tryClickButtons();
				}, TIMINGS.MUTATION_DEBOUNCE);
			});

			observer.observe(playerContainer, {
				childList: true,
				subtree: true,
			});

			logger.info('MutationObserver setup complete');
		}

		/**
		 * Sets up initial polling to catch early ad buttons
		 * Runs for a limited time before relying solely on MutationObserver
		 */
		function setupInitialPolling() {
			// Clear any existing interval
			if (initialCheckInterval) {
				clearInterval(initialCheckInterval);
			}

			// Initial check
			tryClickButtons();

			// Poll for skip buttons during initial load
			initialCheckInterval = window.setInterval(() => {
				tryClickButtons();
			}, TIMINGS.INITIAL_CHECK_INTERVAL);

			// Stop polling after initial duration
			setTimeout(() => {
				if (initialCheckInterval) {
					clearInterval(initialCheckInterval);
					initialCheckInterval = null;
					logger.debug('Initial polling stopped, relying on MutationObserver');
				}
			}, TIMINGS.INITIAL_POLLING_DURATION);
		}

		/**
		 * Starts the skipper functionality
		 */
		function start() {
			logger.info('Skipper started');
			setupMutationObserver();
			setupInitialPolling();
		}

		/**
		 * Stops the skipper functionality
		 */
		function stop() {
			logger.info('Skipper stopped');

			if (observer) {
				observer.disconnect();
				observer = null;
			}

			if (initialCheckInterval) {
				clearInterval(initialCheckInterval);
				initialCheckInterval = null;
			}
		}

		/**
		 * Cleanup on page unload
		 */
		function cleanup() {
			stop();
			logger.info('Content script cleaned up');
		}

		// Handle YouTube SPA navigation (clicking between videos doesn't reload the page)
		async function onNavigate() {
			logger.info('YouTube navigation detected, reinitializing');
			stop();
			try {
				await waitForYouTubePlayer();
				if (isEnabled) start();
			} catch (err) {
				logger.error('Failed to detect YouTube player after navigation', err);
			}
		}

		window.addEventListener('yt-navigate-finish', onNavigate);

		// Watch for settings changes
		const unwatchEnabled = watchEnabled((enabled) => {
			isEnabled = enabled;
			logger.info(`Extension ${enabled ? 'enabled' : 'disabled'}`);

			if (enabled) {
				start();
			} else {
				stop();
			}
		});

		// Start if enabled
		if (isEnabled) {
			start();
		}

		// Cleanup on unload
		window.addEventListener('beforeunload', cleanup);

		// Cleanup function for when content script is unloaded
		return () => {
			cleanup();
			unwatchEnabled();
			window.removeEventListener('yt-navigate-finish', onNavigate);
			window.removeEventListener('beforeunload', cleanup);
		};
	},
});
