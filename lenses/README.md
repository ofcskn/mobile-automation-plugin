# LenserFight Lenses

These files are LenserFight parametric lens definitions. They define AI prompts
with user-fillable parameters (using `[[parameter]]` syntax) that produce
structured, validated output for each step of the release pipeline.

## Available lenses

| Lens | Purpose | Inputs |
|---|---|---|
| `locale-selector.lens.md` | Recommend and resolve locale set | app name, target markets, budget tier |
| `aso-optimizer.lens.md` | Keyword research + metadata for one locale | app name, category, competitors, target locale |
| `geo-optimizer.lens.md` | Entity anchor, schema markup, GEO content | app name, ASO description, differentiator |
| `screenshot-designer.lens.md` | Slide-by-slide screenshot brief | app name, keywords, visual style, locale |

## How to use

### With LenserFight Cloud MCP
When the LenserFight MCP is connected, Claude agents can trigger lenses directly.
API key stored in `LENSERFIGHT_API_KEY` user config.

### Manually
1. Open moon.lenserfight.com
2. Open each lens by name
3. Fill the `[[parameters]]`
4. Copy output into Claude Code context
5. Claude Code runs the downstream scripts

## Chain order (launch-ready workflow)

```
Brand Kit (Step 0) → Locale Selector (Step 1) → ASO Optimizer (Step 2)
→ GEO Optimizer (Step 3) → Screenshot Designer (Step 4) → fastlane (Step 5)
```

Full workflow: `workflows/launch-ready-workflow.md`

## Brand Kit lens

Existing lens ID: `c0903096-4a2c-463f-b6c2-c26aa72c5e6d`
Generates: 1024×1024 App Store icon, 512×512 Google Play icon, brand PDF
