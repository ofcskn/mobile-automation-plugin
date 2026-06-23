# Plugin Conversion Plan: mobile-store-deploy → Claude Code Plugin

> **This file is written for an AI agent to read and execute.**
> Follow every step in order. Do not skip steps. Check the file tree at each phase before proceeding.

---

## What this plan does

Converts the existing `mobile-store-deploy` agentskills.io SKILL.md project into a
fully compliant **Claude Code plugin** — publishable to the ClaudePluginHub marketplace
and Anthropic's official plugin registry.

A Claude Code plugin is a GitHub repository with a `.claude-plugin/plugin.json` manifest
plus standard directories (`commands/`, `agents/`, `skills/`, `hooks/`). The existing
`skills/` directory is already agentskills.io-compatible and maps directly into the
Claude Code plugin `skills/` convention. The conversion adds the manifest, slash commands,
specialized subagents, and lifecycle hooks on top of what already exists.

---

## Source references (read before starting)

- Plugin spec: `https://code.claude.com/docs/en/plugins`
- Plugin reference: `https://code.claude.com/docs/en/plugins-reference`
- Marketplace docs: `https://code.claude.com/docs/en/plugin-marketplaces`
- ClaudePluginHub building guide: `https://www.claudepluginhub.com/learn/building-plugins`
- Anthropic submission: `https://platform.claude.com/plugins/submit`
- agentskills.io spec: `https://agentskills.io/specification`
- Apple localization: `https://developer.apple.com/localization/`
- Android Locale API: `https://developer.android.com/reference/java/util/Locale`

---

## Target file tree (end state)

```
mobile-store-deploy/                         ← GitHub repo root
│
├── .claude-plugin/
│   └── plugin.json                          ← STEP 1: Create this first
│
├── commands/                                ← STEP 2: Slash commands
│   ├── msd-release.md                       ← /msd-release
│   ├── msd-bump.md                          ← /msd-bump
│   ├── msd-screenshots.md                   ← /msd-screenshots
│   ├── msd-metadata.md                      ← /msd-metadata
│   ├── msd-locale.md                        ← /msd-locale
│   └── msd-validate.md                      ← /msd-validate
│
├── agents/                                  ← STEP 3: Specialized subagents
│   ├── version-manager.md
│   ├── screenshot-pipeline.md
│   ├── metadata-validator.md
│   ├── localization-auditor.md
│   └── release-coordinator.md
│
├── skills/                                  ← EXISTING — keep as-is
│   ├── managing-app-versions/
│   │   ├── SKILL.md
│   │   ├── scripts/
│   │   │   └── bump-version.js
│   │   └── references/
│   │       └── version-format.md
│   ├── generating-store-screenshots/
│   │   ├── SKILL.md
│   │   ├── references/
│   │   │   └── device-matrix.md
│   │   └── assets/device-frames/
│   ├── managing-store-metadata/
│   │   ├── SKILL.md
│   │   ├── scripts/
│   │   │   └── validate-metadata.js
│   │   └── references/
│   │       ├── apple-limits.md
│   │       └── google-limits.md
│   ├── managing-app-localizations/
│   │   ├── SKILL.md
│   │   ├── scripts/
│   │   │   └── validate-translations.js
│   │   └── references/
│   │       └── locale-codes.md             ← UPDATE in STEP 4
│   └── submitting-app-release/
│       ├── SKILL.md
│       ├── scripts/
│       │   └── release-checklist.js
│       └── references/
│           └── submission-checklist.md
│
├── hooks/                                   ← STEP 5: Lifecycle automation
│   └── hooks.json
│
├── SKILL.md                                 ← EXISTING orchestrator — keep as-is
├── PLAN.md                                  ← EXISTING architecture doc
├── plugin-plan.md                           ← THIS FILE
├── README.md                                ← UPDATE in STEP 6
├── LICENSE                                  ← EXISTING MIT
├── CHANGELOG.md                             ← CREATE in STEP 6
│
├── config/
│   └── .template.config.json
├── metadata/                                ← Per-app store copy
│   └── {app-id}/{platform}/{locale}/
├── screenshots/                             ← Per-app screenshot assets
│   └── {app-id}/raw/ + designed/
├── versions/                                ← Per-app version tracking
│   └── {app-id}/version.json
└── locales/                                 ← Per-app i18n JSON files
    └── {app-id}/en.json
```

---

## STEP 1: Create the plugin manifest

Create `.claude-plugin/plugin.json`:

