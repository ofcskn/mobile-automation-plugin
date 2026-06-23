# Submission Checklist Reference

## EAS submission commands

```bash
# Build first (if not already built)
eas build --platform ios --profile production
eas build --platform android --profile production

# Submit the latest build
eas submit --platform ios --profile production
eas submit --platform android --profile production

# Submit a specific build by ID
eas submit --platform ios --id <build-id>
eas submit --platform android --id <build-id>
```

## eas.json submission profiles

```json
{
  "submit": {
    "production": {
      "ios": {
        "appleId": "your@email.com",
        "ascAppId": "1234567890",
        "appleTeamId": "YOURTEAMID"
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

## Required environment variables for CI

```bash
# EAS authentication
export EXPO_TOKEN="..."

# iOS — App Store Connect API key (preferred over Apple ID/password)
export APP_STORE_CONNECT_API_KEY_ID="XXXXXXXXXX"
export APP_STORE_CONNECT_ISSUER_ID="xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
export APP_STORE_CONNECT_API_KEY_CONTENT="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----"

# Android — Google Play service account
export GOOGLE_SERVICES_JSON="$(cat google-play-key.json)"
```

## EAS secrets (store credentials securely in EAS, not local files)

```bash
eas secret:create --scope project --name APP_STORE_CONNECT_API_KEY_ID --value "XXXXXXXXXX"
eas secret:create --scope project --name APP_STORE_CONNECT_ISSUER_ID --value "xxxxxxxx-..."
eas secret:push --scope project --env-file .env.production
```

## Post-submission monitoring

- iOS: Check App Store Connect for review status (typically 24-48h)
- Android: Monitor Play Console for rollout health (crashes, ANRs, ratings)
- Android 10% rollout: expand to 50% after 48h if crash-free rate > 99.5%
