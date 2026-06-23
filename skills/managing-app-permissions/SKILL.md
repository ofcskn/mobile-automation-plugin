---
name: managing-app-permissions
description: >
  Validates iOS and Android app permissions — checks that all iOS NSUsageDescription strings
  are present and non-empty, detects dangerous or deprecated Android permissions, and
  cross-references declared permissions with actual API usage in the codebase. Use before
  every store submission to avoid rejection. Use /msd-permissions to run interactively.
---

# Managing App Permissions

## Why permissions cause rejections

Apple rejects apps that:
- Declare a permission (e.g. NSCameraUsageDescription) with an empty or generic string
- Request permissions not used in the app binary
- Use APIs that require permissions without declaring them
- Use NSTrackingUsageDescription without ATT framework implementation

Google rejects apps that:
- Request sensitive permissions not justified by core functionality
- Use deprecated permissions (READ_EXTERNAL_STORAGE without media alternatives)
- Declare ACCESS_BACKGROUND_LOCATION without foreground location approval

## iOS permission rules

All NS*UsageDescription strings must:
1. Be non-empty
2. Explain WHY the app needs the permission (not just WHAT it does)
3. Be in the user's language (localize for non-English markets)

❌ Bad: "Camera access"
✅ Good: "Used to scan QR codes for adding contacts"

## Android permission rules

Permissions are declared in `app.json` under `expo.android.permissions[]`.
Only declare permissions your app actually uses.
Dangerous permissions (CAMERA, LOCATION, CONTACTS, etc.) trigger runtime dialogs.

## Process

1. Read app's `app.json` or `app.config.ts`
2. Extract iOS infoPlist NS*UsageDescription entries
3. Extract Android permissions array
4. Validate each iOS entry has a meaningful description (not empty, not generic)
5. Flag dangerous Android permissions and confirm they're intentional
6. Optionally scan source code to detect permission API usage
