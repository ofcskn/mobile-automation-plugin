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

## Per-platform versioning

iOS and Android can be bumped independently using an optional third argument:

```
node bump-version.js <appId> <patch|minor|major|build> [ios|android|both]
```

| Command | Effect |
|---|---|
| `bump-version.js {appId} patch` | bump both platforms (default) |
| `bump-version.js {appId} patch both` | explicit both — same as default |
| `bump-version.js {appId} patch ios` | bump iOS only; Android unchanged |
| `bump-version.js {appId} patch android` | bump Android only; iOS unchanged |

When platforms diverge, the top-level `semver` in `version.json` reflects the most recently bumped platform. Each platform block also carries its own `semver` field for independent tracking:

```json
{
  "semver": "1.0.1",
  "ios": {
    "semver": "1.0.1",
    "CFBundleShortVersionString": "1.0.1",
    "CFBundleVersion": "3"
  },
  "android": {
    "semver": "1.0.0",
    "versionName": "1.0.0",
    "versionCode": 2
  }
}
```

Use per-platform bumping when one platform is in App Store review while the other needs a hotfix, or when release cadences differ between stores.

## Reference

Load on demand: `skills/managing-app-versions/references/version-format.md`
