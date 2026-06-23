---
name: selecting-app-locales
description: >
  Enforces locale selection before any localisation, metadata, screenshot, or i18n
  task begins. Use when starting a new app, adding languages, preparing for store
  submission, or any time the locale set is unknown or unconfirmed. Presents both the
  Android BCP 47 locale list (locale_config.xml) and the Apple App Store storefront
  table (175 regions, default and additional languages) so the user can make an
  informed, explicit decision. Writes the confirmed locale set to
  config/{app-id}.config.json before any other skill runs.
---

# Selecting App Locales

## Why this must run first

Every downstream task — metadata validation, i18n JSON files, screenshot locales,
fastlane Snapfile, App Store Connect locale folders, Google Play metadata folders —
depends on a confirmed locale list. Starting without one causes rework.

**The agent MUST ask the user before assuming any locale set.**
Even if the user says "just do English", that is a valid answer — write it to config.

---

## Enforcement paragraph prompt (copy into any locale-related task)

```
LOCALE SELECTION GATE — run this before any localisation work:

1. Read config/{app-id}.config.json and check if locales[] is already confirmed.
   - If locales[] exists and is non-empty: show the list and ask "Should I use these
     locales, or do you want to change them?"
   - If locales[] is missing or empty: proceed to step 2.

2. Ask the user:
   "Which languages should this app support?
    I need to know before I can set up metadata, screenshots, or translations.

    Reference lists are available:
    - Android supported locales: skills/selecting-app-locales/references/android-locales.md
      (82 locales with BCP 47 codes for locale_config.xml and resource folders)
    - Apple App Store storefronts: skills/selecting-app-locales/references/apple-storefronts.md
      (175 regions with default + additional languages Apple shows per country)

    Common starting points:
    • English only → en (simplest launch)
    • English + Turkish → en, tr (for your current audience)
    • English + Turkish + German → en, tr, de
    • Major markets → en, tr, de, fr, es, pt-BR, ja, ko, zh-Hans

    Which locales do you want? I'll write them to config and set up all folders."

3. User responds with locale list.

4. Resolve locale codes per platform using references/android-locales.md
   and references/apple-storefronts.md:
   - i18next key (short): en, tr, de
   - iOS App Store Connect folder: en-US, tr-TR, de-DE
   - Android locale_config.xml name: en-US, tr, de
   - Android resource folder: values-en-rUS, values-tr, values-de
   - Google Play Console locale: en-US, tr-TR, de-DE
   - RTL flag (ar, he, fa, ur, iw — requires I18nManager.forceRTL(true) in RN/Expo)

5. Run: node scripts/resolve-locales.js {app-id} "{locale-list}"
   This writes the resolved locale map to config/{app-id}.config.json → locales[]

6. Show the user the resolved config and confirm:
   "Here's what I'll set up:
    [table of locale codes per platform]
   Confirm? (yes / change)"

7. Only proceed to the next skill after confirmation.
```

---

## Locale resolution rules

### Android locale_config.xml format
Uses BCP 47 names as the `android:name` attribute value (not underscore Java convention).

```xml
<locale android:name="tr"/>          <!-- Turkish -->
<locale android:name="en-US"/>       <!-- English (United States) -->
<locale android:name="zh-Hans"/>     <!-- Chinese (Simplified) -->
<locale android:name="sr-Latn"/>     <!-- Serbian (Latin script) -->
```

Note legacy codes still in Android's own AOSP list:
- `in` = Indonesian (modern BCP 47: `id`)
- `iw` = Hebrew (modern BCP 47: `he`)
- `ji` = Yiddish (modern BCP 47: `yi`)

Android runtime maps these automatically — but use the legacy codes in
`locale_config.xml` and resource folders for AOSP compatibility.

### Apple App Store storefront logic

Apple determines which language the store shows based on the storefront (country):
- Japan (JPN) → default Japanese, additional: English (US)
- Turkey (TUR) → default English (UK), additional: Turkish
- Germany (DEU) → default German, additional: English (UK)
- USA (USA) → default English (US), additional: 9 languages

**Implication for metadata strategy:**
If you're targeting Turkey, you need BOTH `en-US` metadata (default user language for
that region) AND `tr-TR` metadata (localized listing). The Apple storefront table
tells you what languages users in each country expect to see — load
`references/apple-storefronts.md` to advise the user on which locales matter most for
their target markets.

### RTL locales requiring extra engineering work

| Code | Language | Platform extra |
|---|---|---|
| `ar` | Arabic | `I18nManager.forceRTL(true)` in RN/Expo, RTL layout review |
| `he` / `iw` | Hebrew | Same as Arabic |
| `fa` | Farsi/Persian | Same as Arabic |
| `ur` | Urdu | Same as Arabic |

Flag RTL locales explicitly in the confirmed locale list and in config.json.

---

## Script: resolve-locales.js

```bash
node skills/selecting-app-locales/scripts/resolve-locales.js {app-id} "en,tr,de"
```

Writes to config/{app-id}.config.json:
```json
{
  "locales": [
    {
      "i18next": "en",
      "ios": "en-US",
      "android_config": "en-US",
      "android_folder": "values-en-rUS",
      "playConsole": "en-US",
      "rtl": false,
      "primary": true
    },
    {
      "i18next": "tr",
      "ios": "tr-TR",
      "android_config": "tr",
      "android_folder": "values-tr",
      "playConsole": "tr-TR",
      "rtl": false,
      "primary": false
    }
  ]
}
```

---

## References (load on demand)

- `references/android-locales.md` — full 82-locale Android AOSP BCP 47 list
- `references/apple-storefronts.md` — full 175-country Apple storefront table
