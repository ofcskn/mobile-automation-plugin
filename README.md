# mobile-store-deploy

> An open-source Claude Code plugin that automates the full mobile app release pipeline for iOS and Android.

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

## Installation (Claude Code)

```bash
/plugin marketplace add mobile-store-deploy
/plugin install mobile-store-deploy
```

## Installation (agentskills.io — Claude Code, Cursor, Codex)

```bash
npx skills add mobile-store-deploy
```

## Slash commands

| Command | What it does |
|---|---|
| `/msd-release` | Full release pipeline — version bump → validate → submit |
| `/msd-bump` | Bump version number only |
| `/msd-screenshots` | Generate and validate store screenshots |
| `/msd-metadata` | Update and validate store metadata |
| `/msd-locale` | Add language or fix missing translation keys |
| `/msd-validate` | Run all validation checks without submitting |
| `/msd-select-locales` | Select or update app's supported locales |
| `/msd-aso` | ASO keyword research and metadata optimization |
| `/msd-geo` | GEO content — schema markup, entity anchor, ProductHunt |

## What it solves

| Problem | Solution |
|---|---|
| Version numbers diverge across iOS, Android, app.json | `versions/{app-id}/version.json` — single source of truth |
| 300+ screenshots per release | 2-phase pipeline: fastlane capture → app-store-screenshots design |
| Metadata silently rejected for char limit violations | `validate-metadata.js` enforces hard limits pre-upload |
| i18n keys missing from some locales | `validate-translations.js` blocks CI until all keys present |
| No pre-submission validation pipeline | `release-checklist.js` runs 7 sequential gates |

## Key constraints enforced

- Apple App Name / Subtitle: **30 chars** each (hard limit)
- Apple Keywords: **100 chars** (comma-separated, no spaces)
- Apple Description: **4,000 chars** (NOT indexed for search)
- Google Short Description: **80 chars** (IS indexed)
- Google Full Description: **4,000 chars** (IS indexed — include keywords)
- Google What's New: **500 chars** (not 4,000 like iOS)
- Android versionCode: monotonically increasing, never decrement

## Automatic hooks

The plugin validates metadata character limits when you edit any file under `metadata/`
and checks translation completeness when you edit files under `locales/`.

## External OSS tools

- [fastlane](https://github.com/fastlane/fastlane) — MIT — build, sign, capture, submit
- [ParthJadhav/app-store-screenshots](https://github.com/ParthJadhav/app-store-screenshots) — MIT — screenshot design
- [i18next](https://github.com/i18next/i18next) — MIT — runtime i18n
- [expo/eas-cli](https://github.com/expo/eas-cli) — MIT — Expo builds
- [LenserFight](https://github.com/conectlens/lenserfight) — brand kit + icon generation

## License

MIT — see [LICENSE](LICENSE)
