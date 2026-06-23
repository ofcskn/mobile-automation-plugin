---
schema: "lenserfight.export.v1"
schemaVersion: "1.0.0"
kind: "lens"
visibility: "owner"
---
# Screenshot Designer Brief for Mobile Apps

**Tags:** `#screenshots` `#app-store` `#google-play` `#design` `#aso` `#branding`

## Parameters

### `[[app name]]`
- **Type:** `text`
- **Description:** App name
- **Placeholder:** e.g. HabitFlow

### `[[app category]]`
- **Type:** `text`
- **Description:** App category
- **Placeholder:** e.g. Health & Fitness

### `[[top 5 keywords]]`
- **Type:** `text`
- **Description:** Primary keywords from ASO Optimizer lens output (comma-separated)
- **Placeholder:** e.g. habit,streak,daily,reminder,routine

### `[[visual style]]`
- **Type:** `text`
- **Description:** Visual direction for the screenshots
- **Placeholder:** e.g. clean minimal, warm neutrals, dark premium, playful colorful

### `[[target locale]]`
- **Type:** `text`
- **Description:** Primary locale for these screenshots
- **Placeholder:** e.g. en-US

### `[[number of slides]]`
- **Type:** `text`
- **Description:** How many screenshot slides (Apple allows 10, Google Play allows 8)
- **Placeholder:** 5

### `[[brand colors]]`
- **Type:** `text`
- **Description:** Primary brand color(s) in hex or plain name
- **Placeholder:** e.g. #4F46E5 purple, white background

## Lens body

You are a senior app store screenshot strategist and UX copywriter.
Design a complete screenshot brief for [[app name]] ([[app category]]).

Style: [[visual style]]
Target locale: [[target locale]]
Number of slides: [[number of slides]]
Keywords to embed in captions: [[top 5 keywords]]
Brand colors: [[brand colors]]

**Critical constraints:**

Apple App Store:
- Screenshot captions are indexed via Apple OCR since June 2025
- Caption headline text is a ranking signal — MUST align with keyword strategy
- First screenshot is most important (shown in search results before user taps)
- Max 10 screenshots per locale per device (iPhone 6.9" required from 2026)

Google Play:
- Caption text is NOT indexed by OCR
- Focus on visual storytelling, not keyword placement
- Max 8 screenshots per device type
- Do NOT add device frames — Play renders its own

**Design principles (from top App Store screenshot analysis):**
- Plain white is the amateur tell — use deliberate backgrounds (saturated color, cream, dark navy)
- Headline occupies top 30–40% of canvas — must be readable at thumbnail size
- One idea per headline — never join two things with "and"
- 3–5 words per headline — short, common words
- Almost every great headline has one word styled differently (color accent, italic, heavier weight)
- Last slide must differ from earlier slides — mosaic, countdown, CTA, not another hero

---

**Your output:**

## Screenshot Brief for [[app name]] — [[target locale]]

### Design direction
- Background treatment: [specific color/gradient guidance]
- Typography: [font weight, size hierarchy]
- Device frame approach: [centered single phone / multi-phone / floating elements]
- Accent color: [specific hex from brand colors]

### Slide-by-slide breakdown

**Slide 1 — Hero (most critical, shown in search)**
- Headline: `{3–5 words}` ({X} chars)
- Sub-headline: `{supporting line}`
- Visual: [screen to show]
- Keywords embedded: [{keyword1}, {keyword2}]
- Apple OCR value: HIGH — confirm caption aligns with top keyword

**Slide 2 — Core feature**
- Headline: `{3–5 words}`
- Sub-headline: `{supporting line}`
- Visual: [screen to show]
- Keywords embedded: [{keyword}]

[Continue for all [[number of slides]] slides]

**Slide [[number of slides]] — CTA / Social proof**
- Approach: [mosaic / testimonial / stat / download prompt]
- Headline: `{3–5 words}`
- Visual: [concept]

### Keyword OCR alignment table (iOS only)

| Slide | Caption text | Keywords covered | OCR index confidence |
|---|---|---|---|
| 1 | `{text}` | habit, streak | HIGH |
| 2 | `{text}` | daily, reminder | MEDIUM |
[...]

### Google Play adaptations
[Note any changes needed for Play — remove OCR-optimized headlines if they
read awkwardly without the keyword-stuffing context]

### Localization notes for [[target locale]]
[RTL direction if applicable, text expansion estimates for translations,
cultural visual considerations]

### Asset delivery spec
- iOS required: 1320×2868 (iPhone 6.9"), 1242×2688 (iPhone 6.5"), 2064×2752 (iPad 13")
- Android required: 1080×1920 (phone), 1024×500 feature graphic
- Naming: `{01..10}_{short-description}.png`
- Directory: `screenshots/{app-id}/designed/{platform}/{locale}/`

### Command to trigger design layer
```bash
# Using ParthJadhav/app-store-screenshots:
npx skills add ParthJadhav/app-store-screenshots

# Pass this brief to the agent:
"Build App Store screenshots for [[app name]].
Style: [[visual style]], [[brand colors]].
[number of slides] slides.
Headlines: [paste Slide 1–N headlines from above]"
```
