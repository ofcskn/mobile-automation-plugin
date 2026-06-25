#!/usr/bin/env node
/**
 * discover-apps.js
 * Scans a directory for Expo/React Native apps and prints their metadata.
 * Usage: node discover-apps.js /path/to/projects/directory
 */

const fs = require('fs');
const path = require('path');

const [,, scanDir] = process.argv;
if (!scanDir) {
  console.error('Usage: node discover-apps.js /path/to/projects/directory');
  process.exit(1);
}

const absDir = path.resolve(scanDir);
if (!fs.existsSync(absDir)) {
  console.error(`Directory not found: ${absDir}`);
  process.exit(1);
}

console.log(`\nScanning for Expo/React Native apps in: ${absDir}\n`);

const found = [];

function scan(dir, depth) {
  if (depth > 3) return;
  let entries;
  try { entries = fs.readdirSync(dir); } catch { return; }
  if (entries.includes('node_modules') && depth > 0) return;

  const hasAppJson = entries.includes('app.json');
  const hasPackageJson = entries.includes('package.json');

  if (hasAppJson && hasPackageJson) {
    try {
      const appJson = JSON.parse(fs.readFileSync(path.join(dir, 'app.json'), 'utf8'));
      const pkg = JSON.parse(fs.readFileSync(path.join(dir, 'package.json'), 'utf8'));
      const expo = appJson.expo || {};
      found.push({
        path: dir,
        name: expo.name || pkg.name || path.basename(dir),
        version: expo.version || pkg.version || '?',
        bundleId: expo.ios?.bundleIdentifier || null,
        androidPkg: expo.android?.package || null,
        hasEas: entries.includes('eas.json'),
      });
      return; // don't recurse into app subdirs
    } catch {}
  }

  for (const entry of entries) {
    if (entry.startsWith('.') || entry === 'node_modules') continue;
    const sub = path.join(dir, entry);
    try {
      if (fs.statSync(sub).isDirectory()) scan(sub, depth + 1);
    } catch {}
  }
}

scan(absDir, 0);

if (found.length === 0) {
  console.log('No Expo/React Native apps found.');
  process.exit(0);
}

console.log(`Found ${found.length} app(s):\n`);
found.forEach((app, i) => {
  console.log(`${i + 1}. ${app.name} (v${app.version})`);
  console.log(`   Path:      ${app.path}`);
  if (app.bundleId)  console.log(`   iOS:       ${app.bundleId}`);
  if (app.androidPkg) console.log(`   Android:   ${app.androidPkg}`);
  console.log(`   EAS:       ${app.hasEas ? '✅' : '❌ (no eas.json)'}`);
  console.log();
});

console.log('To register an app: /msd-init {appId}');
console.log('Then set "path" in .msd/config/{appId}.config.json');
