---
name: mobile-automation-plugin
description: >
  Automates the full mobile app release pipeline — version management, localized metadata,
  multi-device screenshot generation, i18n translations, and store submission for iOS and
  Android. Use when the user asks to "release my app", "bump the version", "generate store
  screenshots", "update metadata in all languages", "prepare a store submission", "sync
  translations", or "manage my app versions across platforms". Orchestrates sub-skills:
  managing-app-versions, generating-store-screenshots, managing-store-metadata,
  managing-app-localizations, submitting-app-release.
---

# Mobile Store Deploy

## Overview

This plugin automates the five hardest parts of mobile app distribution:

1. **Version management** — semantic versioning synced across iOS (CFBundleVersion) and Android (versionCode/versionName)
2. **Platform management** — iOS App Store Connect and Google Play Console configuration
3. **Device management** — screenshot matrix across all required device sizes and locales
4. **Internationalisation (i18n)** — translation files, store metadata per locale
5. **Store submission** — EAS-powered `eas submit` for iOS and Android

## When to use which sub-skill

| User request | Load sub-skill |
|---|---|
| "bump version", "new build number" | `managing-app-versions` |
| "take screenshots", "generate screenshots", "update store images" | `generating-store-screenshots` |
| "update description", "change keywords", "edit metadata" | `managing-store-metadata` |
| "add a language", "translate strings", "missing translations" | `managing-app-localizations` |
| "submit to store", "release", "publish", "deploy" | `submitting-app-release` |
| "full release" (all of the above) | load all five in order |

## Project config

Every app in this repo has a config file at `config/{app-id}.config.json`. Load it first
on every task — it defines platforms, locales, device matrix, and Fastlane lane names.

```bash
# Confirm app ID before starting any task
ls config/
cat config/{app-id}.config.json
```

## Gotchas

- **Apple character limits are hard constraints, not guidelines.** A 31-character subtitle
  causes App Store Connect to reject the entire metadata batch silently. Always validate
  before uploading. Run `node scripts/validate-metadata.js {app-id}` first.
- **Apple does NOT index the long description for search.** Keywords go in name (30),
  subtitle (30), and the hidden keyword field (100). The description is conversion copy only.
- **Google Play DOES index the full description.** Same 4,000-char field, completely
  different indexing behaviour than iOS.
- **Screenshot captions are indexed by Apple since June 2025 via OCR.** The headline text
  overlaid on each screenshot is a ranking signal. Align it with your keyword strategy.
- **Android versionCode must be monotonically increasing.** Never reuse a code.
- **iOS build numbers must increase per TestFlight upload**, but CFBundleShortVersionString
  (version string) can stay the same across builds.
- **Google Play has 8 screenshots max per device type; Apple allows 10.**
- **Locales differ between platforms.** Apple uses `en-US`; Google uses `en-US` or just
  `en`. Always check `references/locale-codes.md` before creating new locale folders.

## Progressive disclosure

For detailed reference, load these files on demand:

- `skills/managing-app-versions/references/version-format.md` — version schema and rules
- `skills/generating-store-screenshots/references/device-matrix.md` — all required sizes
- `skills/generating-store-screenshots/references/screenshot-specs.md` — export specs
- `skills/managing-store-metadata/references/apple-limits.md` — all Apple field limits
- `skills/managing-store-metadata/references/google-limits.md` — all Google field limits
- `skills/managing-app-localizations/references/locale-codes.md` — platform locale codes
- `skills/submitting-app-release/references/submission-checklist.md` — pre-release gates
