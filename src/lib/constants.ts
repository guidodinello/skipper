/**
 * YouTube selectors for skip buttons and video player elements
 * YouTube frequently changes their DOM structure, so we maintain multiple fallback selectors
 */
export const YOUTUBE_SELECTORS = {
    // Skip ad button selectors (ordered by frequency/reliability)
    SKIP_BUTTON_MODERN: ".ytp-ad-skip-button-modern",
    SKIP_BUTTON_CONTAINER: ".ytp-ad-skip-button-container button",
    SKIP_BUTTON_ALT: ".ytp-skip-ad-button",
    SKIP_BUTTON_LEGACY: ".ytp-ad-skip-button",

    // Continue watching confirmation button
    CONTINUE_WATCHING: 'button[aria-label*="Continue"]',
    CONTINUE_WATCHING_ALT: ".ytp-continue-watching-button",

    // Video player container (for MutationObserver scope)
    VIDEO_PLAYER: "#movie_player",
    VIDEO_CONTAINER: ".html5-video-player",
} as const;

/**
 * Storage keys for extension settings
 */
export const STORAGE_KEYS = {
    ENABLED: "skipper_enabled",
} as const;

/**
 * Default settings
 */
export const DEFAULT_SETTINGS = {
    enabled: true,
} as const;

/**
 * Timing configurations (in milliseconds)
 */
export const TIMINGS = {
    // How often to check for skip buttons (initial polling before MutationObserver)
    INITIAL_CHECK_INTERVAL: 1000,

    // How long to run initial polling before relying solely on MutationObserver
    INITIAL_POLLING_DURATION: 10000,

    // Delay before clicking skip button (makes it less detectable)
    SKIP_DELAY: 100,

    // Debounce delay for mutation observer
    MUTATION_DEBOUNCE: 100,
} as const;

/**
 * YouTube URL patterns
 */
export const YOUTUBE_PATTERNS = {
    WATCH_PAGE: "*://www.youtube.com/watch*",
} as const;
