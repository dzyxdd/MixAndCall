---
name: update-stage
description: Update stage/release song lists in content/
---

# Update Stage / Release

1. Edit `content/stages.json` or `content/releases.json`
2. Keep `song_title_list` titles matching `content/songs.json` `title` when linking is desired
3. `npm run validate` (unknown titles warn, do not fail)
4. PR
