---
name: generating-store-screenshots
description: >
  Manages the two-phase store screenshot pipeline: Phase 1 captures raw screenshots
  by automatically exploring the running iOS Simulator or Android Emulator — booting
  the device, launching the app, navigating every key screen, and capturing numbered
  PNGs; Phase 2 adds design layers (device frames, headlines, backgrounds) via
  ParthJadhav/app-store-screenshots or storeshots.org. Outputs are grouped by
  locale/platform/device-size so folders can be downloaded and uploaded directly.
  Use when the user says "generate screenshots", "update store images", "take
  screenshots", "design marketing slides", or "screenshot pipeline".
---

# Generating Store Screenshots

## Prerequisites — check BEFORE starting

Run each detection command. If any check fails, stop and tell the user exactly what is missing.

### Xcode (iOS only)

```bash
xcode-select -p          # must return a valid path, e.g. /Applications/Xcode.app/Contents/Developer
xcodebuild -version      # must show Xcode 15+ for iPhone 16 Pro Max simulator
xcrun simctl list devices available | grep -E "iPhone|iPad"  # must list at least one device
```

If Xcode is missing: "Xcode is not installed. Install it from the Mac App Store, then run `sudo xcode-select --switch /Applications/Xcode.app/Contents/Developer`."

### Android Studio + SDK (Android only)

```bash
adb --version            # must return a version string
echo $ANDROID_HOME       # must be set, e.g. /Users/you/Library/Android/sdk
emulator -list-avds      # must list at least one AVD (virtual device)
```

If missing: "Android Studio is not installed or ANDROID_HOME is not set. Install Android Studio, open the AVD Manager, and create at least one virtual device."

### Developer accounts

Ask the user to confirm:
- **iOS screenshots**: "Do you have an Apple Developer account and is your app added to App Store Connect?" (required to submit; not required to capture screenshots)
- **Android screenshots**: "Do you have a Google Play Developer account and is your app created in Play Console?" (required to submit; not required to capture)

If the user answers no to either, note it and continue — captures can still be taken locally.

### iOS Simulator check

```bash
xcrun simctl list devices booted   # check if a simulator is already running
```

If nothing is booted, boot the required device:

```bash
# Find the exact UDID for iPhone 16 Pro Max
xcrun simctl list devices available | grep "iPhone 16 Pro Max"

# Boot it
xcrun simctl boot <UDID>
open -a Simulator
```

### Android Emulator check

```bash
adb devices   # lists running emulators/devices
```

If nothing is listed, launch an AVD:

```bash
emulator -list-avds                         # pick an AVD name
emulator -avd <AVD_NAME> -no-snapshot-load  # launch it
adb wait-for-device                         # wait until fully booted
```

---

## Folder structure (locale → platform → device-size)

All output is grouped so a user can zip and upload one locale folder directly.

```
screenshots/{appId}/
├── raw/                                            ← Phase 1 output
│   └── {locale}/
│       ├── ios/
│       │   ├── iPhone-16-Pro-Max-1320x2868/
│       │   │   ├── 1.png
│       │   │   ├── 2.png
│       │   │   └── ...
│       │   └── iPhone-11-Pro-Max-1242x2688/
│       └── android/
│           └── Phone-1080x1920/
│               ├── 1.png
│               └── ...
└── designed/                                       ← Phase 2 output (committed)
    └── {locale}/
        ├── ios/
        │   └── iPhone-16-Pro-Max-1320x2868/
        │       ├── 1.png
        │       └── ...
        └── android/
            └── Phone-1080x1920/
                ├── 1.png
                └── ...
```

**Why this order:** locale is the top-level grouping because store uploads are per-locale. A user can hand off `/en-US/` directly to a teammate or CI step without re-sorting files.

---

## Phase 1 — Automated simulator exploration

The goal is to find the **best marketing screens** by exploring every key area of the app, not just the first screen. AI must navigate through the app systematically.

### iOS — full exploration sequence

```bash
# 1. Launch the app on the booted simulator
xcrun simctl launch booted <BUNDLE_ID>

# 2. Wait for the app to finish loading
sleep 3

# 3. Capture onboarding / splash (screenshot 1)
OUTDIR="screenshots/{appId}/raw/{locale}/ios/{device-folder}"
mkdir -p "$OUTDIR"
xcrun simctl io booted screenshot "$OUTDIR/1.png"
```

After each capture, **explore the next screen** using UI interaction:

```bash
# Tap (x y in points — check with Accessibility Inspector or cliclick)
xcrun simctl io booted tap <X> <Y>

# Swipe
xcrun simctl io booted swipe <startX> <startY> <endX> <endY>

# Press Home to reset if needed
xcrun simctl io booted button home
```

**Exploration order — capture a screenshot at each step:**
1. Splash / onboarding screen 1
2. Onboarding screen 2 (swipe or tap Next)
3. Onboarding screen 3 (if present)
4. Home / Dashboard after login or skip
5. Primary feature screen (the main value of the app)
6. Secondary feature or list view
7. Detail view (tap into any item)
8. Settings or profile screen
9. Any premium / paywall screen (shows value proposition)
10. Any unique screen that differentiates the app

**Number files sequentially** (`1.png`, `2.png`, ...). Do not stop at one screen. Keep exploring and capturing until you have 8–10 candidates, then let the user choose which to use for the store.

After capture, review all screenshots and annotate which screen each represents:
```
1.png — onboarding welcome
2.png — feature overview
3.png — main dashboard
...
```

### Android — full exploration sequence

```bash
# 1. Launch app
adb shell am start -n <PACKAGE>/<ACTIVITY>
sleep 3

# 2. Capture first screen
OUTDIR="screenshots/{appId}/raw/{locale}/android/Phone-1080x1920"
mkdir -p "$OUTDIR"
adb exec-out screencap -p > "$OUTDIR/1.png"
```

Navigate and capture:

```bash
# Tap
adb shell input tap <X> <Y>

# Swipe
adb shell input swipe <x1> <y1> <x2> <y2> 300

# Back
adb shell input keyevent KEYCODE_BACK

# After each navigation
adb exec-out screencap -p > "$OUTDIR/{N}.png"
```

Follow the same exploration order as iOS above. Capture 8–10 candidate screens, then annotate and let the user select.

---

## Phase 2 — Design (add overlays, headlines, device frames)

**Option A — CLI (recommended):**
```bash
npx skills add ParthJadhav/app-store-screenshots
```
Use the brief from `lenses/screenshot-designer.lens.md`. Output to `designed/{locale}/{platform}/{device-folder}/`.

**Option B — Web GUI:**
Open storeshots.org, import PNGs from `raw/{locale}/`, export to `designed/{locale}/`.

**iOS only:** Add device frames. **Android:** do NOT add device frames — Play Store renders its own.

---

## Critical constraints

- **iPhone 6.9" (1320×2868) is REQUIRED from 2026.** Submission blocked without it.
- **iPad Pro 13" (2064×2752) required if the app supports iPad.**
- Apple allows max **10 screenshots** per locale per device. Google allows **8**.
- **Do NOT add device frames to Android screenshots.**
- **Apple OCR indexes screenshot caption text since June 2025.** Align headlines with `keywords.txt`.
- Always load `references/device-matrix.md` before starting capture.

## References

- `skills/generating-store-screenshots/references/device-matrix.md` — required device sizes
- `skills/generating-store-screenshots/references/screenshot-specs.md` — pixel specs and folder layout
