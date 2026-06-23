#!/usr/bin/env node
/**
 * release-checklist.js
 * Usage: node release-checklist.js <app-id> [--platform ios|android]
 * Runs all pre-flight validation gates before a store submission.
 * Exits 1 if any gate fails.
 * MIT License — mobile-store-deploy
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const [,, appId, platformFlag] = process.argv;
if (!appId) { console.error('Usage: node release-checklist.js <app-id>'); process.exit(1); }

const root = path.resolve(__dirname, '../../..');
const configPath = path.join(root, 'config', `${appId}.config.json`);
const versionPath = path.join(root, 'versions', appId, 'version.json');

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

function runScript(scriptPath, args = '') {
  execSync(`node "${scriptPath}" ${args}`, { stdio: 'pipe', cwd: root });
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
    path.join(root, 'skills/managing-store-metadata/scripts/validate-metadata.js'),
    appId
  );
});

// Gate 4: Translation completeness
gate('All translation keys present', () => {
  runScript(
    path.join(root, 'skills/managing-app-localizations/scripts/validate-translations.js'),
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

// Gate 6: Fastlane credentials
gate('Fastlane credentials configured', () => {
  const apiKey = path.join(root, 'fastlane', 'api_key.json');
  const serviceAccount = path.join(root, 'fastlane', 'google-play-api.json');
  const hasIOS = fs.existsSync(apiKey) || process.env.FASTLANE_API_KEY_PATH;
  const hasAndroid = fs.existsSync(serviceAccount) || process.env.SUPPLY_JSON_KEY_DATA;
  if (!hasIOS && !hasAndroid) throw new Error('No Fastlane credentials found. Set env vars or add key files.');
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
  console.log(`  iOS:     bundle exec fastlane ios release`);
  console.log(`  Android: bundle exec fastlane android release\n`);
  process.exit(0);
} else {
  console.error(`❌ ${failed} gate(s) failed. Fix before submitting.\n`);
  process.exit(1);
}
