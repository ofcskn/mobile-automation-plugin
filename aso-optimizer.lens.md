---
schema: "lenserfight.export.v1"
schemaVersion: "1.0.0"
kind: "lens"
visibility: "owner"
---
# ASO Optimizer for Mobile Apps

**Tags:** `#aso` `#keywords` `#app-store` `#google-play` `#metadata` `#seo`

## Parameters

### `[[app name]]`
- **Type:** `text`
- **Description:** The app's name as it appears in the store
- **Placeholder:** e.g. HabitFlow

### `[[app category]]`
- **Type:** `text`
- **Description:** App Store category
- **Placeholder:** e.g. Health & Fitness

### `[[app description draft]]`
- **Type:** `text`
- **Description:** One paragraph describing what the app does (plain language, not marketing)
- **Placeholder:** Enter a plain description of the app's core function...

### `[[target locale]]`
- **Type:** `text`
- **Description:** The locale to optimize for (one locale per lens run)
- **Placeholder:** e.g. en-US

### `[[top 3 competitors]]`
- **Type:** `text`
- **Description:** App Store names of 3 competitors
- **Placeholder:** e.g. Streaks, Habitica, Done

### `[[existing keywords]]`
- **Type:** `text`
- **Description:** Current keyword field content (leave blank if none)
- **Placeholder:** e.g. habit,tracker,daily,streak

## Lens body

You are a senior ASO specialist. Optimize the App Store and Google Play metadata
for [[app name]] ([[app category]]) in locale [[target locale]].

App description: [[app description draft]]
Competitors: [[top 3 competitors]]
Current keywords: [[existing keywords]]

**Platform-specific rules (HARD LIMITS — store rejects silently on violation):**

Apple App Store:
- App Name: 30 chars MAX — strongest search signal
- Subtitle: 30 chars MAX — leave 1 char buffer (Apple bug may not index last word at 30)
- Keywords: 100 chars MAX — comma-separated, NO spaces after commas
- Description: 4,000 chars MAX — NOT indexed for search on iOS (conversion copy only)
- Promotional Text: 170 chars MAX — NOT indexed, can update without new version
- Screenshot captions: indexed by Apple OCR since June 2025 — align with keywords

Google Play:
- Title: 30 chars MAX — strongest signal
- Short Description: 80 chars MAX — IS indexed (second strongest signal)
- Full Description: 4,000 chars — IS indexed (include keywords 3–5× naturally)
- What's New: 500 chars MAX (NOT 4,000 like iOS)

**iOS keyword strategy:**
- Never repeat words already in App Name or Subtitle (Apple auto-indexes those)
- Single words > phrases (algorithm cross-indexes from different fields)
- Total search surface = Name (30) + Subtitle (30) + Keywords (100) = 160 chars only
- Keyword field: comma,no,spaces to maximize character efficiency

**Locale-specific keyword research:**
For locale [[target locale]], generate keywords in the NATIVE language of that locale.
Do not simply translate English keywords — research what users in that market actually
search for. Example: Turkish users may search "alışkanlık takip" not "habit tracker".

**Your output:**

## ASO strategy for [[app name]] — [[target locale]]

### Keyword research findings
[10–15 keyword candidates with estimated search intent: high/medium/low]

### Competitor gap analysis
[keywords [[top 3 competitors]] rank for that [[app name]] is missing]

### Optimized iOS metadata

**App Name (30 chars):**
`{your suggestion}` ({X} chars)

**Subtitle (30 chars):**
`{your suggestion}` ({X} chars)

**Keywords (100 chars):**
`{your suggestion}` ({X} chars)
✓ No spaces after commas
✓ No words from App Name/Subtitle

**Promotional Text (170 chars):**
`{your suggestion}` ({X} chars)

**Description (4,000 chars):**
[conversion-focused copy, structured for readability]
Character count: {X}/4,000

### Optimized Google Play metadata

**Title (30 chars):**
`{your suggestion}` ({X} chars)

**Short Description (80 chars):**
`{your suggestion}` ({X} chars)
✓ Includes primary keyword naturally

**Full Description (4,000 chars):**
[SEO-optimized — keyword appears 3–5× naturally, benefits-first structure]
Character count: {X}/4,000

**What's New (500 chars):**
`{your suggestion}` ({X} chars)

### Screenshot caption recommendations
[5 captions using top keywords — for Apple OCR indexing alignment]

### Validation command
```bash
node skills/managing-store-metadata/scripts/validate-metadata.js {app-id}
```

### Next: GEO optimization
Load `lenses/geo-optimizer.lens.md` with the optimized description above.
