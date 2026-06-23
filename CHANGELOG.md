# Changelog

## [1.0.1] — 2026-06-23

### Fixed
- Phase 3 cleanup: stale root files moved to .data/, lenses promoted to lenses/ directory

## [1.0.0] — 2026-06-23

### Added
- Five agentskills.io-compatible sub-skills: managing-app-versions, generating-store-screenshots, managing-store-metadata, managing-app-localizations, submitting-app-release
- Three additional skills: selecting-app-locales, optimizing-aso-seo, optimizing-geo
- Nine Claude Code slash commands: /msd-release, /msd-bump, /msd-screenshots, /msd-metadata, /msd-locale, /msd-validate, /msd-select-locales, /msd-aso, /msd-geo
- Seven specialized subagents: version-manager, screenshot-pipeline, metadata-validator, localization-auditor, release-coordinator, locale-selector, aso-geo-optimizer
- Automatic hooks: metadata char-limit validation on write, translation audit on write, locale gate on prompt
- Hard character limit validator (validate-metadata.js) for Apple and Google
- Translation completeness validator (validate-translations.js)
- Pre-release gate runner (release-checklist.js) with 7 sequential gates
- Version bump script with monotonic versionCode enforcement
- sync-build-numbers.js for Expo/native iOS/Android platform sync
- resolve-locales.js with 36 pre-mapped locales across all platform formats
- Four LenserFight lens definitions: locale-selector, aso-optimizer, geo-optimizer, screenshot-designer
- launch-ready-workflow.md chaining all 5 lenses
- config/.template.config.json per-app config schema
- Device matrix with required iPhone 6.9" (1320x2868) for 2026
- Apple storefront table (175 countries) and Android AOSP locale list (82 locales)
- Screenshot caption OCR indexing guidance (Apple, June 2025)
- GEO optimization for AI discoverability
