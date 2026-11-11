# Portfolio

Smart's personal site at [9smart.life](https://9smart.life/): a single scrollable page with a short bio, a photo gallery, and contact details. Hand-authored HTML, SCSS, and vanilla JS — no framework.

## Commands

```bash
npm install        # once
npm run sass       # watch SCSS and compile to dist/css/main.css
npm run build:css  # one-shot CSS compile
npm run photos     # publish photos dropped into incoming/<Category>/
npm run images     # regenerate all thumbnails and lightbox sizes
npm run deploy     # build CSS, then push dist/ to GitHub Pages
```

Preview locally with VS Code Live Server (port 5501) or `python3 -m http.server --directory dist`.

## Adding photos

Drop edited exports into `incoming/<Category>/` and run `npm run photos`. The folder name becomes the category and the filename becomes the caption (`winter-stroll-in-japan.jpg` → "Winter Stroll In Japan"). Image processing uses macOS `sips`.

## Layout

- `scss/` — stylesheet source (never edit `dist/css/main.css` directly)
- `dist/` — everything that gets deployed
- `scripts/` — photo publishing
- `docs/adr/`, `CONTEXT.md` — design decisions and vocabulary
