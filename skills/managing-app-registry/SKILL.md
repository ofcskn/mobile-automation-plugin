---
name: managing-app-registry
description: >
  Manages the registry of known apps in .msd/memory/apps.json. Use when initializing a new app,
  updating app state (first release complete, new locale added), discovering apps in a
  directory, or reading current app status. Always read the registry before any release
  operation to check if first-release setup is complete.
---

# Managing the App Registry

## Registry file

`.msd/memory/apps.json` — single source of truth for all registered apps.

## App record schema

```json
{
  "appId": "myapp",
  "displayName": "My App",
  "path": "/path/to/your/expo/app",
  "platforms": ["ios", "android"],
  "locales": ["en", "tr", "de"],
  "bundleId": {
    "ios": "com.example.myapp",
    "android": "com.example.myapp"
  },
  "currentVersion": "1.0.0",
  "firstRelease": {
    "ios": false,
    "android": false
  },
  "storeIds": {
    "ios": null,
    "android": null
  },
  "addedAt": "2026-06-23"
}
```

## When to update the registry

- After `/msd-init`: create new app record
- After first submission completes: set `firstRelease.ios` or `firstRelease.android` to `true`
- After version bump: update `currentVersion`
- After locale added: update `locales[]`

## Reading the registry

Before any release operation, check:
1. Is the app registered? If not, run `/msd-init {appId}` first.
2. Is `firstRelease.ios/android` true? If not, use the First Release checklist.
3. What locales are registered? Validate metadata exists for all of them.

## App discovery

To find all Expo apps in a directory, look for `app.json` or `app.config.ts` files:
```bash
find /path/to/projects -name "app.json" -maxdepth 3 | grep -v node_modules
```
