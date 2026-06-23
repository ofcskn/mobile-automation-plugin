---
schema: "lenserfight.export.v1"
schemaVersion: "1.0.0"
kind: "lens"
visibility: "owner"
---
# Locale Selector for Mobile Apps

**Tags:** `#localization` `#i18n` `#app-store` `#google-play` `#mobile`

## Parameters

### `[[app name]]`
- **Type:** `text`
- **Description:** The name of the mobile app
- **Placeholder:** e.g. HabitFlow

### `[[app category]]`
- **Type:** `text`
- **Description:** App category (e.g. productivity, health, finance, gaming)
- **Placeholder:** e.g. health & fitness

### `[[target markets]]`
- **Type:** `text`
- **Description:** Countries or regions you want to reach (ISO3 codes or plain names)
- **Placeholder:** e.g. Turkey, Germany, USA, Japan — or: TR, DE, US, JP

### `[[current locale list]]`
- **Type:** `text`
- **Description:** Existing locale codes if any (leave blank if none)
- **Placeholder:** e.g. en, tr — or leave blank

### `[[budget tier]]`
- **Type:** `text`
- **Description:** Translation budget tier: minimal / standard / comprehensive
- **Placeholder:** standard

## Lens body

You are a senior mobile app localization strategist. Your task is to recommend the
optimal locale set for [[app name]], a [[app category]] app.

Target markets: [[target markets]]
Current locales (if any): [[current locale list]]
Budget tier: [[budget tier]]

**Your job:**

1. Analyze the target markets against the Apple App Store storefront table (175 countries).
   For each target market, identify:
   - The default language Apple shows users in that country
   - Additional supported languages users may have set
   - Whether locale metadata is needed in multiple languages for that market

   Apple storefront key facts:
   - Turkey (TUR): default English (UK), additional Turkish → need BOTH en-US AND tr-TR
   - Germany (DEU): default German, additional English → need BOTH de-DE AND en-US
   - Japan (JPN): default Japanese, additional English US → need ja AND en-US
   - USA (USA): default English US, 9 additional languages → en-US required, consider es-MX
   - Brazil (BRA): default Portuguese Brazil → need pt-BR

2. Map each recommended locale to all required platform codes:
   - i18next short code (en, tr, de)
   - iOS App Store Connect folder (en-US, tr-TR, de-DE)
   - Android locale_config.xml name (en-US, tr, de)
   - Android resource folder (values-en-rUS, values-tr, values-de)
   - Google Play Console (en-US, tr-TR, de-DE)
   - RTL flag (ar, he/iw, fa, ur)

   Android BCP 47 notes:
   - Use `tr` not `tr-TR` for Turkish in locale_config.xml (language-only entry)
   - Hebrew legacy code in Android AOSP list: `iw` (not `he`)
   - Indonesian legacy code: `in` (not `id`)
   - Chinese Simplified: `zh-Hans`, Chinese Traditional: `zh-Hant`
   - Serbian Latin script: `sr-Latn` in locale_config.xml

3. Flag any RTL locales with ⚠️ and note that React Native / Expo requires:
   `I18nManager.forceRTL(true)` in app startup, plus layout review.

4. Group recommendations by tier:

   **Tier 1 — Must have** (primary markets, high ROI)
   **Tier 2 — High value** (strong secondary markets for this category)
   **Tier 3 — Nice to have** (long-tail, lower priority)

5. Estimate translation effort:
   - Minimal (MVP): English only
   - Standard: 3–5 locales (~200 translation strings × N locales)
   - Comprehensive: 10+ locales (consider hiring translators for tier 2+)

6. Output a ready-to-paste `config.json` locales array:

```json
"locales": [
  {
    "i18next": "en",
    "ios": "en-US",
    "android_config": "en-US",
    "android_folder": "values-en-rUS",
    "playConsole": "en-US",
    "rtl": false,
    "primary": true
  }
]
```

7. Output the `locale_config.xml` entries for Android:
```xml
<locale-config xmlns:android="http://schemas.android.com/apk/res/android">
  <locale android:name="en-US"/>
  <!-- add recommended locales here -->
</locale-config>
```

**Output format:**

## Recommended locale set for [[app name]]

### Summary table
[locale codes across all platforms]

### Tier breakdown
[Tier 1 / 2 / 3 with rationale per locale]

### RTL warnings
[list any RTL locales with action items]

### Translation effort estimate
[strings count × locales × cost estimate]

### config.json locales array
[ready to paste]

### locale_config.xml
[ready to paste]

### Next steps
1. Run: `node skills/selecting-app-locales/scripts/resolve-locales.js {app-id} "{locale-list}"`
2. Load `skills/managing-app-localizations` to set up translation files
3. Load `skills/managing-store-metadata` to create metadata folders
4. Load `lenses/aso-optimizer.lens.md` to optimize keywords per locale
