import js from "@eslint/js";
import tseslint from "@typescript-eslint/eslint-plugin";
import tsparser from "@typescript-eslint/parser";
import sveltePlugin from "eslint-plugin-svelte";
import svelteParser from "svelte-eslint-parser";
import globals from "globals";

export default [
    // Ignore patterns
    {
        ignores: [
            ".output/**",
            ".wxt/**",
            "dist/**",
            "node_modules/**",
            "*.config.js",
            "*.config.ts",
        ],
    },

    // JavaScript/TypeScript files
    {
        files: ["**/*.js", "**/*.ts"],
        plugins: {
            "@typescript-eslint": tseslint,
        },
        languageOptions: {
            parser: tsparser,
            parserOptions: {
                ecmaVersion: 2022,
                sourceType: "module",
            },
            globals: {
                ...globals.browser,
                // Extension APIs (browser, chrome)
                ...globals.webextensions,
                // WXT auto-imports
                defineBackground: "readonly",
                defineContentScript: "readonly",
                // Svelte 5 runes
                $state: "readonly",
                $derived: "readonly",
                $effect: "readonly",
                $props: "readonly",
                $bindable: "readonly",
                $inspect: "readonly",
            },
        },
        rules: {
            ...js.configs.recommended.rules,
            ...tseslint.configs.recommended.rules,
            "@typescript-eslint/no-unused-vars": [
                "error",
                {
                    argsIgnorePattern: "^_",
                    varsIgnorePattern: "^_",
                },
            ],
            "@typescript-eslint/no-explicit-any": "warn",
            "no-console": ["warn", { allow: ["warn", "error"] }],
        },
    },

    // Svelte files
    {
        files: ["**/*.svelte"],
        plugins: {
            svelte: sveltePlugin,
            "@typescript-eslint": tseslint,
        },
        languageOptions: {
            parser: svelteParser,
            parserOptions: {
                parser: tsparser,
                extraFileExtensions: [".svelte"],
            },
            globals: {
                ...globals.browser,
                // Extension APIs (browser, chrome)
                ...globals.webextensions,
                // WXT auto-imports
                defineBackground: "readonly",
                defineContentScript: "readonly",
                // Svelte 5 runes
                $state: "readonly",
                $derived: "readonly",
                $effect: "readonly",
                $props: "readonly",
                $bindable: "readonly",
                $inspect: "readonly",
            },
        },
        rules: {
            ...sveltePlugin.configs.recommended.rules,
            ...tseslint.configs.recommended.rules,
            "@typescript-eslint/no-unused-vars": [
                "error",
                {
                    argsIgnorePattern: "^_",
                    varsIgnorePattern: "^_",
                },
            ],
            "@typescript-eslint/no-explicit-any": "warn",
            "no-console": ["warn", { allow: ["warn", "error"] }],
            "svelte/no-at-html-tags": "warn",
        },
    },
];
