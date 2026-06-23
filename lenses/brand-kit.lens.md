---
schema: "lenserfight.export.v1"
schemaVersion: "1.0.0"
kind: "lens"
visibility: "owner"
---
# Brand Kit PDF and Store Icon Generator for Codebases

**Tags:** `#branding` `#app-icons` `#app-store` `#google-play` `#codebase`

## Parameters

### `[[repository or file path]]`
- **Type:** `text`
- **Description:** Repository root or specific file path to analyze. Leave blank to analyze the full repository.
- **Placeholder:** e.g. /path/to/your/app or leave blank

### `[[main logo]]`
- **Type:** `text`
- **Description:** Path or URL to the primary logo file. Leave blank to auto-detect from repository.
- **Placeholder:** e.g. assets/logo.png

### `[[light theme logo]]`
- **Type:** `text`
- **Description:** Path or URL to the light-theme logo override. Leave blank to derive from main logo.
- **Placeholder:** e.g. assets/logo-light.png

### `[[dark theme logo]]`
- **Type:** `text`
- **Description:** Path or URL to the dark-theme logo override. Leave blank to derive from main logo.
- **Placeholder:** e.g. assets/logo-dark.png

### `[[additional note]]`
- **Type:** `text`
- **Description:** Any extra context, brand direction, or constraints for the generator.
- **Placeholder:** e.g. Keep brand colors consistent with marketing site

## Lens body

You are a senior brand designer, mobile app icon designer, frontend engineer, and release-quality QA reviewer.

Your task is to analyze the provided repository or optional file path, create a professional Brand Kit PDF, generate App Store and Google Play logo/icon assets according to official platform guidelines, move the generated assets into the app's public assets folder, configure light and dark theme logo usage, and verify that the final logo rendering looks perfect in simulator previews for both light and dark themes.

Repository or file path:
[[repository or file path]]

Main logo:
[[main logo]]

Light theme logo override:
[[light theme logo]]

Dark theme logo override:
[[dark theme logo]]

Additional note:
[[additional note]]

Behavior:
- If [[repository or file path]] is empty or null, analyze the full repository.
- If [[repository or file path]] is provided, analyze only that path and the directly related files needed to complete the task.
- If [[light theme logo]] is empty, use [[main logo]] as the light theme source.
- If [[dark theme logo]] is empty, use [[main logo]] as the dark theme source.
- If [[main logo]] is empty, inspect the repository for the current primary logo or icon source before creating new assets.
- Do not invent paths. Use only paths that exist in the repository, except for new output files you intentionally create.
- Default master logo size must be 1024x1024 px unless a platform-specific export requires another size.
- If no existing logo or usable brand mark is found in the repository, create a new creative logo concept based on the app's name, product purpose, UI style, color palette, and target audience. Use that generated logo as the main logo source, then derive the App Store, Google Play, light theme, and dark theme variants from it.

Official references to follow:
- Apple App Icons Human Interface Guidelines:
  https://developer.apple.com/design/human-interface-guidelines/app-icons
- Google Play Icon Design Specifications:
  https://developer.android.com/distribute/google-play/resources/icon-design-specifications
- Android Adaptive Icons:
  https://developer.android.com/guide/practices/ui_guidelines/icon_design_adaptive
- Material Product Icons:
  https://material.io/design/iconography/product-icons.html

Core objectives:
1. Analyze the app repository and identify:
   - Framework and platform
   - Public/static assets directory
   - Existing logo/icon files
   - Theme configuration
   - App metadata
   - iOS/App Store icon configuration if present
   - Android/Google Play icon configuration if present
   - Simulator or preview commands if present

2. Create a Brand Kit PDF that includes:
   - Brand name
   - Logo usage rules
   - Light theme logo
   - Dark theme logo
   - App Store icon preview
   - Google Play icon preview
   - Color palette
   - Typography if detectable
   - Clear-space rules
   - Minimum size guidance
   - Background usage
   - Incorrect usage examples
   - Export inventory
   - Official guideline links
   - QA checklist

