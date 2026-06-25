---
description: Run the full mobile app release pipeline for iOS and/or Android
---

Run the complete automobileapp release pipeline for the specified app.

## Gate 0 — Credential check (run before anything else)

### Step 0a — Auto-load credentials

Check for a local credentials file and source it silently if present:

```bash
# Auto-source .env.production if it exists (values never printed)
if [ -f ".env.production" ]; then
  set -a && source .env.production && set +a
  echo "✅ Loaded credentials from .env.production"
fi
```

If `.env.production` is not found, check whether EAS cloud secrets cover the required vars by running:

```bash
eas secret:list 2>/dev/null | grep -E "EXPO_TOKEN|APP_STORE|GOOGLE_SERVICES"
```

EAS cloud secrets are injected automatically during `eas build` and `eas submit` — if they appear here, no local env vars are needed.

### Step 0b — Validate credentials

Load `skills/submitting-app-release/references/credentials-guide.md` and run:

```bash
check() { [ -n "${!1}" ] && echo "✅ $1" || echo "❌ $1 missing"; }
check EXPO_TOKEN
check APP_STORE_CONNECT_API_KEY_ID
check APP_STORE_CONNECT_ISSUER_ID
check APP_STORE_CONNECT_API_KEY_CONTENT   # iOS only
check GOOGLE_SERVICES_JSON               # Android only
```

Validate formats per credentials-guide.md (key ID = 10 chars, issuer ID = UUID, key content has PEM header, Google JSON has `type: service_account`).

Confirm EAS accepts the token:
```bash
eas whoami
```

### Step 0c — If credentials are missing

Do NOT stop the pipeline silently. Show this exact message and offer the two setup paths:

```
⛔ Submission will be blocked. Choose a setup path:

  Path A — EAS secrets (recommended — works in CI, set once forever):
    eas secret:push --scope project --env-file .env.production

  Path B — local .env.production (local dev only):
    cp skills/submitting-app-release/references/.env.production.example .env.production
    # Fill in real values, then re-run msd-release

  See: skills/submitting-app-release/references/credentials-guide.md
```

Ask: "Set up credentials now (I'll walk you through it), or continue without submission?" If the user wants to set up now, run `/automobileapp:msd-setup-credentials`. Otherwise continue — all gates except submission will still run and the release summary will be generated.

---

First, gather these inputs:
1. App ID — check if `DEFAULT_APP_ID` user config is set; otherwise ask
2. Version bump type — ask: patch / minor / major / build-only
3. Target platform — ask: ios / android / both
4. Confirm locales — show `.msd/config/{appId}.config.json` locales array and ask for confirmation

## Gate 0.5 — Ask build mode

> "Build locally (no EAS cloud queue, uses your Xcode/Android Studio) or via EAS cloud?
> **Local is the default** — no build minutes consumed, no queue wait."

Store the answer. It controls Gate 5 below.

---

Then execute in order (stop and report at any failure):
1. Load `skills/managing-app-versions` — delegate to version-manager agent
2. Load `skills/managing-store-metadata` — delegate to metadata-validator agent
3. Load `skills/managing-app-localizations` — delegate to localization-auditor agent
4. Load `skills/generating-store-screenshots` — delegate to screenshot-pipeline agent (confirm assets exist)
5. Load `skills/submitting-app-release` — delegate to release-coordinator agent

### Gate 5 — Build and submit

**If local build:**
```bash
cd {appPath}

# Build
eas build --local --platform ios --profile production
eas build --local --platform android --profile production

# Find binaries
IOS_BUILD=$(find . -maxdepth 2 -name "*.ipa" -newer eas.json | tail -1)
ANDROID_BUILD=$(find . -maxdepth 2 -name "*.aab" -newer eas.json | tail -1)

# Submit using local binary path (no cloud queue)
eas submit --platform ios --path "$IOS_BUILD" --profile production
eas submit --platform android --path "$ANDROID_BUILD" --profile production
```

**If cloud build:**
```bash
cd {appPath}
eas build --platform all --profile production
eas submit --platform ios --profile production
eas submit --platform android --profile production
```

Never auto-proceed past a failed gate. Always stop and tell the user exactly what failed.

After all gates pass and EAS submission succeeds, run:
```
node skills/submitting-app-release/scripts/generate-release-summary.js {appId}
```
This generates a self-contained HTML page in the system temp directory and opens it in the browser. The page shows all gate results, per-locale metadata with one-click copy buttons, screenshot thumbnails, and EAS submit commands — everything needed to complete the store upload manually if any step requires it.
