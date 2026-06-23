# EAS Build Guide

> Source: https://docs.expo.dev/build/introduction/
> Always check the official docs for the latest — this guide summarizes the key workflows.

## What is EAS Build?

EAS Build is a hosted service for building app binaries for Expo and React Native projects. It handles app signing credentials, provides sensible defaults, and supports internal distribution for team testing. You can also build locally using `--local` if you prefer not to use cloud build minutes.

## Build Profiles

EAS uses `eas.json` to define build profiles. Three standard profiles:

### development

- `developmentClient: true` — installs Expo Dev Client instead of Expo Go
- `distribution: internal` — for team testing, not store submission
- iOS: can target simulator (`ios.simulator: true`)
- Use for: daily development, testing new native modules

```bash
eas build --platform ios --profile development
# For iOS Simulator (faster, no device needed):
eas build --platform ios --profile development --local
```

### preview

- `distribution: internal` — APK (Android) or IPA via Ad Hoc (iOS)
- Android: `buildType: apk` for direct install without Play Store
- Use for: stakeholder review, QA testing
- EAS prints a shareable download link when complete

```bash
eas build --platform all --profile preview
```

### production

- Full store build — AAB (Android) or IPA (iOS) for store submission
- Not for internal distribution; submitted directly to app stores
- Use for: App Store / Play Store release

```bash
eas build --platform all --profile production
```

## Local Builds

Build on your own machine without EAS cloud (no build minutes used):

```bash
# Requires local Android/iOS toolchain
eas build --platform android --profile production --local
eas build --platform ios --profile production --local
```

Requirements:
- Android: Android Studio + SDK
- iOS: Xcode (Mac only)
- Faster for iteration, no queue wait, useful for debugging native code

## Internal Distribution

For preview/development builds shared with testers, set `"distribution": "internal"` in the profile:
- iOS: uses Ad Hoc provisioning or enterprise provisioning
- Android: produces APK with a direct download link

```bash
eas build --platform all --profile preview
# EAS prints a shareable download URL when done
```

## Submit After Build

```bash
# Submit the latest build
eas submit --platform ios --profile production
eas submit --platform android --profile production

# Or submit a specific build ID
eas submit --platform ios --id <build-id>
```

## Check Build Status

```bash
eas build:list
eas build:view <build-id>
```

## Profile Inheritance

Profiles can extend each other using `"extends"` to reduce duplication:

```json
{
  "build": {
    "base": {
      "node": "18.0.0"
    },
    "production": {
      "extends": "base"
    }
  }
}
```

## Common eas.json (reference)

```json
{
  "build": {
    "development": {
      "developmentClient": true,
      "distribution": "internal",
      "ios": {
        "simulator": true
      }
    },
    "preview": {
      "distribution": "internal",
      "android": {
        "buildType": "apk"
      }
    },
    "production": {}
  }
}
```

## Reference

- EAS Build introduction: https://docs.expo.dev/build/introduction/
- eas.json configuration: https://docs.expo.dev/build/eas-json/
