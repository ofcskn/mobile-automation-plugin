# Implementation Design: mobile-store-deploy Claude Code Plugin

**Status:** Pre-implementation planning  
**Date:** 2026-06-23  
**Source spec:** `plugin-plan.md` (943 lines, including Addendum A and B)

---

## 1. Situation Assessment

### What exists on disk right now

| Asset | Location | Status |
|---|---|---|
| Orchestrator SKILL.md | `files (1)/SKILL.md` | Done — move to repo root |
| 4 working Node scripts | `files (1)/` | Done — need to be relocated |
| Root SKILL.md | `SKILL.md` (repo root) | This is the selecting-app-locales sub-skill, not the orchestrator |
| 4 lens .md files | repo root | Done — need to move to `lenses/` |
| `resolve-locales.js` | repo root | Done — needs to move to `skills/selecting-app-locales/scripts/` |
| `android-locales.md` | repo root | Done — needs to move to `skills/selecting-app-locales/references/` |
| `apple-storefronts.md` | repo root | Done — needs to move to `skills/selecting-app-locales/references/` |
| `launch-ready-workflow.md` | repo root | Done — needs to move to `workflows/` |
| Architecture PLAN.md | `files (1)/PLAN.md` | Done — move to repo root |

### What does not yet exist

- `.claude-plugin/plugin.json`
- `commands/` directory (9 files)
- `agents/` directory (7 files)
- `skills/` directory tree (7 sub-skills, each with SKILL.md + scripts/ + references/)
- `hooks/hooks.json`
- `lenses/README.md`
- `config/.template.config.json`
- `workflows/` directory (contents exist at wrong path)
- 6 scripts referenced by commands but not yet written:
  - `skills/managing-app-versions/scripts/sync-build-numbers.js`
  - `skills/managing-app-versions/scripts/validate-version.js`
  - `skills/generating-store-screenshots/scripts/validate-screenshots.js`
  - `skills/generating-store-screenshots/scripts/audit-screenshots.js`
  - `skills/managing-store-metadata/scripts/sync-to-store.sh`
  - `skills/managing-app-localizations/scripts/extract-strings.js`
- All 5 original sub-skill SKILL.md files (plan says "existing, unchanged" but none exist)
- `skills/optimizing-aso-seo/SKILL.md` and `skills/optimizing-geo/SKILL.md`
- `config/.template.config.json` (schema never fully written in plan)

**Critical finding:** The plan says "skills/*/SKILL.md — existing, unchanged" but the `skills/` directory does not exist on disk. All sub-skill SKILL.md files must be authored from scratch. This is the largest gap in the plan.

---

## 2. Three Implementation Approaches

### Approach A: Sequential Single-Agent

Build every file in the order dictated by `plugin-plan.md` (Steps 1→8), one file at a time.

**Sequence:** plugin.json → 9 commands → 7 agents → 7 skill SKILL.md files → scripts relocation → reference files → hooks.json → lenses/ → workflows/ → config template → README/CHANGELOG.

**Advantages:**
- Simplest to execute and audit
- Each file is complete before moving to the next
- Errors are caught at the file level immediately
- No merge conflicts or ordering problems

**Disadvantages:**
- Slowest wall-clock time
- The skills directory (most complex part) blocks everything downstream
- A single stall on one file pauses the whole build

**When to use:** When you want full control and reviewability, or when running the implementation in a single Claude Code session manually.

---

### Approach B: Parallel Multi-Agent

Split work into independent workstreams and run them concurrently using multiple agents.

**Parallel groups:**
- **Group 1 (infrastructure):** `.claude-plugin/plugin.json`, `config/.template.config.json`, `hooks/hooks.json`
- **Group 2 (commands):** All 9 `commands/*.md` files (each is independent)
- **Group 3 (agents):** All 7 `agents/*.md` files (each is independent)
- **Group 4 (skills — core):** `skills/managing-app-versions/`, `skills/managing-store-metadata/`, `skills/managing-app-localizations/`, `skills/submitting-app-release/`, `skills/generating-store-screenshots/`
- **Group 5 (skills — new):** `skills/selecting-app-locales/`, `skills/optimizing-aso-seo/`, `skills/optimizing-geo/`
- **Group 6 (relocation):** Move 4 lens files → `lenses/`, move scripts → correct skill directories, move `launch-ready-workflow.md` → `workflows/`

Groups 1, 2, 3, and 6 can run concurrently. Group 4 must run after Group 6 (relocation deposits scripts into place). Group 5 is independent.

**Advantages:**
- Fastest wall-clock time
- Commands and agents are pure content — easily parallelizable
- No logic dependencies between individual command files

**Disadvantages:**
- File relocation (Group 6) must complete before Group 4 can write scripts into the correct locations
- Higher coordination overhead; more complex to audit
- If any agent produces incorrect output, it may block validation later
- Requires careful deduplication of reference content (several skills share `locale-codes.md` and limits references)

