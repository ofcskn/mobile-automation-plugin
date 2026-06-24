#!/usr/bin/env node
/**
 * release-checklist.js
 * Usage: node release-checklist.js <app-id> [--platform ios|android]
 * Runs all pre-flight validation gates before a store submission.
 * Exits 1 if any gate fails.
 * MIT License — mobile-store-deploy
 */

const { spawnSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const [,, appId, platformFlag] = process.argv;
if (!appId) { console.error('Usage: node release-checklist.js <app-id>'); process.exit(1); }

if (!/^[a-zA-Z0-9._-]+$/.test(appId)) {
  console.error('Error: app-id may only contain letters, numbers, dots, hyphens, and underscores.');
  process.exit(1);
}

const root = path.resolve(__dirname, '../../..');

function safeJoin(base, ...parts) {
  const resolved = path.resolve(base, ...parts);
  if (!resolved.startsWith(base + path.sep) && resolved !== base) {
    throw new Error(`Path traversal detected: ${resolved}`);
  }
  return resolved;
}

const configPath = safeJoin(root, 'config', `${appId}.config.json`);
const versionPath = safeJoin(root, 'versions', appId, 'version.json');

let gates = [];
let passed = 0;
let failed = 0;

function gate(label, fn) {
  try {
    const result = fn();
    if (result === false) throw new Error('Gate returned false');
    console.log(`  ✅ ${label}`);
    passed++;
  } catch (e) {
    console.error(`  ❌ ${label}`);
    if (e.message) console.error(`     ${e.message}`);
    failed++;
  }
}

function runScript(scriptPath, ...args) {
  const result = spawnSync(process.execPath, [scriptPath, ...args], { stdio: 'pipe', cwd: root });
  if (result.status !== 0) {
    const msg = result.stderr ? result.stderr.toString().trim() : 'script exited with non-zero status';
    throw new Error(msg);
  }
}

console.log(`\n🚀 Pre-flight checklist: ${appId}\n`);

// Gate 1: Config exists
gate('config/{app-id}.config.json exists', () => {
  if (!fs.existsSync(configPath)) throw new Error(`Not found: ${configPath}`);
});

// Gate 2: Version file exists and is valid
gate('versions/{app-id}/version.json is valid', () => {
  if (!fs.existsSync(versionPath)) throw new Error(`Not found: ${versionPath}`);
  const v = JSON.parse(fs.readFileSync(versionPath, 'utf8'));
  if (!v.semver || !v.ios || !v.android) throw new Error('version.json missing required fields');
  if (parseInt(v.android.versionCode, 10) < 1) throw new Error('versionCode must be >= 1');
});

// Gate 3: Metadata validation
gate('Metadata passes character limit validation', () => {
  runScript(
    safeJoin(root, 'skills/managing-store-metadata/scripts/validate-metadata.js'),
    appId
  );
});

// Gate 4: Translation completeness
gate('All translation keys present', () => {
  runScript(
    safeJoin(root, 'skills/managing-app-localizations/scripts/validate-translations.js'),
    appId
  );
});

// Gate 5: Screenshots exist
gate('Screenshot files present for required device sizes', () => {
  const designedPath = path.join(root, 'screenshots', appId, 'designed');
  if (!fs.existsSync(designedPath)) throw new Error(`No designed screenshots at ${designedPath}`);
  const platforms = fs.readdirSync(designedPath);
  if (platforms.length === 0) throw new Error('No platform folders in designed screenshots');
});

// Gate 6: EAS credentials
gate('EAS credentials configured', () => {
  const hasIOS = process.env.EXPO_TOKEN ||
    process.env.APP_STORE_CONNECT_API_KEY_ID ||
    process.env.APP_STORE_CONNECT_API_KEY_CONTENT;
  const hasAndroid = process.env.EXPO_TOKEN ||
    process.env.GOOGLE_SERVICES_JSON;
  if (!hasIOS && !hasAndroid) throw new Error('No EAS credentials found. Set EXPO_TOKEN or App Store Connect / Google Play env vars. See skills/submitting-app-release/references/submission-checklist.md');
});

// Gate 7: CHANGELOG updated
gate('CHANGELOG.md updated', () => {
  const changelog = path.join(root, 'CHANGELOG.md');
  if (!fs.existsSync(changelog)) throw new Error('CHANGELOG.md not found');
  const content = fs.readFileSync(changelog, 'utf8');
  const version = JSON.parse(fs.readFileSync(versionPath, 'utf8')).semver;
  if (!content.includes(version)) throw new Error(`Version ${version} not found in CHANGELOG.md`);
});

// Summary
const version = fs.existsSync(versionPath)
  ? JSON.parse(fs.readFileSync(versionPath, 'utf8')).semver
  : 'unknown';

console.log(`\n${'─'.repeat(50)}`);
console.log(`App:     ${appId}`);
console.log(`Version: ${version}`);
console.log(`Gates:   ${passed} passed, ${failed} failed`);
console.log('─'.repeat(50));

if (failed === 0) {
  console.log('✅ All gates passed. Safe to submit.\n');
  console.log('Next steps:');
  console.log(`  iOS:     eas submit --platform ios --profile production`);
  console.log(`  Android: eas submit --platform android --profile production\n`);
  process.exit(0);
} else {
  console.error(`❌ ${failed} gate(s) failed. Fix before submitting.\n`);
  process.exit(1);
}
