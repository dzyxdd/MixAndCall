---
name: add-callbook
description: Attach a callbook (prefer text; image allowed) to a song version
---

# Add Callbook

**Prefer text** (`format: table|flow` under `content/callbooks/`). Images are allowed but not recommended.

1. Find the song in `content/songs.json`
2. Under the right `versions[]`, push a callbook:
   - Image: `{ "format": "image", "description": "来源--作者", "src": "assets/call-images/author/stage/song.png" }`
   - Put the file under `content/assets/call-images/...`
3. `npm run validate`
4. PR

Text formats are rendered in a later phase; until then text refs show a placeholder.
