---
description: Select or update the app's supported locales before metadata, screenshots, or i18n work
---

Select locales for the specified app before any localization work.

Ask: app ID.

Steps:
1. Check `.msd/config/{appId}.config.json` for existing `locales[]` array
2. Load `skills/selecting-app-locales`
3. Show Apple storefront table (`skills/selecting-app-locales/references/apple-storefronts.md`)
   and Android locale list (`skills/selecting-app-locales/references/android-locales.md`)
4. Ask user: "Which locales should this app support?"
5. Run: `node skills/selecting-app-locales/scripts/resolve-locales.js {appId} "{locale-list}"`
6. Show the resolved table and ask for confirmation
7. Only proceed after explicit user confirmation

For RTL locales: flag ⚠️ and note that `I18nManager.forceRTL(true)` is required.
