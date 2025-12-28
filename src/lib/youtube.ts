import { YOUTUBE_SELECTORS, TIMINGS } from '@/lib/constants';
import { logger } from '@/lib/utils/logger';

/**
 * Attempts to click the YouTube skip ad button
 * Uses multiple fallback selectors for reliability
 * @returns true if button was found and clicked, false otherwise
 */
export function clickSkipButton(): boolean {
	const selectors = [
		YOUTUBE_SELECTORS.SKIP_BUTTON_MODERN,
		YOUTUBE_SELECTORS.SKIP_BUTTON_CONTAINER,
		YOUTUBE_SELECTORS.SKIP_BUTTON_ALT,
		YOUTUBE_SELECTORS.SKIP_BUTTON_LEGACY,
	];

	for (const selector of selectors) {
		const button = document.querySelector<HTMLButtonElement>(selector);
		if (button && isButtonVisible(button)) {
			logger.action('Skip button found', selector);
			setTimeout(() => {
				button.click();
				logger.info('Successfully clicked skip button');
			}, TIMINGS.SKIP_DELAY);
			return true;
		}
	}

	return false;
}

/**
 * Attempts to click the "Continue watching?" confirmation button
 * @returns true if button was found and clicked, false otherwise
 */
export function clickContinueWatching(): boolean {
	const selectors = [
		YOUTUBE_SELECTORS.CONTINUE_WATCHING,
		YOUTUBE_SELECTORS.CONTINUE_WATCHING_ALT,
	];

	for (const selector of selectors) {
		const button = document.querySelector<HTMLButtonElement>(selector);
		if (button && isButtonVisible(button)) {
			logger.action('Continue watching button found', selector);
			setTimeout(() => {
				button.click();
				logger.info('Successfully clicked continue watching button');
			}, TIMINGS.SKIP_DELAY);
			return true;
		}
	}

	return false;
}

/**
 * Checks if a button element is visible and clickable
 * @param element The button element to check
 * @returns true if the element is visible
 */
function isButtonVisible(element: HTMLElement): boolean {
	const rect = element.getBoundingClientRect();
	const style = window.getComputedStyle(element);

	return (
		rect.width > 0 &&
		rect.height > 0 &&
		style.display !== 'none' &&
		style.visibility !== 'hidden' &&
		style.opacity !== '0'
	);
}

/**
 * Waits for the YouTube player to be available in the DOM
 * @param timeout Maximum time to wait in milliseconds
 * @returns Promise that resolves when player is found or rejects on timeout
 */
export function waitForYouTubePlayer(timeout: number = 10000): Promise<HTMLElement> {
	return new Promise((resolve, reject) => {
		const selectors = [YOUTUBE_SELECTORS.VIDEO_PLAYER, YOUTUBE_SELECTORS.VIDEO_CONTAINER];

		// Check if player already exists
		for (const selector of selectors) {
			const player = document.querySelector<HTMLElement>(selector);
			if (player) {
				logger.debug('YouTube player found immediately', selector);
				resolve(player);
				return;
			}
		}

		// Set up observer to wait for player
		const observer = new MutationObserver(() => {
			for (const selector of selectors) {
				const player = document.querySelector<HTMLElement>(selector);
				if (player) {
					logger.debug('YouTube player found via observer', selector);
					observer.disconnect();
					resolve(player);
					return;
				}
			}
		});

		observer.observe(document.body, {
			childList: true,
			subtree: true,
		});

		// Timeout if player not found
		setTimeout(() => {
			observer.disconnect();
			reject(new Error(`YouTube player not found within ${timeout}ms`));
		}, timeout);
	});
}

/**
 * Finds the YouTube player container element
 * @returns The player container element or null if not found
 */
export function getPlayerContainer(): HTMLElement | null {
	const selectors = [YOUTUBE_SELECTORS.VIDEO_PLAYER, YOUTUBE_SELECTORS.VIDEO_CONTAINER];

	for (const selector of selectors) {
		const player = document.querySelector<HTMLElement>(selector);
		if (player) {
			return player;
		}
	}

	return null;
}
