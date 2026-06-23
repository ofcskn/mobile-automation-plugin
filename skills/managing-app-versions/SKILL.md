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
