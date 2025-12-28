import { YOUTUBE_SELECTORS, TIMINGS } from '@/lib/constants';
import { logger } from '@/lib/utils/logger';

// Track last clicked button to avoid spam clicking
let lastClickedButton: HTMLElement | null = null;
let lastClickTime = 0;
const CLICK_COOLDOWN = 3000; // Don't click the same button within 3 seconds

/**
 * Simulates a user click with mouse events for better compatibility
 * @param element The element to click
 */
function simulateUserClick(element: HTMLElement): void {
	// Try multiple click methods for maximum compatibility

	// Method 1: Mouse events (most reliable for YouTube)
	const mouseEvents = ['mousedown', 'mouseup', 'click'];
	mouseEvents.forEach(eventType => {
		const event = new MouseEvent(eventType, {
			view: window,
			bubbles: true,
			cancelable: true,
			buttons: 1
		});
		element.dispatchEvent(event);
	});

	// Method 2: Pointer events (newer standard)
	const pointerEvents = ['pointerdown', 'pointerup'];
	pointerEvents.forEach(eventType => {
		const event = new PointerEvent(eventType, {
			view: window,
			bubbles: true,
			cancelable: true,
			isPrimary: true
		});
		element.dispatchEvent(event);
	});

	// Method 3: Regular click as fallback
	element.click();
}

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
		if (button) {
			const opacity = window.getComputedStyle(button).opacity;
			const buttonText = button.textContent?.trim() || '';

			// Log button found but not ready
			if (!isButtonClickable(button)) {
				logger.debug('Skip button found but not ready', {
					selector,
					opacity,
					text: buttonText,
					disabled: button.disabled
				});
				continue;
			}

			// Check if button text is ready (should be just "Skip", not "Skip in 5s")
			if (buttonText.includes('in') || /\d/.test(buttonText)) {
				logger.debug('Skip button has countdown', { text: buttonText });
				continue;
			}

			// Check if we already clicked this button recently
			const now = Date.now();
			if (button === lastClickedButton && now - lastClickTime < CLICK_COOLDOWN) {
				logger.debug('Skip button on cooldown, skipping click');
				return false;
			}

			logger.action('Skip button ready to click', {
				selector,
				opacity,
				text: buttonText,
				disabled: button.disabled
			});

			setTimeout(() => {
				simulateUserClick(button);
				lastClickedButton = button;
				lastClickTime = Date.now();
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
		if (button && isButtonClickable(button)) {
			logger.action('Continue watching button found', selector);
			setTimeout(() => {
				simulateUserClick(button);
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
 * @returns true if the element is visible and enabled
 */
function isButtonClickable(element: HTMLElement): boolean {
	const rect = element.getBoundingClientRect();
	const style = window.getComputedStyle(element);

	// Check if button is a HTMLButtonElement and is disabled
	const isDisabled = element instanceof HTMLButtonElement && element.disabled;
	const ariaDisabled = element.getAttribute('aria-disabled') === 'true';

	// YouTube uses opacity to indicate if the button is ready
	// Opacity 0.5 = button visible but not ready, 1.0 = ready to click
	const opacity = parseFloat(style.opacity);
	const isFullyOpaque = opacity >= 0.99; // Allow for small floating point differences

	return (
		rect.width > 0 &&
		rect.height > 0 &&
		style.display !== 'none' &&
		style.visibility !== 'hidden' &&
		isFullyOpaque &&
		!isDisabled &&
		!ariaDisabled
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
