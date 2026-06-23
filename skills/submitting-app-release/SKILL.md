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

## EAS Build profiles

Before running `release-checklist.js`, ensure you are building with the correct EAS profile.

See `docs/eas-build-guide.md` for a full guide to development, preview, and production builds.
Reference: https://docs.expo.dev/build/introduction/

## Reference

Load on demand: `skills/submitting-app-release/references/submission-checklist.md`
