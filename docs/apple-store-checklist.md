# Apple App Store — Complete Release Checklist

## Legend
- 🔴 **MANUAL** — requires your action, cannot be automated
- 🟡 **AI-ASSISTED** — AI prepares content, you approve
- 🟢 **AUTOMATED** — runs without your involvement

---

## Part 1: First Release Setup (do once per app)

| # | Step | Type | Details |
|---|------|------|---------|
| 1 | Create Apple Developer account | 🔴 MANUAL | [developer.apple.com](https://developer.apple.com) — $99/year |
| 2 | Enroll in Apple Developer Program | 🔴 MANUAL | Individual or Organization. Organization requires D-U-N-S number (takes 5 business days) |
| 3 | Accept Developer Program License Agreement | 🔴 MANUAL | App Store Connect → Agreements → Active |
| 4 | Create App ID (Bundle Identifier) | 🔴 MANUAL | developer.apple.com → Identifiers → + → App IDs → set Bundle ID e.g. `com.yourname.appname` |
| 5 | Create new app in App Store Connect | 🔴 MANUAL | ASC → Apps → + → New App → iOS → set name, Bundle ID, SKU, language |
| 6 | Complete App Information | 🔴 MANUAL | Name (30 chars), Subtitle (30 chars), Category, Secondary Category |
| 7 | Fill Privacy Nutrition Labels | 🔴 MANUAL | App Privacy tab → Data types collected → linked to identity? Used for tracking? |
| 8 | Complete Content Rights declaration | 🔴 MANUAL | Does your app contain third-party content? |
| 9 | Set Age Rating | 🔴 MANUAL | Age Rating tab → complete questionnaire |
| 10 | Set Pricing | 🔴 MANUAL | Pricing and Availability → Free or tier |
| 11 | Set Availability (countries) | 🔴 MANUAL | Select all or specific territories |
| 12 | Create App Store Connect API Key | 🔴 MANUAL | ASC → Users and Access → Integrations → App Store Connect API → + → Role: Developer or App Manager |
| 13 | Store API key as EAS secret | 🔴 MANUAL | Download `.p8` file. Run `eas secret:create --scope project --name APP_STORE_CONNECT_API_KEY_CONTENT --value "..."`. Never commit the file. |
| 14 | Write metadata | 🟡 AI-ASSISTED | Run `/msd-aso` — AI generates name, subtitle, keywords, description per locale. You approve. |
| 15 | Write screenshots brief | 🟡 AI-ASSISTED | Run `/msd-screenshots` — AI generates screenshot content brief. You capture with EAS/Simulator. |
| 16 | Upload screenshots | 🟡 AI-ASSISTED | Required sizes: iPhone 6.9" (1320×2868) **required from 2026**, iPhone 6.5" (1242×2688), iPad Pro 13" optional |
| 17 | Validate metadata | 🟢 AUTOMATED | `node skills/managing-store-metadata/scripts/validate-metadata.js {appId}` |
| 18 | Build IPA | 🟢 AUTOMATED | `eas build --platform ios --profile production` |
| 19 | Submit build | 🟢 AUTOMATED | `eas submit --platform ios --profile production` |
| 20 | Fill App Review Information | 🔴 MANUAL | ASC → Version → App Review Information. Fill in the auth info block — see section below |
| 21 | Submit for Review | 🟢 AUTOMATED | EAS submit triggers review request automatically |
| 22 | Wait for Apple review | ⏳ WAITING | 24–48 hours first submission. Check ASC for status. |
| 23 | Release | 🟢 AUTOMATED | Auto-release on approval, or manual release from ASC |

---

## Step 20 — App Review Information (Authentication Info for Reviewers)

**Where:** App Store Connect → Your App → Version → App Review Information

Copy-paste the block below. Adapt the app name and IAP details as needed.

```
Sign-in required
No

Demo Account
Username: N/A
Password: N/A

Notes for the reviewer
No authentication is required to use the app. All core features are accessible without an account or login.

To review in-app purchases (IAP):
- The app uses StoreKit / Apple In-App Purchase for subscription/one-time purchases.
- Use an Apple Sandbox Tester account to test IAP flows without being charged.
- On the Payments screen, tap any subscription or purchase option to trigger the IAP sheet.
- Sandbox purchases complete immediately and can be managed in App Store Connect → Sandbox Testers.

No QR codes, biometrics, 2FA, or geo-restrictions are in place.
```

**Why these values work:**
- `Sign-in required: No` removes the demo account requirement — reviewers won't be blocked waiting for credentials.
- The IAP paragraph tells reviewers exactly how to exercise the purchase flow. Without it, reviewers may return the binary with "Unable to review in-app purchases."
- Mentioning Sandbox Tester accounts signals familiarity with the Apple test environment and builds reviewer confidence.

> **Before submitting:** Ensure a Sandbox Tester account exists in App Store Connect → Users and Access → Sandbox. Even if reviewers don't use your credentials, having one ready avoids back-and-forth.

---

## Part 2: Subsequent Releases (every update)

| # | Step | Type | Command |
|---|------|------|---------|
| 1 | Bump version | 🟢 AUTOMATED | `node skills/managing-app-versions/scripts/bump-version.js {appId} patch` |
| 2 | Write "What's New" | 🟡 AI-ASSISTED | `/msd-release-notes {appId}` — AI drafts per locale, you approve |
| 3 | Validate metadata | 🟢 AUTOMATED | `node skills/managing-store-metadata/scripts/validate-metadata.js {appId}` |
| 4 | Pre-flight check | 🟢 AUTOMATED | `node skills/submitting-app-release/scripts/release-checklist.js {appId}` |
| 5 | Sync version to app | 🟢 AUTOMATED | `node skills/managing-app-versions/scripts/sync-build-numbers.js {appId} --project-root {path}` |
| 6 | Build IPA | 🟢 AUTOMATED | `eas build --platform ios --profile production` |
| 7 | Submit | 🟢 AUTOMATED | `eas submit --platform ios --profile production` |
| 8 | Wait for review | ⏳ WAITING | Usually 1–24 hours for updates |

**Time for subsequent releases: ~30 minutes active work (mostly waiting for EAS build)**

---

## Common Mistakes

- ❌ Screenshots without iPhone 6.9" (1320×2868) — **required from 2026, submission blocked**
- ❌ Keywords with spaces after commas: `habit, tracker` → use `habit,tracker`
- ❌ Repeating App Name words in Keywords field (Apple auto-indexes cross-field, wastes space)
- ❌ Subtitle exactly 30 chars — leave 1 char buffer (Apple bug)
- ❌ Description over 4,000 chars — validator catches this
- ❌ Committing API keys or credential files — use `eas secret:create` to store them in EAS instead

---

## Screenshot Requirements (2026)

| Device | Size | Required? |
|--------|------|-----------|
| iPhone 6.9" | 1320×2868 | ✅ **Required from 2026** |
| iPhone 6.5" | 1242×2688 | ✅ Required (or 6.9" covers it) |
| iPhone 5.5" | 1242×2208 | Optional (legacy) |
| iPad Pro 13" | 2064×2752 | Required if iPad supported |

Max 10 screenshots per locale. Up to 3 app preview videos (30 seconds max).
