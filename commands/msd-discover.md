---
description: Scan a directory to discover all Expo/React Native apps and show which ones are registered
---

Scan a directory for Expo/React Native apps.

## Steps

1. Ask: "Which directory should I scan? (e.g. `/Users/you/projects`)"
2. Run: `node skills/managing-app-registry/scripts/discover-apps.js {directory}`
3. Read `.msd/memory/apps.json` and cross-reference found apps with registered ones
4. For each found app, show:
   - Name, path, version
   - Registered? ✅ / ❌
   - If not registered: suggest `/msd-init {suggested-appId}`
5. Ask: "Would you like to register any of these apps now?"
