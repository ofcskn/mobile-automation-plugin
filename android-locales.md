# Android Locale Reference

Source: Android AOSP `locale_config.xml` — BCP 47 names for `<locale android:name="..."/>`

Use these values for:
- `locale_config.xml` → `android:name` attribute
- `Locale.forLanguageTag("...")` in Java/Kotlin code
- `values-{lang}` resource folder names (see folder column)

## Full locale list (82 locales)

| BCP 47 (`android:name`) | Language | Resource folder | Notes |
|---|---|---|---|
| `af` | Afrikaans | `values-af` | |
| `am` | Amharic | `values-am` | |
| `ar` | Arabic | `values-ar` | ⚠️ RTL |
| `as` | Assamese | `values-as` | |
| `az` | Azerbaijani | `values-az` | |
| `be` | Belarusian | `values-be` | |
| `bg` | Bulgarian | `values-bg` | |
| `bn` | Bengali | `values-bn` | |
| `bs` | Bosnian | `values-bs` | |
| `ca` | Catalan | `values-ca` | |
| `cs` | Czech | `values-cs` | |
| `da` | Danish | `values-da` | |
| `de` | German | `values-de` | |
| `el` | Greek | `values-el` | |
| `en-AU` | English (Australia) | `values-en-rAU` | |
| `en-CA` | English (Canada) | `values-en-rCA` | |
| `en-GB` | English (United Kingdom) | `values-en-rGB` | |
| `en-IN` | English (India) | `values-en-rIN` | |
| `en-US` | English (United States) | `values-en-rUS` | Primary English |
| `es` | Spanish (Spain) | `values-es` | |
| `es-US` | Spanish (United States) | `values-es-rUS` | |
| `et` | Estonian | `values-et` | |
| `eu` | Basque | `values-eu` | |
| `fa` | Farsi | `values-fa` | ⚠️ RTL |
| `fi` | Finnish | `values-fi` | |
| `fil` | Filipino | `values-fil` | |
| `fr` | French (France) | `values-fr` | |
| `fr-CA` | French (Canada) | `values-fr-rCA` | |
| `gl` | Galician | `values-gl` | |
| `gu` | Gujarati | `values-gu` | |
| `hi` | Hindi | `values-hi` | |
| `hr` | Croatian | `values-hr` | |
| `hu` | Hungarian | `values-hu` | |
| `hy` | Armenian | `values-hy` | |
| `in` | Indonesian | `values-in` | Legacy code (modern: `id`) — use `in` in Android |
| `is` | Icelandic | `values-is` | |
| `it` | Italian | `values-it` | |
| `iw` | Hebrew | `values-iw` | ⚠️ RTL — Legacy code (modern: `he`) — use `iw` in Android |
| `ja` | Japanese | `values-ja` | |
| `ka` | Georgian | `values-ka` | |
| `kk` | Kazakh | `values-kk` | |
| `km` | Khmer | `values-km` | |
| `kn` | Kannada | `values-kn` | |
| `ko` | Korean | `values-ko` | |
| `ky` | Kyrgyz | `values-ky` | |
| `lo` | Lao | `values-lo` | |
| `lt` | Lithuanian | `values-lt` | |
| `lv` | Latvian | `values-lv` | |
| `mk` | Macedonian | `values-mk` | |
| `ml` | Malayalam | `values-ml` | |
| `mn` | Mongolian | `values-mn` | |
| `mr` | Marathi | `values-mr` | |
| `ms` | Malay | `values-ms` | |
| `my` | Burmese | `values-my` | |
| `nb` | Norwegian | `values-nb` | |
| `ne` | Nepali | `values-ne` | |
| `nl` | Dutch | `values-nl` | |
| `or` | Odia | `values-or` | |
| `pa` | Punjabi | `values-pa` | |
| `pl` | Polish | `values-pl` | |
| `pt-BR` | Portuguese (Brazil) | `values-pt-rBR` | |
| `pt-PT` | Portuguese (Portugal) | `values-pt-rPT` | |
| `ro` | Romanian | `values-ro` | |
| `ru` | Russian | `values-ru` | |
| `si` | Sinhala | `values-si` | |
| `sk` | Slovak | `values-sk` | |
| `sl` | Slovenian | `values-sl` | |
| `sq` | Albanian | `values-sq` | |
| `sr` | Serbian (Cyrillic) | `values-sr` | |
| `sr-Latn` | Serbian (Latin) | `values-b+sr+Latn` | Script variant — needs b+lang+Script format |
| `sv` | Swedish | `values-sv` | |
| `sw` | Swahili | `values-sw` | |
| `ta` | Tamil | `values-ta` | |
| `te` | Telugu | `values-te` | |
| `th` | Thai | `values-th` | |
| `tr` | Turkish | `values-tr` | |
| `uk` | Ukrainian | `values-uk` | |
| `ur` | Urdu | `values-ur` | ⚠️ RTL |
| `uz` | Uzbek | `values-uz` | |
| `vi` | Vietnamese | `values-vi` | |
| `zh-Hans` | Chinese (Simplified) | `values-zh-rCN` | |
| `zh-Hant` | Chinese (Traditional) | `values-zh-rTW` | |
| `zu` | Zulu | `values-zu` | |

## RTL locales (⚠️ require extra handling in React Native / Expo)

`ar`, `fa`, `iw` (Hebrew), `ur`

In React Native / Expo, add to app startup:
```js
import { I18nManager } from 'react-native';
I18nManager.forceRTL(true);
```

Also review: flexDirection, text alignment, icon placement, back button direction.

## Resource folder naming rules

| Pattern | When to use | Example |
|---|---|---|
| `values-{lang}` | Language only | `values-tr`, `values-de` |
| `values-{lang}-r{REGION}` | Language + region (old format) | `values-en-rUS`, `values-pt-rBR` |
| `values-b+{lang}+{Script}` | Language + script (BCP 47) | `values-b+sr+Latn` |
| `values-b+{lang}+{Script}+{REGION}` | Full BCP 47 | `values-b+zh+Hans+CN` |

## locale_config.xml placement

```
app/src/main/res/xml/locale_config.xml
```

Reference in `AndroidManifest.xml`:
```xml
<application android:localeConfig="@xml/locale_config">
```

Required from Android 13 (API 33) for per-app language preferences.
