# mobile-store-deploy Claude Code Plugin — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Convert the `mobile-store-deploy` skill project into a fully compliant Claude Code plugin with 9 slash commands, 7 agents, 8 sub-skills, lifecycle hooks, and all working scripts.

**Architecture:** Phased build — Phase 1 creates the core 5-skill pipeline (scripts + manifest + agents + commands + hooks), Phase 2 adds the locale selection gate, Phase 3 adds ASO/GEO optimization and publishing artifacts. Each phase ends with runnable script tests.

**Tech Stack:** Node.js 18+ (scripts), Markdown (SKILL.md/agents/commands), JSON (manifest/hooks/config), fastlane (external, not built here)

## Global Constraints

- All scripts use `path.resolve(__dirname, '../../../../')` to walk up 4 levels to plugin root
- Script exit code 1 = failure (blocks CI); exit code 0 = success
- Apple char limits are HARD limits — store silently rejects violations
- Android versionCode must monotonically increase — never decrement
- Plugin root dir: `/Users/ofcskn/Documents/projects/youtube/mobile-automation-plugin`
- All new files go in that root (not in `files (1)/`)
- Source files to copy from: `files (1)/` directory in the root

---

## Phase 1: Core pipeline

### Task 1: Plugin manifest + directory skeleton

**Files:**
- Create: `.claude-plugin/plugin.json`
- Create dirs: `commands/`, `agents/`, `skills/`, `hooks/`, `config/`, `metadata/`, `screenshots/`, `versions/`, `locales/`

- [ ] **Step 1: Create directory structure**

```bash
cd /Users/ofcskn/Documents/projects/youtube/mobile-automation-plugin
mkdir -p .claude-plugin commands agents hooks config
mkdir -p skills/managing-app-versions/scripts skills/managing-app-versions/references
mkdir -p skills/generating-store-screenshots/references
mkdir -p skills/managing-store-metadata/scripts skills/managing-store-metadata/references
mkdir -p skills/managing-app-localizations/scripts skills/managing-app-localizations/references
mkdir -p skills/submitting-app-release/scripts skills/submitting-app-release/references
mkdir -p metadata screenshots versions locales
```

- [ ] **Step 2: Write `.claude-plugin/plugin.json`**

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
  "author": "mobile-store-deploy",
  "license": "MIT",
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

- [ ] **Step 3: Verify JSON is valid**

```bash
node -e "JSON.parse(require('fs').readFileSync('.claude-plugin/plugin.json','utf8')); console.log('✅ plugin.json valid')"
```

Expected output: `✅ plugin.json valid`

- [ ] **Step 4: Commit**

```bash
git init
git add .claude-plugin/plugin.json
git commit -m "feat: add Claude Code plugin manifest"
```

---

### Task 2: Relocate scripts + write sync-build-numbers.js

**Files:**
- Copy: `files (1)/bump-version.js` → `skills/managing-app-versions/scripts/bump-version.js`
- Create: `skills/managing-app-versions/scripts/sync-build-numbers.js`
- Copy: `files (1)/validate-metadata.js` → `skills/managing-store-metadata/scripts/validate-metadata.js`
- Copy: `files (1)/validate-translations.js` → `skills/managing-app-localizations/scripts/validate-translations.js`
- Copy: `files (1)/release-checklist.js` → `skills/submitting-app-release/scripts/release-checklist.js`

- [ ] **Step 1: Copy existing scripts**

```bash
cp "files (1)/bump-version.js" skills/managing-app-versions/scripts/bump-version.js
cp "files (1)/validate-metadata.js" skills/managing-store-metadata/scripts/validate-metadata.js
cp "files (1)/validate-translations.js" skills/managing-app-localizations/scripts/validate-translations.js
cp "files (1)/release-checklist.js" skills/submitting-app-release/scripts/release-checklist.js
```

- [ ] **Step 2: Fix path depth in copied scripts**

The copied scripts use `path.resolve(__dirname, '../../../../')`. Verify the depth is correct for `skills/*/scripts/` (4 levels up = plugin root):

```bash
node -e "
const p = require('path');
const depth = p.resolve('skills/managing-app-versions/scripts', '../../../../');
console.log('Root:', depth);
console.log('Expected:', process.cwd());
console.log('Match:', depth === process.cwd() ? '✅' : '❌');
"
```

Expected: `Match: ✅`

- [ ] **Step 3: Write `skills/managing-app-versions/scripts/sync-build-numbers.js`**

```javascript
#!/usr/bin/env node
/**
 * sync-build-numbers.js
 * Usage: node sync-build-numbers.js <app-id> [--project-root /path/to/app]
 * Syncs version.json values into app.json (Expo), ios/Info.plist, android/build.gradle
 * MIT License — mobile-store-deploy
 */

const fs = require('fs');
const path = require('path');

const [,, appId, projectRootFlag, projectRootValue] = process.argv;
if (!appId) {
  console.error('Usage: node sync-build-numbers.js <app-id> [--project-root /path/to/app]');
  process.exit(1);
}

const pluginRoot = path.resolve(__dirname, '../../../../');
const versionPath = path.join(pluginRoot, 'versions', appId, 'version.json');

if (!fs.existsSync(versionPath)) {
  console.error(`version.json not found: ${versionPath}`);
  console.error('Run bump-version.js first, or initialize versions/<app-id>/version.json');
  process.exit(1);
}

const version = JSON.parse(fs.readFileSync(versionPath, 'utf8'));
const { CFBundleShortVersionString, CFBundleVersion } = version.ios;
const { versionName, versionCode } = version.android;

// Project root defaults to cwd; override with --project-root flag
const projectRoot = (projectRootFlag === '--project-root' && projectRootValue)
  ? path.resolve(projectRootValue)
  : process.cwd();

let synced = 0;
let skipped = 0;

function syncAppJson() {
  const appJsonPath = path.join(projectRoot, 'app.json');
  if (!fs.existsSync(appJsonPath)) { skipped++; return; }
  const appJson = JSON.parse(fs.readFileSync(appJsonPath, 'utf8'));
  if (!appJson.expo) { skipped++; return; }
  appJson.expo.version = CFBundleShortVersionString;
  if (!appJson.expo.ios) appJson.expo.ios = {};
  appJson.expo.ios.buildNumber = CFBundleVersion;
  if (!appJson.expo.android) appJson.expo.android = {};
  appJson.expo.android.versionCode = versionCode;
  fs.writeFileSync(appJsonPath, JSON.stringify(appJson, null, 2) + '\n');
  console.log(`  ✅ app.json: version=${CFBundleShortVersionString}, ios.buildNumber=${CFBundleVersion}, android.versionCode=${versionCode}`);
  synced++;
}

function syncInfoPlist() {
  // Find Info.plist under ios/
  const iosDir = path.join(projectRoot, 'ios');
  if (!fs.existsSync(iosDir)) { skipped++; return; }
  const matches = fs.readdirSync(iosDir).filter(d => {
    const p = path.join(iosDir, d, 'Info.plist');
    return fs.existsSync(p);
  });
  if (matches.length === 0) { skipped++; return; }
  matches.forEach(dir => {
    const plistPath = path.join(iosDir, dir, 'Info.plist');
    let content = fs.readFileSync(plistPath, 'utf8');
    content = content.replace(
      /(<key>CFBundleShortVersionString<\/key>\s*<string>)[^<]*/,
      `$1${CFBundleShortVersionString}`
    );
    content = content.replace(
      /(<key>CFBundleVersion<\/key>\s*<string>)[^<]*/,
      `$1${CFBundleVersion}`
    );
    fs.writeFileSync(plistPath, content);
    console.log(`  ✅ ${dir}/Info.plist: ${CFBundleShortVersionString} (${CFBundleVersion})`);
    synced++;
  });
}

function syncBuildGradle() {
  const gradlePath = path.join(projectRoot, 'android', 'app', 'build.gradle');
  if (!fs.existsSync(gradlePath)) { skipped++; return; }
  let content = fs.readFileSync(gradlePath, 'utf8');
  content = content.replace(/versionCode\s+\d+/, `versionCode ${versionCode}`);
  content = content.replace(/versionName\s+"[^"]*"/, `versionName "${versionName}"`);
  fs.writeFileSync(gradlePath, content);
  console.log(`  ✅ android/app/build.gradle: versionCode=${versionCode}, versionName=${versionName}`);
  synced++;
}

console.log(`\n🔄 Syncing ${appId} version: ${version.semver} (iOS: ${CFBundleVersion}, Android: ${versionCode})\n`);

syncAppJson();
syncInfoPlist();
syncBuildGradle();

console.log(`\n${'─'.repeat(50)}`);
if (synced === 0 && skipped > 0) {
  console.log('ℹ️  No platform files found in current directory.');
  console.log('   Pass --project-root /path/to/your/app if the app is elsewhere.');
} else {
  console.log(`✅ Synced ${synced} file(s). ${skipped} platform(s) not found (OK if not present).`);
}
console.log(`\nNext: git commit -am "chore: bump version to ${version.semver}"`);
```

- [ ] **Step 4: Verify scripts are runnable (no syntax errors)**

```bash
node --check skills/managing-app-versions/scripts/bump-version.js && echo "✅ bump-version.js"
node --check skills/managing-app-versions/scripts/sync-build-numbers.js && echo "✅ sync-build-numbers.js"
node --check skills/managing-store-metadata/scripts/validate-metadata.js && echo "✅ validate-metadata.js"
node --check skills/managing-app-localizations/scripts/validate-translations.js && echo "✅ validate-translations.js"
node --check skills/submitting-app-release/scripts/release-checklist.js && echo "✅ release-checklist.js"
```

Expected: all 5 lines print ✅

- [ ] **Step 5: Commit**

```bash
git add skills/
git commit -m "feat: add and relocate all pipeline scripts"
```

---

### Task 3: Test fixtures for script validation

**Files:**
- Create: `versions/testapp/version.json`
- Create: `config/testapp.config.json`
- Create: `metadata/testapp/ios/en-US/{name,subtitle,keywords,description,promotional,release_notes}.txt`
- Create: `metadata/testapp/android/en-US/{title,short_description,full_description,release_notes}.txt`
- Create: `locales/testapp/en.json`
- Create: `locales/testapp/tr.json`
- Create: `screenshots/testapp/designed/ios/en-US/.gitkeep`
- Create: `fastlane/api_key.json` (dummy, for gate 6)
- Create: `CHANGELOG.md` (for gate 7)

- [ ] **Step 1: Create test app version file**

