---
description: Bump the app version number for iOS and Android
---

Bump the version for the specified app.

Ask: app ID, bump type (patch / minor / major / build), and optionally platform (ios / android / both — default: both).

Usage examples:
- `node bump-version.js {appId} patch` — bump both platforms
- `node bump-version.js {appId} minor ios` — bump iOS only
- `node bump-version.js {appId} patch android` — bump Android only
- `node bump-version.js {appId} major both` — explicit both

Steps:
1. Show current version: `cat .msd/versions/{appId}/version.json`
2. Run: `node skills/managing-app-versions/scripts/bump-version.js {appId} {bumpType} [{platform}]`
3. Run: `node skills/managing-app-versions/scripts/sync-build-numbers.js {appId} --project-root {appRoot}`
4. Show the new version numbers (semver, iOS build, Android versionCode)
5. Suggest commit message: `chore: bump version to {semver} (build {build})`

If the user doesn't know the app project root, default to current working directory.
