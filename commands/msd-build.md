---
description: Build the app using EAS — local build (no cloud queue) or EAS cloud. Tracks output binary path for direct submission.
---

Build the app for the specified profile. **Local build is the default** — it uses your machine's Xcode/Android Studio, skips the EAS cloud queue, and produces a binary you can submit immediately with `--path`.

## Usage

`/automobileapp:msd-build {appId} [development|preview|production] [ios|android|all]`

Defaults: production, all platforms.

---

## Step 1 — Ask build mode

> "Build locally (uses your Xcode/Android Studio, no cloud queue) or via EAS cloud?
> - **Local (default)** — no build minutes used, no queue wait, binary stays on your machine
> - **Cloud** — EAS manages signing and environment, binary stored in EAS"

If the user doesn't specify, use **local**.

---

## Step 2 — Pre-build checks

```bash
# Read app path
cat memory/apps.json | node -e "const d=JSON.parse(require('fs').readFileSync('/dev/stdin','utf8')); console.log(d.apps?.find(a=>a.id==='{appId}')?.path || 'not found')"

# Confirm eas.json exists in app root
ls {appPath}/eas.json || echo "❌ eas.json missing — run: cd {appPath} && eas build:configure"

# For production: run pre-flight checklist first
node skills/submitting-app-release/scripts/release-checklist.js {appId}
```

---

## Step 3a — Local build (recommended)

### iOS local

Requirements: Xcode 15+, valid distribution certificate and provisioning profile (EAS manages these — run `eas credentials` if missing).

```bash
cd {appPath}

# Production store build
eas build --local --platform ios --profile production
# Output: ./build-XXXXXXXXXX.ipa  (in {appPath})

# Find the output binary
IOS_BUILD=$(find . -maxdepth 2 -name "*.ipa" -newer eas.json | sort -t_ -k2 -n | tail -1)
echo "iOS binary: $IOS_BUILD"
```

Save `$IOS_BUILD` path — it is passed to `eas submit --path` in the next step.

### Android local

Requirements: Android Studio, Java 17+, `ANDROID_HOME` set.

```bash
cd {appPath}

# Production AAB (required for Play Store)
eas build --local --platform android --profile production
# Output: ./build-XXXXXXXXXX.aab

# Find the output binary
ANDROID_BUILD=$(find . -maxdepth 2 -name "*.aab" -newer eas.json | sort -t_ -k2 -n | tail -1)
echo "Android binary: $ANDROID_BUILD"
```

### Both platforms

```bash
# Run sequentially (local builds are not parallelizable — they use the same Xcode/Gradle process)
eas build --local --platform ios --profile production
eas build --local --platform android --profile production
```

---

## Step 3b — Cloud build (if user chose cloud)

```bash
cd {appPath}
eas build --platform {platform} --profile production
# Monitor status:
eas build:list --status in-progress
```

When the cloud build completes, download the binary for local submission:
```bash
# Get the build URL/ID from the output, then:
eas build:view   # shows download URL
# Download and use --path for submit (same as local build flow)
```

---

## Step 4 — Record binary paths

After the build completes, store the binary paths for the submission step:

```bash
# Show user the paths
echo "Ready to submit:"
echo "  iOS:     $IOS_BUILD"
echo "  Android: $ANDROID_BUILD"
```

Pass these paths to `msd-release` or use `eas submit --path` directly:

```bash
# iOS — submit local binary directly (no cloud queue)
eas submit --platform ios --path "$IOS_BUILD" --profile production

# Android — submit local binary directly
eas submit --platform android --path "$ANDROID_BUILD" --profile production
```

---

## Profile reference

| Profile | Use case | Output |
|---|---|---|
| `development` | Daily dev with Expo Dev Client | .ipa (device) or simulator build |
| `preview` | QA / stakeholder testing | .apk (Android) or Ad Hoc .ipa (iOS) |
| `production` | App Store / Play Store submission | .ipa (iOS), .aab (Android) |

## Reference

`docs/eas-build-guide.md` — full EAS Build documentation summary
`docs/credential-setup-guide.md` — signing credentials and provisioning setup