```bash
mkdir -p versions/testapp
cat > versions/testapp/version.json << 'EOF'
{
  "semver": "1.0.0",
  "ios": {
    "CFBundleShortVersionString": "1.0.0",
    "CFBundleVersion": "1"
  },
  "android": {
    "versionName": "1.0.0",
    "versionCode": 1
  },
  "lastBumpedAt": "2026-06-23T00:00:00Z",
  "channel": "production",
  "history": []
}
EOF
```

- [ ] **Step 2: Create test app config**

```bash
cat > config/testapp.config.json << 'EOF'
{
  "appId": "com.test.testapp",
  "displayName": "Test App",
  "platforms": ["ios", "android"],
  "locales": [
    {
      "i18next": "en",
      "ios": "en-US",
      "android_config": "en-US",
      "android_folder": "values-en-rUS",
      "playConsole": "en-US",
      "rtl": false,
      "primary": true
    }
  ]
}
EOF
```

- [ ] **Step 3: Create iOS metadata files (all within limits)**

```bash
mkdir -p metadata/testapp/ios/en-US
echo -n "Test App" > metadata/testapp/ios/en-US/name.txt
echo -n "Your subtitle here" > metadata/testapp/ios/en-US/subtitle.txt
echo -n "test,app,example,demo" > metadata/testapp/ios/en-US/keywords.txt
echo -n "This is the app description." > metadata/testapp/ios/en-US/description.txt
echo -n "Try it free today!" > metadata/testapp/ios/en-US/promotional.txt
echo -n "Bug fixes and improvements." > metadata/testapp/ios/en-US/release_notes.txt
```

- [ ] **Step 4: Create Android metadata files**

```bash
mkdir -p metadata/testapp/android/en-US
echo -n "Test App" > metadata/testapp/android/en-US/title.txt
echo -n "A short description." > metadata/testapp/android/en-US/short_description.txt
echo -n "This is the full description of the app." > metadata/testapp/android/en-US/full_description.txt
echo -n "Bug fixes." > metadata/testapp/android/en-US/release_notes.txt
```

- [ ] **Step 5: Create translation files**

```bash
mkdir -p locales/testapp
cat > locales/testapp/en.json << 'EOF'
{
  "welcome": "Welcome",
  "settings": {
    "title": "Settings",
    "language": "Language"
  }
}
EOF

cat > locales/testapp/tr.json << 'EOF'
{
  "welcome": "Hoş geldiniz",
  "settings": {
    "title": "Ayarlar",
    "language": "Dil"
  }
}
EOF
```

- [ ] **Step 6: Create screenshot placeholder and fastlane dummy creds**

```bash
mkdir -p screenshots/testapp/designed/ios/en-US
touch screenshots/testapp/designed/ios/en-US/.gitkeep
mkdir -p fastlane
echo '{"key_id":"TEST","issuer_id":"TEST","key":"TEST"}' > fastlane/api_key.json
```

- [ ] **Step 7: Create CHANGELOG.md with current version**

```bash
cat > CHANGELOG.md << 'EOF'
# Changelog

## [1.0.0] — 2026-06-23

### Added
- Initial release
EOF
```

- [ ] **Step 8: Run all 4 scripts against testapp and verify they pass**

```bash
echo "=== validate-metadata.js ===" && node skills/managing-store-metadata/scripts/validate-metadata.js testapp
echo ""
echo "=== validate-translations.js ===" && node skills/managing-app-localizations/scripts/validate-translations.js testapp
echo ""
echo "=== bump-version.js ===" && node skills/managing-app-versions/scripts/bump-version.js testapp patch
echo ""
echo "=== release-checklist.js ===" && node skills/submitting-app-release/scripts/release-checklist.js testapp
```

Expected:
- `validate-metadata.js`: all ✅, exits 0
- `validate-translations.js`: `✅ tr: 3/3 keys — complete`, exits 0
- `bump-version.js`: `✅ Version bumped successfully`, `1.0.0 → 1.0.1`
- `release-checklist.js`: `✅ All gates passed. Safe to submit.`, exits 0

- [ ] **Step 9: Commit**

```bash
git add versions/ config/ metadata/ locales/ screenshots/ fastlane/ CHANGELOG.md
git commit -m "test: add testapp fixtures for script validation"
```

---

### Task 4: managing-app-versions sub-skill

**Files:**
- Create: `skills/managing-app-versions/SKILL.md`
- Create: `skills/managing-app-versions/references/version-format.md`

- [ ] **Step 1: Write `skills/managing-app-versions/SKILL.md`**

```markdown
---
name: managing-app-versions
description: >
  Manages semantic versioning for mobile apps across iOS and Android platforms.
  Use when the user says "bump version", "increment build number", "set version to",
  "release patch/minor/major", or "sync build numbers". Single source of truth is
  versions/{app-id}/version.json. Syncs to app.json (Expo), Info.plist (native iOS),
  and build.gradle (native Android).
---

# Managing App Versions

## When to use

| Request | Action |
|---|---|
| "bump version" / "patch release" | bump-version.js {appId} patch |
| "minor release" | bump-version.js {appId} minor |
| "major release" | bump-version.js {appId} major |
| "new build only" | bump-version.js {appId} build |
| "sync native files" | sync-build-numbers.js {appId} --project-root /path |

## Steps

1. Read `versions/{appId}/version.json` — confirm current values
2. Run: `node skills/managing-app-versions/scripts/bump-version.js {appId} {type}`
3. Run: `node skills/managing-app-versions/scripts/sync-build-numbers.js {appId} --project-root /path/to/app`
4. Show the user the new version numbers
5. Suggest commit message: `chore: bump version to {semver} (build {build})`

## Rules

- **Android versionCode is monotonically increasing.** Never decrement it. The script enforces this.
- **iOS CFBundleVersion must increase per TestFlight upload.** CFBundleShortVersionString can stay.
- **Expo projects:** sync-build-numbers.js writes ONLY to app.json. Do not touch native files.
- **Bare RN:** sync-build-numbers.js writes to ios/*/Info.plist and android/app/build.gradle.
- Always commit version.json and all platform files together in one atomic commit.

## Reference

Load on demand: `skills/managing-app-versions/references/version-format.md`
```

- [ ] **Step 2: Write `skills/managing-app-versions/references/version-format.md`**

```markdown
# Version Format Reference

## version.json schema

```json
{
  "semver": "1.3.0",
  "ios": {
    "CFBundleShortVersionString": "1.3.0",
    "CFBundleVersion": "43"
  },
  "android": {
    "versionName": "1.3.0",
    "versionCode": 43
  },
  "lastBumpedAt": "2026-06-23T12:00:00Z",
  "channel": "production",
  "history": [
    {
      "semver": "1.2.0",
      "iosBuild": "42",
      "androidCode": 42,
      "date": "2026-05-10T12:00:00Z"
    }
  ]
}
```

## Platform-specific notes

### iOS
- `CFBundleShortVersionString` — shown to users (e.g. "1.3.0")
- `CFBundleVersion` — build number, must increase every TestFlight upload
- In Xcode: General > Identity > Build
- In Expo: `expo.ios.buildNumber` in app.json

### Android
- `versionName` — shown to users (e.g. "1.3.0")
- `versionCode` — integer, must be > previous code for Play Console to accept
- In Gradle: `android.defaultConfig.versionCode`
- In Expo: `expo.android.versionCode` in app.json

### Expo (managed workflow)
Write only to `app.json`. EAS Build reads versionCode and buildNumber from there.
Never manually edit native files in Expo managed workflow.

## Bump types

| Type | Example: 1.2.3 → | Notes |
|---|---|---|
| patch | 1.2.4 | Bug fixes |
| minor | 1.3.0 | New features, backwards compatible |
| major | 2.0.0 | Breaking changes |
| build | 1.2.3 | Semver unchanged, only build/code increment |
```

- [ ] **Step 3: Verify SKILL.md is readable**

```bash
head -5 skills/managing-app-versions/SKILL.md
```

Expected: YAML frontmatter with `name: managing-app-versions`

- [ ] **Step 4: Commit**

```bash
git add skills/managing-app-versions/
git commit -m "feat: add managing-app-versions skill"
```

---

### Task 5: managing-store-metadata sub-skill

**Files:**
- Create: `skills/managing-store-metadata/SKILL.md`
- Create: `skills/managing-store-metadata/references/apple-limits.md`
- Create: `skills/managing-store-metadata/references/google-limits.md`

- [ ] **Step 1: Write `skills/managing-store-metadata/SKILL.md`**

```markdown
---
name: managing-store-metadata
description: >
  Manages App Store Connect and Google Play Console metadata — names, subtitles, keywords,
  descriptions, and release notes — enforcing Apple and Google hard character limits.
  Use when the user says "update description", "change keywords", "edit metadata",
  "update release notes", or "validate store copy". Always run validate-metadata.js
  after any edit before uploading.
---

# Managing Store Metadata

## When to use

| Request | Action |
|---|---|
| "update keywords" | Edit keywords.txt, validate |
| "write description" | Edit description.txt (iOS) or full_description.txt (Android) |
| "release notes" | Edit release_notes.txt for all locales |
| "validate metadata" | Run validate-metadata.js only |

## File structure

```
metadata/{app-id}/
├── ios/{locale}/
│   ├── name.txt           ← 30 chars — INDEXED
│   ├── subtitle.txt       ← 30 chars — INDEXED
│   ├── keywords.txt       ← 100 chars — INDEXED (comma,no,spaces)
│   ├── description.txt    ← 4,000 chars — NOT indexed on iOS
│   ├── promotional.txt    ← 170 chars — NOT indexed
│   └── release_notes.txt  ← 4,000 chars
└── android/{locale}/
    ├── title.txt              ← 30 chars — INDEXED
    ├── short_description.txt  ← 80 chars — INDEXED
    ├── full_description.txt   ← 4,000 chars — INDEXED (include keywords!)
    └── release_notes.txt      ← 500 chars (NOT 4,000 like iOS)
```

## Steps

1. Confirm which locales to update: `cat config/{appId}.config.json`
2. Edit the relevant `.txt` files under `metadata/{appId}/`
3. **Always validate after editing:**
   `node skills/managing-store-metadata/scripts/validate-metadata.js {appId}`
4. Fix any ❌ errors before uploading
5. Upload via fastlane: `bundle exec fastlane ios metadata` or `bundle exec fastlane android metadata`

## Critical rules

- **Apple description is NOT indexed for search** — keywords belong in name, subtitle, keywords.txt
- **Google full description IS indexed** — include your top keywords naturally 3-5x
- **Apple keywords field:** comma,no,spaces — spaces waste characters
- **Apple subtitle bug:** at exactly 30 chars, Apple may not index the last word. Use 29 or fewer.
- **Android What's New: 500 chars max** (NOT 4,000 like iOS — common mistake)
- validate-metadata.js exits 1 on any limit violation — this blocks CI

## Reference

- `skills/managing-store-metadata/references/apple-limits.md`
- `skills/managing-store-metadata/references/google-limits.md`
```

