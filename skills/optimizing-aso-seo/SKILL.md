---
name: optimizing-aso-seo
description: >
  Optimizes App Store Optimization (ASO) strategy across all metadata fields for both
  Apple App Store and Google Play. Covers keyword research, competitor gap analysis,
  character-limit-aware copy, and screenshot caption alignment with Apple OCR indexing.
  Use when the user says "optimize keywords", "improve ASO", "keyword research",
  "improve ranking", or "write metadata". Use lenses/aso-optimizer.lens.md for
  AI-powered metadata generation per locale.
---

# Optimizing ASO/SEO

## When to use

| Request | Action |
|---|---|
| "optimize keywords" | Run ASO optimizer lens for each locale |
| "keyword research" | Load aso-optimizer.lens.md, fill parameters |
| "write store description" | Use lens output, validate character counts |
| "competitor analysis" | Lens includes competitor gap analysis |
| "align screenshots with keywords" | Cross-reference keywords.txt with screenshot-designer.lens.md output |

## Core ASO rules

### iOS search surface (160 chars total)
- App Name (30) + Subtitle (30) + Keywords (100) = **all indexed characters**
- Description: 4,000 chars — **NOT indexed** — conversion copy only
- Do not repeat words across fields (Apple auto-indexes cross-field)
- Single words > phrases in keywords field
- No spaces after commas in keywords: `habit,streak,daily` NOT `habit, streak, daily`

### Google Play search
- Title (30) + Short Description (80) = most weighted signals
- Full Description (4,000) **IS indexed** — include keywords 3-5× naturally
- What's New: 500 chars (NOT 4,000) — NOT indexed

### Apple OCR screenshot indexing (since June 2025)
- Caption headlines on screenshots ARE indexed
- Align slide 1 headline with top keyword from keywords.txt
- Use `lenses/screenshot-designer.lens.md` to generate keyword-aligned caption brief

## Process

1. Load `lenses/aso-optimizer.lens.md`
2. Fill parameters: app name, category, description draft, target locale, top 3 competitors
3. Review output — especially keyword field (must fit in 100 chars, no spaces after commas)
4. Write approved values to `.msd/metadata/{appId}/ios/{locale}/` and `.msd/metadata/{appId}/android/{locale}/`
5. Validate: `node skills/managing-store-metadata/scripts/validate-metadata.js {appId}`
6. Repeat for each locale (run lens once per locale)

## Locale-specific keyword research

Do not simply translate English keywords — research native-language search terms.
Example: Turkish users search "alışkanlık takip" not "habit tracker".
The aso-optimizer lens handles this automatically when given the target locale.
