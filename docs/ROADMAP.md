# mobile-store-deploy — Product Roadmap

> Last updated: 2026-06-23

---

## What's already built (v1.0)

`mobile-store-deploy` v1.0 ships a full-stack CLI plugin for Expo / React Native app store releases:

- **16 slash commands** — `/msd-release`, `/msd-bump`, `/msd-screenshots`, `/msd-metadata`, `/msd-locale`, `/msd-validate`, `/msd-select-locales`, `/msd-aso`, `/msd-geo`, `/msd-status`, `/msd-checklist`, `/msd-discover`, `/msd-build`, `/msd-permissions`, `/msd-release-notes`, `/msd-init`
- **9 specialized subagents** — release-coordinator, version-manager, screenshot-pipeline, metadata-validator, locale-selector, localization-auditor, aso-geo-optimizer, checklist-runner, app-registry-manager
- **10 skills** — metadata management, version management, localization, screenshot generation, permissions, ASO/SEO optimization, GEO optimization, locale selection, store submission, app registry
- **Validation scripts** — `validate-metadata.js` (enforces Apple 30/100/4000 char limits; Google 80/4000/500 limits), `validate-translations.js`, `release-checklist.js` (7 gates)
- **Version tooling** — `bump-version.js` (monotonic versionCode), `sync-build-numbers.js`
- **Locale resolution** — `resolve-locales.js` with 36 pre-mapped locale codes; Apple storefront table (175 countries), Android AOSP list (82 locales)
- **4 LenserFight lenses** — ASO optimizer, GEO optimizer, locale selector, screenshot designer
- **Launch-ready workflow** — end-to-end release orchestration
- **EAS submit profiles** — development / preview / beta / production in `eas.json`

---

## The Core Problem: State Detection

The plugin currently requires developers to manually track what is complete. There is no mechanism to scan an existing project and report what is already done versus what is still blocking release.

This is the single biggest friction point. A developer with a partially-built app — icons done, screenshots missing, bundle ID unset — has to mentally audit their project before they can even run the plugin meaningfully. For first-time publishers, this silent gap causes more confusion than any individual missing feature.

The solution: **smart project scanning**. On any `/msd-` command invocation (or via a dedicated `/msd-doctor` command), the plugin scans the project directory and generates a personalized checklist with pre-filled status for every release gate:

```
mobile-store-deploy: Project scan — nefes

✅ App icons (iOS: 1024px, Android: 512px)
✅ Brand kit (SVG/PDF/PNG)
✅ Locale files (10: en tr de es fr hi ja ko pt zh)
✅ EAS profiles (dev / preview / beta / prod)
✅ bump-version.js (app-native script detected)
✅ eas-profile.js (app-native script detected)

❌ Bundle identifier — ios.bundleIdentifier not set in app.json
❌ Android package — android.package not set in app.json
❌ Simulator screenshots — only design previews found, not device captures
❌ Store metadata — metadata/nefes/ directory missing or empty
❌ IAP products — react-native-purchases detected but no products configured in App Store Connect
❌ Permissions — NSMicrophoneUsageDescription not declared explicitly
```

Without this scan, a first release would hit: no bundle ID → rejected build, no screenshots → rejected submission, no metadata → rejected review, no IAP products → rejected under Guideline 3.1.1. Each is a separate rejection round, adding weeks of delay.

---

## P0 — Blocking (required before first release)

### 1. Smart state detection + personalized checklist

**What it does:** Scans `app.json`, `eas.json`, `metadata/`, `screenshots/`, `locales/`, `package.json` dependencies, and `scripts/` to determine the current state of every release gate. Outputs a personalized, pre-filled checklist with ✅/❌ for each item. Persists state to `memory/apps.json` so subsequent commands can skip already-complete steps.

