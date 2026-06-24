# Google Play Store — Complete Release Checklist

## Legend
- 🔴 **MANUAL** — requires your action, cannot be automated
- 🟡 **AI-ASSISTED** — AI prepares content, you approve
- 🟢 **AUTOMATED** — runs without your involvement

---

## Part 1: First Release Setup (do once per app)

| # | Step | Type | Details |
|---|------|------|---------|
| 1 | Create Google Play Developer account | 🔴 MANUAL | [play.google.com/console](https://play.google.com/console) — $25 one-time registration fee |
| 2 | Accept Developer Distribution Agreement | 🔴 MANUAL | During registration |
| 3 | Complete identity verification | 🔴 MANUAL | Phone number + payment method. Can take 24 hours |
| 4 | Create new app in Play Console | 🔴 MANUAL | All apps → Create app → set type (App/Game), free/paid, category |
| 4a | Set category and tags | 🟡 AI-ASSISTED | `/msd-tags {appId}` — AI detects App vs Game, suggests main category + up to 5 tags from `config/play-store-tags.json`. Enter in Play Console → Store settings → Manage tags |
| 5 | Set default language | 🔴 MANUAL | Store presence → Main store listing |
| 6 | Complete Data Safety section | 🔴 MANUAL | Policy → Data safety → declare what data your app collects and shares |
| 7 | Complete Content Rating questionnaire | 🔴 MANUAL | Policy → App content → Content rating → complete IARC questionnaire |
| 8 | Set Target Audience | 🔴 MANUAL | Policy → App content → Target audience and content |
| 9 | Set App Access | 🔴 MANUAL | Policy → App content → App access. Fill in the auth info block below |
| 10 | Complete Ads declaration | 🔴 MANUAL | Policy → App content → Ads declaration. Does app show ads? |
| 11 | Create Google Cloud Project and enable Play API | 🔴 MANUAL | console.cloud.google.com → Create project → Enable Google Play Android Developer API |
| 12 | Create service account | 🔴 MANUAL | IAM & Admin → Service accounts → Create → Download JSON key |
| 13 | Grant service account Play Console access | 🔴 MANUAL | Play Console → Setup → API access → Grant access → Role: Release Manager |
| 14 | Store key as EAS secret | 🔴 MANUAL | Run `eas secret:create --scope project --name GOOGLE_SERVICES_JSON --value "$(cat key.json)"`. Never commit the file. |
| 15 | Write store listing | 🟡 AI-ASSISTED | `/msd-aso` — AI writes title, short desc, full desc per locale. You approve. |
| 16 | Write feature graphic brief | 🟡 AI-ASSISTED | 1024×500 banner image required. AI can brief a designer or use LenserFight. |
| 17 | Generate screenshots | 🟡 AI-ASSISTED | Phone (min 320dp), 7" tablet, 10" tablet optional |
| 18 | Validate metadata | 🟢 AUTOMATED | `node skills/managing-store-metadata/scripts/validate-metadata.js {appId}` |
| 19 | Build AAB | 🟢 AUTOMATED | `eas build --platform android --profile production` |
| 20 | Upload to internal testing | 🟢 AUTOMATED | `eas submit --platform android --profile production` |
| 21 | Add internal testers | 🔴 MANUAL | Testing → Internal testing → Testers → add email addresses |
| 22 | Wait 14 days (first release rule) | ⏳ WAITING | Google requires minimum internal testing period for new apps |
| 23 | Promote to production | 🟢 AUTOMATED | `eas submit` with production profile, or Play Console → Promote |

---

## Step 9 — App Access (Authentication Info for Reviewers)

**Where:** Play Console → Policy → App content → App access → Manage

Copy-paste the block below for each app. Adapt the app name and IAP details as needed.

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

**Why these values work:**
- `N/A` for username/password tells Google the app has no auth gate — reviewers won't hunt for a login screen.
- The IAP paragraph tells reviewers exactly how to exercise the purchase flow. Without it, reviewers may reject or flag the IAP integration.
- Mentioning license tester accounts signals familiarity with the Play billing test environment and builds reviewer confidence.

> **Before submitting:** Add a license tester email in Play Console → Setup → License testing. Without it, the IAP test instructions above won't work for reviewers.

---

## Part 2: Subsequent Releases (every update)

| # | Step | Type | Command |
|---|------|------|---------|
| 1 | Bump version | 🟢 AUTOMATED | `node skills/managing-app-versions/scripts/bump-version.js {appId} patch` |
| 2 | Write "What's New" | 🟡 AI-ASSISTED | `/msd-release-notes {appId}` — max 500 chars per locale |
| 3 | Validate metadata | 🟢 AUTOMATED | `node skills/managing-store-metadata/scripts/validate-metadata.js {appId}` |
| 4 | Pre-flight check | 🟢 AUTOMATED | `node skills/submitting-app-release/scripts/release-checklist.js {appId}` |
| 5 | Sync version to app | 🟢 AUTOMATED | `node skills/managing-app-versions/scripts/sync-build-numbers.js {appId} --project-root {path}` |
| 6 | Build AAB | 🟢 AUTOMATED | `eas build --platform android --profile production` |
| 7 | Submit | 🟢 AUTOMATED | `eas submit --platform android --profile production` |
| 8 | Google review | ⏳ WAITING | Usually a few hours for updates |

**Time for subsequent releases: ~20 minutes active work**

---

## Common Mistakes

- ❌ `release_notes.txt` over **500 chars** (people write 4000 thinking it's like iOS — validator catches this)
- ❌ Full description not including keywords (Google indexes it — missed ranking opportunity)
- ❌ Missing feature graphic (1024×500) — required for store listing
- ❌ `versionCode` not incrementing monotonically (bump-version.js handles this)
- ❌ Uploading APK instead of AAB (App Bundle required since August 2021)
- ❌ Skipping internal testing for first release (Google enforces 14-day minimum)

---

## Screenshot Requirements

| Device | Min size | Required? |
|--------|----------|-----------|
| Phone | 320×568dp (min) | ✅ Required (2–8 screenshots) |
| 7" Tablet | 600×1024dp | Optional but recommended |
| 10" Tablet | 720×1280dp | Optional |
| TV | 1280×720px | Only if TV app |

Format: PNG or JPEG, max 8MB per image.
