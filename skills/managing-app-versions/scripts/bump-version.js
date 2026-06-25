#!/usr/bin/env node
/**
 * bump-version.js
 * Usage: node bump-version.js <app-id> <patch|minor|major|build> [ios|android|both]
 * MIT License — mobile-store-deploy
 */

const fs = require('fs');
const path = require('path');

const [,, appId, bumpType, platformArg] = process.argv;

if (!appId || !bumpType) {
  console.error('Usage: node bump-version.js <app-id> <patch|minor|major|build> [ios|android|both]');
  process.exit(1);
}

const platform = platformArg || 'both';

if (!['ios', 'android', 'both'].includes(platform)) {
  console.error(`Unknown platform: ${platform}. Use: ios, android, both`);
  process.exit(1);
}

const versionPath = path.resolve(__dirname, `../../../.msd/versions/${appId}/version.json`);

if (!fs.existsSync(versionPath)) {
  console.error(`version.json not found at ${versionPath}`);
  console.error('Run: mkdir -p .msd/versions/<app-id> && node scripts/init-version.js <app-id>');
  process.exit(1);
}

const version = JSON.parse(fs.readFileSync(versionPath, 'utf8'));

// Per-platform semver: fall back to top-level semver if not present
const iosSemver = (version.ios && version.ios.semver) || version.semver;
const androidSemver = (version.android && version.android.semver) || version.semver;

const currentBuild = parseInt(version.ios.CFBundleVersion, 10);
const currentCode = parseInt(version.android.versionCode, 10);

function bumpSemver(semver, type) {
  const [maj, min, pat] = semver.split('.').map(Number);
  switch (type) {
    case 'major': return { major: maj + 1, minor: 0, patch: 0 };
    case 'minor': return { major: maj, minor: min + 1, patch: 0 };
    case 'patch': return { major: maj, minor: min, patch: pat + 1 };
    case 'build': return { major: maj, minor: min, patch: pat };
    default:
      console.error(`Unknown bump type: ${type}. Use: patch, minor, major, build`);
      process.exit(1);
  }
}

// Archive current version in history
const historyEntry = {
  semver: version.semver,
  iosBuild: version.ios.CFBundleVersion,
  androidCode: version.android.versionCode,
  date: version.lastBumpedAt
};

let newIos = { ...version.ios };
let newAndroid = { ...version.android };
let newTopSemver = version.semver;

if (platform === 'both') {
  const { major, minor, patch } = bumpSemver(version.semver, bumpType);
  const newSemver = `${major}.${minor}.${patch}`;
  const newBuild = currentBuild + 1;
  const newCode = currentCode + 1;

  newIos = { semver: newSemver, CFBundleShortVersionString: newSemver, CFBundleVersion: String(newBuild) };
  newAndroid = { semver: newSemver, versionName: newSemver, versionCode: newCode };
  newTopSemver = newSemver;

  console.log(`✅ Bumped iOS + Android: ${version.semver} → ${newSemver} (iOS build: ${newBuild}, Android versionCode: ${newCode})`);

} else if (platform === 'ios') {
  const { major, minor, patch } = bumpSemver(iosSemver, bumpType);
  const newSemver = `${major}.${minor}.${patch}`;
  const newBuild = currentBuild + 1;

  newIos = { semver: newSemver, CFBundleShortVersionString: newSemver, CFBundleVersion: String(newBuild) };
  newAndroid = { semver: androidSemver, ...version.android };
  newTopSemver = newSemver;

  console.log(`✅ Bumped iOS only: ${iosSemver} → ${newSemver} (build: ${newBuild}) | Android unchanged: ${androidSemver} (versionCode: ${currentCode})`);

} else if (platform === 'android') {
  const { major, minor, patch } = bumpSemver(androidSemver, bumpType);
  const newSemver = `${major}.${minor}.${patch}`;
  const newCode = currentCode + 1;

  newAndroid = { semver: newSemver, versionName: newSemver, versionCode: newCode };
  newIos = { semver: iosSemver, ...version.ios };
  newTopSemver = newSemver;

  console.log(`✅ Bumped Android only: ${androidSemver} → ${newSemver} (versionCode: ${newCode}) | iOS unchanged: ${iosSemver} (build: ${currentBuild})`);
}

const updated = {
  ...version,
  semver: newTopSemver,
  ios: newIos,
  android: newAndroid,
  lastBumpedAt: new Date().toISOString(),
  history: [historyEntry, ...(version.history || [])].slice(0, 50)
};

fs.writeFileSync(versionPath, JSON.stringify(updated, null, 2) + '\n');

console.log('');
console.log(`Next: node scripts/sync-build-numbers.js ${appId}`);
