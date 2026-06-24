---
description: Build the app using EAS — development (dev client), preview (internal testing), or production (store release). Handles all three profiles with guidance.
---

Build the app with EAS Build.

## Usage

`/msd-build {appId} [development|preview|production] [ios|android|all]`

Defaults: production, all platforms.

## Before building

1. Read `memory/apps.json` for app path
2. Read `config/{appId}.config.json` — check `_pluginNotes.buildScript` and `_pluginNotes.requiredEasSecrets`
3. If `requiredEasSecrets` is listed, confirm with user that all secrets are set in EAS before proceeding
4. Check `{appPath}/eas.json` exists — if not, run `eas build:configure` in the app directory
5. For production: run `node skills/submitting-app-release/scripts/release-checklist.js {appId}` first

## Build command selection

Check `config/{appId}.config.json` → `_pluginNotes.buildScript`:
- **If `buildScript` defined** (app has its own build wrapper): run from `appPath`:
  ```bash
  cd {appPath}
  node scripts/eas-profile.js build {platform} {profile}
  ```
  This wrapper handles `--local` vs cloud, env injection, and profile aliasing automatically.
- **Otherwise** use bare EAS commands shown in the profiles below.

## Steps per profile

### development

For daily development — installs Expo Dev Client:
```bash
cd {appPath}
# Device build:
eas build --platform {platform} --profile development
# Simulator (iOS only, faster):
eas build --platform ios --profile development
# Local build (requires Xcode/Android Studio):
eas build --platform {platform} --profile development --local
```

After build: scan QR code or install IPA/APK to test.

### preview

For QA and stakeholder review:
```bash
cd {appPath}
eas build --platform {platform} --profile preview
```

Android produces APK (direct install). iOS uses Ad Hoc provisioning.
EAS prints a shareable download link when done.

### production

For App Store / Play Store release:
```bash
cd {appPath}
eas build --platform {platform} --profile production
```

After build: run `/msd-release {appId}` or submit directly:
```bash
eas submit --platform {platform} --profile production
```

## Local build option

If the user wants to build locally (no EAS cloud, uses local Xcode/Android Studio):
```bash
eas build --platform {platform} --profile {profile} --local
```

Advantages: faster for iteration, no build queue, no EAS build minutes used.
Requires: Xcode (iOS), Android Studio + SDK (Android), installed on local machine.

## Checking build status

```bash
cd {appPath}
eas build:list        # list recent builds
eas build:view        # view latest build
```

## Reference

Full EAS Build documentation: https://docs.expo.dev/build/introduction/
Always check for the latest — EAS updates frequently.
