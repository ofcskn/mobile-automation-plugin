# Launch-Ready Workflow — mobile-automation-plugin × LenserFight

> **LenserFight Workflow Definition**
> Chain these lenses in sequence. Output from each lens feeds as input to the next.
> Trigger via LenserFight Cloud MCP or manually in Claude Code with `/msd-release`.

---

## Workflow: `launch-ready`

**Purpose:** Takes a new mobile app from zero to a fully prepared store submission —
locale selection, brand kit, ASO strategy, GEO optimization, and screenshot brief —
in one chained workflow.

**Total lenses:** 5
**Estimated time:** 15–30 minutes (mostly AI generation, human review at each gate)

---

## Step 0 — Brand Kit (existing lens)

**Lens ID:** `c0903096-4a2c-463f-b6c2-c26aa72c5e6d`
**Name:** Brand Kit PDF and Store Icon Generator for Codebases

**Inputs:**
- `[[repository or file path]]` → project root or specific path
- `[[main logo]]` → existing logo file path or "generate new"
- `[[light theme logo]]` → optional override
- `[[dark theme logo]]` → optional override
- `[[additional note]]` → "Generate 1024×1024 App Store icon and 512×512 Google Play icon"

**Outputs:**
- Brand Kit PDF
- `icon-appstore-1024.png` (no alpha, square, system-applied corners)
- `icon-google-play-512.png` (32-bit PNG, full square, no rounded corners)
- `logo-light.png`, `logo-dark.png`
- Color palette and typography extracted
- Simulator verification report

**Human gate:** Review icon and brand colors before proceeding. Approve or request revision.

**Passes to Step 1:** `[[brand colors]]`, `[[visual style hint]]`

---

## Step 1 — Locale Selector

**Lens file:** `lenses/locale-selector.lens.md`

**Inputs (from user + Step 0):**
- `[[app name]]` → from project
- `[[app category]]` → from user
- `[[target markets]]` → user specifies countries/regions
- `[[current locale list]]` → empty for new app
- `[[budget tier]]` → minimal / standard / comprehensive

**What it does:**
- Consults Apple App Store 175-country storefront table
- Consults Android AOSP 82-locale BCP 47 list
- Recommends locale set tiered by market priority
- Identifies RTL locales that need engineering work
- Outputs ready-to-paste `config.json` locales array and `locale_config.xml`

**Human gate:** User confirms or modifies locale list.

**Agent action after approval:**
```bash
node skills/selecting-app-locales/scripts/resolve-locales.js {app-id} "{confirmed-locales}"
```

**Passes to Step 2:** confirmed locale list, per-platform locale codes

---

## Step 2 — ASO Optimizer

**Lens file:** `lenses/aso-optimizer.lens.md`
**Run once per primary locale** (en-US first, then repeat for each additional locale)

**Inputs (from user + Step 1):**
- `[[app name]]`
- `[[app category]]`
- `[[app description draft]]` → user provides or extracts from README
- `[[target locale]]` → one locale per run
- `[[top 3 competitors]]` → user specifies
- `[[existing keywords]]` → empty for new app

**What it does:**
- Keyword research for the target locale's native language
- Competitor keyword gap analysis
- Optimizes all iOS metadata fields within hard char limits
- Optimizes all Google Play metadata fields
- Recommends screenshot caption keywords (Apple OCR alignment)
- Validates character counts before output

**Human gate:** Review metadata, especially keyword field allocation.

**Agent action after approval:**
```bash
# Write approved metadata to files
echo "HabitFlow: Daily Tracker" > metadata/{app-id}/ios/en-US/name.txt
echo "Streak & Goal Builder" > metadata/{app-id}/ios/en-US/subtitle.txt
echo "habit,routine,reminder,morning,evening,challenge" > metadata/{app-id}/ios/en-US/keywords.txt
# [etc for all fields]

# Validate
node skills/managing-store-metadata/scripts/validate-metadata.js {app-id}
```

**Passes to Step 3:** optimized description, top 5 keywords

---

## Step 3 — GEO Optimizer

**Lens file:** `lenses/geo-optimizer.lens.md`

**Inputs (from user + Step 2):**
- `[[app name]]`
- `[[app category]]`
- `[[aso optimized description]]` → from Step 2 output
- `[[target user persona]]` → user specifies
- `[[key differentiator]]` → user specifies
- `[[app store url]]` → will be known after first submission
- `[[play store url]]` → will be known after first submission

**What it does:**
- Generates entity anchor sentence (canonical app definition for AI)
- AI-parseable landing page description
- JSON-LD Schema markup for SoftwareApplication
- ProductHunt tagline and description
- Press release paragraph
- 30-day GEO action plan
- Entity consistency audit checklist

**Human gate:** Review entity anchor sentence. This wording goes everywhere — once set, don't change it for 6+ months.

**Agent action after approval:**
- Save entity anchor to `config/{app-id}.config.json` → `geo.entityAnchor`
- Save schema markup to `assets/{app-id}/schema.json`
- Add to README under "About" section

**Passes to Step 4:** top 5 keywords, visual style preference, brand colors

---

## Step 4 — Screenshot Designer

**Lens file:** `lenses/screenshot-designer.lens.md`

**Inputs (from user + Steps 2–3):**
- `[[app name]]`
- `[[app category]]`
- `[[top 5 keywords]]` → from Step 2 keyword list
- `[[visual style]]` → user specifies (clean minimal / dark premium / warm playful)
- `[[target locale]]` → primary locale first
- `[[number of slides]]` → 5 (recommended starting point)
- `[[brand colors]]` → from Step 0 brand kit

**What it does:**
- Generates slide-by-slide copy brief
- Aligns caption headlines with top keywords (Apple OCR indexing)
- Provides distinct approach for Google Play (no OCR)
- Asset delivery spec with exact pixel dimensions
- Command to trigger `app-store-screenshots` design layer

**Human gate:** Review headline copy for all slides. This copy appears in the store.

**Agent action after approval:**
```bash
# Trigger design layer
npx skills add ParthJadhav/app-store-screenshots
# Use output brief to configure the Next.js editor
# Export to screenshots/{app-id}/designed/
node skills/generating-store-screenshots/scripts/validate-screenshots.js {app-id}
```

---

## Step 5 — Final Submission (skills pipeline)

After all 4 lenses complete:

```bash
# Pre-flight gate
node skills/submitting-app-release/scripts/release-checklist.js {app-id}

# Submit
eas submit --platform ios --profile production
eas submit --platform android --profile production
```

---

## MCP integration (calling lenses programmatically)

When the LenserFight Cloud MCP is connected (`https://mcp.lenserfight.com/mcp`),
Claude agents can trigger lenses directly:

```
[Agent in Claude Code]
"Run the launch-ready workflow for habitflow"

→ Claude detects LenserFight MCP is connected
→ Calls locale-selector lens with gathered parameters
→ Presents output to user for gate approval
→ On approval, calls aso-optimizer lens for each locale
→ Calls geo-optimizer with ASO output
→ Calls screenshot-designer with keyword output
→ Runs script pipeline to write all files
→ Runs release-checklist.js
→ Reports: "Ready for submission. Run /msd-release to proceed."
```

---

## Manual workflow (without MCP)

If LenserFight MCP is not connected, run lenses manually:

1. Open moon.lenserfight.com
2. Open each lens by name
3. Fill in parameters from the gate inputs above
4. Copy output → paste into agent context
5. Agent writes files and runs validation scripts
