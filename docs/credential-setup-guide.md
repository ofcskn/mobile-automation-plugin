# Credential Setup Guide

Step-by-step instructions for every credential required to build and submit to App Store and Google Play.

---

## 1. EXPO_TOKEN

Used by EAS CLI to authenticate your account for builds and submissions.

**Steps:**
1. Go to **expo.dev** and sign in
2. Click your avatar (top-right) → **Account settings**
3. In the left sidebar click **Access tokens**
4. Click **Create token**
5. Name it (e.g. `mobile-automation-plugin`) → click **Create**
6. Copy the token — it starts with `expo_` — and store it immediately (shown only once)

**Verify:**
```bash
export EXPO_TOKEN="expo_your_token_here"
eas whoami   # should print your username
```

---

## 2. App Store Connect API Key (iOS)

Allows EAS to submit to App Store Connect without an Apple ID password or 2FA prompt.

**Steps:**
1. Go to **appstoreconnect.apple.com** and sign in
2. Click **Users and Access** in the top navigation
3. Click the **Integrations** tab
4. Click **App Store Connect API** in the left sidebar
5. Click the **+** button to generate a new key
6. Set **Name**: `EAS Submit` (or similar)
7. Set **Access**: **App Manager** (minimum required for submission)
8. Click **Generate**
9. You now see three things — copy all three:

| What | Where on the page | Variable name |
|---|---|---|
| **Key ID** | Listed in the key row (10 alphanumeric chars, e.g. `ABC1234567`) | `APP_STORE_CONNECT_API_KEY_ID` |
| **Issuer ID** | Shown at the top of the page above the key list (UUID format) | `APP_STORE_CONNECT_ISSUER_ID` |
| **Private key (.p8 file)** | Click **Download API Key** next to the key row | Used to generate `APP_STORE_CONNECT_API_KEY_CONTENT` |

10. The `.p8` file can only be downloaded **once** — download it immediately
11. Generate the base64 content from the `.p8` file:
```bash
base64 -i AuthKey_ABC1234567.p8
# Copy the entire output — that is your APP_STORE_CONNECT_API_KEY_CONTENT
```

12. Delete the `.p8` file after storing the base64 value — it is no longer needed

**Verify format:**
```bash
# Key ID: exactly 10 alphanumeric characters
echo "$APP_STORE_CONNECT_API_KEY_ID" | grep -E '^[A-Z0-9]{10}$' && echo "✅ valid" || echo "❌ invalid format"

# Issuer ID: UUID
echo "$APP_STORE_CONNECT_ISSUER_ID" | grep -E '^[0-9a-f]{8}-([0-9a-f]{4}-){3}[0-9a-f]{12}$' && echo "✅ valid" || echo "❌ invalid format"

# Key content: must have PEM header
echo "$APP_STORE_CONNECT_API_KEY_CONTENT" | base64 -d | grep "BEGIN PRIVATE KEY" && echo "✅ valid" || echo "❌ invalid"
```

---

## 3. Apple Team ID and App Apple ID (iOS)

Required in `eas.json` submit profile.

**Team ID:**
1. Go to **developer.apple.com** and sign in
2. Click **Account** in the top navigation
3. Click **Membership details** in the left sidebar
4. Copy **Team ID** (e.g. `ABCDE12345`)

**App Apple ID** (different from your personal Apple ID):
1. Go to **appstoreconnect.apple.com**
2. Click **Apps** → select your app
3. Click **App Information** (left sidebar)
4. Under **General Information**, copy the **Apple ID** number (e.g. `1234567890`)

Add both to `eas.json` in your app root:
```json
{
  "submit": {
    "production": {
      "ios": {
        "appleTeamId": "ABCDE12345",
        "ascAppId": "1234567890"
      }
    }
  }
}
```

---

## 4. Google Play Service Account (Android)

Allows EAS to submit APK/AAB files to Google Play without a browser login.

### Part A — Link Google Play to Google Cloud

1. Go to **play.google.com/console** and sign in
2. Click **Setup** in the left sidebar → **API access**
3. If you see "Link to a Google Cloud project" — click it and follow the prompt to link (or create) a Google Cloud project
4. Once linked, click **Create new service account**
5. A dialog opens with a link to **Google Cloud Console** — click it

### Part B — Create service account in Google Cloud Console

1. You are now in **IAM & Admin → Service Accounts**
2. Click **+ Create Service Account**
3. Fill in:
   - **Name**: `play-store-submit` (or similar)
   - **Description**: EAS submission service account
4. Click **Create and continue**
5. Under **Grant this service account access**, skip this step (click **Continue**)
6. Click **Done**
7. Find your new service account in the list → click the three-dot menu → **Manage keys**
8. Click **Add key** → **Create new key** → select **JSON** → click **Create**
9. A `.json` file is downloaded — this is your service account key

### Part C — Grant Play Console access

1. Go back to **play.google.com/console → Setup → API access**
2. Find your service account in the list
3. Click **Grant access**
4. Set **Account permissions**: enable **Release apps to testing tracks** and **Release apps to production**
5. Click **Apply** then **Invite user**

### Generate the credential

```bash
# Validate the JSON
cat google-play-key.json | node -e "
  const d = JSON.parse(require('fs').readFileSync('/dev/stdin','utf8'));
  console.log(d.type === 'service_account' ? '✅ service_account' : '❌ wrong type: ' + d.type);
  console.log('Project:', d.project_id);
  console.log('Email:', d.client_email);
"

# Store as environment variable (single line)
export GOOGLE_SERVICES_JSON="$(cat google-play-key.json)"

# Delete the file — the env var is the source of truth now
rm google-play-key.json
```

---

## 5. Store credentials in EAS (recommended — set once, works forever)

Once you have all values:

```bash
# Push from a .env.production file
eas secret:push --scope project --env-file .env.production

# Or set individually
eas secret:create --scope project --name EXPO_TOKEN --value "$EXPO_TOKEN"
eas secret:create --scope project --name APP_STORE_CONNECT_API_KEY_ID --value "$APP_STORE_CONNECT_API_KEY_ID"
eas secret:create --scope project --name APP_STORE_CONNECT_ISSUER_ID --value "$APP_STORE_CONNECT_ISSUER_ID"
eas secret:create --scope project --name APP_STORE_CONNECT_API_KEY_CONTENT --value "$APP_STORE_CONNECT_API_KEY_CONTENT"
eas secret:create --scope project --name GOOGLE_SERVICES_JSON --value "$GOOGLE_SERVICES_JSON"

# Verify all secrets are stored (values masked)
eas secret:list
```

After this, `eas build` and `eas submit` pick up credentials automatically. No env vars needed locally or in CI.

---

## 6. Protect local files

```bash
# Add to .gitignore
grep -q "\.env\.production" .gitignore || echo ".env.production" >> .gitignore
grep -q "\.p8" .gitignore || echo "*.p8" >> .gitignore
grep -q "google-play-key\.json" .gitignore || echo "google-play-key.json" >> .gitignore
```
