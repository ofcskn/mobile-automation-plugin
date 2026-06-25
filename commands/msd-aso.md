---
description: Run ASO keyword research and metadata optimization for one or all locales
---

Run ASO optimization for the specified app.

Ask: app ID, target locale(s), top 3 competitors.

Steps:
1. Load `skills/optimizing-aso-seo`
2. Load `lenses/aso-optimizer.lens.md`
3. Gather: app description draft (read from README or ask user), competitor names
4. Run the ASO optimizer lens for the primary locale first, then each additional locale
5. After user approves output, write to `.msd/metadata/{appId}/ios/{locale}/` and `.msd/metadata/{appId}/android/{locale}/`
6. Validate: `node skills/managing-store-metadata/scripts/validate-metadata.js {appId}`
7. Cross-reference top keywords with `lenses/screenshot-designer.lens.md` for OCR alignment

Run the lens once per locale — keyword research differs by language and market.
