# Ovideo

<div align="center">
  <h3>🎬 Modern Web Video Player</h3>
  <p>A feature-rich online video player with playlist management and playback controls</p>

  <p>
    <img src="https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript">
    <img src="https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB" alt="React">
    <img src="https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white" alt="Vite">
    <img src="https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white" alt="Tailwind CSS">
    <img src="https://img.shields.io/badge/PWA-5A0FC8?style=for-the-badge&logo=pwa&logoColor=white" alt="PWA">
  </p>
</div>

---

![dark](./docs/dark.png)

## ✨ Features

### 🎯 Core Functionality
- **📁 Local File Support** - Import single or multiple video files with automatic playlist generation
- **🗂️ Folder Import** - Bulk import entire directories while preserving relative paths
- **🌐 Remote Streaming** - Add online video URLs (HTTP/HTTPS) and mix with local files
- **📋 Playlist Management** - Quick switching between playlist items with current item highlighting
- **⚡ Playback Controls** - Variable speed playback (0.5x - 2x) with consistent cross-platform experience

### 🎨 User Experience
- **🌓 Theme Support** - Automatic dark/light theme switching
- **🌍 Internationalization** - Multi-language support (English/Chinese)
- **📱 Responsive Design** - Optimized for desktop and mobile devices
- **🎪 Drag & Drop** - Intuitive file dropping interface
- **🔄 Modern UI** - Built with shadcn/ui and Radix Primitives
- **📲 PWA Support** - Installable as a native app with offline capabilities

## 🚀 Getting Started

### Prerequisites

- Node.js 22.13+ or 24+ (Node.js 24 recommended; run `nvm use`)
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/honkinglin/ovideo.git
   cd ovideo
   ```

2. **Install dependencies**
   ```bash
   npm ci
   ```

3. **Start development server**
   ```bash
   npm run dev
   ```

4. **Open your browser**
   Navigate to `http://localhost:5173`

## 📱 PWA Features

Ovideo is a Progressive Web App (PWA) that can be installed on your device for a native app-like experience:

### Installation
- **Desktop**: Look for the install prompt in the address bar or the install button in the app
- **Mobile**: Use "Add to Home Screen" option in your browser menu
- **Updates**: The app prompts when a new version is available; choose when to apply it.
- **Brand Consistency**: Uses the project logo for all PWA icons across different platforms

### Offline Capabilities
- **Service Worker Caching**: The app shell and playback engine are cached for offline access. Remote video content is not downloaded or cached. Local videos must be selected again after reopening.
- **Font Caching**: Google Fonts are cached for consistent typography
- **Update Prompt**: New versions wait for you to save playback progress and update

### Cross-Platform Support
- **Desktop**: Windows, macOS, Linux (Chrome, Edge, Firefox)
- **Mobile**: iOS (Safari), Android (Chrome, Samsung Internet)
- **Responsive**: Adapts to different screen sizes and orientations

## 🔧 Development

### Available Scripts

- `npm run dev` - Start development server with HMR
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint
- `npm test` - Run import, playlist, URL, and playback regression tests
- `npm run check` - Run lint, tests, and production build
- `npm run test:e2e` - Run desktop/mobile Chromium playback tests after building (uses installed Chrome locally; CI installs Chromium)

### Project Structure

```
src/
├── components/
│   ├── ui/                    # shadcn/ui components
│   │   ├── button.tsx
│   │   ├── card.tsx
│   │   ├── dialog.tsx
│   │   └── ...
│   └── video-player/          # Main video player components
│       ├── index.tsx          # Main player component
│       ├── controls-toolbar.tsx
│       ├── player-surface.tsx
│       ├── playlist-panel.tsx
│       └── hooks/             # Custom React hooks
│           ├── use-video-playback.ts
│           ├── use-video-playlist.ts
│           └── ...
├── lib/
│   └── utils.ts              # Utility functions
└── assets/                   # Static assets
```

### Tech Stack

- **Framework**: React 19 with TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS with CSS Variables
- **UI Components**: shadcn/ui + Radix UI Primitives
- **Video Processing**: mpegts.js for MPEG-TS support
- **Icons**: Lucide React
- **State Management**: React Hooks (useState, useReducer)
- **PWA**: Vite PWA Plugin with Workbox for Service Worker and caching

## 🚀 Deployment

### Build for Production

```bash
npm run build
```

The built files will be in the `dist/` directory, ready for deployment to any static hosting service.