**What it checks:**
- `app.json` → `ios.bundleIdentifier`, `android.package`, `expo.plugins`, permissions arrays
- `metadata/{appId}/ios/{locale}/` and `metadata/{appId}/android/{locale}/` → presence of `name.txt`, `description.txt`, `keywords.txt`, `release_notes.txt`
- `screenshots/{appId}/` → whether files are design exports vs. real device captures (resolution-matched to Apple's 6.9" 1320×2868 requirement)
- `package.json` → known IAP packages (`react-native-purchases`, `expo-in-app-purchases`, `react-native-iap`)
- `scripts/` → app-native `bump-version.js`, `eas-profile.js`, or equivalent
- `locales/{appId}/` → locale file count and key completeness

**Why it saves time:** Manual pre-release audits take 2–4 hours for a first release. Automated scanning takes 30 seconds and catches things developers habitually overlook — the bundle ID is the single most common "I forgot" moment in Expo first releases.

---

### 2. Bundle ID / Package name setup detection

**What it does:** Detects when `ios.bundleIdentifier` or `android.package` is missing or still set to a placeholder (e.g., `com.example.*`). Prompts the developer to set it and validates the format (reverse-domain, no uppercase, no special chars). Warns that the bundle ID **cannot be changed after the first public release** — changing it orphans existing users, invalidates purchases, and breaks push notification certificates.

**Why it matters:** An Expo managed workflow app that reaches EAS Submit without a bundle ID fails at build time with a cryptic error. Developers who hit this late — after configuring credentials, signing certificates, and provisioning profiles — lose 1–3 hours recovering.

**Detection pattern:**
```json
// app.json — these patterns trigger a P0 warning
"ios": {},                                         // missing entirely
"ios": { "bundleIdentifier": "" },                // empty string
"ios": { "bundleIdentifier": "com.example.app" } // obvious placeholder
```

---

### 3. App-native script detection

**What it does:** Before invoking any plugin script (bump-version, profile loading, etc.), the plugin scans the target app's `scripts/`, `tools/`, and root directory for app-owned equivalents. If found, the plugin delegates to those scripts rather than running its own generic version.

**Why it matters (nefes example):** The nefes app has its own `scripts/bump-version.js` that updates `app.json` + `package.json` + `packages/config/app-info.ts` atomically. The plugin's generic `bump-version.js` only updates `app.json`. Running the plugin's version would leave `app-info.ts` out of sync — a subtle bug that manifests at runtime, not at build time.

**Detection logic:**
```
/msd-bump invoked
  → scan: ./scripts/bump-version.js?  YES → invoke app script, skip plugin script
  → scan: ./tools/bump-version.js?    NO
  → scan: ./bump-version.js?          NO
  → fallback: plugin's generic bump-version.js
```

This pattern applies to: version bumping, EAS profile loading, changelog generation, and any script the plugin would otherwise run on the developer's behalf.

---

### 4. Screenshot pipeline (simulator → capture → upload)

**The gap:** Design preview images exported from Figma or Canva are not the same as simulator screenshots. Apple's 2025 guidelines explicitly state that screenshots must show the actual app interface — "mockups or conceptual designs" are a named rejection trigger. Per Apple's 2024 transparency report, design-category rejections totalled 378,300 out of 1.93 million total rejections.

**What the pipeline does:**
1. Detects whether existing screenshots are design exports or real captures (by checking resolution against known device matrices)
2. If design exports only → flags ❌ and guides through simulator capture workflow
3. Launches the correct simulator (iPhone 6.9" for required Apple primary size; Pixel 7 for Google Play)
4. Navigates the app to key screens and triggers screenshot capture via `xcrun simctl io` or `adb shell screencap`
5. Validates dimensions: Apple 6.9" requires 1320×2868px; 6.7" requires 1290×2796px; landscape variants at transposed values
6. Uploads via EAS or Fastlane Deliver to App Store Connect / Play Console

**Required sizes (2026):**
- iOS primary: 6.9" — 1320×2868px (required)
- iOS secondary: 6.7" — 1290×2796px (required for older device coverage)
- Android: 1080×1920px minimum, 16:9 or 9:16 aspect ratio

**Impact:** Missing screenshots block submission entirely — App Store Connect will not allow a binary to enter review without required device sizes. Uploading design mockups instead of real UI risks rejection under the "inaccurate content representation" rule.

---

## P1 — High Value

### 5. In-app purchase / subscription setup guide

IAP configuration is the most common cause of first-release delays for monetized apps. The failure mode is invisible at submission time: the binary is accepted, enters review, and then gets rejected under Guideline 3.1.1 because the reviewer cannot complete a purchase. Sandbox vs. production product mismatch, missing "Restore Purchases" button, or products not yet in "Ready to Submit" state in App Store Connect — any of these cause rejection at review, not at submission.

**What the plugin detects:**
- `react-native-purchases` in `package.json` → triggers IAP checklist
- Validates `REVENUECAT_PUBLIC_API_KEY` is set in the app's environment config
- Checks `app.json` for `expo-in-app-purchases` plugin entry
- Warns if no "Restore Purchases" UI component is detectable (iOS requires it — missing it is a rejection)

**The IAP setup checklist the plugin generates:**
```
IAP Setup — react-native-purchases detected

❌ App Store Connect: Products created and in "Ready to Submit" state
❌ RevenueCat dashboard: Products imported and attached to Offerings
❌ Sandbox tester account created in App Store Connect
❌ REVENUECAT_PUBLIC_API_KEY set in eas.json secrets
❌ "Restore Purchases" button present in app UI (mandatory for iOS)
❌ StoreKit 2 entitlement added to provisioning profile
❌ Google Play: In-app products created and activated
❌ License tester email added in Google Play Console
```

**Impact:** IAP errors account for approximately 15% of first-release rejections for monetized apps. RevenueCat community reports show "offerings could not be loaded" during App Store review is among the top rejection reasons for subscription apps. Each rejection round-trip adds 3–7 days for App Store, 1–3 days for Play Store.

---

### 6. Privacy policy + Terms of service generator

Both Apple (mandatory since 2019 for apps with accounts or subscriptions) and Google Play require a publicly accessible privacy policy URL. The App Store Connect upload form will not complete without it. For apps with health, location, or camera access, Apple also audits that the policy language matches declared permissions.

**What the plugin generates:**
- Reads declared permissions from `app.json` (`NSMicrophoneUsageDescription`, `NSLocationWhenInUseUsageDescription`, etc.)
- Uses app category, locale list, and IAP presence to draft a privacy policy covering: data collection, third-party SDKs, IAP/subscriptions, user rights (GDPR/CCPA), contact information
- Outputs a static HTML file suitable for hosting on GitHub Pages or Vercel
- Provides a checklist for posting the URL and linking it back into App Store Connect and Play Console

**Impact:** Missing privacy policy is responsible for approximately 8% of first-release rejections. For health/wellness apps (meditation category), Apple's review team checks this field explicitly.

---

### 7. CI/CD workflow generator

**What it generates:**
- `.github/workflows/release.yml` — triggered on `git tag v*`, runs EAS build for iOS + Android in parallel, then `eas submit --auto-submit`
- Bitrise step wrapping `/msd-release` as a lane action
- `Fastfile` template with `deliver` and `supply` lanes
- OTA update lane via `eas update --channel production`

**Key configuration handled automatically:**
- Matrix build: `[platform: ios, android]` in GitHub Actions
- Secret injection: `EXPO_TOKEN`, `APP_STORE_CONNECT_API_KEY`, `GOOGLE_PLAY_JSON_KEY` from repository secrets
- `--non-interactive` flag enforcement (omitting this causes CI builds to hang waiting for stdin)
- Branch → channel mapping: `main` → `production`, `staging` → `beta`

**Impact:** CI/CD setup takes 4–8 hours manually. The `--non-interactive` flag omission alone is responsible for the majority of "works locally, hangs in CI" reports in the Expo community forums.

---

### 8. Multi-app status dashboard

For agencies or developers managing multiple apps, there is no unified view of release state across projects. `/msd-status` currently scopes to a single `{appId}`.

**What the dashboard shows:**
```
mobile-store-deploy: Workspace dashboard

App         Platform   Version   Status              Next action
──────────────────────────────────────────────────────────────────────
nefes       iOS        1.2.0     ❌ Screenshots      Run /msd-screenshots
nefes       Android    1.2.0     ✅ In review        —
focus-app   iOS        2.0.1     ✅ Live             —
focus-app   Android    2.0.1     ❌ IAP rejected     Fix product IDs
```

Reads from `memory/apps.json` (already exists in v1.0) and augments with real-time status from App Store Connect API and Google Play Developer API.

---

### 9. TestFlight beta management

Apple's TestFlight pipeline sits between internal testing and public release. Errors here — wrong group assignment, missing compliance questionnaire, missing export compliance — cause delays before the app even enters App Store review.

**What the plugin manages:**
- Add/remove testers from internal and external groups via App Store Connect API
- Monitor crash rate from TestFlight feedback before promoting to production
- Flag the export compliance questionnaire (commonly overlooked; causes TestFlight processing to stall silently)
- Surface recurring themes from beta feedback via the localization-auditor agent

---

### 10. ASO A/B test tracker

Both Apple (Product Page Optimization) and Google (Store Listing Experiments) offer native A/B testing for metadata and screenshots. Most teams either do not use these features or run experiments without documenting outcomes — leading to repeated regressions.

**What the tracker stores:**
- Variant metadata sets (icon, screenshots, title, subtitle) per experiment
- Start/end dates and which variant is currently live
- Conversion rate snapshots pulled from App Store Connect Analytics API
- Win/loss record per element type

Stored as structured JSON under `aso/{appId}/experiments/` alongside the existing metadata directory structure. Per MobileAction's 2026 ASO research, 54% of app listings lack cross-localization — the tracker surfaces which locales are missing experiment coverage.

---

## P2 — Quality of Life

### 11. Crash reporting setup checklist

Sentry and Bugsnag both require native initialization before the first production release. A silent misconfiguration (wrong DSN, missing native module link) means production crashes are invisible until users start leaving reviews.

**Gate:** Confirm `@sentry/react-native` or `@bugsnag/react-native` is initialized in the app entry point and the DSN is set in environment config before `/msd-release` proceeds to production.

---

### 12. Analytics verification gate

Amplitude, Mixpanel, Firebase Analytics — any of these require an `init()` call before the app reaches production. The plugin verifies the SDK is initialized (by scanning the app entry file) and that the write key / measurement ID is set in `eas.json` secrets, not hardcoded.

---

### 13. Deep link / Universal link validation

Apple Associated Domains (`apple-app-site-association`) and Android Digital Asset Links (`assetlinks.json`) are a named rejection cause: the files must be publicly accessible, correctly formatted, and matching the app's bundle ID. Apple's review team follows any deep link shown in the app's screenshots — if it fails, the app is rejected.

**What the plugin validates:**
- Fetches `https://{domain}/.well-known/apple-app-site-association` and parses JSON
- Validates `applinks.apps` contains the correct `<teamID>.<bundleID>` format
- Fetches `/.well-known/assetlinks.json` for Android and validates `package_name` matches `android.package`
- Warns if either file returns non-200 or fails JSON parsing

---

### 14. App size budget enforcement

Apple displays an "App Size" warning in App Store Connect when an IPA exceeds 200MB over-the-air. The Play Store enforces a 150MB AAB limit. Exceeding these does not cause rejection but reduces conversion — users on cellular see the warning and often abandon the install.

**What the plugin checks:**
- Post-build IPA/AAB file size vs. configurable budget thresholds
- Flags any asset accounting for >10MB individually (uncompressed images, bundled fonts, audio files)
- Warns before `eas submit` if size is approaching the threshold

---

### 15. Review response templates

App Store ratings are a ranking signal in both Apple Search and Google Play search. A 1-star review answered professionally recovers some conversion damage. Most developers do not respond because drafting a context-specific reply in multiple languages is time-consuming.

**What the plugin generates:**
- Reads review text via App Store Connect API or Play Developer API
- Generates a professional, on-brand response in the reviewer's language (using the app's declared locale list)
- Tailored by sentiment: crash reports get a different template than "too expensive" feedback
- Stored as drafts for developer approval before posting

---

## Bottlenecks identified (from research)

Apple's 2024 App Store Transparency Report (published May 2025) documented 7.77 million app submissions, of which 1.93 million (approximately 25%) were rejected. Performance issues drove 1.23 million rejections; Legal drove 420,000; Design drove 378,300. The table below maps these categories to plugin solutions:

| Rejection Reason | Frequency | Plugin Solution | Priority |
|---|---|---|---|
| Missing / incorrect screenshots (dimension mismatch, design mockups submitted as real UI) | ~20% of design rejections | Screenshot pipeline with dimension validation | P0 |
| Privacy / undeclared permissions (NSUsageDescription missing or mismatched with policy) | ~20% of all rejections | Permission audit + privacy policy generator | P0 |
| In-app purchase errors (products not ready, missing restore button, sandbox mismatch) | ~15% of rejections for monetized apps | IAP setup guide + RevenueCat detection | P1 |
| Metadata violations (placeholder text, misleading description, keyword stuffing) | ~12% of rejections | Metadata validator with character-limit enforcement | P0 |
| Crashes / bugs in review build (reviewer cannot complete a core flow) | ~10% of rejections | Pre-submit test gate + crash reporting setup | P2 |
| Missing privacy policy URL (required for accounts, subscriptions, health data) | ~8% of rejections | Privacy policy generator | P1 |
| Bundle ID / package name misconfiguration (placeholder left in, changed post-release) | ~5% of rejections | Bundle ID detection gate | P0 |

---

## The 60-80% time saving breakdown

| Task | Manual time | With plugin | Savings |
|---|---|---|---|
| State audit (what's done vs. missing) | 2–4 hours | 30 seconds | 98% |
| Simulator screenshot creation (all required sizes) | 3–6 hours | 20 minutes | 85% |
| Store metadata across 10 locales | 8–16 hours | 1–2 hours | 85% |
| IAP product setup + RevenueCat wiring | 4–8 hours | 1 hour | 80% |
| CI/CD wiring (GitHub Actions + EAS) | 4–8 hours | 30 minutes | 90% |
| Privacy policy + ToS drafting | 2–4 hours | 15 minutes | 90% |
| Deep link / Universal link validation | 1–2 hours | 5 minutes | 92% |
| **Total (first release)** | **24–48 hours** | **4–8 hours** | **~80%** |

The 80% estimate is conservative for developers who hit the IAP rejection round-trip (adds 7–14 days) or the screenshot rejection (adds 3–7 days). The plugin catches both gates pre-submission.

---

## App-specific intelligence (nefes example)

This is the exact checklist `mobile-store-deploy` would generate after scanning a nefes-style project:

```
mobile-store-deploy: Project scan
Scanned: app.json, eas.json, package.json, scripts/, locales/, metadata/, screenshots/
──────────────────────────────────────────────────────────────────────────────

IDENTITY
  ✅ App icons — all iOS sizes (1024px) and Android sizes (512px) present
  ✅ Brand kit — SVG / PDF / PNG logos confirmed

VERSIONING
  ✅ App-native bump-version.js detected (scripts/bump-version.js)
     → Updates app.json + package.json + packages/config/app-info.ts
     → Plugin will delegate to this script instead of its own generic version
  ✅ App-native eas-profile.js detected (scripts/eas-profile.js)
     → Handles env loading and profile aliases dev/preview/beta/prod

LOCALIZATION
  ✅ 10 locale files present: en tr de es fr hi ja ko pt zh
  ✅ EAS submit profiles: development / preview / beta / production

BLOCKING — must resolve before submission
  ❌ Bundle identifier — ios.bundleIdentifier not set in app.json
     → Set "bundleIdentifier": "com.yourco.appname" under "ios" in app.json
     → WARNING: Cannot change after first public release without orphaning users

  ❌ Android package — android.package not set in app.json
     → Set "package": "com.yourco.appname" under "android" in app.json

  ❌ Simulator screenshots — only design preview images found in screenshots/
     → Design exports are not accepted by Apple review (mockup rejection risk)
     → Required: 1320×2868px (iPhone 6.9"), 1290×2796px (iPhone 6.7")
     → Run /msd-screenshots to launch simulator capture workflow

  ❌ Store metadata — metadata/ directory missing
     → Required files: name.txt, subtitle.txt, keywords.txt, description.txt, release_notes.txt
     → Required for 10 locales: en, tr, de, es, fr, hi, ja, ko, pt, zh
     → Run /msd-metadata to generate scaffolding

  ❌ Permissions not declared — Expo is silently injecting defaults
     → Meditation app likely uses audio — declare NSMicrophoneUsageDescription explicitly
     → Undeclared permissions with vague descriptions trigger Apple Guideline 5.1.1
     → Run /msd-permissions to audit and declare all required usage descriptions

HIGH PRIORITY — blocks monetization
  ❌ IAP products not configured — react-native-purchases detected in package.json
     → No products found in App Store Connect
     → Required before review: products in "Ready to Submit" state
     → Required in UI: "Restore Purchases" button (mandatory for iOS)
     → Run /msd-checklist --iap to get the full IAP setup guide

SUMMARY
  Completed:  6 / 11 gates
  Blocking:   5 gates (must resolve before submitting)
  Estimated time with plugin:    3–5 hours
  Estimated time without plugin: 18–32 hours
```

---

## Sources

- [Apple 2024 App Store Transparency Report — MacRumors](https://www.macrumors.com/2025/05/30/app-store-2024-transparency-report/)
- [Apple App Store Rejection Reasons 2025 — twinr.dev](https://twinr.dev/blogs/apple-app-store-rejection-reasons-2025/)
- [App Store Screenshot Guidelines 2026 — appscreenshotgen.com](https://appscreenshotgen.com/page/blog/app-store-screenshot-guidelines-2026/)
- [ASO Mistakes Killing App Growth 2026 — MobileAction](https://www.mobileaction.co/blog/aso-mistakes/)
- [Expo EAS First Submission Checklist 2026 — ShipNative](https://www.shipnative.dev/blog/expo-eas-app-store-submission-checklist)
- [RevenueCat App Store Rejection — Community Forum](https://community.revenuecat.com/general-questions-7/react-native-app-rejected-from-app-store-because-of-no-purchase-possible-977)
- [EAS Submit Documentation — Expo](https://docs.expo.dev/submit/introduction/)
