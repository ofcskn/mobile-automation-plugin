# Locale Code Reference

## Authoritative sources

- Apple localization: https://developer.apple.com/localization/
- Android Locale API: https://developer.android.com/reference/java/util/Locale
- App Store: 175 regions, 40 languages (Apple, 2026)
- Android BCP 47 modern API: `Locale.forLanguageTag("tr-TR")` — use over legacy constructor

## Platform code formats

| Language | i18next | iOS ASC folder | Android config | Android folder | Play Console |
|---|---|---|---|---|---|
| English (US) | `en` | `en-US` | `en-US` | `values-en-rUS` | `en-US` |
| Turkish | `tr` | `tr-TR` | `tr` | `values-tr` | `tr-TR` |
| German | `de` | `de-DE` | `de` | `values-de` | `de-DE` |
| French | `fr` | `fr-FR` | `fr` | `values-fr` | `fr-FR` |
| Spanish | `es` | `es-ES` | `es` | `values-es` | `es-ES` |
| Portuguese (BR) | `pt-BR` | `pt-BR` | `pt-BR` | `values-pt-rBR` | `pt-BR` |
| Japanese | `ja` | `ja` | `ja` | `values-ja` | `ja-JP` |
| Korean | `ko` | `ko` | `ko` | `values-ko` | `ko-KR` |
| Chinese (Simplified) | `zh-Hans` | `zh-Hans` | `zh-Hans` | `values-zh-rCN` | `zh-CN` |
| Chinese (Traditional) | `zh-Hant` | `zh-Hant` | `zh-Hant` | `values-zh-rTW` | `zh-TW` |
| Arabic ⚠️ RTL | `ar` | `ar-SA` | `ar` | `values-ar` | `ar` |
| Hebrew ⚠️ RTL | `he` | `he` | `iw` | `values-iw` | `iw` |
| Farsi ⚠️ RTL | `fa` | `fa` | `fa` | `values-fa` | `fa` |
| Indonesian | `id` | `id` | `in` | `values-in` | `id` |
| Russian | `ru` | `ru` | `ru` | `values-ru` | `ru-RU` |
| Italian | `it` | `it` | `it` | `values-it` | `it-IT` |
| Dutch | `nl` | `nl-NL` | `nl` | `values-nl` | `nl-NL` |

## Android BCP 47 notes

- Modern API: `Locale.forLanguageTag("tr-TR")` — use this (API level 21+)
- Legacy (avoid): `new Locale("tr", "TR")` — deprecated
- Resource folder format: `values-tr` (language only) or `values-en-rUS` (lang + region with `r` prefix)
- Script variants: `values-b+sr+Latn` (Serbian in Latin script)
- Legacy codes still in Android AOSP: `iw` (Hebrew), `in` (Indonesian), `ji` (Yiddish)

## Apple localization toolchain

- Xcode 15+: `.xcstrings` format (replaces `.strings` + `.stringsdict`)
- Export: Xcode → Product → Export Localizations → `.xcloc` bundles
- iOS 13+: users can set per-app language in Settings → App → Language

## RTL locales requiring engineering work

| Code | Language | React Native / Expo action |
|---|---|---|
| `ar` | Arabic | `I18nManager.forceRTL(true)` + layout review |
| `he` / `iw` | Hebrew | Same as Arabic |
| `fa` | Farsi/Persian | Same as Arabic |
| `ur` | Urdu | Same as Arabic |

For RTL: review all flexDirection, icon placement, text alignment, back button positions.
