---
name: submitting-app-release
description: >
  Runs pre-flight validation gates and submits the app to App Store Connect and Google
  Play Console via EAS CLI. Use when the user says "release", "submit to store",
  "publish", "deploy app", or "submit for review". Always runs release-checklist.js
  first — never submits past a failing gate without explicit user confirmation.
---

# Submitting App Release

## When to use

| Request | Action |
|---|---|
| "submit app" / "release" | Run checklist → submit both platforms |
| "submit iOS only" | Run checklist --platform ios → eas submit --platform ios |
| "submit Android only" | Run checklist --platform android → eas submit --platform android |
| "pre-flight check" | Run release-checklist.js only, no submission |

## Release sequence

1. Run all 7 pre-flight gates:
   ```bash
   node skills/submitting-app-release/scripts/release-checklist.js {appId}
   ```

2. If all gates pass:
   ```bash
   # iOS — phased release (7-day automatic rollout)
   eas submit --platform ios --profile production

   # Android — staged rollout (10% initial)
   eas submit --platform android --profile production
   ```

3. Report submitted version and review status to user.

## The 7 pre-flight gates

1. `config/{appId}.config.json` exists
2. `versions/{appId}/version.json` is valid (semver + versionCode ≥ 1)
3. Metadata passes all character limit validation
4. All translation keys present across all locales
5. Designed screenshots exist for required device sizes
6. EAS credentials configured (`eas whoami` passes, secrets set)
7. CHANGELOG.md includes the current version number

## Rules

- **Never auto-proceed past a failing gate.** Stop and report to user.
- **iOS staged release:** enable phased release in App Store Connect after submission
- **Android staged rollout:** set rollout to 10% in Google Play Console, expand after 48h monitoring

## EAS environment variables

| Variable | Purpose |
|---|---|
| `EXPO_TOKEN` | EAS authentication token (CI/CD) |
| `APP_STORE_CONNECT_API_KEY_ID` | App Store Connect API key ID |
| `APP_STORE_CONNECT_ISSUER_ID` | App Store Connect issuer ID |
| `APP_STORE_CONNECT_API_KEY_CONTENT` | App Store Connect API private key (base64) |
| `GOOGLE_SERVICES_JSON` | Google Play service account key (JSON string) |

## EAS Build profiles

Before running `release-checklist.js`, ensure you are building with the correct EAS profile.

See `docs/eas-build-guide.md` for a full guide to development, preview, and production builds.
Reference: https://docs.expo.dev/build/introduction/

## Reference

Load on demand: `skills/submitting-app-release/references/submission-checklist.md`