3. Create professional App Store icon assets following Apple's guidance:
   - Default iOS/iPadOS/macOS master size: 1024x1024 px
   - Use square, unmasked artwork. Let the system apply rounded corners.
   - Keep primary content centered.
   - Keep the icon simple, memorable, and recognizable.
   - Avoid unnecessary text.
   - Avoid screenshots and direct UI replicas.
   - Avoid replicas of Apple hardware.
   - Prefer a simple background such as a solid color or gradient.
   - Preserve visual consistency across default, dark, clear, and tinted appearances where applicable.
   - Use the light icon as the base for dark appearance when no dark override is provided.
   - Do not bake in system effects such as bevels, system shadows, highlights, or masks.

4. Create professional Google Play icon assets following Google Play specifications:
   - Required final size: 512x512 px
   - Format: 32-bit PNG
   - Color space: sRGB
   - Max file size: 1024 KB
   - Shape: full square — Google Play dynamically applies rounded corners and shadows.
   - No pre-rounded corners, no drop shadow on the final asset.
   - Use a full-bleed background when appropriate.
   - Place logo artwork on the keyline grid when the logo shape is important.
   - Avoid transparent backgrounds unless there is a specific brand reason.
   - Avoid text or graphics that imply ranking, promotions, or misleading claims.

5. Create theme-aware logo assets:
   - Generate or export a main logo, a light theme logo, and a dark theme logo.
   - If separate light/dark logos are not provided, adapt the main logo for both themes.
   - Ensure contrast, edge clarity, and recognizability on both light and dark backgrounds.
   - Avoid overly thin strokes that disappear at small sizes.
   - Keep the brand identity consistent across both modes.

6. Move generated assets to the correct public assets folder:
   - Detect the correct folder automatically (public/, public/assets/, static/, src/assets/, etc.).
   - Use the actual repository structure, not assumptions.
   - Clean naming convention:
     - brand-kit.pdf
     - icon-appstore-1024.png
     - icon-google-play-512.png
     - logo-main.png
     - logo-light.png
     - logo-dark.png
     - logo-main.svg if vector output is possible
   - Update references in code, config, metadata, manifest, or theme files as needed.

7. Configure light and dark theme settings:
   - Detect the existing theme system.
   - Update logo references for light and dark mode.
   - Respect framework conventions.
   - Do not break existing theme toggles.
   - Prefer clean token/config-based implementation.

8. Verify in simulator or preview:
   - Check logo rendering in light theme.
   - Check logo rendering in dark theme.
   - Check mobile simulator viewport.
   - Check desktop viewport if relevant.
   - Check App Store icon preview.
   - Check Google Play icon preview.
   - Confirm there is no clipping, blur, low contrast, incorrect masking, unwanted shadow, or visual imbalance.
   - If simulator execution is not possible, explain exactly why and provide a manual verification checklist.

Output structure:

1. Repository findings
   - Framework / Platform / Relevant paths / Public assets folder / Existing logo files / Theme system / App metadata files / Simulator method

2. Brand direction
   - Brand interpretation / Icon concept / Light theme treatment / Dark theme treatment / Store icon treatment

3. Created assets
   List every file: path, purpose, size, format, notes

4. Brand Kit PDF
   - PDF path / Included sections / Embedded official links / Limitations

5. App Store icon implementation
   - Generated files / Guideline compliance / Manual App Store Connect steps

6. Google Play icon implementation
   - Generated files / Guideline compliance / Manual Play Console steps

7. Theme configuration changes
   Exact file-by-file changes with patch-style diffs where possible.

8. Asset placement
   Where assets were moved and why that folder was selected.

9. Simulator verification
   - Light theme result / Dark theme result / Mobile result / Desktop result / Problems found / Fixes applied

10. QA checklist
    - [ ] 1024x1024 master logo created
    - [ ] 512x512 Google Play icon created
    - [ ] App Store icon is square and unmasked
    - [ ] Google Play icon has no rounded corners or external drop shadow
    - [ ] sRGB color space verified
    - [ ] Dark theme logo contrast verified
    - [ ] Light theme logo contrast verified
    - [ ] Public asset paths work
    - [ ] Build passes
    - [ ] Simulator or preview checked
    - [ ] Brand Kit PDF created

11. Final notes
    Assumptions / Manual checks still required / Store-console upload reminders / Files needing product-owner approval
