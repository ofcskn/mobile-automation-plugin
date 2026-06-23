---
description: Generate "What's New" release notes for all locales — AI drafts per language, you approve, then writes to metadata files
---

Generate release notes for the current version across all configured locales.

## Usage

`/msd-release-notes {appId}` or `/msd-release-notes {appId} "Fixed crash on startup, added dark mode"`

## Steps

1. Read `memory/apps.json` for the app's locale list
2. Read `versions/{appId}/version.json` for the current version
3. Ask (if not provided): "What changed in this version? Describe in plain English — I'll adapt it per language and platform."

4. For each locale in the app's locale list:
   a. Draft iOS "What's New" (max 4,000 chars, natural phrasing in that language)
   b. Draft Android "What's New" (max **500 chars** — strictly enforce this)
   c. Show both drafts to user

5. Ask: "Approve all? Or review locale by locale?"
   - If approve all: write all files immediately
   - If review: show each locale, wait for approval per locale

6. Write approved files:
   - `metadata/{appId}/ios/{locale}/release_notes.txt`
   - `metadata/{appId}/android/{locale}/release_notes.txt`

7. Run validate-metadata.js to confirm char limits pass

## Per-language guidance

Do NOT literally translate — adapt for natural expression:
- `en-US`: direct, friendly ("We fixed a crash and added dark mode")
- `tr-TR`: more formal ("Uygulama kararlılığı artırıldı, karanlık mod eklendi")
- `de-DE`: precise, compound-words preferred
- `ja-JP`: polite form, shorter sentences
- `zh-Hans`: concise, feature-list format

## Locale code mapping for file paths

Use the locale codes already in `metadata/{appId}/` — if `en-US` directory exists, write there.
If only `en` exists, write to `en/`.

## Android 500-char rule

Android What's New is strictly 500 chars. If the content exceeds this after translation, summarize to the 2-3 most important changes. Never truncate mid-sentence.
