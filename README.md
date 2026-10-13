# Medad Style Lab

Twenty-two radically different visual directions for the Medad (مداد) landing page, side by side, to pick one identity.

- `index.html`: the gallery (static thumbnails; hovering a card loads its live page).
- `styles/NN-name/`: each style as a standalone page (`index.html`, `style.css`, `script.js`).
- `shared/`: palette and fonts (`tokens.css`), all Arabic copy (`content.js`), the style navigator, logos and thumbnails.
- `STYLE_BRIEF.md`: the rules every style follows (palette, the brand word «مـــــداد», kashida, copy rules).

## Run locally
Double-click `index.html`; no server or build step is needed. Chrome and Safari work from `file://`. Firefox may block the fonts there, so use a server: `python3 -m http.server` and open http://localhost:8000.

## Deploy (CranL)
A `Dockerfile` serves the folder with nginx on `$PORT`. Pushing to `main` and deploying the CranL app publishes it.