**When to use:** When you have multiple Claude Code agents available and need to complete the build in one session under time pressure.

---

### Approach C: Phased Implementation (Recommended)

Build in three self-contained phases, each independently testable:

**Phase 1 — Core Plugin Shell (testable after this phase)**
- Relocate all misplaced files to correct directories
- Create `.claude-plugin/plugin.json`
- Create the 5 original commands (`msd-release`, `msd-bump`, `msd-screenshots`, `msd-metadata`, `msd-locale`, `msd-validate`)
- Create the 5 original agents
- Create `hooks/hooks.json` (PostToolUse only — no UserPromptSubmit yet)
- Build the 5 core skill SKILL.md files with existing scripts
- **Test point:** Plugin installs, slash commands load, hooks fire on write

**Phase 2 — Locale Selection Gate (Addendum A)**
- Create `skills/selecting-app-locales/` with its SKILL.md, scripts, and references
- Add `agents/locale-selector.md`
- Add `commands/msd-select-locales.md`
- Update `hooks/hooks.json` to add `UserPromptSubmit` locale gate
- **Test point:** Locale gate fires on locale/translation keywords; `resolve-locales.js` runs correctly

**Phase 3 — ASO/GEO Extension (Addendum B)**
- Create `skills/optimizing-aso-seo/SKILL.md` and `skills/optimizing-geo/SKILL.md`
- Add `agents/aso-geo-optimizer.md`
- Add `commands/msd-aso.md` and `commands/msd-geo.md`
- Create `lenses/README.md`
- Create `config/.template.config.json`
- Update `workflows/launch-ready-workflow.md` in place
- Update `README.md` and create `CHANGELOG.md`
- **Test point:** ASO/GEO commands load; config template is valid JSON

---

## 3. Recommended Approach: C (Phased)

**Rationale:**

The plan itself is structured as a base spec + two addenda — this maps naturally to three phases. Each phase produces a working, shippable state. If implementation is interrupted, Phase 1 alone is already a publishable plugin.

Phase 1 covers 80% of user value (the core release pipeline). Phases 2 and 3 are additive. This matches how most plugins are actually used: the core commands get 90% of usage.

The most important benefit: **testability between phases**. The 4 existing scripts (`bump-version.js`, `validate-metadata.js`, `validate-translations.js`, `release-checklist.js`) and `resolve-locales.js` can be verified with `node` before any plugin infrastructure exists. Building the skills scaffold around already-verified scripts reduces risk.

---

## 4. Implementation Sequence (Detailed)

### Pre-flight: Relocate existing files first

Before creating anything new, move the misplaced files. This must happen first because script paths in commands and SKILL.md files reference canonical locations.

```
MOVE: files (1)/SKILL.md          → SKILL.md (replace the selecting-app-locales variant)
MOVE: files (1)/PLAN.md           → PLAN.md
MOVE: files (1)/bump-version.js   → skills/managing-app-versions/scripts/bump-version.js
MOVE: files (1)/validate-metadata.js → skills/managing-store-metadata/scripts/validate-metadata.js
MOVE: files (1)/validate-translations.js → skills/managing-app-localizations/scripts/validate-translations.js
MOVE: files (1)/release-checklist.js → skills/submitting-app-release/scripts/release-checklist.js
MOVE: resolve-locales.js          → skills/selecting-app-locales/scripts/resolve-locales.js
MOVE: android-locales.md          → skills/selecting-app-locales/references/android-locales.md
MOVE: apple-storefronts.md        → skills/selecting-app-locales/references/apple-storefronts.md
MOVE: aso-optimizer.lens.md       → lenses/aso-optimizer.lens.md
MOVE: geo-optimizer.lens.md       → lenses/geo-optimizer.lens.md
MOVE: locale-selector.lens.md     → lenses/locale-selector.lens.md
MOVE: screenshot-designer.lens.md → lenses/screenshot-designer.lens.md
MOVE: launch-ready-workflow.md    → workflows/launch-ready-workflow.md
```

Note: The current root `SKILL.md` (the selecting-app-locales variant) becomes `skills/selecting-app-locales/SKILL.md`. The orchestrator from `files (1)/SKILL.md` takes over the root position.

### Phase 1 build order