```json
{
  "name": "mobile-store-deploy",
  "version": "1.0.0",
  "description": "Automates the full mobile app release pipeline — version management, localized metadata, multi-device screenshot generation, i18n translations, and store submission for iOS and Android. Enforces Apple and Google character limits. Works with Expo, React Native, and native iOS/Android projects.",
  "keywords": [
    "mobile", "ios", "android", "app-store", "google-play",
    "deployment", "localization", "i18n", "screenshots",
    "fastlane", "expo", "react-native", "versioning", "aso"
  ],
  "author": "your-github-username",
  "license": "MIT",
  "homepage": "https://github.com/your-org/mobile-store-deploy",
  "repository": "https://github.com/your-org/mobile-store-deploy",
  "userConfig": {
    "DEFAULT_APP_ID": {
      "type": "string",
      "description": "Default app ID to use when not specified (e.g. com.yourcompany.yourapp)",
      "required": false
    },
    "LENSERFIGHT_API_KEY": {
      "type": "string",
      "sensitive": true,
      "description": "LenserFight Cloud MCP API key for brand kit and icon generation",
      "required": false
    }
  }
}
```

**Validation checklist for this file:**
- [ ] `name` is lowercase, hyphens only, no spaces
- [ ] `version` follows semver
- [ ] `keywords` include all major trigger words Claude will match on
- [ ] `userConfig` sensitive values use `"sensitive": true` (stored in system keychain)
- [ ] Replace `your-github-username` and `your-org` with actual values before publishing

---

## STEP 2: Create slash commands in `commands/`

Commands are flat `.md` files with YAML frontmatter. They become `/command-name` invocations.

### commands/msd-release.md
```markdown
---
description: Run the full mobile app release pipeline for one or both stores
---

Run the complete mobile-store-deploy release pipeline for the specified app.

Ask the user for:
1. App ID (check if DEFAULT_APP_ID env var is set first)
2. Version bump type (patch / minor / major / build-only)
3. Target platform (ios / android / both)
4. Confirm locales to include

Then execute in order:
1. Load skills/managing-app-versions — bump version
2. Load skills/managing-store-metadata — validate metadata
3. Load skills/managing-app-localizations — validate translations
4. Load skills/generating-store-screenshots — confirm screenshots exist
5. Load skills/submitting-app-release — run pre-flight and submit

Stop and report to user at any failed gate. Never auto-proceed past a failure.
```

### commands/msd-bump.md
```markdown
---
description: Bump the app version number for iOS and Android
---

Bump the version for the specified app.

Ask: app ID, bump type (patch/minor/major/build).
Load skills/managing-app-versions.
Run: node skills/managing-app-versions/scripts/bump-version.js {appId} {bumpType}
Run: node skills/managing-app-versions/scripts/sync-build-numbers.js {appId}
Report new version numbers. Suggest git commit message.
```

### commands/msd-screenshots.md
```markdown
---
description: Generate or update store screenshots for all devices and locales
---

Generate store screenshots for the specified app.

Ask: app ID, platform (ios/android/both), whether to localize.
Load skills/generating-store-screenshots.
Load references/device-matrix.md to confirm required sizes.
Run the capture phase, then guide through the design phase using app-store-screenshots.
Validate with scripts/validate-screenshots.js.
```

### commands/msd-metadata.md
```markdown
---
description: Update, validate, or sync App Store and Google Play metadata
---

Manage store metadata for the specified app.

Ask: app ID, what to update (description/keywords/release-notes/all), which locales.
Load skills/managing-store-metadata.
Always run validate-metadata.js after any edit before uploading.
Remind user: Apple description is NOT indexed. Google full description IS indexed.
```

### commands/msd-locale.md
```markdown
---
description: Add a new language, fix missing translations, or audit i18n completeness
---

Manage localization for the specified app.

Ask: app ID, action (add-locale / fix-missing / audit-all).
Load skills/managing-app-localizations.
Load references/locale-codes.md for correct locale codes per platform.
For RTL locales (ar, he, fa, ur): note I18nManager.forceRTL requirement.
Run validate-translations.js and report results.
```

### commands/msd-validate.md
```markdown
---
description: Run all pre-release validation checks without submitting
---

Run the full validation suite for the specified app without submitting.

Ask: app ID.
Run in sequence:
- node skills/managing-store-metadata/scripts/validate-metadata.js {appId}
- node skills/managing-app-localizations/scripts/validate-translations.js {appId}
- node skills/submitting-app-release/scripts/release-checklist.js {appId}
Report pass/fail for each gate with specific failure details.
```

---

## STEP 3: Create agents in `agents/`

