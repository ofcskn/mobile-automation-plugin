#!/usr/bin/env node
/**
 * resolve-locales.js
 * Usage: node resolve-locales.js <app-id> "en,tr,de"
 * Resolves short locale codes to per-platform format and writes to config/{app-id}.config.json
 * MIT License — mobile-store-deploy
 */

const fs = require('fs');
const path = require('path');

const [,, appId, localeInput] = process.argv;
if (!appId || !localeInput) {
  console.error('Usage: node resolve-locales.js <app-id> "en,tr,de"');
  process.exit(1);
}

// BCP47 resolution map: i18next short code → platform-specific formats
const LOCALE_MAP = {
  'en':    { ios: 'en-US',   android_config: 'en-US',  android_folder: 'values-en-rUS', playConsole: 'en-US',  rtl: false },
  'en-AU': { ios: 'en-AU',   android_config: 'en-AU',  android_folder: 'values-en-rAU', playConsole: 'en-AU',  rtl: false },
  'en-GB': { ios: 'en-GB',   android_config: 'en-GB',  android_folder: 'values-en-rGB', playConsole: 'en-GB',  rtl: false },
  'en-CA': { ios: 'en-CA',   android_config: 'en-CA',  android_folder: 'values-en-rCA', playConsole: 'en-CA',  rtl: false },
  'tr':    { ios: 'tr-TR',   android_config: 'tr',     android_folder: 'values-tr',     playConsole: 'tr-TR',  rtl: false },
  'de':    { ios: 'de-DE',   android_config: 'de',     android_folder: 'values-de',     playConsole: 'de-DE',  rtl: false },
  'fr':    { ios: 'fr-FR',   android_config: 'fr',     android_folder: 'values-fr',     playConsole: 'fr-FR',  rtl: false },
  'fr-CA': { ios: 'fr-CA',   android_config: 'fr-CA',  android_folder: 'values-fr-rCA', playConsole: 'fr-CA',  rtl: false },
  'es':    { ios: 'es-ES',   android_config: 'es',     android_folder: 'values-es',     playConsole: 'es-ES',  rtl: false },
  'es-MX': { ios: 'es-MX',   android_config: 'es-US',  android_folder: 'values-es-rUS', playConsole: 'es-419', rtl: false },
  'pt-BR': { ios: 'pt-BR',   android_config: 'pt-BR',  android_folder: 'values-pt-rBR', playConsole: 'pt-BR',  rtl: false },
  'pt-PT': { ios: 'pt-PT',   android_config: 'pt-PT',  android_folder: 'values-pt-rPT', playConsole: 'pt-PT',  rtl: false },
  'ja':    { ios: 'ja',      android_config: 'ja',     android_folder: 'values-ja',     playConsole: 'ja-JP',  rtl: false },
  'ko':    { ios: 'ko',      android_config: 'ko',     android_folder: 'values-ko',     playConsole: 'ko-KR',  rtl: false },
  'zh-Hans':{ ios: 'zh-Hans', android_config: 'zh-Hans', android_folder: 'values-zh-rCN', playConsole: 'zh-CN', rtl: false },
  'zh-Hant':{ ios: 'zh-Hant', android_config: 'zh-Hant', android_folder: 'values-zh-rTW', playConsole: 'zh-TW', rtl: false },
  'ar':    { ios: 'ar-SA',   android_config: 'ar',     android_folder: 'values-ar',     playConsole: 'ar',     rtl: true  },
  'he':    { ios: 'he',      android_config: 'iw',     android_folder: 'values-iw',     playConsole: 'iw',     rtl: true  },
  'fa':    { ios: 'fa',      android_config: 'fa',     android_folder: 'values-fa',     playConsole: 'fa',     rtl: true  },
  'ur':    { ios: 'ur',      android_config: 'ur',     android_folder: 'values-ur',     playConsole: 'ur',     rtl: true  },
  'ru':    { ios: 'ru',      android_config: 'ru',     android_folder: 'values-ru',     playConsole: 'ru-RU',  rtl: false },
  'it':    { ios: 'it',      android_config: 'it',     android_folder: 'values-it',     playConsole: 'it-IT',  rtl: false },
  'nl':    { ios: 'nl-NL',   android_config: 'nl',     android_folder: 'values-nl',     playConsole: 'nl-NL',  rtl: false },
  'pl':    { ios: 'pl',      android_config: 'pl',     android_folder: 'values-pl',     playConsole: 'pl-PL',  rtl: false },
  'sv':    { ios: 'sv',      android_config: 'sv',     android_folder: 'values-sv',     playConsole: 'sv-SE',  rtl: false },
  'da':    { ios: 'da',      android_config: 'da',     android_folder: 'values-da',     playConsole: 'da-DK',  rtl: false },
  'nb':    { ios: 'nb',      android_config: 'nb',     android_folder: 'values-nb',     playConsole: 'no-NO',  rtl: false },
  'fi':    { ios: 'fi',      android_config: 'fi',     android_folder: 'values-fi',     playConsole: 'fi-FI',  rtl: false },
  'hu':    { ios: 'hu',      android_config: 'hu',     android_folder: 'values-hu',     playConsole: 'hu-HU',  rtl: false },
  'cs':    { ios: 'cs',      android_config: 'cs',     android_folder: 'values-cs',     playConsole: 'cs-CZ',  rtl: false },
  'ro':    { ios: 'ro',      android_config: 'ro',     android_folder: 'values-ro',     playConsole: 'ro',     rtl: false },
  'hi':    { ios: 'hi',      android_config: 'hi',     android_folder: 'values-hi',     playConsole: 'hi-IN',  rtl: false },
  'id':    { ios: 'id',      android_config: 'in',     android_folder: 'values-in',     playConsole: 'id',     rtl: false },
  'vi':    { ios: 'vi',      android_config: 'vi',     android_folder: 'values-vi',     playConsole: 'vi',     rtl: false },
  'th':    { ios: 'th',      android_config: 'th',     android_folder: 'values-th',     playConsole: 'th',     rtl: false },
  'uk':    { ios: 'uk',      android_config: 'uk',     android_folder: 'values-uk',     playConsole: 'uk',     rtl: false },
};

