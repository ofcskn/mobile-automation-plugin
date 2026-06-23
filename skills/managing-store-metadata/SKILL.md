---
name: managing-store-metadata
description: >
  Manages App Store Connect and Google Play Console metadata — names, subtitles, keywords,
  descriptions, and release notes — enforcing Apple and Google hard character limits.
  Use when the user says "update description", "change keywords", "edit metadata",
  "update release notes", or "validate store copy". Always run validate-metadata.js
  after any edit before uploading.
---

# Managing Store Metadata

## When to use

| Request | Action |
|---|---|
| "update keywords" | Edit keywords.txt, validate |
| "write description" | Edit description.txt (iOS) or full_description.txt (Android) |
| "release notes" | Edit release_notes.txt for all locales |
| "validate metadata" | Run validate-metadata.js only |

## File structure

```
metadata/{app-id}/
├── ios/{locale}/
│   ├── name.txt           ← 30 chars — INDEXED
│   ├── subtitle.txt       ← 30 chars — INDEXED
│   ├── keywords.txt       ← 100 chars — INDEXED (comma,no,spaces)
│   ├── description.txt    ← 4,000 chars — NOT indexed on iOS
│   ├── promotional.txt    ← 170 chars — NOT indexed
│   └── release_notes.txt  ← 4,000 chars
└── android/{locale}/
    ├── title.txt              ← 30 chars — INDEXED
    ├── short_description.txt  ← 80 chars — INDEXED
    ├── full_description.txt   ← 4,000 chars — INDEXED (include keywords!)
    └── release_notes.txt      ← 500 chars (NOT 4,000 like iOS)
```

## Steps

1. Confirm which locales to update: `cat config/{appId}.config.json`
2. Edit the relevant `.txt` files under `metadata/{appId}/`
3. **Always validate after editing:**
   `node skills/managing-store-metadata/scripts/validate-metadata.js {appId}`
4. Fix any ❌ errors before uploading
5. Upload: `eas submit --platform ios` / `eas submit --platform android`, or paste directly into App Store Connect / Google Play Console

## Critical rules

- **Apple description is NOT indexed for search** — keywords belong in name, subtitle, keywords.txt
- **Google full description IS indexed** — include your top keywords naturally 3-5x
- **Apple keywords field:** comma,no,spaces — spaces waste characters
- **Apple subtitle bug:** at exactly 30 chars, Apple may not index the last word. Use 29 or fewer.
- **Android What's New: 500 chars max** (NOT 4,000 like iOS — common mistake)
- validate-metadata.js exits 1 on any limit violation — this blocks CI

## Reference

- `skills/managing-store-metadata/references/apple-limits.md`
- `skills/managing-store-metadata/references/google-limits.md`