Agents are specialized subagents Claude delegates to for focused tasks.
Each is a `.md` file with YAML frontmatter.

### agents/version-manager.md
```markdown
---
description: Specialized agent for all version number management — bumping, syncing, validating iOS and Android version codes across app.json, Info.plist, and build.gradle
when_to_use: When the user asks about version numbers, build codes, or version bumping
allowed-tools: [Bash, Read, Write]
---

You are the version management specialist for mobile-store-deploy.

Your single source of truth is versions/{appId}/version.json.
Your job: read it, bump it correctly, sync it to platform files.

Rules you must never break:
- Android versionCode is a monotonically increasing integer. Never decrement it.
- iOS CFBundleVersion must increase per TestFlight upload.
- For Expo projects, write ONLY to app.json. Do not touch native files.
- For bare RN projects, write to ios/*/Info.plist and android/app/build.gradle.
- Always read references/version-format.md before writing any platform file.
- Commit both version.json and all platform files in one atomic commit.

Android uses Locale.forLanguageTag() (BCP 47) — modern API since API level 21.
Never construct legacy Locale objects like new Locale("tr", "TR") in generated code.
Use Locale.forLanguageTag("tr-TR") instead.
```

### agents/screenshot-pipeline.md
```markdown
---
description: Specialized agent for the two-phase screenshot pipeline — simulator capture via fastlane and design layer via app-store-screenshots or storeshots
when_to_use: When the user needs to generate, update, or validate store screenshots
allowed-tools: [Bash, Read, Write]
---

You are the screenshot pipeline specialist for mobile-store-deploy.

Phase 1 (capture): fastlane snapshot (iOS) + screengrab (Android)
Phase 2 (design): ParthJadhav/app-store-screenshots agent skill OR storeshots.org

Critical constraints:
- iPhone 6.9" (1320×2868) is REQUIRED from 2026. Submission blocked without it.
- iPad Pro 13" (2064×2752) required if app supports iPad.
- Apple allows 10 screenshots per locale/device. Google allows 8.
- Do NOT add device frames to Android screenshots — Play renders its own.
- Apple OCR indexes screenshot caption text since June 2025. Align captions with keywords.txt.
- Always load references/device-matrix.md before starting capture.
- Always load references/screenshot-specs.md for pixel dimension requirements.

LenserFight Cloud MCP (lens c0903096-4a2c-463f-b6c2-c26aa72c5e6d) for icon compliance.
```

### agents/metadata-validator.md
```markdown
---
description: Specialized agent that validates and enforces Apple App Store and Google Play metadata character limits, keyword strategy, and indexing rules
when_to_use: When the user asks to validate metadata, check character limits, or update store descriptions
allowed-tools: [Bash, Read, Write]
---

You are the store metadata specialist for mobile-store-deploy.

HARD LIMITS — store silently rejects on violation:

Apple App Store:
- App Name: 30 chars (strongest search signal)
- Subtitle: 30 chars (leave 1 char buffer — Apple bug may not index last word at exactly 30)
- Keywords: 100 chars, comma-separated, NO spaces after commas
- Promotional Text: 170 chars (NOT indexed, updatable without new version)
- Description: 4,000 chars (NOT indexed for search on iOS — conversion copy only)
- What's New: 4,000 chars
- IAP Name: 35 chars
- IAP Description: 55 chars
- In-App Event Title: 30 chars (indexed since iOS 15)
- Screenshot captions: indexed via OCR since June 2025

Google Play:
- Title: 30 chars (strongest signal)
- Short Description: 80 chars (IS indexed, second strongest signal)
- Full Description: 4,000 chars (IS indexed — place keywords naturally throughout)
- What's New: 500 chars (NOT 4,000 like iOS — common mistake)

KEY DIFFERENCE: iOS description is NOT indexed. Google Play full description IS indexed.
Always run validate-metadata.js before any upload. Exit code 1 = block upload.

Apple locale format: en-US, tr-TR, de-DE (BCP 47 with region)
Google Play folder format: en-US or en for most locales
```

