import { storage } from "wxt/utils/storage";
import { STORAGE_KEYS, DEFAULT_SETTINGS } from "@/lib/constants";
import { logger } from "@/lib/utils/logger";

/**
 * Gets the enabled/disabled state of the extension
 * @returns Promise resolving to true if enabled, false if disabled
 */
export async function getEnabled(): Promise<boolean> {
    const value = await storage.getItem<boolean>(`local:${STORAGE_KEYS.ENABLED}`);
    const enabled = value ?? DEFAULT_SETTINGS.enabled;
    logger.debug("getEnabled", enabled);
    return enabled;
}

/**
 * Sets the enabled/disabled state of the extension
 * @param enabled true to enable, false to disable
 */
export async function setEnabled(enabled: boolean): Promise<void> {
    logger.debug("setEnabled", enabled);
    await storage.setItem(`local:${STORAGE_KEYS.ENABLED}`, enabled);
}

/**
 * Toggles the enabled/disabled state of the extension
 * @returns Promise resolving to the new state
 */
export async function toggleEnabled(): Promise<boolean> {
    const current = await getEnabled();
    const newState = !current;
    await setEnabled(newState);
    logger.debug("toggleEnabled", `${current} -> ${newState}`);
    return newState;
}

/**
 * Watches for changes to the enabled/disabled state
 * @param callback Function to call when state changes
 * @returns Cleanup function to stop watching
 */
export function watchEnabled(callback: (enabled: boolean) => void): () => void {
    return storage.watch<boolean>(`local:${STORAGE_KEYS.ENABLED}`, (newValue) => {
        const enabled = newValue ?? DEFAULT_SETTINGS.enabled;
        logger.debug("watchEnabled callback", enabled);
        callback(enabled);
    });
}
