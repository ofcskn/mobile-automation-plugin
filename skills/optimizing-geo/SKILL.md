---
name: optimizing-geo
description: >
  Optimizes Generative Engine Optimization (GEO) — making the app discoverable when users
  ask AI assistants (Claude, ChatGPT, Gemini, Perplexity) for app recommendations.
  Covers entity anchor sentences, JSON-LD schema markup, ProductHunt copy, press releases,
  and 30-day AI visibility action plans. Use when the user says "GEO optimization",
  "AI discoverability", "schema markup", "entity anchoring", or "ProductHunt launch".
  Use lenses/geo-optimizer.lens.md for AI-powered GEO content generation.
---

# Optimizing GEO (AI Discoverability)

## When to use

| Request | Action |
|---|---|
| "GEO optimization" | Run geo-optimizer.lens.md |
| "schema markup" | Generate JSON-LD from lens output |
| "ProductHunt launch" | Use lens tagline + description |
| "entity anchor" | Extract from lens output, save to config |
| "AI visibility" | Run lens + follow 30-day action plan |

## What GEO does

AI tools cite apps that have:
1. Structured, factual descriptions that AI can extract precisely
2. Consistent entity name across ALL web surfaces
3. Coverage on authoritative tech sites and review platforms
4. Schema markup on the app's landing page
5. Authentic community presence (Reddit, ProductHunt, reviews)

## Entity anchor rule

The entity anchor sentence is the canonical one-sentence definition:
```
"[App Name] is a [category] app for iOS and Android designed for [user persona],
featuring [key differentiator]."
```

Use this EXACT wording everywhere. Never change it for 6+ months.
Save to `.msd/config/{appId}.config.json` → `geo.entityAnchor`.

## Process

1. Complete ASO optimization first (`skills/optimizing-aso-seo`)
2. Load `lenses/geo-optimizer.lens.md`
3. Fill parameters: app name, category, ASO description, user persona, differentiator, store URLs
4. Review entity anchor sentence (most important output — locked in for 6 months)
5. Save JSON-LD schema to `assets/{appId}/schema.json`
6. Save entity anchor to `.msd/config/{appId}.config.json` → `geo.entityAnchor`
7. Follow the 30-day GEO action plan from lens output

## 30-day action plan summary

| Day | Action |
|---|---|
| 1 | Add JSON-LD schema to landing page |
| 2 | Launch on ProductHunt with GEO description |
| 7 | Submit to AppAdvice, 9to5Mac, AndroidPolice |
| 14 | Post authentic use case in relevant subreddits |
| 21 | Build in public thread with factual feature list |
| 30 | First AI visibility audit (test all 4 AI tools) |
