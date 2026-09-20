# Skipper

> Automatically skip YouTube ads by clicking the skip button for you

A lightweight browser extension that watches for YouTube skip ad buttons and clicks them instantly, so you never have to. It also dismisses "Continue watching?" confirmation prompts automatically.

## Features

- **Automatic Ad Skipping**: Detects and clicks the skip button the moment it becomes available
- **Continue Watching**: Automatically dismisses YouTube's "Continue watching?" confirmation dialog
- **Multi-Selector Fallback**: Targets multiple known skip button selectors so it keeps working when YouTube changes their DOM
- **Smart Click Detection**: Waits until the skip button is fully visible and enabled (opacity check, disabled/aria-disabled check) before clicking — avoids false triggers during countdown
- **Simulated User Interaction**: Dispatches `mousedown`, `mouseup`, `click`, and pointer events for maximum YouTube compatibility
- **Click Cooldown**: Prevents spam-clicking the same button within a 3-second window
- **Real-Time DOM Watching**: Uses a `MutationObserver` scoped to the YouTube player container for efficient, low-overhead detection
- **Toggle On/Off**: Enable or disable skipping from the popup without reloading the page; state is persisted across sessions
- **Dark Mode**: Popup UI supports system dark mode automatically
- **Cross-Browser**: Works on Chrome/Chromium (MV3) and Firefox (MV2)

## Installation

### From Source

1. Clone the repository:

```bash
git clone https://github.com/guidodinello/skipper.git
cd skipper
```

2. Install dependencies:

```bash
pnpm install
```

3. Build for your browser:

```bash
# For Chrome/Chromium
pnpm build

# For Firefox
pnpm build:firefox
```

4. Load the extension:
    - **Chrome**: Navigate to `chrome://extensions/`, enable "Developer mode", click "Load unpacked", and select the `.output/chrome-mv3` directory
    - **Firefox**: Navigate to `about:debugging#/runtime/this-firefox`, click "Load Temporary Add-on", and select any file in the `.output/firefox-mv2` directory

## Usage

### Basic Usage

1. Visit any YouTube video page (`youtube.com/watch?...`)
2. When an ad plays and a skip button appears, Skipper clicks it automatically
3. If YouTube asks "Continue watching?", Skipper dismisses that too

The extension activates only on YouTube watch pages and does nothing on other sites.

### Enabling / Disabling

Click the Skipper icon in your browser toolbar to open the popup. Use the toggle switch to enable or disable automatic skipping. The setting persists across browser sessions and syncs immediately — no page reload required.

### Checking Logs

Open the browser console on a YouTube watch page and filter for `[Skipper]` to see real-time activity: which selector matched, when a button was clicked, and any detection issues.

## Development

### Prerequisites

- [Node.js](https://nodejs.org/) (v18 or higher)
- [pnpm](https://pnpm.io/) package manager

### Setup

```bash
pnpm install
```

### Development Mode

Run with hot reload (opens `youtube.com/watch?v=dQw4w9WgXcQ` automatically):

```bash
# Chrome
pnpm dev

# Firefox
pnpm dev:firefox

# Chrome (Flatpak install)
pnpm dev:chrome-flatpak
```

### Building

```bash
# Production build for Chrome
pnpm build

# Production build for Firefox
pnpm build:firefox
```

### Creating Distribution Packages

```bash
# Create ZIP for Chrome Web Store
pnpm zip

# Create ZIP for Firefox Add-ons
pnpm zip:firefox
```

### Code Quality

```bash
# Type checking
pnpm check

# Lint code
pnpm lint

# Format code
pnpm format

# Fix lint, format, and type issues in one go
pnpm fix
```

## Technology Stack

- **[WXT](https://wxt.dev/)** - Modern cross-browser extension framework
- **[Svelte 5](https://svelte.dev/)** - Reactive UI with runes API (`$state`, `$effect`, `$derived`)
- **[TypeScript](https://www.typescriptlang.org/)** - Type-safe JavaScript throughout
- **[Tailwind CSS 4](https://tailwindcss.com/)** - Utility-first styling for the popup UI
- **[Vite](https://vitejs.dev/)** - Fast build tool

## Project Structure

```
skipper/
├── src/
│   ├── entrypoints/
│   │   ├── background.ts         # Background service worker
│   │   ├── content.ts            # YouTube content script (MutationObserver + polling)
│   │   └── popup/                # Popup UI
│   │       ├── index.html
│   │       ├── popup.ts
│   │       └── Popup.svelte      # Toggle switch component
│   ├── lib/
│   │   ├── constants.ts          # YouTube selectors, storage keys, timing config
│   │   ├── storage.ts            # Settings persistence (WXT storage API)
│   │   ├── youtube.ts            # DOM interaction: skip + continue-watching logic
│   │   └── utils/
│   │       └── logger.ts         # Centralized logger ([Skipper] prefix)
│   └── public/
│       └── icons/                # Extension icons (16, 32, 48, 128 px)
├── wxt.config.ts                 # WXT + manifest configuration
├── package.json
└── README.md
```

## How It Works

1. **Content script** loads on every `youtube.com/watch?*` page and waits for the YouTube player to appear in the DOM.
2. A **`MutationObserver`** is attached to the player container (`#movie_player`) and fires on any child DOM changes.
3. On each mutation, the script queries a prioritized list of skip button selectors:
    - `.ytp-ad-skip-button-modern`
    - `.ytp-ad-skip-button-container button`
    - `.ytp-skip-ad-button`
    - `.ytp-ad-skip-button` (legacy)
4. A button is only clicked if it passes visibility checks: non-zero dimensions, not hidden, full opacity (1.0), not disabled, and no countdown text.
5. The click is simulated with `mousedown` / `mouseup` / `click` / `pointerdown` / `pointerup` events for compatibility with YouTube's event handlers.
6. A short **initial polling phase** (every 1 s for the first 10 s) catches buttons that appear before the observer is ready, after which the observer takes over exclusively.
7. The **popup toggle** writes to `browser.storage.local`; the content script watches storage changes and starts or stops the observer in real time.

## Browser Support

- Chrome/Chromium: Version 88+ (Manifest V3)
- Firefox: Version 109+ (Manifest V2)
- Edge: Version 88+

## License

MIT License - see [LICENSE](LICENSE) file for details

## Author

**Guido Dinello**

- GitHub: [@guidodinello](https://github.com/guidodinello)
