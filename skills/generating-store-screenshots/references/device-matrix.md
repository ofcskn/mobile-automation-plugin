# Device Matrix for Store Screenshots

> **Design tool rule:** All canvas dimensions must come from **ParthJadhav/app-store-screenshots** (MIT). Never assume or hardcode sizes — run the tool and let it set the output dimensions.

> **Asset folder rule:** The `{appId}` folder segment must NOT end with `.app`. macOS treats such paths as application bundles and App Store tooling rejects them silently.

## iOS Required Devices (2026)

Both **Phone** and **Tablet** screenshot sets are required for App Store submission.

### Phone

| Device | Resolution | Status | Simulator name |
|---|---|---|---|
| iPhone 6.9" (iPhone 16 Pro Max) | 1320×2868 | **REQUIRED — blocks submission without it** | iPhone 16 Pro Max |
| iPhone 6.5" (iPhone 11 Pro Max) | 1242×2688 | Recommended | iPhone 11 Pro Max |

**Note:** Apple dropped the 5.5" requirement. 6.9" is the new minimum as of 2026.

### Tablet

| Device | Resolution | Status | Simulator name |
|---|---|---|---|
| iPad Pro 13" | 2064×2752 | **Required if app supports iPad** | iPad Pro (13-inch) |

**Tablet fallback — no iPad simulator:** If no iPad simulator is available and no tablet captures exist, use the phone screenshots as the `image` input in `src/data.js` and run ParthJadhav/app-store-screenshots targeting the iPad Pro 13" canvas. The tool places the phone capture on the correct iPad canvas. Output goes to `designed/{locale}/ios/iPad-Pro-13-2064x2752/`.

## Android Required Devices

Both **Phone** and **Tablet** screenshot sets are required if the app supports tablets.

### Phone

| Device | Resolution | Notes |
|---|---|---|
| Phone | 1080×1920 minimum | Up to 3840×21600 |
| Feature Graphic | 1024×500 | Shown on store listing header — required |

### Tablet

| Device | Resolution | Notes |
|---|---|---|
| 7-inch tablet | 1080×1920 | Required if app supports tablets |
| 10-inch tablet | 1080×1920 | Required if app supports tablets |

**Tablet fallback — no tablet emulator:** If no tablet emulator is available, run phone screenshots through ParthJadhav/app-store-screenshots at tablet canvas dimensions. Output goes to `designed/{locale}/android/Tablet-7inch-1080x1920/` and `designed/{locale}/android/Tablet-10inch-1080x1920/`.

## Fastlane Snapfile (iOS) — starter template

```ruby
devices([
  "iPhone 16 Pro Max",
  "iPhone 11 Pro Max"
])

languages([
  "en-US",
  "tr-TR"
])

scheme("YourAppUITests")
output_directory("./screenshots/raw")
clear_previous_screenshots(true)
```

## Fastlane Screengrabfile (Android) — starter template

```ruby
locales(['en-US', 'tr-TR'])
clear_previous_screenshots(true)
output_directory './screenshots/raw/android'
app_package_name 'com.yourapp'
tests_package_name 'com.yourapp.test'
```
