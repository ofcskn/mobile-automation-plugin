#!/usr/bin/env node
/**
 * bump-version.js
 * Usage: node bump-version.js <app-id> <patch|minor|major|build>
 * MIT License — mobile-store-deploy
 */

const fs = require('fs');
const path = require('path');

const [,, appId, bumpType] = process.argv;

if (!appId || !bumpType) {
  console.error('Usage: node bump-version.js <app-id> <patch|minor|major|build>');
  process.exit(1);
}

const versionPath = path.resolve(__dirname, `../../../versions/${appId}/version.json`);

if (!fs.existsSync(versionPath)) {
  console.error(`version.json not found at ${versionPath}`);
  console.error('Run: mkdir -p versions/<app-id> && node scripts/init-version.js <app-id>');
  process.exit(1);
}

const version = JSON.parse(fs.readFileSync(versionPath, 'utf8'));
const [major, minor, patch] = version.semver.split('.').map(Number);
const currentBuild = parseInt(version.ios.CFBundleVersion, 10);
const currentCode = parseInt(version.android.versionCode, 10);

let newMajor = major, newMinor = minor, newPatch = patch;
const newBuild = currentBuild + 1;
const newCode = currentCode + 1;

switch (bumpType) {
  case 'major':
    newMajor += 1; newMinor = 0; newPatch = 0;
    break;
  case 'minor':
    newMinor += 1; newPatch = 0;
    break;
  case 'patch':
    newPatch += 1;
    break;
  case 'build':
    // semver unchanged, only build numbers increment
    break;
  default:
    console.error(`Unknown bump type: ${bumpType}. Use: patch, minor, major, build`);
    process.exit(1);
}

const newSemver = `${newMajor}.${newMinor}.${newPatch}`;

// Archive current version in history
const historyEntry = {
  semver: version.semver,
  iosBuild: version.ios.CFBundleVersion,
  androidCode: version.android.versionCode,
  date: version.lastBumpedAt
};

const updated = {
  ...version,
  semver: newSemver,
  ios: { CFBundleShortVersionString: newSemver, CFBundleVersion: String(newBuild) },
  android: { versionName: newSemver, versionCode: newCode },
  lastBumpedAt: new Date().toISOString(),
  history: [historyEntry, ...(version.history || [])].slice(0, 50)
};

fs.writeFileSync(versionPath, JSON.stringify(updated, null, 2) + '\n');

console.log('✅ Version bumped successfully');
console.log(`   semver:         ${version.semver} → ${newSemver}`);
console.log(`   iOS build:      ${currentBuild} → ${newBuild}`);
console.log(`   Android code:   ${currentCode} → ${newCode}`);
console.log('');
console.log(`Next: node scripts/sync-build-numbers.js ${appId}`);
