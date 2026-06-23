# mobile-store-deploy Claude Code Plugin — Design Spec

**Date:** 2026-06-23
**Version:** 1.0.0
**License:** MIT

---

## Problem

Mobile app release pipelines involve five coordination-heavy tasks:

1. Version numbers diverge across `Info.plist`, `build.gradle`, and `app.json`
2. Screenshot matrix explosion: 5 screens × 3 sizes × 2 platforms × N locales
3. Store metadata silently rejected by Apple/Google for character limit violations
4. i18n keys missing from some locale files, caught only at submission time
5. No single orchestration layer for pre-flight validation before store submission

---

## Existing Assets

| File | Status | Target path |
|---|---|---|
| `files (1)/SKILL.md` | ✅ complete | `SKILL.md` (root) |
| `files (1)/bump-version.js` | ✅ complete | `skills/managing-app-versions/scripts/` |
| `files (1)/validate-metadata.js` | ✅ complete | `skills/managing-store-metadata/scripts/` |
| `files (1)/validate-translations.js` | ✅ complete | `skills/managing-app-localizations/scripts/` |
| `files (1)/release-checklist.js` | ✅ complete | `skills/submitting-app-release/scripts/` |
| `resolve-locales.js` | ✅ complete | `skills/selecting-app-locales/scripts/` |
| `0-2.md` | ✅ complete | `skills/selecting-app-locales/SKILL.md` |
| `*.lens.md` (4 files) | ✅ complete | `lenses/` |
| `launch-ready-workflow.md` | ✅ complete | `workflows/` |

**Missing but referenced:** `sync-build-numbers.js` (called by `msd-bump`)

---

## Architecture

```
.claude-plugin/plugin.json          ← Claude Code manifest
commands/ (9 slash commands)        ← /msd-* user entry points
agents/ (7 subagents)               ← specialized orchestrators
skills/ (8 sub-skills)              ← knowledge + validation scripts
hooks/hooks.json                    ← automatic validation on file write
lenses/ (4 lens definitions)        ← LenserFight parametric AI tasks
workflows/ (1 workflow)             ← chained lens pipeline
config/ (.template.config.json)     ← per-app config schema
metadata/ + screenshots/ + versions/ + locales/  ← runtime data
```

### Layer responsibilities

| Layer | Component | Role |
|---|---|---|
| Entry | commands/ | User-facing slash commands that orchestrate agents |
| Orchestration | agents/ | Specialized subagents with domain rules baked in |
| Knowledge | skills/ | Reference docs + validation scripts |
| Automation | hooks/hooks.json | Auto-validate on file write events |
| AI tasks | lenses/ | Parametric prompts for ASO, GEO, locales, screenshots |
| Submission | fastlane | Build, sign, upload (external) |

---

## Implementation Plan — 3 Phases

### Phase 1: Core pipeline

**Goal:** Plugin installable and all 4 scripts runnable

Files to create:
- `.claude-plugin/plugin.json`
- `skills/managing-app-versions/SKILL.md` + scripts + references
- `skills/generating-store-screenshots/SKILL.md` + references
- `skills/managing-store-metadata/SKILL.md` + scripts + references
- `skills/managing-app-localizations/SKILL.md` + scripts + references
- `skills/submitting-app-release/SKILL.md` + scripts + references
- `commands/msd-release.md`, `msd-bump.md`, `msd-screenshots.md`, `msd-metadata.md`, `msd-locale.md`, `msd-validate.md`
- `agents/version-manager.md`, `screenshot-pipeline.md`, `metadata-validator.md`, `localization-auditor.md`, `release-coordinator.md`
- `hooks/hooks.json` (PostToolUse gates)
- `skills/managing-app-versions/scripts/sync-build-numbers.js` (missing script)

Files to relocate:
- `files (1)/bump-version.js` → `skills/managing-app-versions/scripts/`
- `files (1)/validate-metadata.js` → `skills/managing-store-metadata/scripts/`
- `files (1)/validate-translations.js` → `skills/managing-app-localizations/scripts/`
- `files (1)/release-checklist.js` → `skills/submitting-app-release/scripts/`

### Phase 2: Locale gate

Files to create:
- `skills/selecting-app-locales/SKILL.md` (from `0-2.md`)
- `skills/selecting-app-locales/scripts/resolve-locales.js` (from root)
- `skills/selecting-app-locales/references/android-locales.md`
- `skills/selecting-app-locales/references/apple-storefronts.md`
- `agents/locale-selector.md`
- `commands/msd-select-locales.md`
- Updated `hooks/hooks.json` with UserPromptSubmit locale gate

### Phase 3: ASO/GEO + publishing

Files to create:
- `skills/optimizing-aso-seo/SKILL.md`
- `skills/optimizing-geo/SKILL.md`
- `commands/msd-aso.md`
- `commands/msd-geo.md`
- `agents/aso-geo-optimizer.md`
- `lenses/README.md`
- Move `*.lens.md` → `lenses/`
- Move `launch-ready-workflow.md` → `workflows/`
- `config/.template.config.json`
- `README.md` (updated from `files (1)/README.md`)
- `CHANGELOG.md`

---

## Config Schema (`.template.config.json`)

```json
{
  "appId": "com.example.myapp",
  "displayName": "My App",
  "platforms": ["ios", "android"],
  "locales": [],
  "devices": {
    "ios": ["iPhone 16 Pro Max", "iPhone 11 Pro Max", "iPad Pro 13"],
    "android": ["Pixel 7"]
  },
  "fastlane": {
    "iosLane": "release",
    "androidLane": "release",
    "apiKeyPath": "fastlane/api_key.json",
    "googlePlayKeyPath": "fastlane/google-play-api.json"
  },
  "geo": {
    "entityAnchor": ""
  }
}
```

---

## Script Path Resolution

All scripts use `path.resolve(__dirname, '../../../../')` to walk up from
`skills/*/scripts/` to the plugin root. This is consistent across all 4 existing scripts.

`sync-build-numbers.js` must follow the same pattern and read `versions/{appId}/version.json`.

---

## Character Limits Enforced by Validator

| Platform | Field | Limit | Indexed |
|---|---|---|---|
| iOS | App Name | 30 | ✅ |
| iOS | Subtitle | 30 | ✅ |
| iOS | Keywords | 100 | ✅ |
| iOS | Promotional | 170 | ❌ |
| iOS | Description | 4,000 | ❌ |
| iOS | What's New | 4,000 | ❌ |
| Android | Title | 30 | ✅ |
| Android | Short Description | 80 | ✅ |
| Android | Full Description | 4,000 | ✅ |
| Android | What's New | **500** | ❌ |

Critical: iOS description NOT indexed. Android full description IS indexed.

---

## Testing

Each phase has discrete test points:

**Phase 1 tests (node scripts):**
```bash
# After populating test data:
node skills/managing-store-metadata/scripts/validate-metadata.js myapp
node skills/managing-app-localizations/scripts/validate-translations.js myapp
node skills/managing-app-versions/scripts/bump-version.js myapp patch
node skills/submitting-app-release/scripts/release-checklist.js myapp
```

**Phase 2 test:**
```bash
node skills/selecting-app-locales/scripts/resolve-locales.js myapp "en,tr,de"
```

**Phase 3 test:** Manual review of lens files, validate plugin structure with plugin-validator agent.

---

## File Count Summary

| Phase | New files | Relocated files | Total |
|---|---|---|---|
| 1 | ~28 | 4 | ~32 |
| 2 | ~6 | 2 | ~8 |
| 3 | ~12 | 5 | ~17 |
| **Total** | **~46** | **~11** | **~57** |
