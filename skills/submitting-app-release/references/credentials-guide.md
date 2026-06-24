# Credentials Guide — Production Release

Load this file when the user is about to run `msd-release` or any EAS submission.
Check every credential relevant to the target platform before proceeding.

---

## How to check credentials (without exposing values)

```bash
# Run this block — it prints ✅ or ❌ for each var, never the value
check() { [ -n "${!1}" ] && echo "✅ $1 is set" || echo "❌ $1 is missing"; }

# EAS (required for all platforms)
check EXPO_TOKEN

# iOS (required if submitting to App Store)
check APP_STORE_CONNECT_API_KEY_ID
check APP_STORE_CONNECT_ISSUER_ID
check APP_STORE_CONNECT_API_KEY_CONTENT

# Android (required if submitting to Google Play)
check GOOGLE_SERVICES_JSON
```

Report the full table to the user. If any required credential is missing, stop and point to the setup section below before continuing.

Also check `eas.json` exists in the app root:

```bash
cat {appRoot}/eas.json | grep -E "submit|production" 2>/dev/null || echo "❌ eas.json not found or missing submit profile"
```

---

## Required credentials per platform

### All platforms — EAS authentication

| Variable | Format example | Where to get it |
|---|---|---|
| `EXPO_TOKEN` | `expo_••••••••••••••••••••••••••••••••` | expo.dev → Account → Access Tokens |

```bash
# Verify token is valid
eas whoami
```

---

### iOS — App Store Connect API key

Apple recommends API keys over Apple ID + password (no 2FA issues in CI).

| Variable | Format example | Where to get it |
|---|---|---|
| `APP_STORE_CONNECT_API_KEY_ID` | `XXXXXXXXXX` (10 chars, alphanumeric) | App Store Connect → Users & Access → Integrations → API Keys |
| `APP_STORE_CONNECT_ISSUER_ID` | `xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx` (UUID) | Same page, shown above the key list |
| `APP_STORE_CONNECT_API_KEY_CONTENT` | `-----BEGIN PRIVATE KEY-----\nMIGH...\n-----END PRIVATE KEY-----` | Downloaded `.p8` file — base64 encode: `base64 -i AuthKey_XXXXXXXXXX.p8` |

**Important:** The `.p8` file can only be downloaded once. Store it in EAS secrets immediately.

**Validation:**
```bash
# Key ID: must be exactly 10 alphanumeric characters
echo $APP_STORE_CONNECT_API_KEY_ID | grep -E '^[A-Z0-9]{10}$' && echo "✅ Key ID format valid" || echo "❌ Key ID format invalid"

# Issuer ID: must be a UUID
echo $APP_STORE_CONNECT_ISSUER_ID | grep -E '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$' && echo "✅ Issuer ID format valid" || echo "❌ Issuer ID format invalid"

# Key content: must contain PEM markers
echo $APP_STORE_CONNECT_API_KEY_CONTENT | grep "BEGIN PRIVATE KEY" && echo "✅ Key content looks valid" || echo "❌ Key content missing PEM header"
```

---

### Android — Google Play service account

| Variable | Format example | Where to get it |
|---|---|---|
| `GOOGLE_SERVICES_JSON` | `{"type":"service_account","project_id":"...","private_key":"-----BEGIN RSA PRIVATE KEY-----\n..."}` | Google Play Console → Setup → API access → Service accounts → Create key (JSON) |

**Validation:**
```bash
# Must be valid JSON with service_account type
echo $GOOGLE_SERVICES_JSON | node -e "const d=JSON.parse(require('fs').readFileSync('/dev/stdin','utf8')); console.log(d.type==='service_account'?'✅ Service account JSON valid':'❌ Wrong type: '+d.type);"
```

---

### `eas.json` submit profile — example

This file lives in the **app root** (not the plugin repo):

```json
{
  "cli": { "version": ">= 12.0.0" },
  "build": {
    "production": {
      "ios": { "distribution": "store" },
      "android": { "buildType": "apk" }
    }
  },
  "submit": {
    "production": {
      "ios": {
        "ascAppId": "1234567890",
        "appleTeamId": "ABCDE12345"
      },
      "android": {
        "serviceAccountKeyPath": "./google-play-key.json",
        "track": "production",
        "rollout": 0.1
      }
    }
  }
}
```

`ascAppId` — found in App Store Connect under the app's General → App Information → Apple ID.
`appleTeamId` — found at developer.apple.com → Membership → Team ID.

---

## Storing credentials securely with EAS secrets

Never commit credentials to git. Store them in EAS:

```bash
# Push from a local .env.production file
eas secret:push --scope project --env-file .env.production

# Or set individually
eas secret:create --scope project --name EXPO_TOKEN --value "expo_..."
eas secret:create --scope project --name APP_STORE_CONNECT_API_KEY_ID --value "XXXXXXXXXX"
eas secret:create --scope project --name APP_STORE_CONNECT_ISSUER_ID --value "xxxxxxxx-..."
eas secret:create --scope project --name APP_STORE_CONNECT_API_KEY_CONTENT --value "$(base64 -i AuthKey_XXXXXXXXXX.p8)"
eas secret:create --scope project --name GOOGLE_SERVICES_JSON --value "$(cat google-play-key.json)"

# List all set secrets (values are masked)
eas secret:list
```

---

## `.env.production.example` — template for local development

Copy this to `.env.production` and fill in real values. Never commit `.env.production`.

```bash
# EAS
EXPO_TOKEN=expo_••••••••••••••••••••••••••••••••

# iOS — App Store Connect API key
APP_STORE_CONNECT_API_KEY_ID=XXXXXXXXXX
APP_STORE_CONNECT_ISSUER_ID=xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
APP_STORE_CONNECT_API_KEY_CONTENT=-----BEGIN PRIVATE KEY-----\nMIGH...\n-----END PRIVATE KEY-----

# Android — Google Play service account JSON (single line)
GOOGLE_SERVICES_JSON={"type":"service_account","project_id":"your-project",...}
```

Add `.env.production` to `.gitignore`:
```bash
echo ".env.production" >> .gitignore
echo "*.p8" >> .gitignore
echo "google-play-key.json" >> .gitignore
```
