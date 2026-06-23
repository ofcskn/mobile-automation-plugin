---
description: Initialize a new app in the plugin registry — creates config, versions, metadata directories, and registers the app
---

Initialize a new app for the mobile-store-deploy pipeline.

## What to ask the user

1. **App ID** — short slug used for all directories (e.g. `nefes`, `myapp`). Must be filesystem-safe.
2. **Display name** — human-readable name shown in stores
3. **Path to Expo/React Native app** — absolute path to the app's root directory
4. **Platforms** — iOS, Android, or both?
5. **Primary locale** — default `en`
6. **Additional locales** — e.g. `tr,de,fr` (comma-separated)
7. **Bundle ID / Package name** — e.g. `com.example.myapp`

## Steps to execute

1. Read `memory/apps.json`
2. Check if appId already exists — if yes, ask to update or cancel
3. Create directories:
   ```bash
   mkdir -p config versions/{appId} metadata/{appId}/ios/en-US metadata/{appId}/android/en-US locales/{appId} screenshots/{appId}
   ```
4. Copy `config/.template.config.json` → `config/{appId}.config.json` and fill in values
5. Create `versions/{appId}/version.json`:
   ```json
   {"semver":"1.0.0","ios":{"CFBundleShortVersionString":"1.0.0","CFBundleVersion":"1"},"android":{"versionName":"1.0.0","versionCode":1}}
   ```
6. Read `app.json` from the user's app path and pre-fill metadata where possible (app name → `name.txt`, etc.)
7. Create stub metadata files with placeholder text for required fields
8. Register in `memory/apps.json`:
   ```json
   {
     "appId": "{appId}",
     "displayName": "{displayName}",
     "path": "{appPath}",
     "platforms": [...],
     "locales": [...],
     "bundleId": {"ios": "{bundleId}", "android": "{androidPkg}"},
     "currentVersion": "1.0.0",
     "firstRelease": {"ios": false, "android": false},
     "storeIds": {"ios": null, "android": null},
     "addedAt": "{today}"
   }
   ```
9. Tell user: "App `{appId}` registered. Next: `/msd-checklist {appId} ios` or `/msd-checklist {appId} android`"

## After init

Run `/msd-checklist {appId} {platform}` to walk through the First Release checklist step by step.
