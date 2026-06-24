---
description: Generate or update store screenshots for all devices and locales — automatically explores the running simulator to find best marketing screens
---

Generate store screenshots for the specified app.

Ask: app ID, platform (ios / android / both), which locales.

---

## Step 1 — Check prerequisites

Run every detection command below. If anything is missing, stop and tell the user before continuing.

### iOS prerequisites

```bash
# Xcode installed?
xcode-select -p

# Xcode version (need 15+ for iPhone 16 Pro Max)
xcodebuild -version

# Any available simulator?
xcrun simctl list devices available | grep -E "iPhone|iPad"

# Simulator already booted?
xcrun simctl list devices booted
```

If no simulator is booted, boot the required device:

```bash
# Find UDID for iPhone 16 Pro Max (required from 2026)
xcrun simctl list devices available | grep "iPhone 16 Pro Max"

# Boot it
xcrun simctl boot <UDID>
open -a Simulator
```

Ask the user: "Do you have an Apple Developer account and is your app registered in App Store Connect?" — note the answer, continue either way (captures work without it).

### Android prerequisites

```bash
# ADB available?
adb --version

# SDK path set?
echo $ANDROID_HOME

# Any AVD (virtual device) available?
emulator -list-avds

# Emulator already running?
adb devices
```

If no emulator is running, launch one:

```bash
emulator -avd <AVD_NAME> -no-snapshot-load
adb wait-for-device
```

Ask the user: "Do you have a Google Play Developer account?" — note the answer, continue either way.

---

## Step 2 — Load skill and device matrix

```
Load skills/generating-store-screenshots
Show skills/generating-store-screenshots/references/device-matrix.md
Show skills/generating-store-screenshots/references/screenshot-specs.md
```

Confirm with the user which device sizes to capture for each platform.

---

## Step 3 — Phase 1: Automated simulator exploration

**Do not capture just one screen.** Explore the entire app to find the best marketing screens.

### iOS capture loop

For each locale and each required device size:

```bash
LOCALE="en-US"       # repeat for each locale
DEVICE="iPhone-16-Pro-Max-1320x2868"
OUTDIR="screenshots/{appId}/raw/$LOCALE/ios/$DEVICE"
mkdir -p "$OUTDIR"

# Launch app
xcrun simctl launch booted <BUNDLE_ID>
sleep 3

# Capture and explore — repeat for every key screen
N=1
xcrun simctl io booted screenshot "$OUTDIR/$N.png" && N=$((N+1))

# Navigate: tap, swipe, scroll — capture after each transition
xcrun simctl io booted tap <X> <Y>
sleep 1
xcrun simctl io booted screenshot "$OUTDIR/$N.png" && N=$((N+1))
```

Explore in this order (capture a numbered PNG at each step):
1. Splash / onboarding screen 1
2. Onboarding screen 2 (tap Next / swipe)
3. Onboarding screen 3 if present
4. Home / Dashboard (after sign-in or skip)
5. Primary feature — the main value screen
6. Secondary feature or list view
7. Detail view (tap into any item)
8. Settings or profile
9. Paywall / premium screen if present
10. Any unique differentiating screen

After capturing all candidates, list them with descriptions:
```
1.png — onboarding welcome
2.png — core feature overview
3.png — main dashboard
...
```
Ask the user which to keep. Delete the rest before proceeding to Phase 2.

### Android capture loop

```bash
LOCALE="en-US"
DEVICE="Phone-1080x1920"
OUTDIR="screenshots/{appId}/raw/$LOCALE/android/$DEVICE"
mkdir -p "$OUTDIR"

# Launch app
adb shell am start -n <PACKAGE>/<MAIN_ACTIVITY>
sleep 3

N=1
adb exec-out screencap -p > "$OUTDIR/$N.png" && N=$((N+1))

# Navigate and capture
adb shell input tap <X> <Y>
sleep 1
adb exec-out screencap -p > "$OUTDIR/$N.png" && N=$((N+1))
```

Follow the same exploration order as iOS above.

---

## Step 4 — Phase 2: Design

Load `lenses/screenshot-designer.lens.md` to generate the design brief (headlines, colors, layout).

Apply design layer:

**Option A — CLI:**
```bash
npx skills add ParthJadhav/app-store-screenshots
```
Output to `screenshots/{appId}/designed/{locale}/{platform}/{device-folder}/`.

**Option B — Web:**
Open storeshots.org. Import from `raw/{locale}/`. Export to `designed/{locale}/`.

iOS: add device frames. Android: no device frames.

---

## Step 5 — Validate

Confirm designed output exists in the correct structure:

```
screenshots/{appId}/designed/{locale}/ios/{device-folder}/1.png  ✅
screenshots/{appId}/designed/{locale}/android/{device-folder}/1.png  ✅
```

Count files per device per locale — Apple requires at least 1, max 10. Google max 8.
