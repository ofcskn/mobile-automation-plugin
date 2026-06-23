---
description: Add a new language, fix missing translations, or audit i18n completeness
---

Manage localization for the specified app.

Ask: app ID, action (add-locale / fix-missing / audit-all).

Steps:
1. Load `skills/managing-app-localizations`
2. Load `skills/managing-app-localizations/references/locale-codes.md` for correct codes per platform
3. For `add-locale`: run `node skills/selecting-app-locales/scripts/resolve-locales.js {appId} "{locale}"` to confirm codes
4. For `fix-missing` or `audit-all`: run `node skills/managing-app-localizations/scripts/validate-translations.js {appId}`
5. Fill any missing keys, then re-validate
6. For RTL locales (ar, he, fa, ur): note that `I18nManager.forceRTL(true)` is required
