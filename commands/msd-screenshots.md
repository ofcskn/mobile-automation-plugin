---
description: Generate or update store screenshots for all devices and locales — automatically explores the running simulator to find best marketing screens
---

Generate store screenshots for the specified app.

Ask: app ID, platform (ios / android / both), which locales.

---

## Step 0 — Detect simulators and ask mode

```bash
# iOS
xcrun simctl list devices booted 2>/dev/null

# Android
adb devices 2>/dev/null
```

Ask the user:

> "Which screenshot mode?
> - **Lightweight (default)** — use the simulator that's already running. One device size, no extra installs.
> - **Full** — capture all required device sizes (needs iPhone 16 Pro Max, iPhone 11 Pro Max, iPad Pro 13" simulators installed).

If they choose Lightweight: skip multi-device loops below. Capture only from the currently booted device. Detect its name and resolution from `xcrun simctl list devices booted --json` (iOS) or `adb shell wm size` (Android), and name the output folder accordingly.

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
OUTDIR=".msd/screenshots/{appId}/raw/$LOCALE/ios/$DEVICE"
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
8. Settings or profile screen
9. Any unique differentiating screen

**Never capture:** paywall screens, subscription gates, purchase dialogs, "Upgrade to Pro" modals, loading spinners, error states, empty states, or login/signup forms. If you navigate into one of these, go back immediately and do not save that screenshot.

---

## Step 3b — Marketing evaluation (AI reviews all candidates)

After the exploration loop, review every captured PNG before showing them to the user.

Score each screenshot against these criteria and **automatically discard** any that fail:

| Criterion | Pass | Fail — discard |
|---|---|---|
| **No paywall / gate** | App content visible and usable | Any purchase prompt, subscription wall, locked content indicator |
| **Real content shown** | Actual data, real UI populated | Empty lists, placeholder text, "Loading…", skeleton screens |
| **Positive framing** | Feature working, happy path | Error message, warning banner, crash dialog |
| **Core value visible** | The app's main benefit is on screen | Settings, legal, about, permissions dialogs |
| **No auth barrier** | User is inside the app | Login form, sign-up screen, forgot password |
| **Clean UI** | No debug overlays, no dev tools | Xcode inspector overlay, ADB dev options visible |

After discarding failures, present only the passing screenshots to the user:

```
✅ 1.png — onboarding welcome (marketing-ready)
✅ 3.png — main dashboard with real data (marketing-ready)
✅ 5.png — primary feature in use (marketing-ready)
❌ 2.png — discarded (paywall gate visible)
❌ 6.png — discarded (empty state / no content)
```

Ask the user to confirm the final selection, then delete all discarded PNGs before proceeding to Phase 2.

### Android capture loop

```bash
LOCALE="en-US"
DEVICE="Phone-1080x1920"
OUTDIR=".msd/screenshots/{appId}/raw/$LOCALE/android/$DEVICE"
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

## Step 4 — Phase 2: Design with ParthJadhav/app-store-screenshots

Use **https://github.com/ParthJadhav/app-store-screenshots** (MIT) to design every approved screenshot — this is the **only** permitted design tool. Do NOT use storeshots.org or any other generator.

> **This tool is a scaffolded Next.js editor, not a CLI.** There is NO `src/data.js` and NO `npm run screenshots`. It is configured by `app-store-screenshots.json` and exported via the browser **Export bundle** button. All sizes come from the tool's export — never hardcode them.

### Setup (one-time per machine)

```bash
npx skills add ParthJadhav/app-store-screenshots
```

Then scaffold the editor for this app and install deps:

```bash
STUDIO=".msd/screenshots/{appId}/design-studio"
mkdir -p "$STUDIO"
# Ask the agent to scaffold the Next.js editor into $STUDIO, then:
cd "$STUDIO" && npm install   # or: bun install
```

### Configure the design

1. Copy approved Phase-1 captures into the scaffold, per platform/device/locale:
```bash
cp .msd/screenshots/{appId}/raw/{locale}/ios/{device}/*.png \
   "$STUDIO/public/screenshots/apple/iphone/{lang}/"
```

2. Read each locale's metadata for headline copy:
   - Headlines: `.msd/metadata/{appId}/{platform}/{locale}/subtitle.txt` (primary screen), then a distinct 3–6 word benefit per subsequent slide. Never repeat a headline.
   - For non-English locales, use translated text from the corresponding metadata directory. Apple OCR indexes iOS captions — align with `keywords.txt`.

3. Write `$STUDIO/app-store-screenshots.json` defining a deck **per device** and every locale in `locales[]`. **All of `iphone`, `ipad`, `android`, `android-7`, `android-10`, and `feature-graphic` decks are required** so both Phone AND Tablet are produced for both platforms:
```json
{
  "schemaVersion": 2,
  "appName": "{displayName}",
  "themeId": "clean-light",
  "connectedCanvas": false,
  "locales": ["en", "tr"],
  "locale": "en",
  "device": "iphone",
  "orientation": "portrait",
  "appIcon": "/app-icon.png",
  "slidesByDevice": {
    "iphone":  [ { "id": "s_01", "layout": "hero",
                   "label": { "en": "KEY BENEFIT" },
                   "headline": { "en": "Short punchy\nheadline." },
                   "screenshot": "/screenshots/apple/iphone/en/01.png" } ],
    "ipad":    [ /* iPad tablet slides — REQUIRED for iOS */ ],
    "android": [ /* Android phone slides */ ],
    "android-7":  [ /* 7" tablet — REQUIRED for Android tablets */ ],
    "android-10": [ /* 10" tablet — REQUIRED for Android tablets */ ],
    "feature-graphic": [ /* 1024×500 Play banner */ ]
  },
  "crossScreenMockupsByDevice": {
    "iphone": [], "ipad": [], "android": [],
    "android-7": [], "android-10": [], "feature-graphic": []
  }
}
```

### Export every device deck

```bash
cd "$STUDIO" && npm run dev   # or: bun run dev → open the printed localhost URL
```

In the editor, for **each device** (iphone, ipad, android, android-7, android-10, feature-graphic): select it, refine copy/placement, click **Export bundle**. Each download is `{appName}-{platform}-{device}-{timestamp}.zip` containing every size × locale at store-ready dimensions:

```
{platform}/{device}/{width}x{height}/{locale}/{NN}-{layout}.png
# e.g. ios/iphone/1320x2868/en/01-hero.png   |   android/android-7/1200x1920/en/01-hero.png
```

Then file each bundle into `.msd/screenshots/{appId}/designed/{platform}/{locale}/` with the device + size baked into each filename (see the skill's "File the exports into designed/" snippet). **Android decks export frameless** — Play Store renders its own frames.

---

## Step 5 — Validate

Confirm both Phone and Tablet designed output exists for iOS AND Android, per locale (platform-first layout, device + size in the filename):

```
.msd/screenshots/{appId}/designed/ios/{lang}/iphone-1320x2868-01-hero.png            ✅ iOS Phone
.msd/screenshots/{appId}/designed/ios/{lang}/ipad-2064x2752-01-hero.png              ✅ iOS Tablet
.msd/screenshots/{appId}/designed/android/{lang}/android-1080x1920-01-hero.png       ✅ Android Phone
.msd/screenshots/{appId}/designed/android/{lang}/android-10-1600x2560-01-hero.png    ✅ Android Tablet
.msd/screenshots/{appId}/designed/android/{lang}/feature-graphic-1024x500-01-feature-graphic.png ✅ Feature graphic
```

Count files per device per locale — Apple requires at least 1, max 10. Google max 8.

If a Tablet deck is missing and the app supports iPad/Android tablets, **do not proceed to submission** — add the missing `ipad` / `android-7` / `android-10` slides to `app-store-screenshots.json` and re-export that device.
