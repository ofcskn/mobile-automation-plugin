---
description: Show current state of a registered app — version, first release status, locale coverage, pending actions
---

Show the status of a registered app.

## Steps

1. Read `memory/apps.json` — find the app record
2. Read `versions/{appId}/version.json` — current version
3. Check `metadata/{appId}/` — which locales have files
4. Run metadata validation silently and summarize result
5. Run translation validation silently and summarize result

## Output format

```
App: {displayName} ({appId})
Version: {semver}

Platforms:
  iOS:     {firstRelease.ios ? "✅ First release complete" : "🔴 First release pending"}
  Android: {firstRelease.android ? "✅ First release complete" : "🔴 First release pending"}

Locales: {locales.join(", ")}
Metadata: {N} locales validated / {M} total
Translations: {N}/{M} complete

Next recommended action:
  {if firstRelease incomplete: "/msd-checklist {appId} ios"}
  {if firstRelease complete: "node skills/submitting-app-release/scripts/release-checklist.js {appId}"}
```

## App not found

If the appId is not in `memory/apps.json`, say:
"App `{appId}` not registered. Run `/msd-init {appId}` first."
