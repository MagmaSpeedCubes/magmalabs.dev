# magmalabs.dev

Static tech company site built with pure HTML/CSS/JS.

## Pages

- `index.html` (Landing)
- `products.html`
- `partnerships.html`
- `blog.html`
- `post.html` (Blog post)
- `team.html`

## Run locally

```bash
python3 -m http.server 8080
```

Then open `http://localhost:8080` (matches `.vscode/launch.json`).

## Products data

Edit `products.json` to update what appears on:

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

Edit `partnerships.json` to update what appears on:

- `partnerships.html` (search + tag filters)

Each partnership supports:

- `id` (used for `partnerships.html#id` anchors)
- `name`, `summary`, `description`
- `images.icon`, `images.thumbnail`, `images.gallery` (paths under `images/`)
- `highlights` (array of strings)
- `tags` (array of strings used for filtering/search)
- `partneredAt`, `updatedAt` (ISO dates like `2026-04-10`)

## Blog data

Edit `blog.json` to update what appears on:

- `blog.html` (search + tag filters)

Each post supports:

- `id` (used for `post.html?id=...` links)
- `title`, `summary`
- `images.thumbnail` (path under `images/`)
- `content` (array of paragraph strings; rendered with blank lines)
- `tags` (array of strings used for filtering/search)
- `writtenAt`, `updatedAt` (ISO dates like `2026-04-10`)
- `readMinutes` (number)
