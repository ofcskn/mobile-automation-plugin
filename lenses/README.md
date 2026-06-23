# LenserFight Lenses

These files are LenserFight parametric lens definitions. They define AI prompts
with user-fillable parameters (using `[[parameter]]` syntax) that produce
structured, validated output for each step of the release pipeline.

## Available lenses

| Lens | Purpose | Inputs |
|---|---|---|
| `brand-kit.lens.md` | Brand Kit PDF, App Store icon (1024×1024), Google Play icon (512×512), light/dark logos | repository path, main logo, light logo, dark logo |
| `locale-selector.lens.md` | Recommend and resolve locale set | app name, target markets, budget tier |
| `aso-optimizer.lens.md` | Keyword research + metadata for one locale | app name, category, competitors, target locale |
| `geo-optimizer.lens.md` | Entity anchor, schema markup, GEO content | app name, ASO description, differentiator |
| `screenshot-designer.lens.md` | Slide-by-slide screenshot brief | app name, keywords, visual style, locale |

## How to use

### Locally (no account required)
1. Open the `.lens.md` file in Claude Code context
2. Fill the `[[parameters]]` at the top of the file
3. Claude runs the lens body and produces the structured output
4. Claude Code runs the downstream scripts

## Chain order (launch-ready workflow)

```
Brand Kit (Step 0) → Locale Selector (Step 1) → ASO Optimizer (Step 2)
→ GEO Optimizer (Step 3) → Screenshot Designer (Step 4) → fastlane (Step 5)
```

Full workflow: `workflows/launch-ready-workflow.md`
