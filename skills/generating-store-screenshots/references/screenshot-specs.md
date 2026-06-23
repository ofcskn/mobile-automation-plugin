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
- Named: `01_hero.png`, `02_feature.png`, etc.

## Android export specs

| Type | Dimensions | Format | Notes |
|---|---|---|---|
| Phone screenshot | 1080×1920 | PNG or JPEG | No device frame |
| Feature Graphic | 1024×500 | PNG or JPEG | Required — store listing header |

- Do NOT add device frames — Play adds them automatically
- Max file size: 8MB per image
- Named: `01_hero.png`, `02_feature.png`, etc.

## Directory structure

```
screenshots/{app-id}/
├── raw/                          ← Phase 1 output (not committed)
│   ├── ios/{device}/{locale}/
│   └── android/{locale}/
└── designed/                     ← Phase 2 output (committed)
    ├── ios/{locale}/
    └── android/{locale}/
```
