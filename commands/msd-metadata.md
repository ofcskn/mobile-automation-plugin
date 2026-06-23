---
description: Update, validate, or sync App Store and Google Play metadata
---

Manage store metadata for the specified app.

Ask: app ID, what to update (description / keywords / release-notes / all), which locales.

Steps:
1. Load `skills/managing-store-metadata`
2. Show current values from `metadata/{appId}/`
3. Edit the requested fields
4. Always run validate immediately after any edit:
   `node skills/managing-store-metadata/scripts/validate-metadata.js {appId}`
5. Fix any ❌ errors before showing user the results

Remind user: Apple description is NOT indexed. Google full description IS indexed.
Never upload metadata until validate-metadata.js exits 0.
