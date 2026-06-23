# iOS Permission Keys Reference

All must go under `expo.ios.infoPlist` in `app.json`.

## Common permissions

| Key | Triggers when |
|-----|--------------|
| NSCameraUsageDescription | `expo-camera`, `expo-barcode-scanner`, any camera API |
| NSMicrophoneUsageDescription | `expo-av` recording, `expo-camera` video |
| NSPhotoLibraryUsageDescription | `expo-image-picker` (read) |
| NSPhotoLibraryAddUsageDescription | `expo-image-picker` (save to library) |
| NSLocationWhenInUseUsageDescription | `expo-location` foreground |
| NSLocationAlwaysAndWhenInUseUsageDescription | `expo-location` background |
| NSLocationAlwaysUsageDescription | Legacy iOS 10 (keep for compatibility) |
| NSContactsUsageDescription | `expo-contacts` |
| NSCalendarsUsageDescription | `expo-calendar` read/write |
| NSRemindersUsageDescription | `expo-calendar` reminders |
| NSMotionUsageDescription | `expo-sensors` accelerometer/gyro |
| NSHealthShareUsageDescription | HealthKit read |
| NSHealthUpdateUsageDescription | HealthKit write |
| NSBluetoothAlwaysUsageDescription | Bluetooth |
| NSFaceIDUsageDescription | `expo-local-authentication` Face ID |
| NSUserTrackingUsageDescription | ATT framework — REQUIRED for IDFA/ad tracking |
| NSSpeechRecognitionUsageDescription | `expo-speech` recognition |
| NSAppleMusicUsageDescription | Apple Music / MediaPlayer |

## Writing good descriptions

Format: "[App name] uses [permission] to [specific user benefit]."

Examples:
- ✅ "Nefes uses the microphone to record your breathing sessions for biofeedback analysis."
- ✅ "My App uses your location to show nearby meditation studios."
- ❌ "Camera access needed." (too vague — Apple rejects)
- ❌ "This app needs your location." (explains what, not why — Apple may reject)

## ATT (App Tracking Transparency)

Required if your app uses any advertising or cross-app tracking:
```json
{
  "expo": {
    "ios": {
      "infoPlist": {
        "NSUserTrackingUsageDescription": "We use this to show you relevant ads and measure their effectiveness."
      }
    },
    "plugins": [["expo-tracking-transparency"]]
  }
}
```

## Localization

Permission strings in `infoPlist` are shown in the device language. For multi-locale apps, add localized strings via `InfoPlist.strings` in the native project (requires `expo-localization` or bare workflow).
