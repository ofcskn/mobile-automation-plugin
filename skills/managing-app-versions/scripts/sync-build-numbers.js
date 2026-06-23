#!/usr/bin/env node
/**
 * sync-build-numbers.js
 * Usage: node sync-build-numbers.js <app-id> [--project-root /path/to/app]
 * Syncs version.json values into app.json (Expo), ios/Info.plist, android/build.gradle
 * MIT License — mobile-store-deploy
 */

const fs = require('fs');
const path = require('path');

const [,, appId, projectRootFlag, projectRootValue] = process.argv;
if (!appId) {
  console.error('Usage: node sync-build-numbers.js <app-id> [--project-root /path/to/app]');
  process.exit(1);
}

const pluginRoot = path.resolve(__dirname, '../../../');
const versionPath = path.join(pluginRoot, 'versions', appId, 'version.json');

if (!fs.existsSync(versionPath)) {
  console.error(`version.json not found: ${versionPath}`);
  console.error('Run bump-version.js first, or initialize versions/<app-id>/version.json');
  process.exit(1);
}

const version = JSON.parse(fs.readFileSync(versionPath, 'utf8'));
const { CFBundleShortVersionString, CFBundleVersion } = version.ios;
const { versionName, versionCode } = version.android;

// Project root defaults to cwd; override with --project-root flag
const projectRoot = (projectRootFlag === '--project-root' && projectRootValue)
  ? path.resolve(projectRootValue)
  : process.cwd();

let synced = 0;
let skipped = 0;

function syncAppJson() {
  const appJsonPath = path.join(projectRoot, 'app.json');
  if (!fs.existsSync(appJsonPath)) { skipped++; return; }
  const appJson = JSON.parse(fs.readFileSync(appJsonPath, 'utf8'));
  if (!appJson.expo) { skipped++; return; }
  appJson.expo.version = CFBundleShortVersionString;
  if (!appJson.expo.ios) appJson.expo.ios = {};
  appJson.expo.ios.buildNumber = CFBundleVersion;
  if (!appJson.expo.android) appJson.expo.android = {};
  appJson.expo.android.versionCode = versionCode;
  fs.writeFileSync(appJsonPath, JSON.stringify(appJson, null, 2) + '\n');
  console.log(`  app.json: version=${CFBundleShortVersionString}, ios.buildNumber=${CFBundleVersion}, android.versionCode=${versionCode}`);
  synced++;
}

function syncInfoPlist() {
  // Find Info.plist under ios/
  const iosDir = path.join(projectRoot, 'ios');
  if (!fs.existsSync(iosDir)) { skipped++; return; }
  const matches = fs.readdirSync(iosDir).filter(d => {
    const p = path.join(iosDir, d, 'Info.plist');
    return fs.existsSync(p);
  });
  if (matches.length === 0) { skipped++; return; }
  matches.forEach(dir => {
    const plistPath = path.join(iosDir, dir, 'Info.plist');
    let content = fs.readFileSync(plistPath, 'utf8');
    content = content.replace(
      /(<key>CFBundleShortVersionString<\/key>\s*<string>)[^<]*/,
      `$1${CFBundleShortVersionString}`
    );
    content = content.replace(
      /(<key>CFBundleVersion<\/key>\s*<string>)[^<]*/,
      `$1${CFBundleVersion}`
    );
    fs.writeFileSync(plistPath, content);
    console.log(`  ${dir}/Info.plist: ${CFBundleShortVersionString} (${CFBundleVersion})`);
    synced++;
  });
}

function syncBuildGradle() {
  const gradlePath = path.join(projectRoot, 'android', 'app', 'build.gradle');
  if (!fs.existsSync(gradlePath)) { skipped++; return; }
  let content = fs.readFileSync(gradlePath, 'utf8');
  content = content.replace(/versionCode\s+\d+/, `versionCode ${versionCode}`);
  content = content.replace(/versionName\s+"[^"]*"/, `versionName "${versionName}"`);
  fs.writeFileSync(gradlePath, content);
  console.log(`  android/app/build.gradle: versionCode=${versionCode}, versionName=${versionName}`);
  synced++;
}

console.log(`\nSyncing ${appId} version: ${version.semver} (iOS: ${CFBundleVersion}, Android: ${versionCode})\n`);

syncAppJson();
syncInfoPlist();
syncBuildGradle();

console.log(`\n${'─'.repeat(50)}`);
if (synced === 0 && skipped > 0) {
  console.log('No platform files found in current directory.');
  console.log('   Pass --project-root /path/to/your/app if the app is elsewhere.');
} else {
  console.log(`Synced ${synced} file(s). ${skipped} platform(s) not found (OK if not present).`);
}
console.log(`\nNext: git commit -am "chore: bump version to ${version.semver}"`);
