#!/usr/bin/env node
/**
 * resolve-locales.js
 * Usage: node resolve-locales.js <app-id> "en,tr,de"
 * Resolves short locale codes to per-platform format and writes to .msd/config/{app-id}.config.json
 * MIT License — mobile-store-deploy
 */

const fs = require('fs');
const path = require('path');

const [,, appId, localeInput] = process.argv;
if (!appId || !localeInput) {
  console.error('Usage: node resolve-locales.js <app-id> "en,tr,de"');
  process.exit(1);
}

const localeMapPath = path.resolve(__dirname, '../../../.msd/config/locale-map.json');
const LOCALE_MAP = JSON.parse(fs.readFileSync(localeMapPath, 'utf8'));

const locales = localeInput.split(',').map(l => l.trim());
const resolved = [];
const unknown = [];
const rtlWarnings = [];

locales.forEach((code, idx) => {
  const map = LOCALE_MAP[code] || LOCALE_MAP[Object.keys(LOCALE_MAP).find(k => k.toLowerCase() === code.toLowerCase())];
  if (!map) { unknown.push(code); return; }
  resolved.push({ i18next: code, ...map, primary: idx === 0 });
  if (map.rtl) rtlWarnings.push(code);
});

if (unknown.length > 0) {
  console.warn(`⚠️  Unknown locale codes (not mapped): ${unknown.join(', ')}`);
  console.warn('   Add them to .msd/config/locale-map.json or check locale-codes.md');
}

// Write to config
const configPath = path.resolve(__dirname, `../../../.msd/config/${appId}.config.json`);
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
