# Local Documentation Preview

This folder is wired into `docs.html`, so documents stored in the repository can be browsed without leaving the site.

## Supported local previews

- `*.pdf` renders inline in the document viewer.
- `*.md` and `*.markdown` render as readable markdown.
- `*.txt`, `*.json`, `*.yaml`, `*.csv`, and similar text files render in a code-style viewer.

## How to add more files

1. Put the file in a local folder such as `docs-local/`.
2. Add an entry in `docs.json` using either `folder` + `files` or a direct `path`.
3. Open the Documentation page and select the file from its category.

## Notes

External links still work as normal documentation entries.
