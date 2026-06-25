---
description: Generate "What's New" release notes for all locales — outputs a single consolidated file per platform with locale XML tags for easy copy-paste
---

Generate release notes for the current version across all configured locales.

## Usage

`/msd-release-notes {appId}` or `/msd-release-notes {appId} "Fixed crash on startup, added dark mode"`

## Output format

All locales are written into **one file per platform**:

- `.msd/metadata/{appId}/android/release_notes.txt`
- `.msd/metadata/{appId}/ios/release_notes.txt`

Each file uses XML locale tags so the user can copy-paste per locale into the store console:

```
<en-US>
Short release note in English.
</en-US>
<de-DE>
Kurze Versionsnotiz auf Deutsch.
</de-DE>
<tr-TR>
Türkçe kısa sürüm notu.
</tr-TR>
```

**Do NOT create per-locale subfolders for release notes.** Store everything in the platform root.

## Steps

1. Read `.msd/memory/apps.json` for the app's locale list and bundle ID
2. Read `.msd/versions/{appId}/version.json` for the current version
3. Ask (if not provided): "What changed in this version? Describe in plain English — I'll adapt it per language."

4. Draft notes for ALL locales at once:
   - **Android**: max 500 chars total per locale block — keep to **1–2 short sentences**
   - **iOS**: max 4000 chars per locale — still keep to **1–2 short sentences** for clarity
   - Write in each language naturally (not a literal translation)

5. Show the complete consolidated file contents to the user and ask: "Approve? Or edit any locale?"

6. Write the approved content to:
   - `.msd/metadata/{appId}/android/release_notes.txt`
   - `.msd/metadata/{appId}/ios/release_notes.txt`

## Locale code mapping (folder code → BCP-47 tag)

| Folder | XML tag  |
|--------|----------|
| en     | en-US    |
| de     | de-DE    |
| es     | es-ES    |
| fr     | fr-FR    |
| hi     | hi-IN    |
| ja     | ja-JP    |
| ko     | ko-KR    |
| pt     | pt-BR    |
| tr     | tr-TR    |
| zh     | zh-Hans  |

Use the locale codes from `.msd/memory/apps.json`. Map each to its BCP-47 tag above.

## Per-language tone guidance

Adapt for natural expression — do NOT literally translate English:
- `en-US`: direct, friendly ("We fixed a crash and added dark mode")
- `tr-TR`: slightly formal ("Uygulama kararlılığı artırıldı, karanlık mod eklendi")
- `de-DE`: precise, compound-words preferred ("Absturz behoben, Dunkelmodus hinzugefügt")
- `ja-JP`: polite form, short ("クラッシュを修正し、ダークモードを追加しました。")
- `zh-Hans`: concise ("修复崩溃，新增深色模式。")
- `ko-KR`: polite ending ("충돌 수정 및 다크 모드 추가.")
- `hi-IN`: natural Hindi ("क्रैश ठीक किया, डार्क मोड जोड़ा।")
- `fr-FR`: smooth French ("Correction d'un plantage et ajout du mode sombre.")
- `es-ES`: natural Spanish ("Corrección de bloqueo y modo oscuro añadido.")
- `pt-BR`: Brazilian Portuguese ("Correção de falha e modo escuro adicionado.")

## Android 500-char rule

Android What's New per locale block is strictly 500 chars. With 1–2 sentences this is never a concern.

## Important constraints

- **Never write release notes to locale subfolders** (no `android/en/release_notes.txt`)
- **One file per platform**, all locales inside, tagged with XML blocks
- **1–2 sentences maximum per locale** — store consoles show this in a small space
