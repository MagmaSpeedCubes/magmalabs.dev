# Plan: Make films/ and ecp/ Standalone Deployable Sites

## Context
Both `films/` and `ecp/` currently depend on shared files at the repo root: `/styles.css`, `/script.js`, `/logo.svg`, `/site.json`. All JSON fetches use absolute paths. The goal is to make each subdirectory fully self-contained so it can be transplanted to a different host (e.g., separate GitHub Pages site, different domain) without any external dependencies on the main magmalabs.dev site.

---

## Files to Create / Modify

### Asset copies (per subdirectory)
| File | Action |
|------|--------|
| `films/styles.css` | Copy of root `styles.css` |
| `films/logo.svg` | Copy of root `logo.svg` |
| `films/script.js` | Copy of root `script.js` with 2 fetch-path fixes |
| `films/site.json` | New — standalone nav config |
| `films/films.json` | Copy of root `films.json` (root copy stays for main site) |
| `ecp/styles.css` | Copy of root `styles.css` |
| `ecp/logo.svg` | Copy of root `logo.svg` |
| `ecp/script.js` | Copy of root `script.js` with 1 fetch-path fix |
| `ecp/site.json` | New — standalone nav config |

### HTML updates — relative paths

`films/index.html` (3 changes):
- `href="/logo.svg"` → `href="logo.svg"` (line 8)
- `href="/styles.css"` → `href="styles.css"` (line 9)
- `src="/script.js"` → `src="script.js"` (line 350)

`ecp/index.html` (4 changes):
- `href="/logo.svg"` → `href="logo.svg"` (line 11)
- `href="/styles.css"` → `href="styles.css"` (line 12)
- `src="/images/products/ecp/ecp-logo.png"` → `https://magmalabs.dev/images/products/ecp/ecp-logo.png` (line 397 — image stays served from main site)
- `src="/script.js"` → `src="script.js"` (line 519)

### script.js fetch-path fixes (surgical, in each standalone copy)

Only two fetch calls matter; all others (`/products.json`, `/blog.json`, etc.) are guarded by DOM-selector checks and never fire on films/ecp pages:

| Line | Change | Which copy |
|------|--------|------------|
| 379 | `fetch("/site.json"` → `fetch("site.json"` | both |
| 7719 | `fetch("/films.json"` → `fetch("films.json"` | films only |

### Standalone site.json files

**films/site.json** — minimal nav, external links to magmalabs.dev:
```json
{
  "header": {
    "brand": { "href": "/", "ariaLabel": "Original Films",
      "logo": { "src": "logo.svg", "alt": "Magma Labs logo", "width": 34, "height": 34 },
      "text": "Original Films" },
    "links": [
      { "label": "Films", "href": "/" },
      { "label": "Magma Labs", "href": "https://magmalabs.dev/" }
    ]
  },
  "footer": {
    "brand": { "href": "/", "ariaLabel": "Original Films",
      "logo": { "src": "logo.svg", "alt": "", "width": 34, "height": 34 },
      "text": "Original Films" },
    "columns": [
      { "title": "Films", "links": [{ "label": "All Films", "href": "/" }] },
      { "title": "Magma Labs", "links": [
        { "label": "Home", "href": "https://magmalabs.dev/" },
        { "label": "Blog", "href": "https://magmalabs.dev/blog/" },
        { "label": "Contact", "href": "https://magmalabs.dev/#contact" }
      ]}
    ],
    "fineprint": "© {year} Magma Labs. All rights reserved."
  }
}
```

**ecp/site.json** — ECP nav with absolute magmalabs.dev links:
```json
{
  "header": {
    "brand": { "href": "/", "ariaLabel": "ECP — Magma Labs",
      "logo": { "src": "logo.svg", "alt": "Magma Labs logo", "width": 34, "height": 34 },
      "text": "Magma Labs" },
    "links": [
      { "label": "ECP", "href": "/" },
      { "label": "Magma Labs", "href": "https://magmalabs.dev/" },
      { "label": "Contact", "href": "https://magmalabs.dev/#contact", "desktopClass": "btn small secondary" }
    ]
  },
  "footer": {
    "brand": { "href": "/", "ariaLabel": "ECP — Magma Labs",
      "logo": { "src": "logo.svg", "alt": "", "width": 34, "height": 34 },
      "text": "Magma Labs" },
    "columns": [
      { "title": "Product", "links": [{ "label": "ECP", "href": "/" }] },
      { "title": "Magma Labs", "links": [
        { "label": "Home", "href": "https://magmalabs.dev/" },
        { "label": "Projects", "href": "https://magmalabs.dev/products/" },
        { "label": "Contact", "href": "https://magmalabs.dev/#contact" }
      ]}
    ],
    "fineprint": "© {year} Magma Labs. All rights reserved."
  }
}
```

---

## Notes
- Root `films.json` stays at repo root for the main site. `films/films.json` is the standalone copy.
- Main site's `films/index.html` and `ecp/index.html` will use relative paths — this works correctly on GitHub Pages since pages are served from their respective directories.
- For future films with thumbnails at `/images/films/...`: when deploying standalone, either copy images dir or switch to absolute `https://magmalabs.dev/images/...`.

---

## Verification
1. From `films/`: `python3 -m http.server 8001` → `http://localhost:8001/` — animation plays, nav/footer loads, no 404s.
2. From `ecp/`: `python3 -m http.server 8002` → `http://localhost:8002/` — page loads, nav/footer loads, no 404s.
3. Main site still works: `/films/` and `/ecp/` on the main site serve correctly (relative paths work from subdirectory on GitHub Pages).
