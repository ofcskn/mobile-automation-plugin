---
description: Generate or update store screenshots for all devices and locales
---

Generate store screenshots for the specified app.

Ask: app ID, platform (ios / android / both), whether to localize (which locales?).

Steps:
1. Load `skills/generating-store-screenshots`
2. Show `skills/generating-store-screenshots/references/device-matrix.md` to confirm required sizes
3. Phase 1 — Capture (simulator / emulator):
   - iOS: `xcrun simctl io booted screenshot <path>.png` (or Cmd+S in iOS Simulator)
   - Android: `adb exec-out screencap -p > <path>.png` (or use emulator toolbar)
4. Phase 2 — Design:
   - Load `lenses/screenshot-designer.lens.md` to generate the design brief
   - Guide user through `npx skills add ParthJadhav/app-store-screenshots`
5. Validate designed output exists in `screenshots/{appId}/designed/`
