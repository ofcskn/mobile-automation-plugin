#!/usr/bin/env node
/**
 * validate-permissions.js
 * Usage: node validate-permissions.js <app-path>
 * Validates iOS and Android permissions in app.json / app.config.ts
 */

const fs = require('fs');
const path = require('path');

const [,, appPath] = process.argv;
if (!appPath) {
  console.error('Usage: node validate-permissions.js /path/to/expo/app');
  process.exit(1);
}

const absPath = path.resolve(appPath);

// Load app.json
const appJsonPath = path.join(absPath, 'app.json');
if (!fs.existsSync(appJsonPath)) {
  console.error(`app.json not found at: ${appJsonPath}`);
  console.error('Pass the root directory of your Expo app.');
  process.exit(1);
}

let appConfig;
try {
  const raw = JSON.parse(fs.readFileSync(appJsonPath, 'utf8'));
  appConfig = raw.expo || raw;
} catch (e) {
  console.error('Failed to parse app.json:', e.message);
  process.exit(1);
}

const DANGEROUS_ANDROID = [
  'CAMERA', 'RECORD_AUDIO', 'READ_CONTACTS', 'WRITE_CONTACTS',
  'ACCESS_FINE_LOCATION', 'ACCESS_COARSE_LOCATION', 'ACCESS_BACKGROUND_LOCATION',
  'READ_EXTERNAL_STORAGE', 'WRITE_EXTERNAL_STORAGE',
  'READ_PHONE_STATE', 'CALL_PHONE', 'READ_CALL_LOG',
  'READ_SMS', 'RECEIVE_SMS', 'SEND_SMS',
  'USE_BIOMETRIC', 'USE_FINGERPRINT',
  'BLUETOOTH_SCAN', 'BLUETOOTH_CONNECT',
  'ACTIVITY_RECOGNITION', 'BODY_SENSORS',
];

const DEPRECATED_ANDROID = {
  'WRITE_EXTERNAL_STORAGE': 'Use READ_MEDIA_IMAGES, READ_MEDIA_VIDEO, READ_MEDIA_AUDIO instead (Android 13+)',
  'READ_EXTERNAL_STORAGE': 'Use READ_MEDIA_* permissions instead (Android 13+)',
};

const GENERIC_DESCRIPTIONS = [
  'camera access', 'camera', 'microphone access', 'microphone',
  'location access', 'location', 'photos access', 'contacts access',
  'needed', 'required', 'permission', 'access',
];

let errors = 0;
let warnings = 0;

console.log(`\n🔍 Permission validation for: ${path.basename(absPath)}\n`);

// === iOS ===
console.log('── iOS Permissions ──────────────────────────────────');
const infoPlist = appConfig.ios?.infoPlist || {};
const nsKeys = Object.keys(infoPlist).filter(k => k.includes('UsageDescription'));

if (nsKeys.length === 0) {
  console.log('  ℹ️  No NS*UsageDescription entries found in app.json ios.infoPlist');
  console.log('     If your app uses camera, location, etc., add them here.\n');
} else {
  for (const key of nsKeys) {
    const val = infoPlist[key];
    if (!val || val.trim() === '') {
      console.log(`  ❌ ${key}: EMPTY — will cause App Store rejection`);
      errors++;
    } else if (GENERIC_DESCRIPTIONS.some(g => val.trim().toLowerCase() === g)) {
      console.log(`  ⚠️  ${key}: "${val}" — too generic, Apple may reject`);
      warnings++;
    } else {
      console.log(`  ✅ ${key}: "${val.substring(0, 60)}${val.length > 60 ? '…' : ''}"`);
    }
  }
}

// === Android ===
console.log('\n── Android Permissions ──────────────────────────────');
const androidPerms = appConfig.android?.permissions || [];

if (androidPerms.length === 0) {
  console.log('  ℹ️  No permissions declared in app.json android.permissions');
  console.log('     Expo adds some defaults. Add explicit permissions to control exactly what is requested.\n');
} else {
  for (const perm of androidPerms) {
    const shortName = perm.replace('android.permission.', '');
    if (DEPRECATED_ANDROID[shortName]) {
      console.log(`  ⚠️  ${perm}`);
      console.log(`     Deprecated: ${DEPRECATED_ANDROID[shortName]}`);
      warnings++;
    } else if (DANGEROUS_ANDROID.includes(shortName)) {
      console.log(`  🟡 ${perm} — dangerous permission, requires runtime dialog`);
    } else {
      console.log(`  ✅ ${perm}`);
    }
  }
}

// Summary
console.log(`\n${'─'.repeat(52)}`);
if (errors > 0) {
  console.log(`❌ ${errors} error(s) — fix before submitting to App Store`);
  console.log(`⚠️  ${warnings} warning(s)`);
  process.exit(1);
} else if (warnings > 0) {
  console.log(`✅ No blocking errors.`);
  console.log(`⚠️  ${warnings} warning(s) — review before submitting`);
} else {
  console.log(`✅ All permissions look good.`);
}
console.log('\nNext: run /msd-permissions for AI-assisted review and fixes');
