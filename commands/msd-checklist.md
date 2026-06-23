---
description: Walk through the First Release checklist for App Store or Play Store step by step — AI marks automated steps done, prompts you for manual steps
---

Run the interactive First Release checklist for a platform.

## Usage

`/msd-checklist {appId} ios` or `/msd-checklist {appId} android`

## Steps

1. Read `memory/apps.json` — check if `firstRelease.{platform}` is already `true`
   - If `true`: say "First release already marked complete. Use the standard release pipeline instead."
   - If `false`: proceed

2. Load the checklist:
   - iOS: `docs/apple-store-checklist.md`
   - Android: `docs/play-store-checklist.md`

3. Walk through **Part 1** step by step:
   - **🟢 AUTOMATED steps:** Run them immediately, show output, mark ✅ done
   - **🟡 AI-ASSISTED steps:** Generate the content (metadata, release notes brief), show it to user, ask "Approve this? (yes/edit/skip)"
   - **🔴 MANUAL steps:** Show the step details, explain exactly what to do and where, then ask "Have you completed this step? (yes/skip)"
   - **⏳ WAITING steps:** Note what to wait for, ask "Continue when ready (press Enter)"

4. Track completed steps in the conversation. Do NOT re-run steps the user already confirmed.

5. When all Part 1 steps complete:
   - Update `memory/apps.json`: set `firstRelease.{platform} = true`
   - Say: "🎉 First release pipeline complete for {platform}. Future releases use the automated pipeline."

## Rules

- Never skip a 🔴 MANUAL step — these have real consequences (missing privacy labels blocks submission)
- For 🟡 AI-ASSISTED steps, always show the generated content BEFORE asking for approval
- Let the user skip optional steps (screenshots for iPad, tablet screenshots for Play)
- After a user says "yes" to a manual step, trust them — don't ask again

## Quick recovery

If the user interrupted mid-checklist, ask: "Where did you leave off? (step number or description)"
Then resume from that step.
