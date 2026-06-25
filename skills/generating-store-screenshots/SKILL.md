---
name: generating-store-screenshots
description: >
  Manages the two-phase store screenshot pipeline: Phase 1 captures raw screenshots
  by automatically exploring the running iOS Simulator or Android Emulator — booting
  the device, launching the app, navigating every key screen, and capturing numbered
  PNGs; Phase 2 adds design layers (device frames, headlines, backgrounds) exclusively
  via ParthJadhav/app-store-screenshots (MIT). Outputs are grouped by
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

## Folder structure

**Phase 1 (raw)** is grouped locale → platform → device for capture clarity.
**Phase 2 (designed)** is grouped **platform → locale** with flat PNGs (device + size in
the filename) — this is the exact layout the submission skill's
`generate-release-summary.js` reads.

```
.msd/screenshots/{appId}/
├── raw/                                            ← Phase 1 output (not committed)
│   └── {locale}/                                   e.g. en-US, tr-TR
│       ├── ios/
│       │   ├── iPhone-16-Pro-Max-1320x2868/
│       │   │   ├── 1.png
│       │   │   └── ...
│       │   └── iPad-Pro-13-2064x2752/
│       └── android/
│           └── Phone-1080x1920/
│               ├── 1.png
│               └── ...
├── design-studio/                                  ← scaffolded ParthJadhav editor
└── designed/                                       ← Phase 2 output (committed)
    ├── ios/
    │   └── {locale}/                               e.g. en, tr
    │       ├── iphone-1320x2868-01-hero.png
    │       ├── iphone-1320x2868-02-device-bottom.png
    │       ├── ipad-2064x2752-01-hero.png
    │       └── ...
    └── android/
        └── {locale}/
            ├── android-1080x1920-01-hero.png
            ├── android-10-1600x2560-01-hero.png
            ├── feature-graphic-1024x500-01-feature-graphic.png
            └── ...
```

**Why this order:** the release-summary generator iterates `designed/{platform}/{locale}/`
and renders every PNG directly inside it, so designed assets are platform-first with the
device + size baked into each filename — nothing is hidden in subfolders.

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
OUTDIR=".msd/screenshots/{appId}/raw/{locale}/ios/{device-folder}"
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
OUTDIR=".msd/screenshots/{appId}/raw/{locale}/android/Phone-1080x1920"
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

## Phase 2 — Design with ParthJadhav/app-store-screenshots (the real tool)

Use **https://github.com/ParthJadhav/app-store-screenshots** (MIT) to produce the
professional, marketing-grade designed screenshots. This is the **only** permitted
design tool — do not substitute storeshots.org or any other generator.

> **What this tool actually is (read carefully — the old instructions were wrong):**
> It is an **agent skill that scaffolds a Next.js visual editor**, NOT a headless
> CLI. There is no `src/data.js` and no `npm run screenshots` command. The editor's
> single source of truth is **`app-store-screenshots.json`**, and you export
> store-ready PNGs by running its dev server and clicking **Export bundle** in the
> browser. All canvas/export dimensions come from the tool itself — never hardcode them.

**Both Phone AND Tablet are REQUIRED for both iOS and Android, per locale.** The tool
covers every required device deck (iPhone, iPad, Android phone, Android 7"/10" tablet,
feature graphic) and exports one zip per device containing every size × locale.

### Step 1 — Install the skill (one-time per machine)

```bash
npx skills add ParthJadhav/app-store-screenshots
```

This installs the design skill for the agent. It is fetched from the public repo, so
**any user** gets the same tool with no project-specific dependencies.

### Step 2 — Scaffold the editor project

Ask the agent to scaffold the Next.js editor into the plugin's design workspace for
this app:

```bash
STUDIO=".msd/screenshots/{appId}/design-studio"
mkdir -p "$STUDIO"
# The skill scaffolds the Next.js editor here. Then install + nothing else:
cd "$STUDIO" && npm install   # (or: bun install)
```

The scaffold creates `public/screenshots/`, `app-store-screenshots.json`, and the
editor UI under `src/`.

### Step 3 — Place the approved raw screenshots

Copy the Phase-1 approved captures into the scaffold's public folder, one folder per
platform/device/locale so each slide can reference them by path:

```bash
# Example: iOS phone, English captures
DST="$STUDIO/public/screenshots/apple/iphone/en"
mkdir -p "$DST"
cp .msd/screenshots/{appId}/raw/en-US/ios/iPhone-16-Pro-Max-1320x2868/*.png "$DST/"
```

### Step 4 — Write `app-store-screenshots.json` (the real config)

This file IS the design. Generate it from the approved screenshots and each locale's
metadata. It defines a slide deck **per device** and a `locales[]` array that drives
per-locale export. Required keys:

```json
{
  "schemaVersion": 2,
  "appName": "{displayName}",
  "themeId": "clean-light",
  "connectedCanvas": false,
  "locales": ["en", "tr", "de"],
  "locale": "en",
  "device": "iphone",
  "orientation": "portrait",
  "appIcon": "/app-icon.png",
  "slidesByDevice": {
    "iphone":  [ /* phone slides */ ],
    "ipad":    [ /* iPad tablet slides — REQUIRED for iOS */ ],
    "android": [ /* Android phone slides */ ],
    "android-7":  [ /* 7" tablet — REQUIRED for Android tablets */ ],
    "android-10": [ /* 10" tablet — REQUIRED for Android tablets */ ],
    "feature-graphic": [ /* 1024×500 Play listing banner */ ]
  },
  "crossScreenMockupsByDevice": {
    "iphone": [], "ipad": [], "android": [],
    "android-7": [], "android-10": [], "feature-graphic": []
  }
}
```