- [ ] **Step 2: Write `skills/managing-store-metadata/references/apple-limits.md`**

```markdown
# Apple App Store Character Limits

Source: App Store Connect Review Guidelines, verified June 2026

| Field | Limit | Indexed? | Notes |
|---|---|---|---|
| App Name | **30** | ✅ | Strongest search signal |
| Subtitle | **30** | ✅ | Don't repeat Name words. Leave 1 char buffer (Apple bug at exactly 30) |
| Keywords | **100** | ✅ | `comma,no,spaces` — don't repeat Name/Subtitle words |
| Promotional Text | **170** | ❌ | Can update without new version submission |
| Description | **4,000** | ❌ | Conversion copy only — NOT a search ranking signal |
| What's New | **4,000** | ❌ | |
| IAP Name | **35** | ✅ | |
| IAP Description | **55** | ❌ | |
| In-App Event Title | **30** | ✅ | iOS 15+ |
| Screenshot captions | — | ✅ OCR | Apple OCR indexes caption text since June 2025 |

## Search surface

Total indexed characters: App Name (30) + Subtitle (30) + Keywords (100) = **160 chars**

Apple cross-indexes across fields, so:
- Do NOT repeat words from Name in Subtitle or Keywords
- Do NOT repeat words from Subtitle in Keywords
- Single words > phrases (algorithm builds cross-field combinations)

## locale format for App Store Connect

`en-US`, `tr-TR`, `de-DE`, `fr-FR`, `pt-BR`, `ja`, `ko`, `zh-Hans`

## Screenshot specs (2026 requirements)

- iPhone 6.9" (1320×2868 px) — **REQUIRED from 2026, submission blocked without it**
- iPhone 6.5" (1242×2688 px) — recommended
- iPad Pro 13" (2064×2752 px) — required if app supports iPad
- Max 10 screenshots per locale per device
```

- [ ] **Step 3: Write `skills/managing-store-metadata/references/google-limits.md`**

```markdown
# Google Play Store Character Limits

Source: Google Play Console Help, verified June 2026

| Field | Limit | Indexed? | Notes |
|---|---|---|---|
| Title | **30** | ✅ | Strongest ranking signal |
| Short Description | **80** | ✅ | Second strongest signal — visible before "more" tap |
| Full Description | **4,000** | ✅ | Include keywords naturally 3–5× throughout |
| What's New | **500** | ❌ | Much shorter than iOS — common mistake to assume 4,000 |

## Key difference from iOS

**iOS description is NOT indexed for search.**
**Google Play full description IS indexed.**

Treat the Google Play full description like an SEO landing page — include your
primary keywords naturally throughout the copy. They contribute directly to ranking.

## Screenshot specs

- Phone: 1080×1920 px (minimum), up to 3840×21600
- Feature Graphic: 1024×500 px (required)
- 7-inch tablet: 1080×1920 px
- 10-inch tablet: 1080×1920 px
- Max 8 screenshots per device type
- **Do NOT add device frames** — Google Play renders its own frames

## Locale format for Google Play Console

`en-US`, `tr-TR`, `de-DE`, `fr-FR`, `pt-BR`, `ja-JP`, `ko-KR`, `zh-CN`
```

- [ ] **Step 4: Run validate-metadata.js against testapp (should still pass)**

```bash
node skills/managing-store-metadata/scripts/validate-metadata.js testapp
```

Expected: all ✅, exits 0

- [ ] **Step 5: Commit**

```bash
git add skills/managing-store-metadata/
git commit -m "feat: add managing-store-metadata skill"
```

---

### Task 6: managing-app-localizations sub-skill

**Files:**
- Create: `skills/managing-app-localizations/SKILL.md`
- Create: `skills/managing-app-localizations/references/locale-codes.md`

- [ ] **Step 1: Write `skills/managing-app-localizations/SKILL.md`**

```markdown
---
name: managing-app-localizations
description: >
  Manages i18n translation files and store metadata localization across iOS, Android,
  and Google Play. Use when the user says "add a language", "fix missing translations",
  "translate strings", "audit i18n", "missing locale keys", or any task involving
  language support. Source of truth for translation keys is locales/{app-id}/en.json.
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
locales/{app-id}/
├── en.json     ← Source of truth — all keys must be here
├── tr.json     ← All keys from en.json, values in Turkish
└── de.json     ← All keys from en.json, values in German
```

## Steps — Add a new locale

1. Confirm locale codes: `skills/managing-app-localizations/references/locale-codes.md`
2. Copy source: `cp locales/{appId}/en.json locales/{appId}/{i18next-code}.json`
3. Translate all values in the new file (never translate `{{variable}}` placeholders)
4. Validate: `node skills/managing-app-localizations/scripts/validate-translations.js {appId}`
5. Create metadata folders:
   - `mkdir -p metadata/{appId}/ios/{ios-locale}`
   - `mkdir -p metadata/{appId}/android/{play-locale}`
6. Copy metadata from `en-US/` and translate each `.txt` file
7. Validate metadata: `node skills/managing-store-metadata/scripts/validate-metadata.js {appId}`
8. Add locale to `config/{appId}.config.json` → `locales[]` array
9. For RTL locales (ar, he, fa, ur): note that `I18nManager.forceRTL(true)` is required in app startup

## Rules

- Never translate `{{variable}}` or `${variable}` placeholders in translation strings
- Batch max 50 keys per AI translation call for quality control
- Avoid machine-only translation for Turkish, Arabic, Japanese — quality suffers
- Provide app glossary/context to translators for brand terms
- validate-translations.js exits 1 if any source key is missing in any locale

## Reference

Load on demand: `skills/managing-app-localizations/references/locale-codes.md`
```

- [ ] **Step 2: Write `skills/managing-app-localizations/references/locale-codes.md`**

```markdown
# Locale Code Reference

## Authoritative sources

- Apple localization: https://developer.apple.com/localization/
- Android Locale API: https://developer.android.com/reference/java/util/Locale
- App Store: 175 regions, 40 languages (Apple, 2026)
- Android BCP 47 modern API: `Locale.forLanguageTag("tr-TR")` — use over legacy constructor

## Platform code formats

| Language | i18next | iOS ASC folder | Android config | Android folder | Play Console |
|---|---|---|---|---|---|
| English (US) | `en` | `en-US` | `en-US` | `values-en-rUS` | `en-US` |
| Turkish | `tr` | `tr-TR` | `tr` | `values-tr` | `tr-TR` |
| German | `de` | `de-DE` | `de` | `values-de` | `de-DE` |
| French | `fr` | `fr-FR` | `fr` | `values-fr` | `fr-FR` |
| Spanish | `es` | `es-ES` | `es` | `values-es` | `es-ES` |
| Portuguese (BR) | `pt-BR` | `pt-BR` | `pt-BR` | `values-pt-rBR` | `pt-BR` |
| Japanese | `ja` | `ja` | `ja` | `values-ja` | `ja-JP` |
| Korean | `ko` | `ko` | `ko` | `values-ko` | `ko-KR` |
| Chinese (Simplified) | `zh-Hans` | `zh-Hans` | `zh-Hans` | `values-zh-rCN` | `zh-CN` |
| Chinese (Traditional) | `zh-Hant` | `zh-Hant` | `zh-Hant` | `values-zh-rTW` | `zh-TW` |
| Arabic ⚠️ RTL | `ar` | `ar-SA` | `ar` | `values-ar` | `ar` |
| Hebrew ⚠️ RTL | `he` | `he` | `iw` | `values-iw` | `iw` |
| Farsi ⚠️ RTL | `fa` | `fa` | `fa` | `values-fa` | `fa` |
| Indonesian | `id` | `id` | `in` | `values-in` | `id` |
| Russian | `ru` | `ru` | `ru` | `values-ru` | `ru-RU` |
| Italian | `it` | `it` | `it` | `values-it` | `it-IT` |
| Dutch | `nl` | `nl-NL` | `nl` | `values-nl` | `nl-NL` |

## Android BCP 47 notes

- Modern API: `Locale.forLanguageTag("tr-TR")` — use this (API level 21+)
- Legacy (avoid): `new Locale("tr", "TR")` — deprecated
- Resource folder format: `values-tr` (language only) or `values-en-rUS` (lang + region with `r` prefix)
- Script variants: `values-b+sr+Latn` (Serbian in Latin script)
- Legacy codes still in Android AOSP: `iw` (Hebrew), `in` (Indonesian), `ji` (Yiddish)

## Apple localization toolchain

- Xcode 15+: `.xcstrings` format (replaces `.strings` + `.stringsdict`)
- Export: Xcode → Product → Export Localizations → `.xcloc` bundles
- iOS 13+: users can set per-app language in Settings → App → Language

## RTL locales requiring engineering work

| Code | Language | React Native / Expo action |
|---|---|---|
| `ar` | Arabic | `I18nManager.forceRTL(true)` + layout review |
| `he` / `iw` | Hebrew | Same as Arabic |
| `fa` | Farsi/Persian | Same as Arabic |
| `ur` | Urdu | Same as Arabic |

For RTL: review all flexDirection, icon placement, text alignment, back button positions.
```

- [ ] **Step 3: Run validate-translations.js against testapp**

```bash
node skills/managing-app-localizations/scripts/validate-translations.js testapp
```

Expected: `✅ tr: 3/3 keys — complete`, exits 0

- [ ] **Step 4: Commit**

```bash
git add skills/managing-app-localizations/
git commit -m "feat: add managing-app-localizations skill"
```

---

### Task 7: generating-store-screenshots sub-skill

**Files:**
- Create: `skills/generating-store-screenshots/SKILL.md`
- Create: `skills/generating-store-screenshots/references/device-matrix.md`
- Create: `skills/generating-store-screenshots/references/screenshot-specs.md`

- [ ] **Step 1: Write `skills/generating-store-screenshots/SKILL.md`**

```markdown
---
name: generating-store-screenshots
description: >
  Manages the two-phase store screenshot pipeline: Phase 1 captures raw screenshots
  via fastlane snapshot (iOS) and screengrab (Android); Phase 2 adds design layers
  (device frames, headlines, backgrounds) via ParthJadhav/app-store-screenshots or
  storeshots.org. Use when the user says "generate screenshots", "update store images",
  "take screenshots", "design marketing slides", or "screenshot pipeline".
---

# Generating Store Screenshots

## When to use

