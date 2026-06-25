---
description: Validate and fix iOS and Android app permissions — checks NSUsageDescription strings, Android dangerous permissions, and optionally modifies app.json
---

Validate app permissions for store submission.

## Usage

`/msd-permissions {appId}` — validates and offers to fix issues interactively

## Steps

1. Read `.msd/memory/apps.json` to find the app's path (or ask user for path)
2. Run: `node skills/managing-app-permissions/scripts/validate-permissions.js {appPath}`
3. For each ❌ error (empty iOS description):
   - Load `skills/managing-app-permissions/references/ios-permissions.md`
   - Show what the permission is for and a suggested description
   - Ask: "Use this description? (yes/edit/skip)"
   - If yes: read `{appPath}/app.json`, update the description, write back
4. For each ⚠️ warning (generic description, deprecated Android permission):
   - Explain the risk and suggested fix
   - Ask: "Fix this? (yes/skip)"
5. After fixes: re-run the validator to confirm all pass
6. Show final summary: "X permissions validated, Y fixed, Z warnings remaining"

## Detecting missing permissions from code

If the user says "check what permissions my code uses", scan the app source:
```bash
grep -r "expo-camera\|Camera\|expo-location\|Location\|expo-av\|Audio\|expo-contacts\|Contacts\|expo-image-picker\|ImagePicker" {appPath}/app {appPath}/components {appPath}/screens 2>/dev/null | grep -v node_modules | head -30
```
Then cross-reference with declared permissions.

## Common fixes

| Issue | Fix |
|-------|-----|
| Empty NSCameraUsageDescription | Add: "Used to scan QR codes and take profile photos" |
| Generic "Camera access" | Replace with specific use case |
| WRITE_EXTERNAL_STORAGE | Replace with READ_MEDIA_IMAGES if only reading photos |
| Missing NSMicrophoneUsageDescription with expo-av | Add microphone description |
