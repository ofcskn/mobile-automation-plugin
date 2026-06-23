# Device Matrix for Store Screenshots

## iOS Required Devices (2026)

| Device | Resolution | Status | Simulator name |
|---|---|---|---|
| iPhone 6.9" (iPhone 16 Pro Max) | 1320×2868 | **REQUIRED — blocks submission without it** | iPhone 16 Pro Max |
| iPhone 6.5" (iPhone 11 Pro Max) | 1242×2688 | Recommended | iPhone 11 Pro Max |
| iPad Pro 13" | 2064×2752 | Required if iPad supported | iPad Pro (13-inch) |

**Note:** Apple dropped the 5.5" requirement. 6.9" is the new minimum as of 2026.

## Android Required Devices

| Device | Resolution | Notes |
|---|---|---|
| Phone | 1080×1920 minimum | Up to 3840×21600 |
| Feature Graphic | 1024×500 | Shown on store listing header — required |
| 7-inch tablet | 1080×1920 | If app supports tablets |
| 10-inch tablet | 1080×1920 | If app supports tablets |

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