1. `.claude-plugin/plugin.json` — manifest (content fully specified in plan Step 1)
2. `skills/managing-app-versions/SKILL.md` — write from scratch (plan says "existing" but it doesn't exist)
3. `skills/managing-app-versions/references/version-format.md` — write reference doc
4. `skills/managing-store-metadata/SKILL.md`
5. `skills/managing-store-metadata/references/apple-limits.md`
6. `skills/managing-store-metadata/references/google-limits.md`
7. `skills/managing-app-localizations/SKILL.md`
8. `skills/managing-app-localizations/references/locale-codes.md` (with BCP47 update from plan Step 4)
9. `skills/generating-store-screenshots/SKILL.md`
10. `skills/generating-store-screenshots/references/device-matrix.md`
11. `skills/submitting-app-release/SKILL.md`
12. `skills/submitting-app-release/references/submission-checklist.md`
13. `commands/msd-release.md` through `commands/msd-validate.md` (6 files, content in plan Step 2)
14. `agents/version-manager.md` through `agents/release-coordinator.md` (5 files, content in plan Step 3)
15. `hooks/hooks.json` — PostToolUse block only (content in plan Step 5)

### Phase 2 build order

16. `skills/selecting-app-locales/SKILL.md` — move root SKILL.md here
17. `agents/locale-selector.md`
18. `commands/msd-select-locales.md`
19. Update `hooks/hooks.json` — add `UserPromptSubmit` block (content in Addendum A)

### Phase 3 build order

20. `skills/optimizing-aso-seo/SKILL.md`
21. `skills/optimizing-geo/SKILL.md`
22. `agents/aso-geo-optimizer.md`
23. `commands/msd-aso.md`
24. `commands/msd-geo.md`
25. `lenses/README.md`
26. `config/.template.config.json`
27. `README.md` — add plugin install section (content in plan Step 6)
28. `CHANGELOG.md` (content in plan Step 6)

---

## 5. Key Design Decisions

### 5.1 Script path resolution

Scripts reference `CLAUDE_PLUGIN_ROOT` from hooks, but commands reference scripts with relative paths like `node skills/managing-app-versions/scripts/bump-version.js`. This creates a dual-reference problem.

**Decision:** Commands assume the working directory is the project repo root (the directory containing `config/`, `metadata/`, etc.). Scripts use `process.cwd()` to locate data directories. `CLAUDE_PLUGIN_ROOT` is only needed in hooks because hooks run in a different context.

Validate all script paths by running: `node skills/managing-app-versions/scripts/bump-version.js --help` from the repo root before writing any command file.

### 5.2 Hooks and `CLAUDE_PLUGIN_ROOT`

The plan's `hooks.json` uses `${CLAUDE_PLUGIN_ROOT}` to locate scripts. This env var is set by the Claude Code runtime when a plugin is installed. During development (before plugin install), it will be unset.

**Decision:** Add a fallback in the hook command strings:
```
PLUGIN_ROOT="${CLAUDE_PLUGIN_ROOT:-$(pwd)}"
node "$PLUGIN_ROOT/skills/..."
```
This lets developers run hooks against a local checkout without the variable being set.

### 5.3 `config/.template.config.json` schema

The plan never specifies the full template schema — only the `locales[]` array (from `resolve-locales.js` output) and references to `lenserfight.brandKitLensId` and `geo.entityAnchor`. The full schema must be inferred from what the scripts actually read.

From `release-checklist.js` (which reads the config file): it checks `config.platforms`, so the schema needs a `platforms` array. From `resolve-locales.js` output: `locales[]` with per-locale platform codes. From the lens addendum: `lenserfight` and `geo` namespace objects.

**Recommended template:**
```json
{
  "_comment": "Copy to config/{app-id}.config.json and fill in values",
  "appId": "com.yourcompany.yourapp",
  "platforms": ["ios", "android"],
  "locales": [],
  "lenserfight": {
    "brandKitLensId": "",
    "asoLensId": "aso-optimizer",
    "geoLensId": "geo-optimizer"
  },
  "geo": {
    "entityAnchor": ""
  },
  "fastlane": {
    "iosLane": "beta",
    "androidLane": "beta"
  }
}
```

### 5.4 Sub-skill SKILL.md content

The plan marks these as "existing, unchanged" but they don't exist. Each must be authored. The content can be derived from:
- The corresponding agent file (which contains the knowledge rules for that skill)
- The orchestrator SKILL.md routing table
- Script docstrings

Minimum viable SKILL.md structure for each sub-skill:
```markdown
---
name: {skill-name}
description: >
  One-line trigger description for when to load this skill.
---

# {Skill Title}

## What this skill does
[2-3 sentences]

## When to use
[Trigger phrases]

## How to run
[Specific commands with actual script paths]

## Rules
[Critical constraints — lifted directly from the corresponding agent file]

## References (load on demand)
[List of references/ files]
```

This pattern is consistent with the existing `selecting-app-locales/SKILL.md` (the root SKILL.md that's currently misplaced) which is the best example of the target format.

### 5.5 Missing scripts decision

Six scripts are referenced in commands and PLAN.md but don't exist:
- `sync-build-numbers.js` — referenced by `msd-bump.md`
- `validate-version.js` — referenced in architecture diagram
- `validate-screenshots.js` — referenced by `msd-screenshots.md`
- `audit-screenshots.js` — referenced in architecture diagram
- `sync-to-store.sh` — referenced in architecture diagram
- `extract-strings.js` — referenced in architecture diagram

**Decision:** Do not create stub/placeholder scripts. Commands that reference missing scripts should note the dependency explicitly with a `TODO` comment in the command's `.md` file. Mark the corresponding checklist item as `[ ] PENDING`. This is honest and prevents a working plugin from silently failing at runtime when a command tries to `node` a script that doesn't exist.

Exception: `sync-build-numbers.js` is referenced in the primary command `msd-bump.md` — this one is high-priority and should be implemented in Phase 1 alongside the other scripts.

---

## 6. Testing Strategy

### Can be tested immediately (no plugin install required)

These run with `node` from the repo root after file relocation:

```bash
# Metadata validator
node skills/managing-store-metadata/scripts/validate-metadata.js {app-id}

# Translation validator  
node skills/managing-app-localizations/scripts/validate-translations.js {app-id}

# Pre-release checklist
node skills/submitting-app-release/scripts/release-checklist.js {app-id}

# Version bump (requires versions/{app-id}/version.json to exist)
node skills/managing-app-versions/scripts/bump-version.js {app-id} patch

# Locale resolver
node skills/selecting-app-locales/scripts/resolve-locales.js {app-id} "en,tr"
```

Create a minimal test fixture at `config/test-app.config.json` (use the template) and `versions/test-app/version.json` with `{"major":1,"minor":0,"patch":0,"build":1}` to run all five scripts without a real app.

### Requires plugin install to test

- Slash commands (must be loaded by Claude Code runtime)
- Agent delegation (`release-coordinator` spawning `version-manager`)
- Hook firing on file write
- `UserPromptSubmit` locale gate injection
- LenserFight lens invocation via MCP

### Validation checklist for plugin.json

Run against the Claude Code plugin schema before publishing:
- `name` is lowercase, hyphen-delimited
- `version` is valid semver
- `userConfig` keys with `"sensitive": true` for API keys
- No trailing commas (use a JSON linter)

---

## 7. Gaps and Ambiguities to Resolve Before Implementation

| # | Gap | Impact | Resolution |
|---|---|---|---|
| 1 | All 5 core sub-skill SKILL.md files are missing | Phase 1 blocked | Author from agent content + skill routing table |
| 2 | `sync-build-numbers.js` is missing; `msd-bump.md` calls it | `msd-bump` command incomplete | Write this script in Phase 1 |
| 3 | `config/.template.config.json` schema not specified in plan | Phase 3 ambiguous | Use schema in section 5.3 above |
| 4 | Root `SKILL.md` is the selecting-app-locales sub-skill, not the orchestrator | Confusing state pre-migration | Move orchestrator from `files (1)/SKILL.md` to root first |
| 5 | `validate-screenshots.js` and `audit-screenshots.js` missing | `msd-screenshots` command has dangling reference | Mark as TODO in command file; implement in Phase 3 |
| 6 | `lenses/README.md` has no content specified in plan | Phase 3 output incomplete | Write from the LenserFight workflow table in Addendum B |
| 7 | `msd-aso.md` and `msd-geo.md` command content is not specified in plan | Phase 3 commands incomplete | Derive from `aso-optimizer.lens.md` and `geo-optimizer.lens.md` frontmatter |
| 8 | `agents/locale-selector.md` and `agents/aso-geo-optimizer.md` content not in plan | Phase 2 and 3 agents incomplete | Derive from corresponding lens files and existing agent pattern |
| 9 | `CLAUDE_PLUGIN_ROOT` unavailable during local development | Hooks fail locally | Add `:-$(pwd)` fallback as described in section 5.2 |
| 10 | Plan says hooks `matcher` is `"Write\|Edit"` but Claude Code hook matcher syntax may differ | Hooks may not fire | Verify hook matcher syntax against plugin reference before writing hooks.json |

---

## 8. File Count Summary

| Directory | Files to create | Source |
|---|---|---|
| `.claude-plugin/` | 1 | plan Step 1 |
| `commands/` | 9 | plan Steps 2 + Addenda |
| `agents/` | 7 | plan Step 3 + Addenda |
| `skills/*/SKILL.md` | 8 | author from scratch |
| `skills/*/scripts/` | 5 existing (move) + 1 new | relocation + write |
| `skills/*/references/` | ~10 | mix of move + write |
| `hooks/` | 1 | plan Step 5 |
| `lenses/` | 4 existing (move) + 1 README | relocation + write |
| `workflows/` | 1 (move) | relocation |
| `config/` | 1 | section 5.3 |
| `README.md` | update | plan Step 6 |
| `CHANGELOG.md` | 1 | plan Step 6 |

**Total: ~50 files to create or relocate.**