### agents/localization-auditor.md
```markdown
---
description: Specialized agent for i18n auditing — finding missing translation keys, adding new locales, validating locale code formats across iOS, Android, and Google Play
when_to_use: When the user asks about translations, missing keys, adding a language, or locale codes
allowed-tools: [Bash, Read, Write]
---

You are the localization specialist for mobile-store-deploy.

Locale code formats differ per layer — always check references/locale-codes.md:
- i18next / Expo: short BCP 47 (en, tr, de)
- iOS App Store Connect: full BCP 47 (en-US, tr-TR, de-DE)
- Android resource folders: values-tr, values-en-rUS (NOT values-en-US)
- Google Play Console: en-US, tr-TR, de-DE

Apple localization notes (from developer.apple.com/localization):
- Xcode 15+ uses .xcstrings format (replaces .strings + .stringsdict)
- Export via Xcode > Product > Export Localizations for external translation
- iOS 13+: users can set per-app language independent of device language
- Foundation APIs handle dates, numbers, currency automatically per locale
- SwiftUI extracts localizable strings automatically

Android Locale API notes (from developer.android.com/reference/java/util/Locale):
- Use Locale.forLanguageTag("tr-TR") — BCP 47 standard
- Avoid legacy new Locale("tr", "TR") — deprecated pattern
- Android resource folder naming: values-tr (language) or values-b+sr+Latn (script variant)
- Two special legacy cases: ja_JP_JP → ja-JP-u-ca-japanese, th_TH_TH → th-TH-u-nu-thai

RTL locales requiring special handling in React Native / Expo:
- Arabic (ar), Hebrew (he), Persian/Farsi (fa), Urdu (ur)
- Add I18nManager.forceRTL(true) to app startup
- Review flexDirection, icon placement, text alignment for all RTL screens

Translation quality rules:
- Avoid machine-only translation — especially for Turkish, Arabic, Japanese
- Never translate {{variable}} i18next placeholders
- Provide glossary context to translators for brand terms
- Batch max 50 keys per AI translation call for quality control
```

### agents/release-coordinator.md
```markdown
---
description: Orchestrator agent that coordinates the full release pipeline across version, screenshots, metadata, localization, and submission phases
when_to_use: When the user asks to do a full release, submit the app, or coordinate multiple pipeline phases
allowed-tools: [Bash, Read, Write]
---

You are the release coordinator for mobile-store-deploy.

You orchestrate the other specialized agents in sequence. Never skip a phase.

Release sequence:
1. Delegate to version-manager agent — bump and sync version
2. Delegate to metadata-validator agent — validate all locales
3. Delegate to localization-auditor agent — validate all i18n keys
4. Delegate to screenshot-pipeline agent — confirm designed assets exist
5. Run node skills/submitting-app-release/scripts/release-checklist.js {appId}
6. If all 7 gates pass, run fastlane submission
7. Report submitted version and review status

iOS staged release: phased_release: true (7-day automatic)
Android staged release: rollout: 0.1 (10% initial, expand manually after 48hr monitoring)

Stop at any failure. Report the exact gate that failed and the fix required.
Never proceed past a failing gate without explicit user confirmation.

App Store Connect API for metadata automation:
Use the ASC API (https://developer.apple.com/app-store-connect/api/) for programmatic
metadata and screenshot uploads — more reliable than fastlane deliver for complex locales.
```

---

## STEP 4: Update `skills/managing-app-localizations/references/locale-codes.md`

Add the following section at the top, incorporating new findings from the Apple and Android docs:

```markdown
## Authoritative sources

- Apple localization: https://developer.apple.com/localization/
- Android Locale API: https://developer.android.com/reference/java/util/Locale
- App Store available in 175 regions, 40 languages (Apple, 2026)
- Android BCP 47 modern API: Locale.forLanguageTag("tr-TR") — use over legacy constructor

## Apple localization toolchain

- Xcode 15+: .xcstrings format (replaces .strings + .stringsdict)
- Export: Xcode > Product > Export Localizations → .xcloc packages for translators
- iOS 13+: users can set per-app language (Settings > App > Language)
- macOS: Language & Region > Apps
- Foundation APIs auto-format: dates, numbers, currency, units per locale

## Android localization toolchain

- Modern API: Locale.forLanguageTag("tr-TR") (BCP 47, API level 21+)
- Legacy (avoid): new Locale("tr", "TR")
- Resource folder naming rules:
  - Language only: values-tr
  - Language + region: values-en-rUS (note: rUS not US)
  - Script variant: values-b+sr+Latn
- Two special legacy cases: ja_JP_JP, th_TH_TH (treated specially in BCP 47)
- App Bundle: locale split via res/values-{locale}/strings.xml

## App Store Connect API for metadata automation

POST /v1/appStoreVersionLocalizations — create/update locale metadata
POST /v1/screenshotSets — manage screenshot sets per locale/device
Full reference: https://developer.apple.com/documentation/appstoreconnectapi
```

---

## STEP 5: Create `hooks/hooks.json`

