---
description: Run all pre-release validation checks without submitting
---

Run the full validation suite for the specified app without submitting.

Ask: app ID.

Run in sequence, capturing output from each:
1. `node skills/managing-store-metadata/scripts/validate-metadata.js {appId}`
2. `node skills/managing-app-localizations/scripts/validate-translations.js {appId}`
3. `node skills/submitting-app-release/scripts/release-checklist.js {appId}`

Report pass/fail for each gate with specific failure details.
Do not run fastlane or submit anything — validation only.
