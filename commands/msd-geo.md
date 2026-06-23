---
description: Generate GEO (AI discoverability) content — entity anchor, schema markup, ProductHunt copy, press release
---

Run GEO optimization for the specified app.

Ask: app ID, target user persona, key differentiator.

Steps:
1. Load `skills/optimizing-geo`
2. Load ASO-optimized description from `metadata/{appId}/ios/en-US/description.txt` (or ask user)
3. Load `lenses/geo-optimizer.lens.md`
4. Fill parameters: app name, category, ASO description, user persona, differentiator, store URLs
5. After user approves the entity anchor sentence:
   - Save JSON-LD to `assets/{appId}/schema.json`
   - Save entity anchor to `config/{appId}.config.json` → `geo.entityAnchor`
6. Give user the 30-day action plan

Remind user: the entity anchor sentence must stay consistent across ALL surfaces for 6+ months.