Hooks run automatically at Claude Code lifecycle events. These hooks add quality gates
without requiring manual command invocation.

```json
{
  "PostToolUse": [
    {
      "matcher": "Write|Edit",
      "hooks": [
        {
          "type": "command",
          "command": "bash -c 'if echo \"$CLAUDE_TOOL_INPUT\" | grep -q \"metadata/\"; then node \"${CLAUDE_PLUGIN_ROOT}/skills/managing-store-metadata/scripts/validate-metadata.js\" $(echo \"$CLAUDE_TOOL_INPUT\" | grep -oP \"metadata/\\K[^/]+\" | head -1) 2>&1 | tail -5; fi'"
        }
      ]
    },
    {
      "matcher": "Write|Edit",
      "hooks": [
        {
          "type": "command",
          "command": "bash -c 'if echo \"$CLAUDE_TOOL_INPUT\" | grep -q \"locales/\"; then APPID=$(echo \"$CLAUDE_TOOL_INPUT\" | grep -oP \"locales/\\K[^/]+\" | head -1); if [ -n \"$APPID\" ]; then node \"${CLAUDE_PLUGIN_ROOT}/skills/managing-app-localizations/scripts/validate-translations.js\" \"$APPID\" 2>&1 | tail -5; fi; fi'"
        }
      ]
    }
  ]
}
```

**What these hooks do:**
- When Claude writes or edits any file under `metadata/`, the metadata validator runs
  automatically and surfaces any character limit violations in Claude's context
- When Claude writes or edits any file under `locales/`, the translation validator runs
  automatically and surfaces any missing keys

**Hooks documentation:** `https://code.claude.com/docs/en/plugins-reference`
Available events: PreToolUse, PostToolUse, PostToolUseFailure, PostToolBatch,
PermissionRequest, UserPromptSubmit, SessionStart, SessionEnd, and 20+ more.

---

## STEP 6: Update README.md and create CHANGELOG.md

### README.md — add at top of Installation section:

```markdown
## Installation (Claude Code)

```bash
# Add to Claude Code
/plugin marketplace add your-org/mobile-store-deploy
/plugin install mobile-store-deploy
```

## Installation (agentskills.io — Claude Code, Cursor, Codex, etc.)

```bash
npx skills add your-org/mobile-store-deploy
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

## Automatic hooks

The plugin automatically validates metadata character limits when you edit any
file under `metadata/` and checks translation completeness when you edit `locales/`.
```

### CHANGELOG.md (create new):
```markdown
# Changelog

## [1.0.0] — 2026-06-23

### Added
- Five agentskills.io-compatible sub-skills: managing-app-versions,
  generating-store-screenshots, managing-store-metadata,
  managing-app-localizations, submitting-app-release
- Six Claude Code slash commands: /msd-release, /msd-bump, /msd-screenshots,
  /msd-metadata, /msd-locale, /msd-validate
- Five specialized subagents: version-manager, screenshot-pipeline,
  metadata-validator, localization-auditor, release-coordinator
- Automatic hooks: metadata char-limit validation on write, translation audit on write
- Hard character limit validator (validate-metadata.js) for Apple and Google
- Translation completeness validator (validate-translations.js)
- Pre-release gate runner (release-checklist.js) with 7 sequential checks
- Version bump script with monotonic versionCode enforcement
- Apple locale notes from developer.apple.com/localization
- Android Locale BCP 47 notes from developer.android.com/reference/java/util/Locale
- Device matrix with required iPhone 6.9" (1320×2868) for 2026
- Screenshot caption indexing note (Apple OCR, June 2025)
```

---

## STEP 7: Publish

### 7a. Push to GitHub

```bash
git add .
git commit -m "feat: convert to Claude Code plugin v1.0.0

- Add .claude-plugin/plugin.json manifest
- Add 6 slash commands (commands/)
- Add 5 specialized subagents (agents/)
- Add lifecycle hooks for auto-validation
- Update README with installation instructions
- Add CHANGELOG.md"

