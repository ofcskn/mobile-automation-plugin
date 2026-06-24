---
description: Interactive credential setup for App Store and Google Play — walks through getting each key, validates format, and stores securely in EAS secrets or .env.production
---

Set up production credentials for store submission.

Load `skills/submitting-app-release/references/credentials-guide.md` before starting.

---

## Step 1 — Choose storage path

Ask:

> "Where should credentials be stored?
> - **EAS secrets (recommended)** — encrypted in EAS cloud. Works in CI, GitHub Actions, and locally. Set once, works forever. Run `eas secret:list` anytime to verify.
> - **Local .env.production** — stored in a local file. Faster to set up. Not available in CI unless you add it to your pipeline."

---

## Step 2 — EXPO_TOKEN (required for both platforms)

Ask: "Do you have an Expo access token set? (check with `eas whoami`)"

If not:
1. Direct user to: expo.dev → Account → Settings → Access Tokens → Create Token
2. Ask user to paste the token (it starts with `expo_`)
3. Validate format: must start with `expo_` and be at least 20 chars
4. Store it:

```bash
# EAS secrets path
eas secret:create --scope project --name EXPO_TOKEN --value "<token>"

# Local path
echo 'EXPO_TOKEN=<token>' >> .env.production
```

---

## Step 3 — iOS credentials (skip if Android-only)

### App Store Connect API Key

1. Direct user to: App Store Connect → Users and Access → Integrations → App Store Connect API → Generate API Key
   - Role: **App Manager** or higher
   - Download the `.p8` file — it can only be downloaded once

2. Collect three values:

```
APP_STORE_CONNECT_API_KEY_ID   — shown on the key list (10 alphanumeric chars)
APP_STORE_CONNECT_ISSUER_ID    — shown above the key list (UUID format)
APP_STORE_CONNECT_API_KEY_CONTENT — base64 of the .p8 file
```

3. Generate the base64 content:
```bash
base64 -i AuthKey_XXXXXXXXXX.p8
# Copy the output — that is APP_STORE_CONNECT_API_KEY_CONTENT
```

4. Validate each value before storing:
```bash
# Key ID: 10 alphanumeric chars
echo "KEYID" | grep -E '^[A-Z0-9]{10}$' && echo "✅ format valid" || echo "❌ invalid"

# Issuer ID: UUID
echo "ISSUERID" | grep -E '^[0-9a-f]{8}-([0-9a-f]{4}-){3}[0-9a-f]{12}$' && echo "✅ format valid" || echo "❌ invalid"

# Key content: must contain PEM header
echo "CONTENT" | grep "BEGIN PRIVATE KEY" && echo "✅ valid" || echo "❌ missing PEM header"
```

5. Store:
```bash
# EAS secrets
eas secret:create --scope project --name APP_STORE_CONNECT_API_KEY_ID --value "<key-id>"
eas secret:create --scope project --name APP_STORE_CONNECT_ISSUER_ID --value "<issuer-id>"
eas secret:create --scope project --name APP_STORE_CONNECT_API_KEY_CONTENT --value "<base64-content>"

# Local
echo 'APP_STORE_CONNECT_API_KEY_ID=<key-id>' >> .env.production
echo 'APP_STORE_CONNECT_ISSUER_ID=<issuer-id>' >> .env.production
echo 'APP_STORE_CONNECT_API_KEY_CONTENT=<base64-content>' >> .env.production
```

6. Delete the `.p8` file after storing — it is no longer needed locally:
```bash
rm AuthKey_XXXXXXXXXX.p8
```

---

## Step 4 — Android credentials (skip if iOS-only)

### Google Play Service Account

1. Direct user to: Google Play Console → Setup → API access
   - If not linked: link to a Google Cloud project (follow the prompt)
   - Click "Create new service account" → Google Cloud Console opens
   - Role: **Service Account User** + **Release Manager** in Play Console
   - Create a JSON key: Actions → Manage Keys → Add Key → Create new key → JSON
   - Download the `.json` file

2. Grant Play Console access:
   - Back in Play Console → Setup → API access → Grant access to the service account
   - Permission: Release to production

3. Validate the JSON:
```bash
cat google-play-key.json | node -e "
  const d = JSON.parse(require('fs').readFileSync('/dev/stdin','utf8'));
  console.log(d.type === 'service_account' ? '✅ valid service account' : '❌ wrong type: ' + d.type);
  console.log('Project:', d.project_id);
  console.log('Client email:', d.client_email);
"
```

4. Store:
```bash
# EAS secrets (store the entire JSON as one secret)
eas secret:create --scope project --name GOOGLE_SERVICES_JSON --value "$(cat google-play-key.json)"

# Local
echo "GOOGLE_SERVICES_JSON='$(cat google-play-key.json)'" >> .env.production
```

5. Delete the local JSON file after storing:
```bash
rm google-play-key.json
```

---

## Step 5 — Final verification

```bash
# Confirm EAS sees all secrets
eas secret:list

# Confirm token works
eas whoami

# If using local file — source and verify (values masked)
source .env.production
check() { [ -n "${!1}" ] && echo "✅ $1 set" || echo "❌ $1 missing"; }
check EXPO_TOKEN
check APP_STORE_CONNECT_API_KEY_ID
check APP_STORE_CONNECT_ISSUER_ID
check APP_STORE_CONNECT_API_KEY_CONTENT
check GOOGLE_SERVICES_JSON
```

If all pass: "✅ Credentials ready. You can now run `/automobileapp:msd-release` and submission will complete automatically."

---

## Step 6 — Protect local files

If `.env.production` was created, ensure it is gitignored:

```bash
grep -q "\.env\.production" .gitignore || echo ".env.production" >> .gitignore
grep -q "\.p8" .gitignore || echo "*.p8" >> .gitignore
grep -q "google-play-key\.json" .gitignore || echo "google-play-key.json" >> .gitignore
```
