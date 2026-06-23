# Apple App Store Character Limits

Source: App Store Connect Review Guidelines, verified June 2026

| Field | Limit | Indexed? | Notes |
|---|---|---|---|
| App Name | **30** | ✅ | Strongest search signal |
| Subtitle | **30** | ✅ | Don't repeat Name words. Leave 1 char buffer (Apple bug at exactly 30) |
| Keywords | **100** | ✅ | `comma,no,spaces` — don't repeat Name/Subtitle words |
| Promotional Text | **170** | ❌ | Can update without new version submission |
| Description | **4,000** | ❌ | Conversion copy only — NOT a search ranking signal |
| What's New | **4,000** | ❌ | |
| IAP Name | **35** | ✅ | |
| IAP Description | **55** | ❌ | |
| In-App Event Title | **30** | ✅ | iOS 15+ |
| Screenshot captions | — | ✅ OCR | Apple OCR indexes caption text since June 2025 |

## Search surface

Total indexed characters: App Name (30) + Subtitle (30) + Keywords (100) = **160 chars**

Apple cross-indexes across fields, so:
- Do NOT repeat words from Name in Subtitle or Keywords
- Do NOT repeat words from Subtitle in Keywords
- Single words > phrases (algorithm builds cross-field combinations)

## locale format for App Store Connect

`en-US`, `tr-TR`, `de-DE`, `fr-FR`, `pt-BR`, `ja`, `ko`, `zh-Hans`

## Screenshot specs (2026 requirements)

- iPhone 6.9" (1320×2868 px) — **REQUIRED from 2026, submission blocked without it**
- iPhone 6.5" (1242×2688 px) — recommended
- iPad Pro 13" (2064×2752 px) — required if app supports iPad
- Max 10 screenshots per locale per device