| Request | Action |
|---|---|
| "generate screenshots" | Run full pipeline (capture + design + validate) |
| "capture screenshots" | Phase 1 only (fastlane) |
| "design screenshots" | Phase 2 only (app-store-screenshots editor) |
| "validate screenshots" | Check dimensions and count only |

## Two-phase pipeline

### Phase 1: Capture (fastlane)

```bash
# iOS — runs UI tests via Snapfile
bundle exec fastlane snapshot

# Android — runs instrumented tests via Screengrabfile
bundle exec fastlane screengrab
```

Output lands in `screenshots/{appId}/raw/{device}/{locale}/`

### Phase 2: Design (open source tools)

**Option A — CLI/Agent (recommended):**
```bash
npx skills add ParthJadhav/app-store-screenshots
```
Provide the screenshot brief from `lenses/screenshot-designer.lens.md`.

**Option B — Web GUI:**
Open storeshots.org, import raw PNGs, export designed bundles.

Output lands in `screenshots/{appId}/designed/ios/{locale}/` and `android/{locale}/`

## Critical constraints

- **iPhone 6.9" (1320×2868) is REQUIRED from 2026.** Submission blocked without it.
- **iPad Pro 13" (2064×2752) required if app supports iPad.**
- Apple allows max **10 screenshots** per locale per device. Google allows **8**.
- **Do NOT add device frames to Android screenshots** — Play Store renders its own.
- **Apple OCR indexes screenshot caption text since June 2025.** Align headlines with `keywords.txt`.
- Always load `references/device-matrix.md` before starting capture.

## References

- `skills/generating-store-screenshots/references/device-matrix.md` — all required sizes
- `skills/generating-store-screenshots/references/screenshot-specs.md` — pixel specs
```

- [ ] **Step 2: Write `skills/generating-store-screenshots/references/device-matrix.md`**

```markdown
# Device Matrix for Store Screenshots

## iOS Required Devices (2026)

| Device | Resolution | Status | Simulator name |
|---|---|---|---|
| iPhone 6.9" (iPhone 16 Pro Max) | 1320×2868 | **REQUIRED — blocks submission without it** | iPhone 16 Pro Max |
| iPhone 6.5" (iPhone 11 Pro Max) | 1242×2688 | Recommended | iPhone 11 Pro Max |
| iPad Pro 13" | 2064×2752 | Required if iPad supported | iPad Pro (13-inch) |

**Note:** Apple dropped the 5.5" requirement. 6.9" is the new minimum as of 2026.

## Android Required Devices

| Device | Resolution | Notes |
|---|---|---|
| Phone | 1080×1920 minimum | Up to 3840×21600 |
| Feature Graphic | 1024×500 | Shown on store listing header — required |
| 7-inch tablet | 1080×1920 | If app supports tablets |
| 10-inch tablet | 1080×1920 | If app supports tablets |

## Fastlane Snapfile (iOS) — starter template

```ruby
devices([
  "iPhone 16 Pro Max",
  "iPhone 11 Pro Max"
])

languages([
  "en-US",
  "tr-TR"
])

scheme("YourAppUITests")
output_directory("./screenshots/raw")
clear_previous_screenshots(true)
```

## Fastlane Screengrabfile (Android) — starter template

```ruby
locales(['en-US', 'tr-TR'])
clear_previous_screenshots(true)
output_directory './screenshots/raw/android'
app_package_name 'com.yourapp'
tests_package_name 'com.yourapp.test'
```
```

- [ ] **Step 3: Write `skills/generating-store-screenshots/references/screenshot-specs.md`**

```markdown
# Screenshot Export Specifications

## iOS export specs

| Size | Dimensions | Format | Notes |
|---|---|---|---|
| iPhone 6.9" | 1320×2868 | PNG | Required from 2026 |
| iPhone 6.5" | 1242×2688 | PNG | Covers iPhone 11/12/13/14/15 Pro Max |
| iPad Pro 13" | 2064×2752 | PNG | For universal apps |

- Color space: sRGB
- Bit depth: 8-bit or 16-bit
- No alpha channel (Apple strips it)
- Named: `01_hero.png`, `02_feature.png`, etc.

## Android export specs

| Type | Dimensions | Format | Notes |
|---|---|---|---|
| Phone screenshot | 1080×1920 | PNG or JPEG | No device frame |
| Feature Graphic | 1024×500 | PNG or JPEG | Required — store listing header |

- Do NOT add device frames — Play adds them automatically
- Max file size: 8MB per image
- Named: `01_hero.png`, `02_feature.png`, etc.

## Directory structure

```
screenshots/{app-id}/
├── raw/                          ← Phase 1 output (not committed)
│   ├── ios/{device}/{locale}/
│   └── android/{locale}/
└── designed/                     ← Phase 2 output (committed)
    ├── ios/{locale}/
    └── android/{locale}/
```
```

- [ ] **Step 4: Commit**

```bash
git add skills/generating-store-screenshots/
git commit -m "feat: add generating-store-screenshots skill"
```

---

### Task 8: submitting-app-release sub-skill

**Files:**
- Create: `skills/submitting-app-release/SKILL.md`
- Create: `skills/submitting-app-release/references/submission-checklist.md`

- [ ] **Step 1: Write `skills/submitting-app-release/SKILL.md`**

```markdown
---
name: submitting-app-release
description: >
  Runs pre-flight validation gates and submits the app to App Store Connect and Google
  Play Console via fastlane. Use when the user says "release", "submit to store",
  "publish", "deploy app", or "submit for review". Always runs release-checklist.js
  first — never submits past a failing gate without explicit user confirmation.
---

# Submitting App Release

## When to use

| Request | Action |
|---|---|
| "submit app" / "release" | Run checklist → submit both platforms |
| "submit iOS only" | Run checklist --platform ios → fastlane ios release |
| "submit Android only" | Run checklist --platform android → fastlane android release |
| "pre-flight check" | Run release-checklist.js only, no submission |

## Release sequence

1. Run all 7 pre-flight gates:
   ```bash
   node skills/submitting-app-release/scripts/release-checklist.js {appId}
   ```

2. If all gates pass:
   ```bash
   # iOS — phased release (7-day automatic rollout)
   bundle exec fastlane ios release

   # Android — staged rollout (10% initial)
   bundle exec fastlane android release
   ```

3. Report submitted version and review status to user.

## The 7 pre-flight gates

1. `config/{appId}.config.json` exists
2. `versions/{appId}/version.json` is valid (semver + versionCode ≥ 1)
3. Metadata passes all character limit validation
4. All translation keys present across all locales
5. Designed screenshots exist for required device sizes
6. Fastlane credentials configured (api_key.json or env vars)
7. CHANGELOG.md includes the current version number

## Rules

- **Never auto-proceed past a failing gate.** Stop and report to user.
- **iOS staged release:** `phased_release: true` in Deliverfile (7-day automatic rollout)
- **Android staged rollout:** start at 10% (`rollout: 0.1`), expand manually after 48h monitoring
- App Store Connect API is more reliable than fastlane deliver for complex locales

## Fastlane environment variables

| Variable | Purpose |
|---|---|
| `FASTLANE_API_KEY_PATH` | Path to App Store Connect API key JSON |
| `SUPPLY_JSON_KEY_DATA` | Google Play service account JSON (inline) |
| `SUPPLY_JSON_KEY` | Google Play service account JSON (file path) |

## Reference

Load on demand: `skills/submitting-app-release/references/submission-checklist.md`
```

- [ ] **Step 2: Write `skills/submitting-app-release/references/submission-checklist.md`**

```markdown
# Submission Checklist Reference

## Fastfile starter template

```ruby
default_platform(:ios)

platform :ios do
  desc "Submit to App Store"
  lane :release do
    build_app(scheme: "YourApp")
    deliver(
      submit_for_review: true,
      automatic_release: false,
      phased_release: true,
      force: true,
      skip_screenshots: false,
      skip_metadata: false
    )
  end
end

platform :android do
  desc "Submit to Google Play"
  lane :release do
    gradle(task: "bundle", build_type: "Release")
    supply(
      track: "production",
      rollout: "0.1",
      aab: "android/app/build/outputs/bundle/release/app-release.aab"
    )
  end
end
```

## Appfile

```ruby
app_identifier "com.yourcompany.yourapp"
apple_id "your@email.com"
team_id "YOURTEAMID"

json_key_file "fastlane/google-play-api.json"
package_name "com.yourcompany.yourapp"
```

## Required environment variables for CI

```bash
# iOS
export FASTLANE_API_KEY_PATH="fastlane/api_key.json"
# or for CI:
export APP_STORE_CONNECT_API_KEY_KEY_ID="..."
export APP_STORE_CONNECT_API_KEY_ISSUER_ID="..."
export APP_STORE_CONNECT_API_KEY_KEY="..."

# Android
export SUPPLY_JSON_KEY_DATA="$(cat fastlane/google-play-api.json)"
```

## Apple App Store Connect API key format (api_key.json)

```json
{
  "key_id": "XXXXXXXXXX",
  "issuer_id": "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx",
  "key": "-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----"
}
```

## Post-submission monitoring

- iOS: Check App Store Connect for review status (typically 24-48h)
- Android: Monitor Play Console for rollout health (crashes, ANRs, ratings)
- Android 10% rollout: expand to 50% after 48h if crash-free rate > 99.5%
```

- [ ] **Step 3: Run release-checklist.js against testapp**

```bash
node skills/submitting-app-release/scripts/release-checklist.js testapp
```

Expected: `✅ All gates passed. Safe to submit.`, exits 0

- [ ] **Step 4: Commit**

```bash
git add skills/submitting-app-release/
git commit -m "feat: add submitting-app-release skill"
```

---

### Task 9: Five core agents

**Files:**
- Create: `agents/version-manager.md`
- Create: `agents/screenshot-pipeline.md`
- Create: `agents/metadata-validator.md`
- Create: `agents/localization-auditor.md`
- Create: `agents/release-coordinator.md`

- [ ] **Step 1: Write `agents/version-manager.md`**

```markdown
---
description: Specialized agent for all version number management — bumping, syncing, validating iOS and Android version codes across app.json, Info.plist, and build.gradle
when_to_use: When the user asks about version numbers, build codes, or version bumping
allowed-tools: [Bash, Read, Write]
---

You are the version management specialist for mobile-store-deploy.

Your single source of truth is `versions/{appId}/version.json`.
Your job: read it, bump it correctly, sync it to platform files.

