# Submission Checklist Reference

## Fastfile starter template

```ruby
default_platform(:ios)

platform :ios do
  desc "Submit to App Store"
  lane :release do
    build_app(scheme: "YourApp")
    deliver(
      submit_for_review: true,
      automatic_release: false,
      phased_release: true,
      force: true,
      skip_screenshots: false,
      skip_metadata: false
    )
  end
end

platform :android do
  desc "Submit to Google Play"
  lane :release do
    gradle(task: "bundle", build_type: "Release")
    supply(
      track: "production",
      rollout: "0.1",
      aab: "android/app/build/outputs/bundle/release/app-release.aab"
    )
  end
end
```

## Appfile

```ruby
app_identifier "com.yourcompany.yourapp"
apple_id "your@email.com"
team_id "YOURTEAMID"

json_key_file "fastlane/google-play-api.json"
package_name "com.yourcompany.yourapp"
```

## Required environment variables for CI

```bash
# iOS
export FASTLANE_API_KEY_PATH="fastlane/api_key.json"
# or for CI:
export APP_STORE_CONNECT_API_KEY_KEY_ID="..."
export APP_STORE_CONNECT_API_KEY_ISSUER_ID="..."
export APP_STORE_CONNECT_API_KEY_KEY="..."

# Android
export SUPPLY_JSON_KEY_DATA="$(cat fastlane/google-play-api.json)"
```

## Apple App Store Connect API key format (api_key.json)

```json
{
  "key_id": "XXXXXXXXXX",
  "issuer_id": "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx",
  "key": "-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----"
}
```

## Post-submission monitoring

- iOS: Check App Store Connect for review status (typically 24-48h)
- Android: Monitor Play Console for rollout health (crashes, ANRs, ratings)
- Android 10% rollout: expand to 50% after 48h if crash-free rate > 99.5%
