# Device Matrix for Store Screenshots

> **Design tool rule:** All export dimensions come from **ParthJadhav/app-store-screenshots** (MIT) — a scaffolded Next.js editor whose **Export bundle** button emits the sizes below per Apple/Google marketing rules. Never hardcode sizes elsewhere; this table documents what the tool produces so you can verify coverage.

> **Asset folder rule:** The `{appId}` folder segment must NOT end with `.app`. macOS treats such paths as application bundles and App Store tooling rejects them silently.

> **Coverage rule:** Both **Phone** and **Tablet** sets are required for **both iOS and Android**, in **every locale**. Configure one deck per device in `app-store-screenshots.json` (`iphone`, `ipad`, `android`, `android-7`, `android-10`, `feature-graphic`) and run Export bundle once per device.

## iOS device sizes (2026)

Both **Phone** (`iphone` deck) and **Tablet** (`ipad` deck) are required for App Store submission.

### Phone — `iphone` deck

| Device | Resolution | Status | Capture simulator |
|---|---|---|---|
| iPhone 6.9" (16 Pro Max) | 1320×2868 | **REQUIRED — blocks submission without it** | iPhone 16 Pro Max |
| iPhone 6.5" | 1284×2778 | Recommended | iPhone 11/12/13/14/15 Pro Max |
| iPhone 6.3" | 1206×2622 | Optional | iPhone 16 Pro |
| iPhone 6.1" | 1125×2436 | Optional | iPhone X/11 Pro |

The Export bundle for the `iphone` deck emits all of the above sizes × every locale. Apple dropped the 5.5" requirement — 6.9" is the minimum as of 2026.

### Tablet — `ipad` deck

| Device | Resolution | Status | Capture simulator |
|---|---|---|---|
| iPad Pro 13" | 2064×2752 | **Required if app supports iPad** | iPad Pro (13-inch) |
| iPad Pro 12.9" | 2048×2732 | Recommended | iPad Pro (12.9-inch) |

**No iPad simulator?** Re-use the phone captures as the `screenshot` value in the `ipad` deck slides inside `app-store-screenshots.json` — the editor places them on the iPad canvas and the Export bundle emits the iPad sizes. Do not skip the tablet deck.

## Android device sizes

Both **Phone** (`android` deck) and **Tablet** (`android-7` + `android-10` decks) are required if the app supports tablets. The **feature graphic** is always required.

### Phone — `android` deck

| Type | Resolution | Notes |
|---|---|---|
| Phone | 1080×1920 | No device frame — Play renders its own |

### Tablet — `android-7` and `android-10` decks

| Device | Portrait | Landscape | Notes |
|---|---|---|---|
| 7-inch tablet (`android-7`) | 1200×1920 | 1920×1200 | Required if app supports tablets |
| 10-inch tablet (`android-10`) | 1600×2560 | 2560×1600 | Required if app supports tablets |

### Feature graphic — `feature-graphic` deck

| Type | Resolution | Notes |
|---|---|---|
| Feature Graphic | 1024×500 | Store listing header — **required** |

**No tablet emulator?** Re-use phone captures as the `screenshot` value in the `android-7` / `android-10` deck slides — the editor places them on the tablet canvas and the Export bundle emits the tablet sizes.

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