Rules you must never break:
- Android versionCode is a monotonically increasing integer. Never decrement it.
- iOS CFBundleVersion must increase per TestFlight upload.
- For Expo projects, write ONLY to app.json. Do not touch native files.
- For bare RN projects, write to ios/*/Info.plist and android/app/build.gradle.
- Always read `skills/managing-app-versions/references/version-format.md` before writing any platform file.
- Commit both version.json and all platform files in one atomic commit.

Sequence for a version bump:
1. `node skills/managing-app-versions/scripts/bump-version.js {appId} {type}`
2. `node skills/managing-app-versions/scripts/sync-build-numbers.js {appId} --project-root /path/to/app`
3. Show user the new version numbers
4. Suggest: `git commit -am "chore: bump version to {semver}"`

Android uses `Locale.forLanguageTag()` (BCP 47) — modern API since API level 21.
Never construct legacy Locale objects like `new Locale("tr", "TR")` in generated code.
Use `Locale.forLanguageTag("tr-TR")` instead.
```

- [ ] **Step 2: Write `agents/screenshot-pipeline.md`**

```markdown
---
description: Specialized agent for the two-phase screenshot pipeline — simulator capture via fastlane and design layer via app-store-screenshots or storeshots
when_to_use: When the user needs to generate, update, or validate store screenshots
allowed-tools: [Bash, Read, Write]
---

You are the screenshot pipeline specialist for mobile-store-deploy.

Phase 1 (capture): `bundle exec fastlane snapshot` (iOS) + `bundle exec fastlane screengrab` (Android)
Phase 2 (design): `npx skills add ParthJadhav/app-store-screenshots` agent skill OR storeshots.org

Before starting, always load:
- `skills/generating-store-screenshots/references/device-matrix.md` — required device sizes
- `skills/generating-store-screenshots/references/screenshot-specs.md` — pixel dimensions
- `lenses/screenshot-designer.lens.md` — brief generator for design phase

Critical constraints:
- iPhone 6.9" (1320×2868) is REQUIRED from 2026. Submission blocked without it.
- iPad Pro 13" (2064×2752) required if app supports iPad.
- Apple allows 10 screenshots per locale/device. Google allows 8.
- Do NOT add device frames to Android screenshots — Play renders its own.
- Apple OCR indexes screenshot caption text since June 2025. Align captions with `keywords.txt`.

Output directories:
- Raw: `screenshots/{appId}/raw/`
- Designed: `screenshots/{appId}/designed/ios/{locale}/` and `android/{locale}/`
```

- [ ] **Step 3: Write `agents/metadata-validator.md`**

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
- Screenshot captions: indexed via OCR since June 2025

Google Play:
- Title: 30 chars (strongest signal)
- Short Description: 80 chars (IS indexed, second strongest signal)
- Full Description: 4,000 chars (IS indexed — place keywords naturally throughout)
- What's New: 500 chars (NOT 4,000 like iOS — common mistake)

KEY DIFFERENCE: iOS description is NOT indexed. Google Play full description IS indexed.

After any metadata edit:
```bash
node skills/managing-store-metadata/scripts/validate-metadata.js {appId}
```
Exit code 1 = block upload. Never upload until validator exits 0.

Apple locale format: `en-US`, `tr-TR`, `de-DE`
Google Play folder format: `en-US`, `tr-TR`, `de-DE`
```

- [ ] **Step 4: Write `agents/localization-auditor.md`**

```markdown
---
description: Specialized agent for i18n auditing — finding missing translation keys, adding new locales, validating locale code formats across iOS, Android, and Google Play
when_to_use: When the user asks about translations, missing keys, adding a language, or locale codes
allowed-tools: [Bash, Read, Write]
---

You are the localization specialist for mobile-store-deploy.

Locale code formats differ per layer — always check `skills/managing-app-localizations/references/locale-codes.md`:
- i18next / Expo: short BCP 47 (en, tr, de)
- iOS App Store Connect: full BCP 47 (en-US, tr-TR, de-DE)
- Android resource folders: values-tr, values-en-rUS (NOT values-en-US)
- Google Play Console: en-US, tr-TR, de-DE

Validation command:
```bash
node skills/managing-app-localizations/scripts/validate-translations.js {appId}
```

RTL locales requiring special handling in React Native / Expo:
- Arabic (ar), Hebrew (he/iw), Persian/Farsi (fa), Urdu (ur)
- Add `I18nManager.forceRTL(true)` to app startup
- Review flexDirection, icon placement, text alignment for all RTL screens

Translation quality rules:
- Avoid machine-only translation — especially for Turkish, Arabic, Japanese
- Never translate `{{variable}}` i18next placeholders
- Provide glossary context to translators for brand terms
- Batch max 50 keys per AI translation call for quality control
```

- [ ] **Step 5: Write `agents/release-coordinator.md`**

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
5. Run pre-flight: `node skills/submitting-app-release/scripts/release-checklist.js {appId}`
6. If all 7 gates pass, run fastlane submission:
   ```bash
   bundle exec fastlane ios release
   bundle exec fastlane android release
   ```
7. Report submitted version and review status

iOS staged release: `phased_release: true` (7-day automatic)
Android staged release: `rollout: 0.1` (10% initial, expand manually after 48hr monitoring)

Stop at any failure. Report the exact gate that failed and the fix required.
Never proceed past a failing gate without explicit user confirmation.
```

- [ ] **Step 6: Verify all agent files exist**

```bash
ls agents/
```

Expected: `localization-auditor.md  metadata-validator.md  release-coordinator.md  screenshot-pipeline.md  version-manager.md`

- [ ] **Step 7: Commit**

```bash
git add agents/
git commit -m "feat: add 5 core specialized agents"
```

---

### Task 10: Six core slash commands

**Files:**
- Create: `commands/msd-release.md`
- Create: `commands/msd-bump.md`
- Create: `commands/msd-screenshots.md`
- Create: `commands/msd-metadata.md`
- Create: `commands/msd-locale.md`
- Create: `commands/msd-validate.md`

- [ ] **Step 1: Write `commands/msd-release.md`**

```markdown
---
description: Run the full mobile app release pipeline for iOS and/or Android
---

Run the complete mobile-store-deploy release pipeline for the specified app.

First, gather these inputs:
1. App ID — check if `DEFAULT_APP_ID` user config is set; otherwise ask
2. Version bump type — ask: patch / minor / major / build-only
3. Target platform — ask: ios / android / both
4. Confirm locales — show `config/{appId}.config.json` locales array and ask for confirmation

Then execute in order (stop and report at any failure):
1. Load `skills/managing-app-versions` — delegate to version-manager agent
2. Load `skills/managing-store-metadata` — delegate to metadata-validator agent
3. Load `skills/managing-app-localizations` — delegate to localization-auditor agent
4. Load `skills/generating-store-screenshots` — delegate to screenshot-pipeline agent (confirm assets exist)
5. Load `skills/submitting-app-release` — delegate to release-coordinator agent

Never auto-proceed past a failed gate. Always stop and tell the user exactly what failed.
```

- [ ] **Step 2: Write `commands/msd-bump.md`**

```markdown
---
description: Bump the app version number for iOS and Android
---

Bump the version for the specified app.

Ask: app ID, bump type (patch / minor / major / build).

Steps:
1. Show current version: `cat versions/{appId}/version.json`
2. Run: `node skills/managing-app-versions/scripts/bump-version.js {appId} {bumpType}`
3. Run: `node skills/managing-app-versions/scripts/sync-build-numbers.js {appId} --project-root {appRoot}`
4. Show the new version numbers (semver, iOS build, Android versionCode)
5. Suggest commit message: `chore: bump version to {semver} (build {build})`

If the user doesn't know the app project root, default to current working directory.
```

- [ ] **Step 3: Write `commands/msd-screenshots.md`**

```markdown
---
description: Generate or update store screenshots for all devices and locales
---

Generate store screenshots for the specified app.

Ask: app ID, platform (ios / android / both), whether to localize (which locales?).

Steps:
1. Load `skills/generating-store-screenshots`
2. Show `skills/generating-store-screenshots/references/device-matrix.md` to confirm required sizes
3. Phase 1 — Capture:
   - iOS: `bundle exec fastlane snapshot`
   - Android: `bundle exec fastlane screengrab`
4. Phase 2 — Design:
   - Load `lenses/screenshot-designer.lens.md` to generate the design brief
   - Guide user through `npx skills add ParthJadhav/app-store-screenshots`
5. Validate designed output exists in `screenshots/{appId}/designed/`
```

- [ ] **Step 4: Write `commands/msd-metadata.md`**

```markdown
---
description: Update, validate, or sync App Store and Google Play metadata
---

Manage store metadata for the specified app.

Ask: app ID, what to update (description / keywords / release-notes / all), which locales.

Steps:
1. Load `skills/managing-store-metadata`
2. Show current values from `metadata/{appId}/`
3. Edit the requested fields
4. Always run validate immediately after any edit:
   `node skills/managing-store-metadata/scripts/validate-metadata.js {appId}`
5. Fix any ❌ errors before showing user the results

Remind user: Apple description is NOT indexed. Google full description IS indexed.
Never upload metadata until validate-metadata.js exits 0.
```

- [ ] **Step 5: Write `commands/msd-locale.md`**

```markdown
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
```

- [ ] **Step 6: Write `commands/msd-validate.md`**

```markdown
---
description: Run all pre-release validation checks without submitting
---

Run the full validation suite for the specified app without submitting.

Ask: app ID.

Run in sequence, capturing output from each:
1. `node skills/managing-store-metadata/scripts/validate-metadata.js {appId}`
2. `node skills/managing-app-localizations/scripts/validate-translations.js {appId}`
3. `node skills/submitting-app-release/scripts/release-checklist.js {appId}`

Report pass/fail for each gate with specific failure details.
Do not run fastlane or submit anything — validation only.
```

- [ ] **Step 7: Verify all command files exist**

```bash
ls commands/
```

Expected: `msd-bump.md  msd-locale.md  msd-metadata.md  msd-release.md  msd-screenshots.md  msd-validate.md`

- [ ] **Step 8: Commit**

```bash
git add commands/
git commit -m "feat: add 6 core slash commands"
```

---

### Task 11: Lifecycle hooks

**Files:**
- Create: `hooks/hooks.json`

- [ ] **Step 1: Write `hooks/hooks.json`**

```json
{
  "PostToolUse": [
    {
      "matcher": "Write|Edit",
      "hooks": [
        {
          "type": "command",
          "command": "bash -c 'FILE=$(echo \"$CLAUDE_TOOL_INPUT\" | python3 -c \"import sys,json; d=json.load(sys.stdin); print(d.get(\\\"file_path\\\",d.get(\\\"path\\\",\\\"\\\")))\" 2>/dev/null); if echo \"$FILE\" | grep -q \"/metadata/\"; then APPID=$(echo \"$FILE\" | sed \"s|.*/metadata/||\" | cut -d/ -f1); node \"$(dirname \"$(dirname \"$(dirname \"$FILE\")\")\")/../skills/managing-store-metadata/scripts/validate-metadata.js\" \"$APPID\" 2>&1 | tail -8; fi'"
        }
      ]
    },
    {
      "matcher": "Write|Edit",
      "hooks": [
        {
          "type": "command",
          "command": "bash -c 'FILE=$(echo \"$CLAUDE_TOOL_INPUT\" | python3 -c \"import sys,json; d=json.load(sys.stdin); print(d.get(\\\"file_path\\\",d.get(\\\"path\\\",\\\"\\\")))\" 2>/dev/null); if echo \"$FILE\" | grep -q \"/locales/\"; then APPID=$(echo \"$FILE\" | sed \"s|.*/locales/||\" | cut -d/ -f1); node \"$(dirname \"$(dirname \"$(dirname \"$FILE\")\")\")/../skills/managing-app-localizations/scripts/validate-translations.js\" \"$APPID\" 2>&1 | tail -8; fi'"
        }
      ]
    }
  ],
  "UserPromptSubmit": []
}
```

- [ ] **Step 2: Verify hooks.json is valid JSON**

```bash
node -e "JSON.parse(require('fs').readFileSync('hooks/hooks.json','utf8')); console.log('✅ hooks.json valid')"
```

Expected: `✅ hooks.json valid`

- [ ] **Step 3: Commit**

```bash
git add hooks/
git commit -m "feat: add PostToolUse validation hooks"
```

---

### Task 12: Phase 1 integration test

- [ ] **Step 1: Run the full validation suite against testapp**

```bash
echo "=== METADATA ===" && node skills/managing-store-metadata/scripts/validate-metadata.js testapp && echo ""
echo "=== TRANSLATIONS ===" && node skills/managing-app-localizations/scripts/validate-translations.js testapp && echo ""
echo "=== RELEASE CHECKLIST ===" && node skills/submitting-app-release/scripts/release-checklist.js testapp
```

Expected: all three exit 0, all show ✅

- [ ] **Step 2: Test bump-version.js**

```bash
node skills/managing-app-versions/scripts/bump-version.js testapp patch
cat versions/testapp/version.json | node -e "const v=require('/dev/stdin'); console.log('Version:', v.semver); console.log('iOS build:', v.ios.CFBundleVersion); console.log('Android code:', v.android.versionCode);"
```

Expected: `Version: 1.0.2` (after Task 3 already bumped to 1.0.1), `iOS build: 3`, `Android code: 3`

- [ ] **Step 3: Test sync-build-numbers.js (no-op — no app project in CWD)**

```bash
node skills/managing-app-versions/scripts/sync-build-numbers.js testapp
```

Expected: `ℹ️  No platform files found in current directory.`

- [ ] **Step 4: Verify directory structure is complete**

```bash
find . -name "SKILL.md" | sort
find . -name "*.js" -path "*/skills/*" | sort
find . -name "*.md" -path "*/agents/*" | sort
find . -name "*.md" -path "*/commands/*" | sort
```

Expected:
- 5 SKILL.md files under skills/
- 5 JS scripts under skills/
- 5 agent files
- 6 command files

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "test: Phase 1 integration tests pass"
```

