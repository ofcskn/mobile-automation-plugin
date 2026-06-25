---
name: managing-app-localizations
description: >
  Manages i18n translation files and store metadata localization across iOS, Android,
  and Google Play. Use when the user says "add a language", "fix missing translations",
  "translate strings", "audit i18n", "missing locale keys", or any task involving
  language support. Source of truth for translation keys is .msd/locales/{app-id}/en.json.
---

# Managing App Localizations

## When to use

| Request | Action |
|---|---|
| "add a language" | Add locale to config, create locale JSON, create metadata folders |
| "fix missing translations" | Run validate-translations.js, fill missing keys |
| "audit all locales" | Run validate-translations.js without a locale filter |
| "translate strings" | Copy en.json, fill values, validate |

## File structure

```
.msd/locales/{app-id}/
├── en.json     ← Source of truth — all keys must be here
├── tr.json     ← All keys from en.json, values in Turkish
└── de.json     ← All keys from en.json, values in German
```

## Steps — Add a new locale

1. Confirm locale codes: `skills/managing-app-localizations/references/locale-codes.md`
2. Copy source: `cp .msd/locales/{appId}/en.json .msd/locales/{appId}/{i18next-code}.json`
3. Translate all values in the new file (never translate `{{variable}}` placeholders)
4. Validate: `node skills/managing-app-localizations/scripts/validate-translations.js {appId}`
5. Create metadata folders:
   - `mkdir -p .msd/metadata/{appId}/ios/{ios-locale}`
   - `mkdir -p .msd/metadata/{appId}/android/{play-locale}`
6. Copy metadata from `en-US/` and translate each `.txt` file
7. Validate metadata: `node skills/managing-store-metadata/scripts/validate-metadata.js {appId}`
8. Add locale to `.msd/config/{appId}.config.json` → `locales[]` array
9. For RTL locales (ar, he, fa, ur): note that `I18nManager.forceRTL(true)` is required in app startup

## Rules

- Never translate `{{variable}}` or `${variable}` placeholders in translation strings
- Batch max 50 keys per AI translation call for quality control
- Avoid machine-only translation for Turkish, Arabic, Japanese — quality suffers
- Provide app glossary/context to translators for brand terms
- validate-translations.js exits 1 if any source key is missing in any locale

## Reference

Load on demand: `skills/managing-app-localizations/references/locale-codes.md`
