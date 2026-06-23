---
name: generating-store-screenshots
description: >
  Manages the two-phase store screenshot pipeline: Phase 1 captures raw screenshots
  from the iOS Simulator or Android Emulator; Phase 2 adds design layers
  (device frames, headlines, backgrounds) via ParthJadhav/app-store-screenshots or
  storeshots.org. Use when the user says "generate screenshots", "update store images",
  "take screenshots", "design marketing slides", or "screenshot pipeline".
---

# Generating Store Screenshots

## When to use

| Request | Action |
|---|---|
| "generate screenshots" | Run full pipeline (capture + design + validate) |
| "capture screenshots" | Phase 1 only (simulator) |
| "design screenshots" | Phase 2 only (app-store-screenshots editor) |
| "validate screenshots" | Check dimensions and count only |

## Two-phase pipeline

### Phase 1: Capture (simulator / emulator)

```bash
# iOS — boot simulator, run app, capture via xcrun
xcrun simctl io booted screenshot screenshots/{appId}/raw/{device}/{locale}/screen.png

# Android — boot emulator, run app, capture via adb
adb exec-out screencap -p > screenshots/{appId}/raw/{device}/{locale}/screen.png
```

Alternatively, capture manually from the running simulator (Cmd+S in iOS Simulator, or use the emulator toolbar). Repeat per device size and locale.

Output lands in `screenshots/{appId}/raw/{device}/{locale}/`

### Phase 2: Design (open source tools)

**Option A — CLI/Agent (recommended):**
```bash
npx skills add ParthJadhav/app-store-screenshots
```
Provide the screenshot brief from `lenses/screenshot-designer.lens.md`.

**Option B — Web GUI:**
Open storeshots.org, import raw PNGs, export designed bundles.

Output lands in `screenshots/{appId}/designed/ios/{locale}/` and `android/{locale}/`

## Critical constraints

- **iPhone 6.9" (1320×2868) is REQUIRED from 2026.** Submission blocked without it.
- **iPad Pro 13" (2064×2752) required if app supports iPad.**
- Apple allows max **10 screenshots** per locale per device. Google allows **8**.
- **Do NOT add device frames to Android screenshots** — Play Store renders its own.
- **Apple OCR indexes screenshot caption text since June 2025.** Align headlines with `keywords.txt`.
- Always load `references/device-matrix.md` before starting capture.

## References

- `skills/generating-store-screenshots/references/device-matrix.md` — all required sizes
- `skills/generating-store-screenshots/references/screenshot-specs.md` — pixel specs
