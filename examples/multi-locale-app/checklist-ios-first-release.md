# ZenApp — iOS First Release Checklist

Run: `/msd-checklist zenapp ios`

## Manual steps to complete before running the checklist

- [ ] Apple Developer account created and enrolled ($99/year)
- [ ] Bundle ID created: `com.yourcompany.zenapp`
- [ ] App created in App Store Connect
- [ ] App Store Connect API key created and stored as EAS secret (`eas secret:create`)

## What the AI handles automatically

- ✅ Metadata validation (all 10 locales × all fields)
- ✅ Character limit enforcement
- ✅ Version sync to app.json
- ✅ EAS build trigger
- ✅ EAS submit trigger

## What requires your approval

- 🟡 ASO-optimized keywords for each locale (AI drafts, you approve)
- 🟡 Description and subtitle for each locale
- 🟡 Screenshot captions (aligned with OCR-indexed keywords)
- 🟡 "What's New" text for each locale

## Time estimate

- Manual setup: 2–3 hours (accounts, API keys, privacy labels)
- AI-assisted review: 1 hour (reviewing metadata for 10 locales)
- Automated: 45 minutes (EAS build + submit)
- Apple review: 24–48 hours