### Deploy to Popular Platforms

<details>
<summary><strong>Vercel</strong></summary>

1. Push your code to GitHub
2. Connect your repository to Vercel
3. Deploy automatically on every push

</details>

<details>
<summary><strong>Netlify</strong></summary>

1. Build the project: `npm run build`
2. Drag and drop the `dist` folder to Netlify
3. Or connect your Git repository for automatic deployments

</details>

<details>
<summary><strong>GitHub Pages</strong></summary>

1. Install gh-pages: `npm install --save-dev gh-pages`
2. Add deploy script to package.json:
   ```json
   "scripts": {
     "deploy": "gh-pages -d dist"
   }
   ```
3. Run: `npm run build && npm run deploy`

</details>

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [shadcn/ui](https://ui.shadcn.com/) for the beautiful UI components
- [Radix UI](https://www.radix-ui.com/) for accessible primitives
- [Lucide](https://lucide.dev/) for the icon system
- [mpegts.js](https://github.com/xqq/mpegts.js) for MPEG-TS support

---

<div align="center">
  <p>Made with ❤️ by <a href="https://github.com/honkinglin">honkinglin</a></p>
  <p>⭐ Star this repository if you find it helpful!</p>
</div>

## Playback and storage notes

- Online sources must be direct HTTP/HTTPS media URLs, not website pages. Playback depends on browser codecs and server access rules; HLS/DASH adapters are not included.
- Local file progress is matched by relative path/name, size, and modification time. Select the same files again to resume; the app does not retain file access or store video bytes.
- Remote URLs (including any query parameters) and the latest 200 progress entries are saved in browser localStorage. Clearing the playlist removes saved remote URLs; clearing site data removes all history and preferences.
- Storage failures do not prevent playback. Videos within three seconds of the end restart from the beginning.
- Deployment paths use `VITE_BASE` consistently for assets, manifest scope, and launch URL. For GitHub Pages use `VITE_BASE=/ovideo/ npm run build`.
- Development service workers are disabled to avoid stale development assets. Verify offline behavior using the production preview.

## Dependency maintenance

The existing React 19 / Vite 7 / Tailwind 3 architecture is retained. `package-lock.json` records tested upgrades. `postcss-selector-parser` is overridden to a patched 7.x version to address GHSA-rj75-hqrm-r3gf in Tailwind 3's build chain; remove the override when upstream dependencies no longer require it. Build output and browser tests must pass after updates.

## Subtitles, segment loops, and keyboard controls

Open **Subtitles, segment loop & shortcuts** beneath the video controls.

- Import a UTF-8 `.srt` or `.vtt` file up to 2 MB. SRT is converted locally to WebVTT. Captions use the browser's native video text track, including native fullscreen. You can hide, show, replace, or remove them. Invalid replacements preserve the previous captions.
- Set **A** at the start of a passage, seek forward, then set **B**. B must be at least 0.5 seconds after A; setting B enables the loop. Pause the loop to seek freely, or clear the markers. A-B takes priority over playlist repeat mode.
- Switching videos clears subtitles and A-B markers. Neither is persisted or uploaded. The playback engine may check segment boundaries on media events, so loops are not frame-accurate.

| Key | Action |
| --- | --- |
| Space / K | Play / pause |
| Left / Right | Seek backward / forward 5 seconds |
| Up / Down | Adjust volume by 5% |
| M | Toggle mute |
| F | Enter / exit fullscreen when supported |
| [ / ] | Set A / B |
| Backslash | Clear the segment |

App shortcuts apply when focus is outside inputs, buttons, dialogs, and native video controls. Those elements keep their own keyboard behavior; modifier keys and IME composition are ignored.

## Playlist organization and watch history

- Sort the entire playlist naturally by name/path (for example, 1, 2, 10), or move individual items up/down. Reordering keeps the current video and playback position. Remote item order is retained after reload; local files must be reselected.
- Search matches names and paths. An empty search result offers a clear-search action. Manual reorder is disabled during filtering so hidden items are not moved unexpectedly; the sort menu explicitly sorts the whole list.
- Removing an item offers a one-step **Undo removal** action until another removal or playlist clearing. Undo restores its original position without interrupting another selected video. Clearing the playlist also clears the undo state.
- Saved playback positions appear in playlist rows. **Clear watch history** asks for confirmation and removes stored positions without removing the playlist or changing preferences. A paused video does not restore a cleared position on exit; further viewing creates new progress records.