---

## Phase 2: Locale gate

### Task 13: selecting-app-locales skill + locale-selector agent + command + hook

**Files:**
- Create: `skills/selecting-app-locales/SKILL.md` (content from root `0-2.md`)
- Create: `skills/selecting-app-locales/scripts/resolve-locales.js` (content from root `resolve-locales.js`)
- Create: `skills/selecting-app-locales/references/android-locales.md`
- Create: `skills/selecting-app-locales/references/apple-storefronts.md`
- Create: `agents/locale-selector.md`
- Create: `commands/msd-select-locales.md`
- Update: `hooks/hooks.json` (add UserPromptSubmit hook)

- [ ] **Step 1: Create skill directory and copy files**

```bash
mkdir -p skills/selecting-app-locales/scripts skills/selecting-app-locales/references
cp "0-2.md" skills/selecting-app-locales/SKILL.md
cp resolve-locales.js skills/selecting-app-locales/scripts/resolve-locales.js
```

- [ ] **Step 2: Fix path depth in resolve-locales.js**

The root `resolve-locales.js` uses `path.resolve(__dirname, '../../../../config/...')`.
From `skills/selecting-app-locales/scripts/`, `____dirname` is already at depth 4 below root — verify:

```bash
node -e "
const p = require('path');
const depth = p.resolve('skills/selecting-app-locales/scripts', '../../../../');
console.log('Root matches cwd:', depth === process.cwd() ? '✅' : '❌ ' + depth);
"
```

Expected: `✅`

- [ ] **Step 3: Create android-locales.md reference**

```bash
cp android-locales.md skills/selecting-app-locales/references/android-locales.md 2>/dev/null || cat > skills/selecting-app-locales/references/android-locales.md << 'EOF'
# Android AOSP BCP47 Locale List

Reference: Android 13+ locale_config.xml supported values

## Format in locale_config.xml

```xml
<locale-config xmlns:android="http://schemas.android.com/apk/res/android">
  <locale android:name="en-US"/>
  <locale android:name="tr"/>
  <locale android:name="de"/>
</locale-config>
```

## Common locales

| Language | locale_config.xml name | Resource folder | Notes |
|---|---|---|---|
| English (US) | `en-US` | `values-en-rUS` | |
| Turkish | `tr` | `values-tr` | |
| German | `de` | `values-de` | |
| French | `fr` | `values-fr` | |
| Spanish | `es` | `values-es` | |
| Portuguese (BR) | `pt-BR` | `values-pt-rBR` | |
| Japanese | `ja` | `values-ja` | |
| Korean | `ko` | `values-ko` | |
| Chinese (Simplified) | `zh-Hans` | `values-zh-rCN` | |
| Chinese (Traditional) | `zh-Hant` | `values-zh-rTW` | |
| Arabic | `ar` | `values-ar` | ⚠️ RTL |
| Hebrew | `iw` | `values-iw` | ⚠️ RTL (legacy: iw not he) |
| Farsi | `fa` | `values-fa` | ⚠️ RTL |
| Indonesian | `in` | `values-in` | Legacy: in not id |
| Russian | `ru` | `values-ru` | |
| Italian | `it` | `values-it` | |
| Dutch | `nl` | `values-nl` | |
| Polish | `pl` | `values-pl` | |
| Swedish | `sv` | `values-sv` | |
| Danish | `da` | `values-da` | |
| Norwegian | `nb` | `values-nb` | |
| Finnish | `fi` | `values-fi` | |
| Hungarian | `hu` | `values-hu` | |
| Czech | `cs` | `values-cs` | |
| Romanian | `ro` | `values-ro` | |
| Hindi | `hi` | `values-hi` | |
| Vietnamese | `vi` | `values-vi` | |
| Thai | `th` | `values-th` | |
| Ukrainian | `uk` | `values-uk` | |
| Serbian (Latin) | `sr-Latn` | `values-b+sr+Latn` | Script variant |

## AndroidManifest.xml integration

Add to `<application>` tag (Android 13 / API 33+):
```xml
<application android:localeConfig="@xml/locale_config">
```

Place `locale_config.xml` at:
`android/app/src/main/res/xml/locale_config.xml`
EOF
```

- [ ] **Step 4: Create apple-storefronts.md reference**

```bash
cp apple-storefronts.md skills/selecting-app-locales/references/apple-storefronts.md 2>/dev/null || cat > skills/selecting-app-locales/references/apple-storefronts.md << 'EOF'
# Apple App Store Storefronts

Reference: Apple App Store available in 175 regions (June 2026)

## Key storefronts for locale strategy

| Country | Storefront code | Default language | Additional languages |
|---|---|---|---|
| United States | USA | English (US) | Spanish, French, Chinese, Japanese, Korean, Portuguese, German, Dutch, Italian |
| Turkey | TUR | English (UK) | Turkish |
| Germany | DEU | German | English (UK) |
| France | FRA | French | English (UK) |
| Japan | JPN | Japanese | English (US) |
| Brazil | BRA | Portuguese (BR) | English (US) |
| South Korea | KOR | Korean | English (US) |
| China (mainland) | CHN | Chinese (Simplified) | English (UK) |
| United Kingdom | GBR | English (UK) | |
| Australia | AUS | English (AU) | |
| Canada | CAN | English (CA) | French (CA) |
| Mexico | MEX | Spanish (MX) | English (US) |
| Spain | ESP | Spanish (ES) | English (UK) |

## Implication for metadata strategy

The storefront table tells you what language users in each country EXPECT to see:

- **Turkey (TUR):** Default is English (UK), additional is Turkish.
  This means Turkish users will first see English metadata unless you provide Turkish.
  You need BOTH `en-US` and `tr-TR` metadata for Turkey.

- **Germany (DEU):** Default is German, additional is English (UK).
  You need BOTH `de-DE` and `en-US` metadata for Germany.

- **Japan (JPN):** Default is Japanese, additional is English (US).
  You need BOTH `ja` and `en-US` metadata for Japan.

## Conclusion for locale selection

If you target Turkey + Germany + Japan + USA:
Required locales: `en-US`, `tr-TR`, `de-DE`, `ja`

The `resolve-locales.js` script handles the per-platform code conversion for all these.
EOF
```

- [ ] **Step 5: Write `agents/locale-selector.md`**

```markdown
---
description: Enforces locale selection gate before any localization, metadata, screenshot, or i18n work begins. Writes confirmed locale set to config/{app-id}.config.json.
when_to_use: When the user starts a new app, adds languages, or locale set is unknown
allowed-tools: [Bash, Read, Write]
---

You are the locale selection specialist for mobile-store-deploy.

Your rule: **always confirm locales before any localization work begins.**

Process:
1. Read `config/{appId}.config.json` — check if `locales[]` is already confirmed.
   - If `locales[]` exists and is non-empty: show the list and ask to confirm or change.
   - If missing or empty: proceed to step 2.

2. Load `skills/selecting-app-locales/references/apple-storefronts.md` and
   `skills/selecting-app-locales/references/android-locales.md` for reference.

3. Ask the user which locales to support. Common starting points:
   - English only: `en`
   - English + Turkish: `en,tr`
   - Major markets: `en,tr,de,fr,es,pt-BR,ja,ko,zh-Hans`

4. Run: `node skills/selecting-app-locales/scripts/resolve-locales.js {appId} "{locale-list}"`

5. Show the resolved locale table and confirm with user before proceeding.

6. Only proceed to downstream skills AFTER user confirms.

For RTL locales (ar, he, fa, ur): flag ⚠️ and note that React Native/Expo requires
`I18nManager.forceRTL(true)` at app startup, plus a full layout audit.
```

