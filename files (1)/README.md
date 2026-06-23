# mobile-store-deploy

> An open-source [agentskills.io](https://agentskills.io) plugin that automates the full mobile app release pipeline for iOS and Android.

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![agentskills.io](https://img.shields.io/badge/agentskills.io-compatible-green)](https://agentskills.io)

## What it solves

| Problem | Solution |
|---|---|
| Version numbers diverge across iOS, Android, app.json | `versions/{app-id}/version.json` — single source of truth |
| 300+ screenshots per release (5 screens × 3 sizes × 2 platforms × 10 langs) | 2-phase pipeline: fastlane capture → app-store-screenshots design |
| Release notes per language per version | `metadata/{app-id}/{platform}/{locale}/release_notes.txt` with CI validation |
| i18n keys missing from some locales | `validate-translations.js` blocks CI until all keys are present |
| Apple/Google silently reject metadata over character limits | `validate-metadata.js` enforces hard limits pre-upload |

## Install

```bash
# As a Claude Code / Cursor / Codex skill
npx skills add your-org/mobile-store-deploy

# Or clone directly
git clone https://github.com/your-org/mobile-store-deploy ~/.claude/skills/mobile-store-deploy
```

## Quick start

```bash
# 1. Copy config template for your app
cp config/.template.config.json config/myapp.config.json
# edit it with your app details

# 2. Initialize version tracking
mkdir -p versions/myapp
echo '{"semver":"1.0.0","ios":{"CFBundleShortVersionString":"1.0.0","CFBundleVersion":"1"},"android":{"versionName":"1.0.0","versionCode":1},"lastBumpedAt":"'$(date -u +%Y-%m-%dT%H:%M:%SZ)'","channel":"production","history":[]}' > versions/myapp/version.json

# 3. Validate metadata
node skills/managing-store-metadata/scripts/validate-metadata.js myapp

# 4. Validate translations
node skills/managing-app-localizations/scripts/validate-translations.js myapp

# 5. Pre-flight check
node skills/submitting-app-release/scripts/release-checklist.js myapp
```

## Skills

| Skill | Trigger phrases |
|---|---|
| `managing-app-versions` | "bump version", "increment build", "set version to..." |
| `generating-store-screenshots` | "generate screenshots", "update store images" |
| `managing-store-metadata` | "update description", "change keywords", "edit metadata" |
| `managing-app-localizations` | "add language", "fix missing translations", "translate app" |
| `submitting-app-release` | "release", "submit to store", "deploy" |

## Key constraints baked in

- Apple App Name / Subtitle: **30 chars** each (hard limit)
- Apple Keywords: **100 chars** (comma-separated, no spaces)
- Apple Description: **4,000 chars** (NOT indexed for search)
- Google Short Description: **80 chars** (IS indexed)
- Google Full Description: **4,000 chars** (IS indexed — include keywords)
- Google What's New: **500 chars** (not 4,000 like iOS)
- Android versionCode: monotonically increasing, never decrement

## External OSS tools used

- [fastlane](https://github.com/fastlane/fastlane) — MIT — build, sign, capture, submit
- [ParthJadhav/app-store-screenshots](https://github.com/ParthJadhav/app-store-screenshots) — MIT — screenshot design
- [ParthJadhav/ios-marketing-capture](https://github.com/ParthJadhav/ios-marketing-capture) — MIT — iOS locale capture
- [i18next](https://github.com/i18next/i18next) — MIT — runtime i18n
- [expo/eas-cli](https://github.com/expo/eas-cli) — MIT — Expo builds
- [LenserFight](https://github.com/conectlens/lenserfight) — Brand kit & icon generation

## License

MIT — see [LICENSE](LICENSE)
