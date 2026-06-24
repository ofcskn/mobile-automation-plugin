# automobileapp — Full Documentation

## Table of Contents

1. [Architecture](#architecture)
2. [First Release: Apple App Store](#first-release-apple-app-store)
3. [First Release: Google Play Store](#first-release-google-play-store)
4. [Subsequent Releases (Automated)](#subsequent-releases-automated)
5. [Managing Multiple Apps](#managing-multiple-apps)
6. [Multi-Locale Management](#multi-locale-management)
7. [Release Notes](#release-notes)
8. [Metadata Reference](#metadata-reference)
9. [Troubleshooting](#troubleshooting)
10. [Concurrency & Parallelism →](CONCURRENCY.md)

---

## Architecture

```
plugin root/
├── config/                  ← Per-app config files
│   ├── .template.config.json
│   └── {app-id}.config.json
├── versions/                ← Single source of truth for version numbers
│   └── {app-id}/version.json
├── metadata/                ← Store listing content (validated against char limits)
│   └── {app-id}/
│       ├── ios/{locale}/    ← name, subtitle, keywords, description, promotional, release_notes
│       └── android/{locale}/← title, short_description, full_description, release_notes
├── locales/                 ← i18n JSON key files
│   └── {app-id}/
│       ├── en.json          ← source of truth
│       └── {locale}.json
├── screenshots/             ← Captured screenshot files
│   └── {app-id}/
├── skills/                  ← Knowledge + validation scripts
├── agents/                  ← Specialized AI subagents
├── commands/                ← Slash commands (/msd-*)
├── hooks/                   ← Auto-validation on file write
└── lenses/                  ← AI prompt templates (LenserFight)
```

---

## First Release: Apple App Store

**Estimated time: 2–4 hours (mostly waiting for review)**

### Manual steps (you must do these once)

| Step | Action | Where |
|------|---------|--------|
| 1 | Create Apple Developer account | [developer.apple.com](https://developer.apple.com) — $99/year |
| 2 | Accept latest Developer Program License Agreement | App Store Connect → Agreements |
| 3 | Create App ID (Bundle Identifier) | Certificates, Identifiers & Profiles |
| 4 | Create new app in App Store Connect | ASC → Apps → + → New App |
| 5 | Set Bundle ID, SKU, primary language | App Information tab |
| 6 | Fill Privacy Nutrition Labels (data types collected) | App Privacy tab |
| 7 | Set Age Rating / Content Questionnaire | Age Rating tab |
| 8 | Set Pricing (Free or Paid) | Pricing and Availability tab |
| 9 | Set Available Territories | Pricing and Availability tab |
| 10 | Create App Store Connect API Key | ASC → Users → Keys → + |
| 11 | Store key as EAS secret | `eas secret:create --scope project --name APP_STORE_CONNECT_API_KEY_ID --value "..."` |

### AI-assisted steps (AI prepares, you approve)

| Step | Command | Notes |
|------|---------|-------|
| 12 | Write metadata | `/msd-aso` → reviews output → approves |
| 13 | Write promotional text | `/msd-aso` output |
| 14 | Generate screenshots | `/msd-screenshots` |

### Fully automated steps

| Step | Command |
|------|---------|
| 15 | Validate all metadata | `node skills/managing-store-metadata/scripts/validate-metadata.js {appId}` |
| 16 | Build IPA | `eas build --platform ios --profile production` |
| 17 | Submit to App Store | `eas submit --platform ios --profile production` |

**After submission:** Apple review takes 24–48 hours for first submission, 1–24 hours for updates.

---

## First Release: Google Play Store

**Estimated time: 1–3 hours (internal testing required before production)**

### Manual steps (you must do these once)

| Step | Action | Where |
|------|---------|--------|
| 1 | Create Google Play Developer account | [play.google.com/console](https://play.google.com/console) — $25 one-time |
| 2 | Accept Developer Distribution Agreement | During registration |
| 3 | Create new app in Play Console | All apps → Create app |
| 4 | Set default language, app name, type | App details |
| 5 | Complete Data Safety section | Policy → Data safety |
| 6 | Complete Content Rating questionnaire | Policy → App content → Content rating |
| 7 | Set target audience & content | Policy → App content → Target audience |
| 8 | Set Pricing (Free/Paid) | Monetization setup |
| 9 | Create service account & download API key | Play Console → Setup → API access → Create service account |
| 10 | Grant service account permissions (Release Manager) | Users and permissions |
| 11 | Store key as EAS secret | `eas secret:create --scope project --name GOOGLE_SERVICES_JSON --value "$(cat key.json)"` |

### AI-assisted steps

| Step | Command | Notes |
|------|---------|-------|
| 12 | Write store listing | `/msd-aso` |
| 13 | Generate screenshots (phone + tablet) | `/msd-screenshots` |

### Fully automated steps

| Step | Command |
|------|---------|
| 14 | Build AAB | `eas build --platform android --profile production` |
| 15 | Upload to internal testing | `eas submit --platform android --profile production` |
| 16 | Promote to production | Play Console → Testing → Promote to production (or EAS) |

**Note:** Google requires at least 14 days of internal testing before promoting to production for new apps.

---

## Subsequent Releases (Automated)

Once first release is complete, subsequent releases are nearly fully automated:

```bash
# 1. Bump version (patch/minor/major)
node skills/managing-app-versions/scripts/bump-version.js {appId} patch

# 2. Generate release notes per locale (see Release Notes section)
# AI writes "What's New" text for each language

# 3. Validate metadata
node skills/managing-store-metadata/scripts/validate-metadata.js {appId}

# 4. Pre-flight check
node skills/submitting-app-release/scripts/release-checklist.js {appId}

# 5. Sync version to app
node skills/managing-app-versions/scripts/sync-build-numbers.js {appId} \
  --project-root /path/to/your/app

# 6. Build + Submit
cd /path/to/your/app
eas build --platform all --profile production
eas submit --platform all --profile production
```

**Time saved vs. manual process: ~70%**

---

## Managing Multiple Apps

Store one config per app:

```
config/
├── myapp.config.json
├── myapp2.config.json
└── myapp3.config.json
```

Run any command with the app ID:
```bash
node skills/managing-store-metadata/scripts/validate-metadata.js {appId}
node skills/managing-app-versions/scripts/bump-version.js {appId} patch
```

---

## Multi-Locale Management

### Directory structure per locale

```
metadata/{appId}/ios/
├── en-US/
│   ├── name.txt
│   ├── subtitle.txt
│   ├── keywords.txt
│   ├── description.txt
│   ├── promotional.txt
│   └── release_notes.txt
├── tr-TR/
│   └── ... (same files in Turkish)
└── de-DE/
    └── ...
```

### Validate all locales at once

```bash
node skills/managing-store-metadata/scripts/validate-metadata.js {appId}
# Reports all locales and all fields
```

### Translation keys validation

```bash
node skills/managing-app-localizations/scripts/validate-translations.js {appId}
# Diffs every locale against en.json source
# Reports missing keys, extra keys
```

### Locale resolution

```bash
# Resolve BCP47 codes to per-platform formats
node skills/selecting-app-locales/scripts/resolve-locales.js {appId} "en,tr,de,fr"
```

---

## Release Notes

Release notes ("What's New") are the most time-consuming multi-locale task.

### Character limits
- iOS "What's New": **4,000 chars**
- Android "What's New": **500 chars** (strict — do not exceed)

### Writing release notes per locale

```bash
# English (write once, AI translates)
echo "New guided breathing session types. Improved sleep timer. Bug fixes." \
  > metadata/{appId}/ios/en-US/release_notes.txt
```

Use `/msd-aso` to ask the AI to translate and adapt release notes for each locale. The AI accounts for:
- Character limits per platform
- Natural phrasing in each language (not literal translation)
- Keyword opportunities in indexed fields

### Release notes are NOT indexed

Apple and Google do NOT index What's New text for search. Write for users, not algorithms.

---

## Metadata Reference

### Apple App Store field limits

| Field | Limit | Indexed? | Tips |
|-------|-------|----------|------|
| App Name | 30 | Yes | Most important field |
| Subtitle | 30 | Yes | Second most important |
| Keywords | 100 | Yes | No spaces after commas. No repeating name/subtitle words |
| Promotional Text | 170 | No | Updates without new build. Use for promotions |
| Description | 4,000 | No | Conversion copy. Not for keyword stuffing |
| What's New | 4,000 | No | Plain user-facing changelog |

**Total indexed chars: 160 (Name + Subtitle + Keywords)**

### Google Play field limits

| Field | Limit | Indexed? | Tips |
|-------|-------|----------|------|
| Title | 30 | Yes | Include primary keyword |
| Short Description | 80 | Yes | Second most important |
| Full Description | 4,000 | **Yes** | Include keywords 3–5x naturally |
| What's New | 500 | No | Short, user-facing only |

**Key difference: Google indexes the full description. Include keywords naturally.**

---

## Troubleshooting

### "version.json not found"
```bash
# Initialize version file first
mkdir -p versions/{appId}
# Then create version.json with semver, ios, android fields
```

### "metadata directory not found"
```bash
mkdir -p metadata/{appId}/ios/en-US metadata/{appId}/android/en-US
```

### validate-metadata exits with errors
Check the specific field and locale reported. Common issues:
- Android `release_notes.txt` over 500 chars (people write 4000 thinking it matches iOS)
- Keywords with spaces after commas: `habit, tracker` → `habit,tracker`
- Subtitle exactly 30 chars (leave 1 buffer for Apple bug: use max 29)

### sync-build-numbers finds no platform files
Pass `--project-root` to point at your actual Expo app:
```bash
node skills/managing-app-versions/scripts/sync-build-numbers.js {appId} \
  --project-root /full/path/to/expo/app
```

### First EAS submit fails
Ensure EAS credentials are configured: run `eas whoami` to verify authentication, and use `eas secret:list` to confirm your App Store Connect / Google Play secrets are set.

---

## Using the Plugin Globally (Multiple Machines)

If you clone this plugin globally and use it across multiple apps, keep your personal app data out of git by adding these lines to your `.gitignore`:

```gitignore
# Personal app data — local only
config/myapp.config.json
versions/myapp/
metadata/myapp/
locales/myapp/
```

Replace `myapp` with your actual app ID. The `testapp` fixtures and `.template.config.json` remain committed for everyone.

### What IS committed
- `config/.template.config.json` — config schema template
- `versions/testapp/`, `metadata/testapp/`, `locales/testapp/` — test fixtures
- `screenshots/.gitkeep` — ensures the directory exists on fresh clone
- All plugin files (skills, agents, commands, hooks, lenses)

### What is NOT committed
- `screenshots/*` — generated files, can be large
- EAS secrets — stored in EAS cloud, never local files
- `.data/*` — archived source files
- Your personal app configs and data (add to `.gitignore` as shown above)
