#!/usr/bin/env node
/**
 * validate-translations.js
 * Usage: node validate-translations.js <app-id> [locale]
 * Finds missing and extra keys across all locale JSON files.
 * Source of truth: en.json
 * MIT License — mobile-store-deploy
 */

const fs = require('fs');
const path = require('path');

const [,, appId, targetLocale] = process.argv;
if (!appId) { console.error('Usage: node validate-translations.js <app-id> [locale]'); process.exit(1); }

const localesRoot = path.resolve(__dirname, `../../../locales/${appId}`);

function flattenKeys(obj, prefix = '') {
  return Object.entries(obj).reduce((acc, [k, v]) => {
    const key = prefix ? `${prefix}.${k}` : k;
    if (typeof v === 'object' && v !== null && !Array.isArray(v)) {
      return [...acc, ...flattenKeys(v, key)];
    }
    return [...acc, key];
  }, []);
}

const sourceFile = path.join(localesRoot, 'en.json');
if (!fs.existsSync(sourceFile)) {
  console.error(`Source locale en.json not found at ${localesRoot}`);
  process.exit(1);
}

const sourceKeys = new Set(flattenKeys(JSON.parse(fs.readFileSync(sourceFile, 'utf8'))));
console.log(`\n🔍 Translation validation for: ${appId}`);
console.log(`   Source (en.json): ${sourceKeys.size} keys\n`);

const localeFiles = fs.readdirSync(localesRoot)
  .filter(f => f.endsWith('.json') && f !== 'en.json')
  .filter(f => !targetLocale || f === `${targetLocale}.json`);

let totalErrors = 0;

localeFiles.forEach(file => {
  const locale = file.replace('.json', '');
  const content = JSON.parse(fs.readFileSync(path.join(localesRoot, file), 'utf8'));
  const localeKeys = new Set(flattenKeys(content));

  const missing = [...sourceKeys].filter(k => !localeKeys.has(k));
  const extra = [...localeKeys].filter(k => !sourceKeys.has(k));

  if (missing.length === 0 && extra.length === 0) {
    console.log(`✅ ${locale}: ${localeKeys.size}/${sourceKeys.size} keys — complete`);
  } else {
    console.log(`❌ ${locale}: ${localeKeys.size}/${sourceKeys.size} keys`);
    if (missing.length > 0) {
      console.log(`   Missing (${missing.length}):`);
      missing.forEach(k => console.log(`     - ${k}`));
    }
    if (extra.length > 0) {
      console.log(`   Extra/obsolete (${extra.length}) — remove or added to source:`);
      extra.forEach(k => console.log(`     + ${k}`));
    }
    totalErrors += missing.length;
  }
});

console.log(`\n${'─'.repeat(50)}`);
if (totalErrors === 0) {
  console.log('✅ All translation files complete.');
  process.exit(0);
} else {
  console.error(`❌ ${totalErrors} missing key(s) found. Add translations before release.`);
  process.exit(1);
}
