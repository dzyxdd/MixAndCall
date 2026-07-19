---
name: add-mix
description: Add or edit a mix entry in content/mixes.json
---

# Add Mix

1. Edit `content/mixes.json` — append an object:
   - `id`: URL-safe slug (no `# []`)
   - `title`, `mix_tag_list`, `text_list`, `text_list_size`, `notes`, `link_list`
2. Run `npm run validate` and `npm test`
3. Run `npm run build:index` so search picks up the mix body
4. Open PR

Example `text_list` item: `{ "lang": "罗马字", "text": "...", "notes": "" }`
