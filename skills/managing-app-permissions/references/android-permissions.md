# Android Permissions Reference

Declared under `expo.android.permissions[]` in `app.json`.

## Dangerous permissions (require runtime dialog)

| Permission | Use case | Notes |
|-----------|----------|-------|
| CAMERA | Camera, QR scanner | Runtime dialog |
| RECORD_AUDIO | Microphone, voice | Runtime dialog |
| ACCESS_FINE_LOCATION | Precise GPS | Runtime dialog |
| ACCESS_COARSE_LOCATION | Approximate location | Runtime dialog |
| ACCESS_BACKGROUND_LOCATION | Background location | Extra dialog, needs justification |
| READ_CONTACTS | Read contacts | Runtime dialog |
| WRITE_CONTACTS | Modify contacts | Runtime dialog |
| READ_MEDIA_IMAGES | Photo library (Android 13+) | Replaces READ_EXTERNAL_STORAGE |
| READ_MEDIA_VIDEO | Video library (Android 13+) | Replaces READ_EXTERNAL_STORAGE |
| READ_MEDIA_AUDIO | Audio library (Android 13+) | Replaces READ_EXTERNAL_STORAGE |
| USE_BIOMETRIC | Fingerprint / face | Runtime |
| BLUETOOTH_SCAN | BLE scanning | Runtime (Android 12+) |
| BLUETOOTH_CONNECT | BLE connect | Runtime (Android 12+) |
| ACTIVITY_RECOGNITION | Step counter, fitness | Runtime |

## Deprecated — avoid

| Permission | Replace with |
|-----------|-------------|
| READ_EXTERNAL_STORAGE | READ_MEDIA_IMAGES / READ_MEDIA_VIDEO / READ_MEDIA_AUDIO (Android 13+) |
| WRITE_EXTERNAL_STORAGE | Not needed on Android 10+ (scoped storage) |
| READ_PHONE_STATE | Only if truly needed — triggers Play Store review |

## Normal permissions (no dialog)

```
INTERNET, ACCESS_NETWORK_STATE, ACCESS_WIFI_STATE,
RECEIVE_BOOT_COMPLETED, VIBRATE, WAKE_LOCK,
USE_FINGERPRINT (legacy), FOREGROUND_SERVICE,
POST_NOTIFICATIONS (Android 13+ — actually dangerous now)
```

## Example app.json

```json
{
  "expo": {
    "android": {
      "permissions": [
        "CAMERA",
        "RECORD_AUDIO",
        "READ_MEDIA_IMAGES",
        "VIBRATE"
      ]
    }
  }
}
```

## Play Store policy

Google will reject or remove apps that:
- Declare permissions not used by core functionality
- Use ACCESS_BACKGROUND_LOCATION without a valid use case
- Abuse READ_PHONE_STATE for device fingerprinting
- Mix personal + sensitive data collection without privacy policy