const locales = localeInput.split(',').map(l => l.trim().toLowerCase());
const resolved = [];
const unknown = [];
const rtlWarnings = [];

locales.forEach((code, idx) => {
  const map = LOCALE_MAP[code];
  if (!map) { unknown.push(code); return; }
  resolved.push({ i18next: code, ...map, primary: idx === 0 });
  if (map.rtl) rtlWarnings.push(code);
});

if (unknown.length > 0) {
  console.warn(`⚠️  Unknown locale codes (not mapped): ${unknown.join(', ')}`);
  console.warn('   Add them to LOCALE_MAP in this script or check locale-codes.md');
}

// Write to config
const configPath = path.resolve(__dirname, `../../../../config/${appId}.config.json`);
let config = {};
if (fs.existsSync(configPath)) {
  config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
}
config.locales = resolved;
fs.writeFileSync(configPath, JSON.stringify(config, null, 2) + '\n');

// Report
console.log(`\n✅ Locale config written for: ${appId}`);
console.log(`\n${'─'.repeat(60)}`);
console.log(`${'i18next'.padEnd(10)} ${'iOS ASC'.padEnd(12)} ${'Android config'.padEnd(16)} ${'Android folder'.padEnd(22)} ${'Play'.padEnd(12)} RTL`);
console.log('─'.repeat(80));
resolved.forEach(l => {
  const rtl = l.rtl ? '⚠️ RTL' : '';
  const primary = l.primary ? ' (primary)' : '';
  console.log(`${(l.i18next + primary).padEnd(20)} ${l.ios.padEnd(12)} ${l.android_config.padEnd(16)} ${l.android_folder.padEnd(22)} ${l.playConsole.padEnd(12)} ${rtl}`);
});

if (rtlWarnings.length > 0) {
  console.log(`\n⚠️  RTL locales detected: ${rtlWarnings.join(', ')}`);
  console.log('   Add I18nManager.forceRTL(true) to app startup for these locales.');
  console.log('   Review: flexDirection, icon placement, text alignment, back buttons.');
}

console.log(`\nNext: run node skills/managing-app-localizations/scripts/validate-translations.js ${appId}`);
