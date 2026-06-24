---
description: Select Play Store tags (max 5) and App Store primary/secondary categories — detects App vs Game type and suggests the most relevant options
---

Select and generate the category + tag configuration for an app on Google Play and Apple App Store.

## Usage

`/msd-tags {appId}`

## Step 1 — Detect app type

Ask the user (if not already stored in `memory/apps.json`):

> "Is this a **Game** or a regular **App**?
> - **App** → Tools, Productivity, Health, Finance, Social, etc.
> - **Game** → Action, Puzzle, Racing, RPG, etc.
> This determines which category system applies on both stores."

Save the answer as `appType: "app"` or `appType: "game"` in `memory/apps.json`.

---

## Step 2 — Play Store: category and tags

Read `config/play-store-tags.json`.

### If app type = "app"

1. **Suggest a main Play Store category** based on the app's purpose (from `metadata/{appId}/android/*/full_description.txt` or ask the user to describe the app in one sentence).

   Play Store app categories:
   Art and Design · Auto and Vehicles · Beauty · Books and Reference · Business ·
   Comics · Communication · Dating · Education · Entertainment · Events · Finance ·
   Food and Drink · Health and Fitness · House and Home · Libraries and Demo ·
   Lifestyle · Maps and Navigation · Medical · Music and Audio · News and Magazines ·
   Parenting · Personalization · Photography · Productivity · Shopping · Social ·
   Sports · Tools · Travel and Local · Video Players and Editors · Weather

2. **Suggest up to 5 tags** from `config/play-store-tags.json → app_tags[]`.

   Selection rules (follow Google's own guidance):
   - Tags must be **obviously relevant** to the core app function — a user unfamiliar with the app must immediately understand why the tag applies.
   - Do **not** add aspirational or loosely related tags (e.g. a streaming app should not get "Camera" just because it uses the camera).
   - If fewer than 5 tags are clearly relevant, suggest fewer — **quality over quantity**.
   - Prefer tags whose `category` matches the chosen main category.

   Output format:
   ```
   Suggested Play Store tags (max 5):
   1. {English tag} — {Turkish: tr value} [{Play Store category}]
   2. …
   ```

   Then ask: "Approve these tags, or replace any?"

### If app type = "game"

Game categories on Play Store replace the tag system. Suggest a **genre category** from:
`Action · Adventure · Arcade · Board · Card · Casino · Casual · Educational · Music · Puzzle · Racing · Role Playing · Simulation · Sports · Strategy · Trivia · Word`

> Note: Games do not use the app tag list. The genre IS the primary classification.

---

## Step 3 — App Store: primary and secondary category

Read `config/app-store-categories.json`.

### If app type = "app"

1. **Suggest a primary category** — the one that best describes the main function. Consider where the user naturally looks for this type of app.

2. **Suggest a secondary category** (optional but recommended) — a supporting category.

   Output:
   ```
   Suggested App Store categories:
   Primary:   {category}  — {reason}
   Secondary: {category}  — {reason}
   ```

   Ask: "Approve? Or change either category?"

### If app type = "game"

1. Suggest **primary Games subcategory** (e.g. Action, Puzzle).
2. Suggest **optional secondary Games subcategory**.

   > Games always use the "Games" primary category — subcategories are what differentiate them.

---

## Step 4 — Output a summary checklist

After approval, output a ready-to-copy summary:

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
PLAY STORE — {appId}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
App type:  {App | Game}
Category:  {main category}

Tags (enter these in Play Console → Store settings → Manage tags):
  1. {tag in English} / {Turkish: tr}
  2. {tag in English} / {Turkish: tr}
  …

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
APP STORE — {appId}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Primary category:   {category}
Secondary category: {category}
(Set in ASC → App Information → Category)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

Save the approved values to `memory/apps.json` under:
```json
"{appId}": {
  "appType": "app",
  "playStore": {
    "category": "...",
    "tags": ["...", "...", "..."]
  },
  "appStore": {
    "primaryCategory": "...",
    "secondaryCategory": "..."
  }
}
```

---

## Translation note

When showing tags to the user, always display both the English name and the Turkish label (`tr` field from the JSON). The Play Console UI shows Turkish labels in Turkish-language accounts — users need both to match what they see on screen.

For other languages: translate the English tag name naturally. Do not guess the localized Play Console label — only the `tr` (Turkish) label from the JSON is authoritative.

---

## Google Play tagging rules (summary)

> Source: Play Console Help — "Choosing a category and tags"

- Max **5 tags** total.
- Tags must reflect what's **very clear to an unfamiliar user** from the store listing or initial in-app experience.
- Do NOT add tags for loosely related genres or features that aren't the core experience.
- Only change tags if you make **significant changes** to app content or functionality.
- Accessibility tags available: Screen reader-friendly · Visual assistance · Hearing assistance · Learning disability · Motor assistance · Accessible communication.
- Changes may take up to **24 hours** to reflect on Google Play.
