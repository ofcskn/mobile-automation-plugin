---
name: selecting-app-locales
description: >
  Enforces locale selection before any localisation, metadata, screenshot, or i18n
  task begins. Use when starting a new app, adding languages, preparing for store
  submission, or any time the locale set is unknown or unconfirmed. Presents both the
  Android BCP 47 locale list (locale_config.xml) and the Apple App Store storefront
  table (175 regions, default and additional languages) so the user can make an
  informed, explicit decision. Writes the confirmed locale set to
  config/{app-id}.config.json before any other skill runs.
---

# Selecting App Locales

## Why this must run first

Every downstream task — metadata validation, i18n JSON files, screenshot locales,
App Store Connect locale folders, Google Play metadata folders —
depends on a confirmed locale list. Starting without one causes rework.

**The agent MUST ask the user before assuming any locale set.**
Even if the user says "just do English", that is a valid answer — write it to config.

## Steps

1. Read `config/{app-id}.config.json` and check if `locales[]` is already confirmed.
   - If `locales[]` exists and is non-empty: show the list and ask "Should I use these locales, or do you want to change them?"
   - If `locales[]` is missing or empty: proceed to step 2.

2. Ask the user which languages to support. Common starting points:
   - English only: `en`
   - English + Turkish: `en,tr`
   - Major markets: `en,tr,de,fr,es,pt-BR,ja,ko,zh-Hans`

3. Run: `node skills/selecting-app-locales/scripts/resolve-locales.js {appId} "{locale-list}"`

4. Show the resolved locale table and confirm with user before proceeding.

5. Only proceed to downstream skills after explicit user confirmation.

## RTL locales

For Arabic (ar), Hebrew (he), Farsi (fa), Urdu (ur): add ⚠️ flag and note that
React Native/Expo requires `I18nManager.forceRTL(true)` at app startup.

## References

- `skills/selecting-app-locales/references/android-locales.md` — BCP47 locale list
- `skills/selecting-app-locales/references/apple-storefronts.md` — storefront table
