# magmalabs.dev

Static tech company site built with pure HTML/CSS/JS.

## Pages

- `index.html` (Landing)
- `products.html`
- `partnerships.html`
- `blog.html`
- `blog-builder.html`
- `post.html` (Blog post)
- `team.html`
- `films.html`

## Run locally

```bash
git clone --recurse-submodules <repo-url>
python3 -m http.server 8080
```

Then open `http://localhost:8080` (matches `.vscode/launch.json`).

If you cloned without `--recurse-submodules`, run
`git submodule update --init` to populate `site-data/`.

## Site data (`site-data` submodule)

The shared, page-agnostic assets live in a dedicated repository,
[`magmalabsdev/site-data`](https://github.com/magmalabsdev/site-data),
tracked here as the `site-data/` git submodule. At runtime every page loads them
over the network from that repo's own GitHub Pages, **not** from this repo:

```
https://magmalabsdev.github.io/site-data/styles.css   (stylesheet)
https://magmalabsdev.github.io/site-data/core.js      (universal runtime)
https://magmalabsdev.github.io/site-data/logo.svg     (shared logo)
https://magmalabsdev.github.io/site-data/<name>.json  (content data)
```

`core.js` holds the universal runtime (site chrome/header/footer rendering, host
detection, toast, clipboard) and exposes helpers on `window.MagmaCore`. The
page-specific code stays in this repo's `script.js`, which reads those helpers
from `window.MagmaCore` — so every page loads `core.js` first, then `script.js`.
The site-data base URL is defined once, in `core.js` as `SITE_DATA_BASE`.

### Updating content/styles

1. Edit the files in the `site-data` repo (e.g. `blog.json`, `styles.css`) and
   commit/push to its `main` branch. GitHub Pages republishes automatically — no
   change to this repo is required and the live site picks it up immediately.
2. To refresh the local submodule pin for development, run
   `git submodule update --remote site-data` here and commit the pointer bump.

The managed files are: `core.js`, `styles.css`, `logo.svg`, `site.json`,
`products.json`, `partnerships.json`, `awards.json`, `team.json`, `blog.json`,
`films.json`, and the standalone nav configs `films-site.json` / `ecp-site.json`.

## Standalone films & ecp sites

`films/` and `ecp/` are self-contained: their only runtime dependency is the
`site-data` Pages host (styles, `core.js`, `logo.svg`, and their own nav config),
plus this repo's `script.js`. Each sets its nav config before `core.js` runs:

```html
<script>window.MAGMA_SITE_JSON_URL = "https://magmalabsdev.github.io/site-data/films-site.json";</script>
```

`core.js` reads `window.MAGMA_SITE_JSON_URL` (falling back to `site.json`) to pick
which header/footer nav to render, so each site shows its own chrome.

## Header + footer

Edit `site.json` (in the `site-data` submodule) to update navigation and the
footer columns across every page.

## Products data

Edit `products.json` (in `site-data`) to update what appears on:

- `index.html` (shows the latest 3 by release/update date)
- `products.html` (search + tag filters)

Each product supports:

- `id` (used for `products.html#id` anchors)
- `name`, `summary`, `description`
- `images.icon`, `images.thumbnail`, `images.gallery` (paths under `images/`)
- `features` (array of strings)
- `tags` (array of strings used for filtering/search)
- `releasedAt`, `updatedAt` (ISO dates like `2026-04-10`)

## Partnerships data

Edit `partnerships.json` (in `site-data`) to update what appears on:

- `partnerships.html` (search + tag filters)

Each partnership supports:

- `id` (used for `partnerships.html#id` anchors)
- `name`, `summary`, `description`
- `images.icon`, `images.thumbnail`, `images.gallery` (paths under `images/`)
- `highlights` (array of strings)
- `tags` (array of strings used for filtering/search)
- `partneredAt`, `updatedAt` (ISO dates like `2026-04-10`)

## Blog data

Edit `blog.json` (in `site-data`) to update what appears on:

- `blog.html` (search + tag filters)

Each post supports:

- `id` (used for `post.html?id=...` links)
- `title`, `summary`
- `images.thumbnail` (path under `images/`)
- `content` (array of paragraph strings; rendered with blank lines)
- `tags` (array of strings used for filtering/search)
- `writtenAt`, `updatedAt` (ISO dates like `2026-04-10`)
- `readMinutes` (number)
