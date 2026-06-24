# Release Notes Workflow for 10 Locales

## The problem

Writing "What's New" for 10 locales × 2 platforms = 20 text files per release.
Android limit: 500 chars each. iOS limit: 4,000 chars each.
Simple translation fails — each language needs natural phrasing.

## The solution with /msd-release-notes

```bash
/msd-release-notes zenapp "Added box breathing technique, improved sleep timer accuracy, fixed audio bug on Android"
```

AI generates:

| Locale | iOS (4000 max) | Android (500 max) |
|--------|----------------|-------------------|
| en | "New: Box breathing technique (4-4-4-4 pattern)..." | "New: Box breathing, better sleep timer, audio fix" |
| tr | "Yeni: Kutu nefes tekniği (4-4-4-4 döngüsü)..." | "Yeni: Kutu nefes, gelişmiş uyku zamanlayıcı" |
| de | "Neu: Box-Atmung Technik (4-4-4-4 Rhythmus)..." | "Neu: Kasten-Atmung, verbesserter Schlaf-Timer" |
| ja | "新機能：ボックスブリージング（4-4-4-4パターン）..." | "新機能：ボックスブリージング、睡眠タイマー改善" |
| ... | ... | ... |

Time to write 20 files manually: ~2 hours
Time with /msd-release-notes: ~10 minutes (review + approve)

## Locale code mapping for this app

| Language | iOS locale folder | Android locale folder |
|----------|-------------------|-----------------------|
| English | en-US | en-US |
| Turkish | tr-TR | tr-TR |
| German | de-DE | de-DE |
| Spanish | es-ES | es-ES |
| French | fr-FR | fr-FR |
| Hindi | hi-IN | hi-IN |
| Japanese | ja-JP | ja-JP |
| Korean | ko-KR | ko-KR |
| Portuguese | pt-BR | pt-BR |
| Chinese | zh-Hans | zh-Hans |
