---
description: Run the full mobile app release pipeline for iOS and/or Android
---

Run the complete automobileapp release pipeline for the specified app.

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
