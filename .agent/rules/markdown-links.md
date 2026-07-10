---
trigger: always_on
description: Always use relative path links instead of absolute/full path links in markdown documentation files.
---

## markdown-links

Rules:
- When linking to local files, directories, or documentation inside markdown files (e.g., `README.md`, files in `docs/`), you MUST use relative path links (e.g., `docs/brd.md` or `../app/frontend/`) instead of absolute/full path links (e.g., `file:///c:/...` or `/c:/...`).
- Clickable relative links ensure the files remain navigable across different developer environments, workspaces, and hosting platforms like GitHub.
