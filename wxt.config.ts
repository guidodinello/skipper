import { defineConfig } from "wxt";
import tailwindcss from "@tailwindcss/vite";

// See https://wxt.dev/api/config.html
export default defineConfig({
    srcDir: "src",
    modules: ["@wxt-dev/module-svelte"],
    manifest: {
        name: "Skipper",
        description: "Automatically skip YouTube ads by clicking the skip button",
        permissions: ["storage"],
        icons: {
            16: "icons/icon-16.png",
            32: "icons/icon-32.png",
            48: "icons/icon-48.png",
            128: "icons/icon-128.png",
        },
        browser_specific_settings: {
            gecko: {
                id: "skipper@guidodinello.dev",
                // Required by Firefox for all new extensions. This extension does not collect any user data
                // @ts-ignore
                data_collection_permissions: { required: ["none"] },
            },
        },
    },
    vite: () => ({
        plugins: [tailwindcss()],
    }),

    webExt: {
        startUrls: ["https://www.youtube.com/watch?v=dQw4w9WgXcQ"],
    },
});
