---
description: Run the full mobile app release pipeline for iOS and/or Android
---

Run the complete automobileapp release pipeline for the specified app.

## Gate 0 — Credential check (run before anything else)

Load `skills/submitting-app-release/references/credentials-guide.md` and run the check block:

```bash
check() { [ -n "${!1}" ] && echo "✅ $1" || echo "❌ $1 missing"; }
check EXPO_TOKEN
check APP_STORE_CONNECT_API_KEY_ID
check APP_STORE_CONNECT_ISSUER_ID
check APP_STORE_CONNECT_API_KEY_CONTENT
check GOOGLE_SERVICES_JSON
```

Also validate formats (key ID = 10 chars, issuer ID = UUID, key content contains PEM header, GOOGLE_SERVICES_JSON parses as valid JSON with `type: service_account`). See credentials-guide.md for the exact validation commands.

If any credential required for the target platform is missing or malformed: **stop and show the user exactly what is missing and where to get it.** Do not proceed to Gate 1.

Also run:
```bash
eas whoami   # confirms EXPO_TOKEN is accepted by EAS
```

---

First, gather these inputs:
1. App ID — check if `DEFAULT_APP_ID` user config is set; otherwise ask
2. Version bump type — ask: patch / minor / major / build-only
3. Target platform — ask: ios / android / both
4. Confirm locales — show `config/{appId}.config.json` locales array and ask for confirmation

Then execute in order (stop and report at any failure):
1. Load `skills/managing-app-versions` — delegate to version-manager agent
2. Load `skills/managing-store-metadata` — delegate to metadata-validator agent
3. Load `skills/managing-app-localizations` — delegate to localization-auditor agent
4. Load `skills/generating-store-screenshots` — delegate to screenshot-pipeline agent (confirm assets exist)
5. Load `skills/submitting-app-release` — delegate to release-coordinator agent

Never auto-proceed past a failed gate. Always stop and tell the user exactly what failed.

After all gates pass and EAS submission succeeds, run:
```
node skills/submitting-app-release/scripts/generate-release-summary.js {appId}
```
This generates a self-contained HTML page in the system temp directory and opens it in the browser. The page shows all gate results, per-locale metadata with one-click copy buttons, screenshot thumbnails, and EAS submit commands — everything needed to complete the store upload manually if any step requires it.