- [ ] **Step 6: Write `commands/msd-select-locales.md`**

```markdown
---
description: Select or update the app's supported locales before metadata, screenshots, or i18n work
---

Select locales for the specified app before any localization work.

Ask: app ID.

Steps:
1. Check `config/{appId}.config.json` for existing `locales[]` array
2. Load `skills/selecting-app-locales`
3. Show Apple storefront table (`skills/selecting-app-locales/references/apple-storefronts.md`)
   and Android locale list (`skills/selecting-app-locales/references/android-locales.md`)
4. Ask user: "Which locales should this app support?"
5. Run: `node skills/selecting-app-locales/scripts/resolve-locales.js {appId} "{locale-list}"`
6. Show the resolved table and ask for confirmation
7. Only proceed after explicit user confirmation

For RTL locales: flag ⚠️ and note that `I18nManager.forceRTL(true)` is required.
```

- [ ] **Step 7: Update `hooks/hooks.json` — add UserPromptSubmit locale gate**

Replace the `hooks/hooks.json` file with:

```json
{
  "PostToolUse": [
    {
      "matcher": "Write|Edit",
      "hooks": [
        {
          "type": "command",
          "command": "bash -c 'FILE=$(echo \"$CLAUDE_TOOL_INPUT\" | python3 -c \"import sys,json; d=json.load(sys.stdin); print(d.get(\\\"file_path\\\",d.get(\\\"path\\\",\\\"\\\")))\" 2>/dev/null); if echo \"$FILE\" | grep -q \"/metadata/\"; then APPID=$(echo \"$FILE\" | sed \"s|.*/metadata/||\" | cut -d/ -f1); node \"$(dirname \"$(dirname \"$(dirname \"$FILE\")\")\")/../skills/managing-store-metadata/scripts/validate-metadata.js\" \"$APPID\" 2>&1 | tail -8; fi'"
        }
      ]
    },
    {
      "matcher": "Write|Edit",
      "hooks": [
        {
          "type": "command",
          "command": "bash -c 'FILE=$(echo \"$CLAUDE_TOOL_INPUT\" | python3 -c \"import sys,json; d=json.load(sys.stdin); print(d.get(\\\"file_path\\\",d.get(\\\"path\\\",\\\"\\\")))\" 2>/dev/null); if echo \"$FILE\" | grep -q \"/locales/\"; then APPID=$(echo \"$FILE\" | sed \"s|.*/locales/||\" | cut -d/ -f1); node \"$(dirname \"$(dirname \"$(dirname \"$FILE\")\")\")/../skills/managing-app-localizations/scripts/validate-translations.js\" \"$APPID\" 2>&1 | tail -8; fi'"
        }
      ]
    }
  ],
  "UserPromptSubmit": [
    {
      "matcher": "locale|language|locali|i18n|translation|metadata|screenshot",
      "hooks": [
        {
          "type": "inject",
          "content": "LOCALE GATE: Before proceeding, check if config/{app-id}.config.json has a confirmed locales[] array. If not, load skills/selecting-app-locales and ask the user which locales to support. Reference skills/selecting-app-locales/references/android-locales.md (BCP47 codes) and skills/selecting-app-locales/references/apple-storefronts.md (175 Apple storefronts). Run resolve-locales.js after confirmation. Only proceed after the user explicitly confirms the locale set."
        }
      ]
    }
  ]
}
```

- [ ] **Step 8: Test resolve-locales.js**

```bash
node skills/selecting-app-locales/scripts/resolve-locales.js testapp "en,tr,de"
cat config/testapp.config.json | node -e "const c=require('/dev/stdin'); console.log('Locales:', c.locales.map(l => l.i18next).join(', '))"
```

Expected: table showing en, tr, de across all platforms; config shows `en, tr, de`

- [ ] **Step 9: Commit**

```bash
git add skills/selecting-app-locales/ agents/locale-selector.md commands/msd-select-locales.md hooks/hooks.json
git commit -m "feat: add locale selection gate (Phase 2)"
```

---

## Phase 3: ASO/GEO + publishing artifacts

### Task 14: ASO/GEO skills, commands, and agent

**Files:**
- Create: `skills/optimizing-aso-seo/SKILL.md`
- Create: `skills/optimizing-geo/SKILL.md`
- Create: `commands/msd-aso.md`
- Create: `commands/msd-geo.md`
- Create: `agents/aso-geo-optimizer.md`

- [ ] **Step 1: Write `skills/optimizing-aso-seo/SKILL.md`**

```markdown
---
name: optimizing-aso-seo
description: >
  Optimizes App Store Optimization (ASO) strategy across all metadata fields for both
  Apple App Store and Google Play. Covers keyword research, competitor gap analysis,
  character-limit-aware copy, and screenshot caption alignment with Apple OCR indexing.
  Use when the user says "optimize keywords", "improve ASO", "keyword research",
  "improve ranking", or "write metadata". Use lenses/aso-optimizer.lens.md for
  AI-powered metadata generation per locale.
---

# Optimizing ASO/SEO

## When to use

| Request | Action |
|---|---|
| "optimize keywords" | Run ASO optimizer lens for each locale |
| "keyword research" | Load aso-optimizer.lens.md, fill parameters |
| "write store description" | Use lens output, validate character counts |
| "competitor analysis" | Lens includes competitor gap analysis |
| "align screenshots with keywords" | Cross-reference keywords.txt with screenshot-designer.lens.md output |

## Core ASO rules

### iOS search surface (160 chars total)
- App Name (30) + Subtitle (30) + Keywords (100) = **all indexed characters**
- Description: 4,000 chars — **NOT indexed** — conversion copy only
- Do not repeat words across fields (Apple auto-indexes cross-field)
- Single words > phrases in keywords field
- No spaces after commas in keywords: `habit,streak,daily` NOT `habit, streak, daily`

### Google Play search
- Title (30) + Short Description (80) = most weighted signals
- Full Description (4,000) **IS indexed** — include keywords 3-5× naturally
- What's New: 500 chars (NOT 4,000) — NOT indexed

### Apple OCR screenshot indexing (since June 2025)
- Caption headlines on screenshots ARE indexed
- Align slide 1 headline with top keyword from keywords.txt
- Use `lenses/screenshot-designer.lens.md` to generate keyword-aligned caption brief

## Process

1. Load `lenses/aso-optimizer.lens.md`
2. Fill parameters: app name, category, description draft, target locale, top 3 competitors
3. Review output — especially keyword field (must fit in 100 chars, no spaces after commas)
4. Write approved values to `metadata/{appId}/ios/{locale}/` and `metadata/{appId}/android/{locale}/`
5. Validate: `node skills/managing-store-metadata/scripts/validate-metadata.js {appId}`
6. Repeat for each locale (run lens once per locale)

## Locale-specific keyword research

Do not simply translate English keywords — research native-language search terms.
Example: Turkish users search "alışkanlık takip" not "habit tracker".
The aso-optimizer lens handles this automatically when given the target locale.
```

- [ ] **Step 2: Write `skills/optimizing-geo/SKILL.md`**

```markdown
---
name: optimizing-geo
description: >
  Optimizes Generative Engine Optimization (GEO) — making the app discoverable when users
  ask AI assistants (Claude, ChatGPT, Gemini, Perplexity) for app recommendations.
  Covers entity anchor sentences, JSON-LD schema markup, ProductHunt copy, press releases,
  and 30-day AI visibility action plans. Use when the user says "GEO optimization",
  "AI discoverability", "schema markup", "entity anchoring", or "ProductHunt launch".
  Use lenses/geo-optimizer.lens.md for AI-powered GEO content generation.
---

# Optimizing GEO (AI Discoverability)

## When to use

| Request | Action |
|---|---|
| "GEO optimization" | Run geo-optimizer.lens.md |
| "schema markup" | Generate JSON-LD from lens output |
| "ProductHunt launch" | Use lens tagline + description |
| "entity anchor" | Extract from lens output, save to config |
| "AI visibility" | Run lens + follow 30-day action plan |

## What GEO does

AI tools cite apps that have:
1. Structured, factual descriptions that AI can extract precisely
2. Consistent entity name across ALL web surfaces
3. Coverage on authoritative tech sites and review platforms
4. Schema markup on the app's landing page
5. Authentic community presence (Reddit, ProductHunt, reviews)

## Entity anchor rule

The entity anchor sentence is the canonical one-sentence definition:
```
"[App Name] is a [category] app for iOS and Android designed for [user persona],
featuring [key differentiator]."
```

Use this EXACT wording everywhere. Never change it for 6+ months.
Save to `config/{appId}.config.json` → `geo.entityAnchor`.

## Process

1. Complete ASO optimization first (`skills/optimizing-aso-seo`)
2. Load `lenses/geo-optimizer.lens.md`
3. Fill parameters: app name, category, ASO description, user persona, differentiator, store URLs
4. Review entity anchor sentence (most important output — locked in for 6 months)
5. Save JSON-LD schema to `assets/{appId}/schema.json`
6. Save entity anchor to `config/{appId}.config.json` → `geo.entityAnchor`
7. Follow the 30-day GEO action plan from lens output

## 30-day action plan summary

| Day | Action |
|---|---|
| 1 | Add JSON-LD schema to landing page |
| 2 | Launch on ProductHunt with GEO description |
| 7 | Submit to AppAdvice, 9to5Mac, AndroidPolice |
| 14 | Post authentic use case in relevant subreddits |
| 21 | Build in public thread with factual feature list |
| 30 | First AI visibility audit (test all 4 AI tools) |
```

- [ ] **Step 3: Write `commands/msd-aso.md`**

```markdown
---
description: Run ASO keyword research and metadata optimization for one or all locales
---

Run ASO optimization for the specified app.

Ask: app ID, target locale(s), top 3 competitors.

Steps:
1. Load `skills/optimizing-aso-seo`
2. Load `lenses/aso-optimizer.lens.md`
3. Gather: app description draft (read from README or ask user), competitor names
4. Run the ASO optimizer lens for the primary locale first, then each additional locale
5. After user approves output, write to `metadata/{appId}/ios/{locale}/` and `metadata/{appId}/android/{locale}/`
6. Validate: `node skills/managing-store-metadata/scripts/validate-metadata.js {appId}`
7. Cross-reference top keywords with `lenses/screenshot-designer.lens.md` for OCR alignment

Run the lens once per locale — keyword research differs by language and market.
```

- [ ] **Step 4: Write `commands/msd-geo.md`**

