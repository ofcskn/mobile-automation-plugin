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

## Simulator mode — ask the user first

Before checking prerequisites, detect what is already running and ask:

```bash
# iOS — what's booted?
xcrun simctl list devices booted 2>/dev/null

# Android — what's connected?
adb devices 2>/dev/null
```

Then ask:

> "I found **[device name]** booted. Which screenshot mode do you want?
>
> - **Lightweight (recommended)** — use only this simulator. Faster, no extra installs. One device size per platform.
> - **Full** — capture all required device sizes (iPhone 6.9", 6.5", iPad 13" for iOS). Requires installing additional simulators.
>
> Default: Lightweight."

**Lightweight mode behavior:**
- iOS: use the single booted simulator. Detect its resolution with `xcrun simctl list devices booted --json` and name the output folder accordingly (e.g., `iPhone-15-Pro-2556x1179` if that's what's running). This is valid for App Store submission — Apple accepts any supported device size.
- Android: use the connected emulator. Name the folder by its reported resolution.
- No need to install additional simulators.

**Full mode behavior:**
- Requires installing iPhone 16 Pro Max (1320×2868, mandatory from 2026), iPhone 11 Pro Max (1242×2688), and iPad Pro 13" (2064×2752) simulators.
- Run each capture loop per device, per locale.

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

**Number files sequentially** (`1.png`, `2.png`, ...). Do not stop at one screen. Keep exploring and capturing until you have 8–10 candidates.

**Never capture — skip and go back immediately if you reach:**
- Paywall, subscription gate, purchase dialog, or "Upgrade to Pro" modal
- Login or sign-up screen
- Loading spinner, skeleton screen, or empty state
- Error message, warning banner, or crash dialog
- Settings → Legal, About, or permissions dialogs
- Any debug overlay or developer tool UI

**After the full exploration, evaluate every candidate before showing the user.** Score each PNG:

| Check | Pass ✅ | Discard ❌ |
|---|---|---|
| No paywall / gate visible | App content freely usable | Any purchase prompt or lock icon |
| Real content populated | Actual data on screen | Placeholder text, empty lists |
| Positive happy path | Feature working correctly | Error state, warning UI |
| Core value on screen | App's main benefit visible | Settings, legal, auth screen |
| Clean UI | No overlays or dev tools | Inspector UI, ADB options |

Present only passing screenshots to the user with a summary:
```
✅ 1.png — onboarding welcome
✅ 3.png — main dashboard (real data)
✅ 5.png — primary feature in use
❌ 2.png — discarded: paywall gate
❌ 6.png — discarded: empty state
```
Delete all discarded files before Phase 2.

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

## Phase 2 — Design with app-store-screenshots (per locale)

Use **https://github.com/ParthJadhav/app-store-screenshots** to generate designed marketing screenshots. Run once per locale so each locale gets headlines in its own language.

### One-time setup

```bash
git clone https://github.com/ParthJadhav/app-store-screenshots /tmp/app-store-screenshots
cd /tmp/app-store-screenshots
npm install
```

### Configure per locale

For each locale, generate a `src/data.js` by reading the approved screenshots and the locale's metadata:

```js
// src/data.js — one entry per approved screenshot
export default [
  {
    image: "../../screenshots/{appId}/raw/{locale}/ios/{device}/1.png",
    // Read headline from metadata/{appId}/ios/{locale}/subtitle.txt
    // Keep to 3–6 words — readable at thumbnail size
    title: "<subtitle or key benefit in this locale's language>",
    bgColor: "#FFFFFF",   // match app brand color or ask user
    titleColor: "#000000",
  },
  {
    image: "../../screenshots/{appId}/raw/{locale}/ios/{device}/3.png",
    title: "<second key benefit>",
    bgColor: "#F5F5F5",
    titleColor: "#111111",
  },
  // one entry per approved screenshot
];
```

**Title text rules:**
- Source text from `metadata/{appId}/ios/{locale}/subtitle.txt` for the primary screen
- For non-English locales, use the translated subtitle or key benefit phrase
- Never repeat the same title across two screenshots
- Apple OCR indexes caption text — align titles with `keywords.txt`

### Generate and move output

```bash
cd /tmp/app-store-screenshots
cp /tmp/data-{locale}.js src/data.js
npm run screenshots
# Output: /tmp/app-store-screenshots/screenshots/*.png

# Move to plugin designed folder
DEST="screenshots/{appId}/designed/{locale}/ios/{device-folder}"
mkdir -p "$DEST"
cp screenshots/*.png "$DEST/"

# Rename to sequential numbers
cd "$DEST" && i=1; for f in *.png; do mv "$f" "$i.png"; i=$((i+1)); done
```

### Repeat for every locale

```bash
for LOCALE in en-US tr-TR de-DE; do   # from config/{appId}.config.json → locales[]
  cp /tmp/data-$LOCALE.js src/data.js
  npm run screenshots
  DEST="screenshots/{appId}/designed/$LOCALE/ios/{device}"
  mkdir -p "$DEST"
  cp screenshots/*.png "$DEST/"
  cd "$DEST" && i=1; for f in *.png; do mv "$f" "$i.png"; i=$((i+1)); done; cd -
done
```

### Android

Same tool, same flow. Set `frame: false` or omit the frame key — Play Store renders its own frames. Output to `designed/{locale}/android/{device-folder}/`.

**iOS only:** Add device frames. **Android:** no device frames — Play Store renders its own.

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
