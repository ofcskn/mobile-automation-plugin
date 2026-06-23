# Version Format Reference

## version.json schema

```json
{
  "semver": "1.3.0",
  "ios": {
    "CFBundleShortVersionString": "1.3.0",
    "CFBundleVersion": "43"
  },
  "android": {
    "versionName": "1.3.0",
    "versionCode": 43
  },
  "lastBumpedAt": "2026-06-23T12:00:00Z",
  "channel": "production",
  "history": [
    {
      "semver": "1.2.0",
      "iosBuild": "42",
      "androidCode": 42,
      "date": "2026-05-10T12:00:00Z"
    }
  ]
}
```

## Platform-specific notes

### iOS
- `CFBundleShortVersionString` — shown to users (e.g. "1.3.0")
- `CFBundleVersion` — build number, must increase every TestFlight upload
- In Xcode: General > Identity > Build
- In Expo: `expo.ios.buildNumber` in app.json

### Android
- `versionName` — shown to users (e.g. "1.3.0")
- `versionCode` — integer, must be > previous code for Play Console to accept
- In Gradle: `android.defaultConfig.versionCode`
- In Expo: `expo.android.versionCode` in app.json

### Expo (managed workflow)
Write only to `app.json`. EAS Build reads versionCode and buildNumber from there.
Never manually edit native files in Expo managed workflow.

## Bump types

| Type | Example: 1.2.3 → | Notes |
|---|---|---|
| patch | 1.2.4 | Bug fixes |
| minor | 1.3.0 | New features, backwards compatible |
| major | 2.0.0 | Breaking changes |
| build | 1.2.3 | Semver unchanged, only build/code increment |