git push origin main
```

### 7b. Submit to Anthropic's official marketplace

```
https://platform.claude.com/plugins/submit
```

or from within Claude: `claude.ai/settings/plugins/submit`

### 7c. Submit to ClaudePluginHub

```
https://www.claudepluginhub.com/tools/submit-plugin
```

Submit the GitHub repository URL. ClaudePluginHub auto-indexes from GitHub Code Search
but new repos can take days to appear — manual submission is instant.

---

## STEP 8: Installation test (run after publishing)

In Claude Code:
```
/plugin marketplace add your-org/mobile-store-deploy
/plugin install mobile-store-deploy
/msd-validate
```

Expected: Claude loads the release-coordinator agent, prompts for app ID,
runs all validation gates, reports results.

---

## Locale code critical facts (for agents to remember)

### Android `java.util.Locale` BCP 47 rules

- **Modern API:** `Locale.forLanguageTag("tr-TR")` — use this
- **Legacy (avoid):** `new Locale("tr", "TR")` — deprecated pattern
- `toLanguageTag()` returns BCP 47 string for interop
- Format: `language-Script-REGION-variant-extensions` (lowercase lang, UPPERCASE region, TitleCase script)
- Android resource folder format: `values-tr` or `values-en-rUS` (NOT `values-en-US`)
- Script variants: `values-b+sr+Latn` (for Serbian in Latin script)
- Special legacy cases: `ja_JP_JP` → `ja-JP-u-ca-japanese`, `th_TH_TH` → `th-TH-u-nu-thai`
- obsolete ISO 639 codes: `iw` → `he` (Hebrew), `ji` → `yi` (Yiddish), `in` → `id` (Indonesian)

### Apple localization system

- App Store: 175 regions, 40 languages
- iOS 13+: per-app language setting (user chooses independently of device language)
- Xcode 15+: `.xcstrings` is the modern format (supersedes `.strings` + `.stringsdict`)
- Export path: Xcode > Product > Export Localizations → .xcloc bundles
- App Store Connect API: use for automated metadata + screenshot uploads
- Foundation auto-formats: `NumberFormatter`, `DateFormatter`, `MeasurementFormatter`
- SwiftUI: `Text("key")` auto-localizes if key exists in `.xcstrings`
- RTL: `@Environment(\.layoutDirection)` in SwiftUI, `UIApplication.shared.userInterfaceLayoutDirection` in UIKit

### Character limit quick reference

| Platform | Field | Limit | Indexed |
|---|---|---|---|
| iOS | App Name | 30 | ✅ |
| iOS | Subtitle | 30 | ✅ (leave 1 buffer) |
| iOS | Keywords | 100 | ✅ (comma,no,spaces) |
| iOS | Promotional | 170 | ❌ (no new version needed) |
| iOS | Description | 4,000 | ❌ (conversion copy only) |
| iOS | What's New | 4,000 | ❌ |
| iOS | IAP Name | 35 | ✅ |
| iOS | Screenshot captions | — | ✅ OCR since Jun 2025 |
| Android | Title | 30 | ✅ |
| Android | Short Description | 80 | ✅ |
| Android | Full Description | 4,000 | ✅ (include keywords) |
| Android | What's New | **500** | ❌ |

**Critical difference:** iOS description = NOT indexed. Android full description = IS indexed.

---

## File-by-file agent checklist

After completing all steps, verify this list:

```
[ ] .claude-plugin/plugin.json                     — manifest with name, version, keywords
[ ] commands/msd-release.md                        — frontmatter + instructions
[ ] commands/msd-bump.md                           — frontmatter + instructions
[ ] commands/msd-screenshots.md                    — frontmatter + instructions
[ ] commands/msd-metadata.md                       — frontmatter + instructions
[ ] commands/msd-locale.md                         — frontmatter + instructions
[ ] commands/msd-validate.md                       — frontmatter + instructions
[ ] agents/version-manager.md                      — frontmatter with when_to_use
[ ] agents/screenshot-pipeline.md                  — frontmatter with when_to_use
[ ] agents/metadata-validator.md                   — frontmatter with when_to_use
[ ] agents/localization-auditor.md                 — frontmatter with when_to_use
[ ] agents/release-coordinator.md                  — frontmatter with when_to_use
[ ] hooks/hooks.json                               — valid JSON, PostToolUse events
[ ] skills/managing-app-versions/SKILL.md          — existing, unchanged
[ ] skills/generating-store-screenshots/SKILL.md   — existing, unchanged
[ ] skills/managing-store-metadata/SKILL.md        — existing, unchanged
[ ] skills/managing-app-localizations/SKILL.md     — existing, unchanged
[ ] skills/submitting-app-release/SKILL.md         — existing, unchanged
[ ] skills/managing-app-localizations/references/locale-codes.md — UPDATED with BCP47 notes
[ ] SKILL.md                                       — existing orchestrator, unchanged
[ ] README.md                                      — UPDATED with plugin install commands
[ ] CHANGELOG.md                                   — CREATED
[ ] LICENSE                                        — existing MIT
[ ] PLAN.md                                        — existing architecture doc
[ ] plugin-plan.md                                 — THIS FILE
```

---

## What NOT to change

The following files must not be modified during plugin conversion:

- `SKILL.md` (root orchestrator) — already agentskills.io-compliant
- `skills/*/SKILL.md` — all five sub-skills are spec-compliant, tested, under 120 lines each
- `skills/*/scripts/*.js` — validators and scripts are working implementations
- `skills/*/references/apple-limits.md` — canonical limits reference
- `skills/*/references/google-limits.md` — canonical limits reference
- `skills/*/references/device-matrix.md` — canonical device sizes
- `skills/*/references/submission-checklist.md` — Fastfile template
- `config/.template.config.json` — app config schema

The only file in `skills/` that gets updated is `locale-codes.md` (Step 4).

---

## Plugin component summary (for ClaudePluginHub listing)

**Type:** Skills (5) + Commands (6) + Agents (5) + Hooks (1)
**Category:** Mobile → Deployment
**Keywords:** mobile, ios, android, app-store, google-play, deployment, localization,
  i18n, screenshots, fastlane, expo, react-native, versioning, aso
**License:** MIT
**Requires:** Node.js 18+, fastlane (for screenshot capture and submission), Ruby 3.x
**Optional:** Expo / EAS CLI, LenserFight Cloud MCP

---

## ADDENDUM A: Locale Selection Enforcement

> Added after integrating Android locale_config.xml (82 locales) and Apple
> App Store storefront table (175 countries). This section is **mandatory**
> for the converting agent to implement.

### New locale selection gate

A new skill `selecting-app-locales` enforces locale confirmation before ANY
localization-related work. Add its trigger to `hooks/hooks.json` as a
`UserPromptSubmit` hook:

```json
{
  "UserPromptSubmit": [
    {
      "matcher": "locale|language|locali|i18n|translation|metadata|screenshot",
      "hooks": [
        {
          "type": "inject",
          "content": "LOCALE GATE: Before proceeding, check if config/{app-id}.config.json has a confirmed locales[] array. If not, load skills/selecting-app-locales and ask the user which locales to support. Reference references/android-locales.md (82 BCP47 codes) and references/apple-storefronts.md (175 Apple storefronts). Run resolve-locales.js after confirmation. Only proceed after the user explicitly confirms the locale set."
        }
      ]
    }
  ]
}
```

### New files added by this addendum

```
skills/selecting-app-locales/
├── SKILL.md                                    ← enforces locale selection gate
├── scripts/resolve-locales.js                 ← resolves codes, writes config
└── references/
    ├── android-locales.md                      ← all 82 Android AOSP BCP47 locales
    └── apple-storefronts.md                   ← all 175 Apple storefront countries

agents/locale-selector.md                      ← dedicated locale selection agent
commands/msd-select-locales.md                 ← /msd-select-locales command
```

### Android locale_config.xml placement

When creating locale support for a new app:
```bash
mkdir -p android/app/src/main/res/xml/
# Write locale_config.xml with confirmed locale codes
# Reference in AndroidManifest.xml:
# <application android:localeConfig="@xml/locale_config">
# Required from Android 13 (API 33)
```

### Critical Android BCP47 facts (baked into resolve-locales.js)

- Hebrew: `iw` in Android (legacy) — modern `he` still maps to `iw` in Android runtime
- Indonesian: `in` in Android (legacy) — modern `id` maps to `in`
- Chinese Simplified: `zh-Hans` in locale_config.xml
- Chinese Traditional: `zh-Hant`
- Serbian Latin script: `sr-Latn` in locale_config.xml → `values-b+sr+Latn` resource folder
- Turkish Türkiye storefront: shows English (UK) by default → need BOTH en-US AND tr-TR metadata

---

## ADDENDUM B: SEO + GEO Skills and LenserFight Integration

> Added to address missing ASO/SEO/GEO pipeline and LenserFight workflow.

### New skills

```
skills/optimizing-aso-seo/
└── SKILL.md            ← keyword research, metadata strategy, screenshot OCR alignment

skills/optimizing-geo/
└── SKILL.md            ← AI discoverability: entity anchoring, schema markup, GEO content
```

### LenserFight lens definitions (new directory)

```
lenses/
├── README.md                         ← lens system explanation + MCP integration guide
├── locale-selector.lens.md           ← parametric locale selection with BCP47 resolution
├── aso-optimizer.lens.md             ← keyword research + all metadata per locale
├── geo-optimizer.lens.md             ← entity anchor, schema, ProductHunt, press, action plan
└── screenshot-designer.lens.md       ← keyword-aligned caption brief for screenshot pipeline
```

Existing Brand Kit lens: `c0903096-4a2c-463f-b6c2-c26aa72c5e6d`

### LenserFight workflow

```
workflows/launch-ready-workflow.md    ← chains all 5 lenses + scripts pipeline
```

Chain order:
```
Brand Kit Lens (Step 0) → Locale Selector (Step 1) → ASO Optimizer (Step 2)
→ GEO Optimizer (Step 3) → Screenshot Designer (Step 4) → fastlane submission (Step 5)
```

### New commands

```
commands/msd-select-locales.md        ← /msd-select-locales
commands/msd-aso.md                   ← /msd-aso
commands/msd-geo.md                   ← /msd-geo
```

### New agents

```
agents/locale-selector.md             ← enforces locale gate with full reference access
agents/aso-geo-optimizer.md           ← ASO + SEO + GEO in one specialized agent
```

### LenserFight as first mobile plugin

This plugin represents the first LenserFight × Claude Code integration.
Key insight: LenserFight parametric lenses + Claude Code skills/agents form a
complementary stack:

| Layer | Tool | Role |
|---|---|---|
| Structured AI tasks | LenserFight lenses | Parametric, repeatable AI prompts with user input |
| File system operations | Claude Code skills/scripts | Reading, writing, validating files |
| Lifecycle automation | Claude Code hooks | Auto-trigger validation on file write |
| Orchestration | Claude Code agents | Coordinate multi-skill workflows |
| Submission | fastlane | Build, sign, upload to stores |

Lenses handle the knowledge-intensive decisions (locale strategy, keyword research,
GEO content). Scripts handle the deterministic operations (char limit validation,
code resolution, version bumping). Together they cover the full release pipeline.

---

## Complete file tree (end state including all addenda)

```
mobile-store-deploy/
├── .claude-plugin/
│   └── plugin.json
├── commands/
│   ├── msd-release.md
│   ├── msd-bump.md
│   ├── msd-screenshots.md
│   ├── msd-metadata.md
│   ├── msd-locale.md
│   ├── msd-validate.md
│   ├── msd-select-locales.md          ← NEW (Addendum A)
│   ├── msd-aso.md                     ← NEW (Addendum B)
│   └── msd-geo.md                     ← NEW (Addendum B)
├── agents/
│   ├── version-manager.md
│   ├── screenshot-pipeline.md
│   ├── metadata-validator.md
│   ├── localization-auditor.md
│   ├── release-coordinator.md
│   ├── locale-selector.md             ← NEW (Addendum A)
│   └── aso-geo-optimizer.md           ← NEW (Addendum B)
├── skills/
│   ├── managing-app-versions/
│   │   ├── SKILL.md
│   │   ├── scripts/bump-version.js
│   │   └── references/version-format.md
│   ├── generating-store-screenshots/
│   │   ├── SKILL.md
│   │   └── references/device-matrix.md
│   ├── managing-store-metadata/
│   │   ├── SKILL.md
│   │   ├── scripts/validate-metadata.js
│   │   └── references/apple-limits.md + google-limits.md
│   ├── managing-app-localizations/
│   │   ├── SKILL.md
│   │   ├── scripts/validate-translations.js
│   │   └── references/locale-codes.md
│   ├── submitting-app-release/
│   │   ├── SKILL.md
│   │   ├── scripts/release-checklist.js
│   │   └── references/submission-checklist.md
│   ├── selecting-app-locales/         ← NEW (Addendum A)
│   │   ├── SKILL.md
│   │   ├── scripts/resolve-locales.js
│   │   └── references/
│   │       ├── android-locales.md
│   │       └── apple-storefronts.md
│   ├── optimizing-aso-seo/            ← NEW (Addendum B)
│   │   └── SKILL.md
│   └── optimizing-geo/                ← NEW (Addendum B)
│       └── SKILL.md
├── lenses/                            ← NEW (Addendum B)
│   ├── README.md
│   ├── locale-selector.lens.md
│   ├── aso-optimizer.lens.md
│   ├── geo-optimizer.lens.md
│   └── screenshot-designer.lens.md
├── hooks/
│   └── hooks.json                     ← UPDATE: add UserPromptSubmit locale gate
├── workflows/
│   └── launch-ready-workflow.md       ← NEW (Addendum B)
├── SKILL.md
├── PLAN.md
├── plugin-plan.md                     ← THIS FILE
├── README.md
├── LICENSE
└── CHANGELOG.md
```
