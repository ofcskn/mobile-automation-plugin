# Screenshot Export Specifications

> **Design tool:** All export dimensions are emitted by **ParthJadhav/app-store-screenshots** (MIT) when you click **Export bundle** in its scaffolded Next.js editor. This table documents what the tool produces (per Apple/Google marketing rules) — do not hardcode sizes elsewhere.

> **Asset folder:** The `{appId}` portion of every path must NOT end with `.app`.

## iOS export specs

Both **Phone** (`iphone` deck) and **Tablet** (`ipad` deck) sets are required.

### Phone — `iphone` deck

| Size | Dimensions | Format | Notes |
|---|---|---|---|
| iPhone 6.9" | 1320×2868 | PNG | Required from 2026 |
| iPhone 6.5" | 1284×2778 | PNG | Covers iPhone 11/12/13/14/15 Pro Max |
| iPhone 6.3" | 1206×2622 | PNG | iPhone 16 Pro |
| iPhone 6.1" | 1125×2436 | PNG | iPhone X/11 Pro |

### Tablet — `ipad` deck

| Size | Dimensions | Format | Notes |
|---|---|---|---|
| iPad Pro 13" | 2064×2752 | PNG | Required if app supports iPad |
| iPad Pro 12.9" | 2048×2732 | PNG | Recommended |

**No iPad simulator?** Re-use phone captures as the `screenshot` value in the `ipad` deck slides of `app-store-screenshots.json`; the editor frames them on the iPad canvas and Export bundle emits the iPad sizes.

- Color space: sRGB
- Bit depth: 8-bit or 16-bit
- No alpha channel (Apple strips it)
- Exported filenames: `{NN}-{layout}.png` (e.g. `01-hero.png`)

## Android export specs

### Phone — `android` deck

| Type | Dimensions | Format | Notes |
|---|---|---|---|
| Phone screenshot | 1080×1920 | PNG or JPEG | No device frame |

### Tablet — `android-7` / `android-10` decks

| Type | Portrait | Landscape | Notes |
|---|---|---|---|
| 7-inch tablet | 1200×1920 | 1920×1200 | No device frame |
| 10-inch tablet | 1600×2560 | 2560×1600 | No device frame |

### Feature graphic — `feature-graphic` deck

| Type | Dimensions | Format | Notes |
|---|---|---|---|
| Feature Graphic | 1024×500 | PNG or JPEG | Required — store listing header |

**No tablet emulator?** Re-use phone captures as the `screenshot` value in the `android-7` / `android-10` deck slides; the editor frames them on the tablet canvas.

- Do NOT add device frames — Play Store renders its own
- Max file size: 8MB per image
- Exported filenames: `{NN}-{layout}.png` (e.g. `01-hero.png`)

## Folder structure

**Phase 1 (raw)** is grouped locale → platform → device for capture. **Phase 2 (designed)**
is grouped **platform → locale** with flat PNGs (device + size in the filename) — the exact
layout the submission skill's `generate-release-summary.js` reads.

```
.msd/screenshots/{app-id}/
├── raw/                                          ← Phase 1 output (not committed)
│   └── {locale}/                                 e.g. en-US, tr-TR
│       ├── ios/
│       │   ├── iPhone-16-Pro-Max-1320x2868/
│       │   │   ├── 1.png
│       │   │   └── ...
│       │   └── iPad-Pro-13-2064x2752/
│       │       └── ...
│       └── android/
│           ├── Phone-1080x1920/
│           │   ├── 1.png
│           │   └── ...
│           └── Feature-Graphic-1024x500/
│               └── feature.png
├── design-studio/                               ← scaffolded ParthJadhav editor
└── designed/                                    ← Phase 2 output (committed)
    ├── ios/
    │   └── {locale}/                            e.g. en, tr
    │       ├── iphone-1320x2868-01-hero.png
    │       ├── ipad-2064x2752-01-hero.png
    │       └── ...
    └── android/
        └── {locale}/
            ├── android-1080x1920-01-hero.png
            ├── android-10-1600x2560-01-hero.png
            ├── feature-graphic-1024x500-01-feature-graphic.png
            └── ...
```

## Designed filename convention

The release-summary generator lists every PNG directly under `designed/{platform}/{locale}/`,
so device + size live in the **filename**, not a subfolder:

```
{device}-{width}x{height}-{NN}-{layout}.png
```

| Deck | Example filename |
|---|---|
| iPhone 6.9" | `iphone-1320x2868-01-hero.png` |
| iPad 13" | `ipad-2064x2752-01-hero.png` |
| Android phone | `android-1080x1920-01-hero.png` |
| Android 10" tablet | `android-10-1600x2560-01-hero.png` |
| Feature graphic | `feature-graphic-1024x500-01-feature-graphic.png` |

Keep this convention so `generate-release-summary.js` and CI scripts find every asset.
