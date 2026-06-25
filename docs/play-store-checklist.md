# Google Play Store — Complete Release Checklist

## Legend
- 🔴 **MANUAL** — requires your action, cannot be automated
- 🟡 **AI-ASSISTED** — AI prepares content, you approve
- 🟢 **AUTOMATED** — runs without your involvement

---

## Part 1: First Release Setup (do once per app)

Google Play's setup flow has three mandatory sections — complete them in order.

---

### Section A — App Content Information

*Play Console → Policy → App content*

| # | Step | Type | Details |
|---|------|------|---------|
| 1 | Create Google Play Developer account | 🔴 MANUAL | [play.google.com/console](https://play.google.com/console) — $25 one-time registration fee |
| 2 | Accept Developer Distribution Agreement | 🔴 MANUAL | During registration |
| 3 | Complete identity verification | 🔴 MANUAL | Phone number + payment method. Can take 24 hours |
| 4 | Create new app | 🔴 MANUAL | All apps → Create app → set type (App or Game), free/paid |
| 5 | Privacy policy | 🔴 MANUAL | Policy → App content → Privacy policy. Add your hosted privacy policy URL |
| 6 | App Access (login credentials) | 🔴 MANUAL | Policy → App content → App access. See **Auth block** below |
| 7 | Ads declaration | 🔴 MANUAL | Policy → App content → Ads. Does the app show ads? |
| 8 | Content rating | 🔴 MANUAL | Policy → App content → Content rating. Complete IARC questionnaire |
| 9 | Target audience | 🔴 MANUAL | Policy → App content → Target audience and content |
| 10 | Data safety | 🔴 MANUAL | Policy → App content → Data safety. Declare what data is collected and shared |
| 11 | Government apps (if applicable) | 🔴 MANUAL | Policy → App content → Government apps — skip if not a government entity |
| 12 | Finance features (if applicable) | 🔴 MANUAL | Policy → App content → Finance. Required if app handles money |
| 13 | Health (if applicable) | 🔴 MANUAL | Policy → App content → Health. Required if app handles health data |

---

#### App Access — Auth Block (Step 6)

**Where:** Play Console → Policy → App content → App access → Manage

Copy-paste the block below. Adapt app name and IAP details as needed.

```
Name
{App Name}

Username / email
N/A

Password
N/A

Other information (other access details)
No authentication is required to use the app. All core features are accessible without an account or login.

To review in-app purchases (IAP):
- The app uses Google Play Billing for subscription/one-time purchases.
- Use a Google Play license tester account to test IAP flows without being charged.
- On the Payments screen, tap any subscription or purchase option to trigger the Play Billing sheet.
- Test purchases will complete immediately and can be cancelled from the Play Console license tester settings.

No QR codes, biometrics, 2FA, or geo-restrictions are in place.
```

> **Before submitting:** Add a license tester email in Play Console → Setup → License testing.

---

### Section B — App Organization

*Play Console → Grow users → Store presence → Store settings*

| # | Step | Type | Details |
|---|------|------|---------|
| 14 | Set default language | 🔴 MANUAL | Store presence → Main store listing → default language |
| 15 | App type | 🔴 MANUAL | Store settings → Application type: **App** or **Game** |
| 16 | Select category | 🟡 AI-ASSISTED | See **Category selection** below |
| 17 | Select tags (max 5) | 🟡 AI-ASSISTED | Store settings → Manage tags. See **Tag selection** below |
| 18 | Contact details | 🔴 MANUAL | Store settings → Contact details: email, phone (optional), website (optional) |

---

#### Category Selection (Step 16)

AI reads `.msd/config/play-store-tags.json` and the app description, then suggests the single most accurate category.

**If app type = App**, choose from:
Art and Design · Auto and Vehicles · Beauty · Books and Reference · Business · Comics ·
Communication · Dating · Education · Entertainment · Events · Finance · Food and Drink ·
Health and Fitness · House and Home · Libraries and Demo · Lifestyle · Maps and Navigation ·
Medical · Music and Audio · News and Magazines · Parenting · Personalization · Photography ·
Productivity · Shopping · Social · Sports · Tools · Travel and Local ·
Video Players and Editors · Weather

**If app type = Game**, choose a genre (games use genre as primary classification, not the app tag list):
Action · Adventure · Arcade · Board · Card · Casino · Casual · Educational · Music ·
Puzzle · Racing · Role Playing · Simulation · Sports · Strategy · Trivia · Word

---

#### Tag Selection (Step 17) — App type only

AI reads `.msd/config/play-store-tags.json → app_tags[]` and selects up to **5** tags.

**Rules (Google's own guidance):**
- A user unfamiliar with the app must immediately see why the tag applies — from the store listing or initial in-app experience.
- Do NOT add aspirational or loosely-related tags.
- Prefer tags whose `category` matches the chosen main category.
- If fewer than 5 tags are clearly relevant, suggest fewer.

**Output AI must show (both labels — Turkish for Play Console UI matching):**
```
Tag 1: {English} / {Turkish from tr field}  [{Play Store category}]
Tag 2: …
```

Games do not use the app tag list.

---

### Section C — Store Listing

*Play Console → Grow users → Store presence → Main store listing*

| # | Step | Type | Details |
|---|------|------|---------|
| 19 | Create API credentials | 🔴 MANUAL | Google Cloud → Project → Enable Play API → Service account → Download JSON key |
| 20 | Store key as EAS secret | 🔴 MANUAL | `eas secret:create --scope project --name GOOGLE_SERVICES_JSON --value "$(cat key.json)"` |
| 21 | Write store listing text | 🟡 AI-ASSISTED | `/msd-aso` — AI writes title (30 chars), short description (80 chars), full description (4000 chars) per locale. Full description IS indexed — include keywords |
| 22 | Feature graphic | 🟡 AI-ASSISTED | See **Feature Graphic** section below — required, 1024×500px |
| 23 | App icon | 🔴 MANUAL | 512×512px PNG or JPEG, max 1MB. Must comply with Google's design criteria and metadata policy |
| 24 | Phone screenshots | 🟡 AI-ASSISTED | `/msd-screenshots` — 2–8 screenshots, 9:16 or 16:9, edges 320–3840px, max 8MB each. For promotion eligibility: min 4 screenshots with each edge ≥ 1080px |
| 25 | 7" tablet screenshots | 🟡 AI-ASSISTED | Optional but recommended — ask user. Same ratio/size rules as phone |
| 26 | 10" tablet screenshots | 🟡 AI-ASSISTED | Optional — ask user. Edges 1080–7680px, 9:16 or 16:9, max 8MB each |
| 27 | Chromebook screenshots | 🟡 AI-ASSISTED | Optional — ask user. 4–8 screenshots, edges 1080–7680px, 16:9 or 9:16, max 8MB each |
| 28 | Android XR screenshots | 🟡 AI-ASSISTED | Optional — ask user. 4–8 screenshots, edges 720–7680px, up to 15MB each |
| 29 | YouTube promo video | 🔴 MANUAL | Optional — ask user. URL must be public or unlisted, no ads, no age restriction |
| 30 | Android XR video (3D) | 🔴 MANUAL | Optional. Must be 360°, 3D, or 180° — public or unlisted, no ads, no age restriction |
| 31 | Validate metadata | 🟢 AUTOMATED | `node skills/managing-store-metadata/scripts/validate-metadata.js {appId}` |

---

#### Feature Graphic (Step 22)

**Spec:** 1024×500px · PNG or JPEG · max 15MB · required for store listing

AI designs the feature graphic using the hero phone screenshot from Step 24 and the `lenses/screenshot-designer.lens.md` parameters. Run `/msd-screenshots` first, then return here.

**Design brief AI must produce:**

```
Feature Graphic Brief — {appId}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Canvas:        1024 × 500px (landscape banner)
Source image:  .msd/screenshots/{appId}/raw/en-US/android/Phone-*/1.png (hero screen)

Layout:
  Left 55%: App name + tagline (3–5 words, bold, white or brand-contrast)
  Right 45%: Hero screenshot, slightly angled or centered, cropped to ~320px wide
  Background: {brand primary color or deliberate gradient — not plain white}

Text:
  App name:  {name} — {font-weight: 700, ~48px}
  Tagline:   {3–5 words from subtitle.txt} — {font-weight: 400, ~24px}

Accent:      {brand color hex from lenses/brand-kit.lens.md if available}
File output: .msd/metadata/{appId}/android/feature-graphic.png

Canva quick-start:
  1. New design → Custom size → 1024 × 500 px
  2. Set background to {brand color}
  3. Place hero screenshot on right side
  4. Add app name and tagline text on left
  5. Export PNG, max 15MB
```

Ask the user: "Do you have a completed feature graphic, or should I generate a Canva design brief for you?"

---

### Section D — Build and Publish

| # | Step | Type | Details |
|---|------|------|---------|
| 32 | Build AAB | 🟢 AUTOMATED | `eas build --platform android --profile production` |
| 33 | Upload to internal testing | 🟢 AUTOMATED | `eas submit --platform android --profile production` |
| 34 | Add internal testers | 🔴 MANUAL | Testing → Internal testing → Testers → add email addresses |
| 35 | Wait 14 days | ⏳ WAITING | Google requires minimum internal testing period for new apps |
| 36 | Promote to production | 🟢 AUTOMATED | `eas submit` with production profile, or Play Console → Promote |

---

## Part 2: Subsequent Releases (every update)

| # | Step | Type | Command |
|---|------|------|---------|
| 1 | Bump version | 🟢 AUTOMATED | `node skills/managing-app-versions/scripts/bump-version.js {appId} patch` |
| 2 | Write "What's New" | 🟡 AI-ASSISTED | `/msd-release-notes {appId}` — one consolidated file, all locales as `<en-US>…</en-US>` blocks, 1–2 sentences each |
| 3 | Validate metadata | 🟢 AUTOMATED | `node skills/managing-store-metadata/scripts/validate-metadata.js {appId}` |
| 4 | Pre-flight check | 🟢 AUTOMATED | `node skills/submitting-app-release/scripts/release-checklist.js {appId}` |
| 5 | Sync version | 🟢 AUTOMATED | `node skills/managing-app-versions/scripts/sync-build-numbers.js {appId} --project-root {path}` |
| 6 | Build AAB | 🟢 AUTOMATED | `eas build --platform android --profile production` |
| 7 | Submit | 🟢 AUTOMATED | `eas submit --platform android --profile production` |
| 8 | Google review | ⏳ WAITING | Usually a few hours for updates |

**Time for subsequent releases: ~20 minutes active work**

---

## Common Mistakes

- ❌ `release_notes.txt` over **500 chars** per locale (validator catches this)
- ❌ Full description not including keywords (Google indexes it — missed ranking opportunity)
- ❌ Missing feature graphic (1024×500) — required, submission blocked without it
- ❌ `versionCode` not incrementing monotonically (`bump-version.js` handles this)
- ❌ Uploading APK instead of AAB (App Bundle required since August 2021)
- ❌ Skipping internal testing for first release (Google enforces 14-day minimum)
- ❌ Using more than 5 tags — Play Console enforces the limit
- ❌ Adding loosely related tags — Google may suppress the app if tags don't match the actual experience

---

## Screenshot Requirements

| Device | Size / Ratio | Required? | Min for promotion |
|--------|-------------|-----------|-------------------|
| Phone | Edges 320–3840px, 9:16 or 16:9 | ✅ 2–8 screenshots | Min 4 with each edge ≥ 1080px |
| 7" Tablet | Edges 320–3840px, 9:16 or 16:9 | Optional | — |
| 10" Tablet | Edges 1080–7680px, 9:16 or 16:9 | Optional | — |
| Chromebook | Edges 1080–7680px, 9:16 or 16:9 | Optional | — |
| Android XR | Edges 720–7680px, 9:16 or 16:9 | Optional | — |

All screenshots: PNG or JPEG, max 8MB (XR: max 15MB).

## Asset Requirements

| Asset | Spec | Required? |
|-------|------|-----------|
| App Icon | 512×512px, PNG or JPEG, max 1MB | ✅ Required |
| Feature Graphic | 1024×500px, PNG or JPEG, max 15MB | ✅ Required |
| Promo Video | YouTube URL, public or unlisted, no ads | Optional |
| XR Video (3D) | YouTube URL, 360°/3D/180°, public or unlisted | Optional |
| XR Video (non-3D) | YouTube URL, public or unlisted | Optional |