Each slide entry:

```json
{
  "id": "s_01",
  "layout": "hero",
  "label":    { "en": "TRACK HABITS", "tr": "ALIŞKANLIK TAKİBİ" },
  "headline": { "en": "Build streaks\nthat stick.", "tr": "..." },
  "screenshot": "/screenshots/apple/iphone/en/01-welcome.png"
}
```

**Headline / label rules (professional marketing copy):**
- One idea per headline, 3–6 words, readable at thumbnail size.
- Source the primary headline from `.msd/metadata/{appId}/{platform}/{locale}/subtitle.txt`;
  write a distinct benefit line for each subsequent slide. Never repeat a headline.
- Provide every locale in `locales[]` — each locale renders headlines in its own
  language. For non-English locales use the translated metadata.
- **Apple OCR indexes caption text since June 2025** — align iOS headlines with
  `.msd/metadata/{appId}/ios/{locale}/keywords.txt`.
- Available layouts: `hero`, `device-bottom`, `device-top`, `two-devices`,
  `no-device`, `split-landscape` (tablets), `feature-graphic`. Vary them for rhythm;
  make the last slide differ from the hero (mosaic / CTA / "no device").

### Step 5 — Run the editor and export each device deck

```bash
cd "$STUDIO" && npm run dev    # (or: bun run dev) → open the printed localhost URL
```

In the browser editor, for **each device** (iphone, ipad, android, android-7,
android-10, feature-graphic): select it in the toolbar, fine-tune copy/placement, then
click **Export bundle**. Each click downloads one zip named
`{appName}-{platform}-{device}-{timestamp}.zip` containing every required size × locale:

```
{platform}/{device}/{width}x{height}/{locale}/{NN}-{layout}.png
# e.g. ios/iphone/1320x2868/en/01-hero.png
```

Run Export bundle once per device so all required Phone + Tablet decks are covered for
both platforms. Sizes are emitted by the tool per Apple/Google marketing rules — see
`references/device-matrix.md` for the full list; do not hardcode them.

### Step 6 — File the exports into `designed/`

Unzip each bundle and reorganize into the **platform-first** `designed/` layout the
submission skill's `generate-release-summary.js` reads —
`designed/{platform}/{locale}/*.png`, with device + size encoded in the filename so
nothing collides and every required size is preserved:

```bash
# For each downloaded bundle zip:
unzip -o ~/Downloads/{appName}-*-{device}-*.zip -d /tmp/ssbundle

# Native export layout is {platform}/{device}/{w}x{h}/{locale}/NN-layout.png
# Reorganize to designed/{platform}/{locale}/{device}-{w}x{h}-NN-layout.png
find /tmp/ssbundle -name '*.png' | while read -r f; do
  rel="${f#/tmp/ssbundle/}"                       # platform/device/WxH/locale/NN-layout.png
  platform="${rel%%/*}"; rest="${rel#*/}"
  device="${rest%%/*}"; rest="${rest#*/}"
  size="${rest%%/*}"; rest="${rest#*/}"
  locale="${rest%%/*}"; file="${rest#*/}"
  dest=".msd/screenshots/{appId}/designed/$platform/$locale"
  mkdir -p "$dest" && cp "$f" "$dest/${device}-${size}-${file}"
done
```

This yields e.g. `designed/ios/en/iphone-1320x2868-01-hero.png` and
`designed/android/en/android-10-1600x2560-01-hero.png` — all visible in the release
summary and grouped by store/locale for upload.

**iOS:** the tool already adds device frames. **Android:** no device frames — Play
Store renders its own (the Android decks are exported frameless).

---

## Critical constraints

- **App ID / asset folder must NOT end with `.app`.** macOS treats such directories as application bundles. App Store tooling will silently reject uploads from a path ending in `.app`. The folder name must be a plain slug (e.g. `myapp`, `zenapp`).
- **Design tool: ParthJadhav/app-store-screenshots (MIT) — exclusively.** It is a scaffolded Next.js editor configured by `app-store-screenshots.json` and exported via the browser **Export bundle** button. There is NO `src/data.js` and NO `npm run screenshots`. Never assume pixel dimensions — all sizes come from the tool's export.
- **Required screenshot sets are Phone AND Tablet, for BOTH iOS and Android, per locale.** Define `iphone` + `ipad` decks for iOS and `android` + `android-7` + `android-10` decks for Android. Do not skip the tablet decks.
- **iPhone 6.9" (1320×2868) is REQUIRED from 2026.** Submission blocked without it.
- **iPad Pro 13" (2064×2752) is the iOS Tablet requirement.**
- **Android feature graphic (1024×500) is required** for the Play listing header.
- Apple allows max **10 screenshots** per locale per device. Google allows **8**.
- **Do NOT add device frames to Android screenshots.**
- **Apple OCR indexes screenshot caption text since June 2025.** Align headlines with `keywords.txt`.
- Always load `references/device-matrix.md` before starting capture.

## References

- `skills/generating-store-screenshots/references/device-matrix.md` — required device sizes
- `skills/generating-store-screenshots/references/screenshot-specs.md` — pixel specs and folder layout
