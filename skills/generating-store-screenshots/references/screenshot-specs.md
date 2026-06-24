# Screenshot Export Specifications

## iOS export specs

| Size | Dimensions | Format | Notes |
|---|---|---|---|
| iPhone 6.9" | 1320×2868 | PNG | Required from 2026 |
| iPhone 6.5" | 1242×2688 | PNG | Covers iPhone 11/12/13/14/15 Pro Max |
| iPad Pro 13" | 2064×2752 | PNG | For universal apps |

- Color space: sRGB
- Bit depth: 8-bit or 16-bit
- No alpha channel (Apple strips it)
- Named sequentially: `1.png`, `2.png`, `3.png`, ...

## Android export specs

| Type | Dimensions | Format | Notes |
|---|---|---|---|
| Phone screenshot | 1080×1920 | PNG or JPEG | No device frame |
| Feature Graphic | 1024×500 | PNG or JPEG | Required — store listing header |

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
