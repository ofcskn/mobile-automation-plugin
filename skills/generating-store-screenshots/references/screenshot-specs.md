# Screenshot Export Specifications

> **Design tool:** All output dimensions are determined by **ParthJadhav/app-store-screenshots** (MIT). Do not assume or hardcode canvas sizes — derive them from the tool's actual output.

> **Asset folder:** The `{appId}` portion of every path must NOT end with `.app`.

## iOS export specs

Both **Phone** and **Tablet** sets are required.

### Phone

| Size | Dimensions | Format | Notes |
|---|---|---|---|
| iPhone 6.9" | 1320×2868 | PNG | Required from 2026 |
| iPhone 6.5" | 1242×2688 | PNG | Covers iPhone 11/12/13/14/15 Pro Max |

### Tablet

| Size | Dimensions | Format | Notes |
|---|---|---|---|
| iPad Pro 13" | 2064×2752 | PNG | Required if app supports iPad |

**Tablet fallback:** If no iPad simulator exists, run phone screenshots through ParthJadhav/app-store-screenshots targeting the iPad Pro 13" canvas. The phone capture becomes the `image` value in `src/data.js`; the tool handles framing and sizing.

- Color space: sRGB
- Bit depth: 8-bit or 16-bit
- No alpha channel (Apple strips it)
- Named sequentially: `1.png`, `2.png`, `3.png`, ...

## Android export specs

### Phone

| Type | Dimensions | Format | Notes |
|---|---|---|---|
| Phone screenshot | 1080×1920 | PNG or JPEG | No device frame |
| Feature Graphic | 1024×500 | PNG or JPEG | Required — store listing header |

### Tablet

| Type | Dimensions | Format | Notes |
|---|---|---|---|
| 7-inch tablet | 1080×1920 | PNG or JPEG | No device frame |
| 10-inch tablet | 1080×1920 | PNG or JPEG | No device frame |

**Tablet fallback:** If no tablet emulator exists, run phone screenshots through ParthJadhav/app-store-screenshots at tablet canvas dimensions.

- Do NOT add device frames — Play Store renders its own
- Max file size: 8MB per image
- Named sequentially: `1.png`, `2.png`, `3.png`, ...

## Folder structure (locale → platform → device-size)

Locale is the top-level grouping so each locale folder can be zipped and uploaded directly.

```
screenshots/{app-id}/
├── raw/                                          ← Phase 1 output (not committed)
│   └── {locale}/                                 e.g. en-US, tr-TR
│       ├── ios/
│       │   ├── iPhone-16-Pro-Max-1320x2868/
│       │   │   ├── 1.png
│       │   │   ├── 2.png
│       │   │   └── ...
│       │   ├── iPhone-11-Pro-Max-1242x2688/
│       │   │   └── ...
│       │   └── iPad-Pro-13-2064x2752/
│       │       └── ...
│       └── android/
│           ├── Phone-1080x1920/
│           │   ├── 1.png
│           │   └── ...
│           └── Feature-Graphic-1024x500/
│               └── feature.png
└── designed/                                     ← Phase 2 output (committed)
    └── {locale}/
        ├── ios/
        │   ├── iPhone-16-Pro-Max-1320x2868/
        │   │   ├── 1.png
        │   │   └── ...
        │   └── iPhone-11-Pro-Max-1242x2688/
        │       └── ...
        └── android/
            └── Phone-1080x1920/
                ├── 1.png
                └── ...
```

## Device folder naming convention

| Device | Folder name |
|---|---|
| iPhone 16 Pro Max | `iPhone-16-Pro-Max-1320x2868` |
| iPhone 11 Pro Max | `iPhone-11-Pro-Max-1242x2688` |
| iPad Pro 13" | `iPad-Pro-13-2064x2752` |
| Android Phone | `Phone-1080x1920` |
| Android Feature Graphic | `Feature-Graphic-1024x500` |

Use these exact folder names so the generate-release-summary script and CI scripts can find files reliably.
