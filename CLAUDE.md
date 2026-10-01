# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Run & Build

- Dev: `npm run dev` (Vite on :5173) then `npm run electron` (separate terminal)
- Build: `npm run build`
- Preview prod build: `npm run preview`

## Architecture

- **Electron main process** (`main.js`): creates BrowserWindow, bypasses CORS (`webSecurity: false`), auto-pairs first BLE device via `select-bluetooth-device`
- **Vite + React renderer** (`src/`): single-page HUD overlay
- **YouTube proxy**: Vite rewrites `/api/yt` → YouTube search results; `src/youtubeService.js` scrapes videoId/title from the proxied HTML
- **BLE HRM**: Web Bluetooth API in `App.jsx`, decodes 8-bit/16-bit heart rate measurement flags

## Key Files

| File | Role |
|---|---|
| `main.js` | Electron main process |
| `src/App.jsx` | All UI + state: video, HRM, search, favorites |
| `src/youtubeService.js` | YouTube search via proxy |
| `vite.config.js` | `/api/yt` proxy config |

## Notes

- No test framework or lint script configured in `package.json` (eslint config exists but isn't wired to a script)
- Favorites persist to `localStorage` under key `bike_HUD_favorites`
- CADENCE and POWER tiles in the UI are placeholders (no sensors yet)