```markdown
---
description: Generate GEO (AI discoverability) content — entity anchor, schema markup, ProductHunt copy, press release
---

Run GEO optimization for the specified app.

Ask: app ID, target user persona, key differentiator.

Steps:
1. Load `skills/optimizing-geo`
2. Load ASO-optimized description from `metadata/{appId}/ios/en-US/description.txt` (or ask user)
3. Load `lenses/geo-optimizer.lens.md`
4. Fill parameters: app name, category, ASO description, user persona, differentiator, store URLs
5. After user approves the entity anchor sentence:
   - Save JSON-LD to `assets/{appId}/schema.json`
   - Save entity anchor to `config/{appId}.config.json` → `geo.entityAnchor`
6. Give user the 30-day action plan

Remind user: the entity anchor sentence must stay consistent across ALL surfaces for 6+ months.
```

- [ ] **Step 5: Write `agents/aso-geo-optimizer.md`**

```markdown
---
description: Specialized agent for ASO keyword research, metadata optimization, and GEO (AI discoverability) content generation across iOS, Android, and web surfaces
when_to_use: When the user asks about keyword research, metadata strategy, AI discoverability, schema markup, ProductHunt launch, or GEO optimization
allowed-tools: [Bash, Read, Write]
---

You are the ASO + GEO specialist for mobile-store-deploy.

## ASO rules

iOS search surface = 160 chars: Name (30) + Subtitle (30) + Keywords (100)
- Description NOT indexed on iOS — keyword placement there has zero ranking effect
- Google Play full description IS indexed — include keywords 3-5× naturally
- Apple OCR indexes screenshot captions since June 2025 — align with top keywords
- Never put spaces after commas in keywords field
- Do not repeat Name/Subtitle words in Keywords field

Lens to use: `lenses/aso-optimizer.lens.md`
Run once per locale (keyword strategy differs by language and market).

## GEO rules

Entity anchor sentence = canonical one-sentence app definition.
Must be consistent across App Store, Play Store, landing page, ProductHunt, press.
Never change it for 6+ months after setting.

Save to: `config/{appId}.config.json` → `geo.entityAnchor`
Schema markup: `assets/{appId}/schema.json`

Lens to use: `lenses/geo-optimizer.lens.md`
Run AFTER ASO optimization (needs the ASO-optimized description as input).

## Process

1. ASO first: run aso-optimizer.lens.md per locale → validate with validate-metadata.js
2. GEO second: run geo-optimizer.lens.md → save entity anchor + schema
3. Screenshots last: cross-reference top keywords with screenshot-designer.lens.md
```

- [ ] **Step 6: Verify all new files exist**

```bash
ls skills/optimizing-aso-seo/ skills/optimizing-geo/ agents/aso-geo-optimizer.md commands/msd-aso.md commands/msd-geo.md
```

Expected: all 5 paths exist

- [ ] **Step 7: Commit**

```bash
git add skills/optimizing-aso-seo/ skills/optimizing-geo/ commands/msd-aso.md commands/msd-geo.md agents/aso-geo-optimizer.md
git commit -m "feat: add ASO/GEO skills, commands, and agent (Phase 3)"
```

---

### Task 15: Lenses, workflows, config template, README, CHANGELOG

**Files:**
- Create: `lenses/` (move `*.lens.md` files from root)
- Create: `lenses/README.md`
- Create: `workflows/launch-ready-workflow.md` (from root)
- Create: `config/.template.config.json`
- Update: `README.md` (from `files (1)/README.md`)
- Create: `CHANGELOG.md` (update existing)

- [ ] **Step 1: Create lenses directory and move lens files**

```bash
mkdir -p lenses workflows
cp locale-selector.lens.md lenses/locale-selector.lens.md
cp aso-optimizer.lens.md lenses/aso-optimizer.lens.md
cp geo-optimizer.lens.md lenses/geo-optimizer.lens.md
cp screenshot-designer.lens.md lenses/screenshot-designer.lens.md
cp launch-ready-workflow.md workflows/launch-ready-workflow.md
```

- [ ] **Step 2: Write `lenses/README.md`**

```markdown
# LenserFight Lenses

These files are LenserFight parametric lens definitions. They define AI prompts
with user-fillable parameters (using `[[parameter]]` syntax) that produce
structured, validated output for each step of the release pipeline.

## Available lenses

| Lens | Purpose | Inputs |
|---|---|---|
| `locale-selector.lens.md` | Recommend and resolve locale set | app name, target markets, budget tier |
| `aso-optimizer.lens.md` | Keyword research + metadata for one locale | app name, category, competitors, target locale |
| `geo-optimizer.lens.md` | Entity anchor, schema markup, GEO content | app name, ASO description, differentiator |
| `screenshot-designer.lens.md` | Slide-by-slide screenshot brief | app name, keywords, visual style, locale |

## How to use

### With LenserFight Cloud MCP
When the LenserFight MCP is connected, Claude agents can trigger lenses directly.
API key stored in `LENSERFIGHT_API_KEY` user config.

### Manually
1. Open moon.lenserfight.com
2. Open each lens by name
3. Fill the `[[parameters]]`
4. Copy output into Claude Code context
5. Claude Code runs the downstream scripts

## Chain order (launch-ready workflow)

```
Brand Kit (Step 0) → Locale Selector (Step 1) → ASO Optimizer (Step 2)
→ GEO Optimizer (Step 3) → Screenshot Designer (Step 4) → fastlane (Step 5)
```

Full workflow: `workflows/launch-ready-workflow.md`

## Brand Kit lens

Existing lens ID: `c0903096-4a2c-463f-b6c2-c26aa72c5e6d`
Generates: 1024×1024 App Store icon, 512×512 Google Play icon, brand PDF
```

- [ ] **Step 3: Write `config/.template.config.json`**

```json
{
  "_comment": "Copy to config/{your-app-id}.config.json and fill in values",
  "appId": "com.example.myapp",
  "displayName": "My App",
  "platforms": ["ios", "android"],
  "locales": [],
  "devices": {
    "ios": ["iPhone 16 Pro Max", "iPhone 11 Pro Max"],
    "android": ["Pixel 7"]
  },
  "fastlane": {
    "iosLane": "release",
    "androidLane": "release",
    "apiKeyPath": "fastlane/api_key.json",
    "googlePlayKeyPath": "fastlane/google-play-api.json"
  },
  "screenshots": {
    "slidesCount": 5,
    "visualStyle": "clean minimal",
    "brandColors": "#4F46E5"
  },
  "geo": {
    "entityAnchor": ""
  }
}
```

- [ ] **Step 4: Update `README.md`**

```markdown
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
```

- [ ] **Step 5: Update `CHANGELOG.md`**

```markdown
# Changelog

## [1.0.0] — 2026-06-23

### Added
- Five agentskills.io-compatible sub-skills: managing-app-versions, generating-store-screenshots, managing-store-metadata, managing-app-localizations, submitting-app-release
- Three additional skills: selecting-app-locales, optimizing-aso-seo, optimizing-geo
- Nine Claude Code slash commands: /msd-release, /msd-bump, /msd-screenshots, /msd-metadata, /msd-locale, /msd-validate, /msd-select-locales, /msd-aso, /msd-geo
- Seven specialized subagents: version-manager, screenshot-pipeline, metadata-validator, localization-auditor, release-coordinator, locale-selector, aso-geo-optimizer
- Automatic hooks: metadata char-limit validation on write, translation audit on write, locale gate on prompt
- Hard character limit validator (validate-metadata.js) for Apple and Google
- Translation completeness validator (validate-translations.js)
- Pre-release gate runner (release-checklist.js) with 7 sequential gates
- Version bump script with monotonic versionCode enforcement
- sync-build-numbers.js for Expo/native iOS/Android platform sync
- resolve-locales.js with 36 pre-mapped locales across all platform formats
- Four LenserFight lens definitions: locale-selector, aso-optimizer, geo-optimizer, screenshot-designer
- launch-ready-workflow.md chaining all 5 lenses
- config/.template.config.json per-app config schema
- Device matrix with required iPhone 6.9" (1320x2868) for 2026
- Apple storefront table (175 countries) and Android AOSP locale list (82 locales)
- Screenshot caption OCR indexing guidance (Apple, June 2025)
- GEO optimization for AI discoverability
```

- [ ] **Step 6: Copy root SKILL.md**

```bash
cp "files (1)/SKILL.md" SKILL.md
```

- [ ] **Step 7: Run final verification**

```bash
echo "=== Plugin manifest ===" && node -e "JSON.parse(require('fs').readFileSync('.claude-plugin/plugin.json','utf8')); console.log('✅ valid')"
echo ""
echo "=== Skills ===" && find skills/ -name "SKILL.md" | sort
echo ""
echo "=== Commands ===" && ls commands/
echo ""
echo "=== Agents ===" && ls agents/
echo ""
echo "=== Scripts ===" && find skills/ -name "*.js" | sort
echo ""
echo "=== Lenses ===" && ls lenses/
echo ""
echo "=== Script validation ===" && node skills/managing-store-metadata/scripts/validate-metadata.js testapp && node skills/managing-app-localizations/scripts/validate-translations.js testapp && node skills/submitting-app-release/scripts/release-checklist.js testapp
```

Expected:
- `plugin.json`: `✅ valid`
- 8 SKILL.md files under skills/
- 9 command files
- 7 agent files
- 5 JS scripts
- 4 lens files + README
- All 3 validators exit 0

- [ ] **Step 8: Final commit**

```bash
git add lenses/ workflows/ config/ README.md CHANGELOG.md SKILL.md
git commit -m "feat: Phase 3 complete — ASO/GEO, lenses, config, README, CHANGELOG"
```

---

## Self-review

**Spec coverage:**
- ✅ `.claude-plugin/plugin.json` — Task 1
- ✅ 9 slash commands — Tasks 10, 13, 14
- ✅ 7 agents — Tasks 9, 13, 14
- ✅ 8 sub-skills — Tasks 4–8, 13, 14
- ✅ `hooks/hooks.json` with PostToolUse + UserPromptSubmit — Tasks 11, 13
- ✅ `sync-build-numbers.js` (missing script) — Task 2
- ✅ Test fixtures — Task 3
- ✅ Lenses moved to `lenses/` — Task 15
- ✅ `config/.template.config.json` — Task 15
- ✅ README + CHANGELOG — Task 15

**Placeholder scan:** No TBDs, no TODOs, all code blocks are complete.

**Type consistency:** All scripts use the same path resolution (`path.resolve(__dirname, '../../../../')`). All commands reference agents and skills by their exact names. All agents reference scripts by exact paths.
