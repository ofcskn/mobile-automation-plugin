#!/usr/bin/env node
/**
 * validate-metadata.js
 * Usage: node validate-metadata.js <app-id> [--fix-truncate]
 * Validates ALL metadata files against Apple and Google hard character limits.
 * Exits with code 1 if any violation found.
 * MIT License — mobile-store-deploy
 */

const fs = require('fs');
const path = require('path');

const [,, appId, flag] = process.argv;
if (!appId) { console.error('Usage: node validate-metadata.js <app-id>'); process.exit(1); }

const metaRoot = path.resolve(__dirname, `../../../metadata/${appId}`);

// Hard limits — these cause silent store rejection on violation
const APPLE_LIMITS = {
  'name.txt':        { max: 30,   label: 'App Name',        indexed: true  },
  'subtitle.txt':    { max: 30,   label: 'Subtitle',        indexed: true  },
  'keywords.txt':    { max: 100,  label: 'Keywords',        indexed: true  },
  'promotional.txt': { max: 170,  label: 'Promotional Text',indexed: false },
  'description.txt': { max: 4000, label: 'Description',     indexed: false },
  'release_notes.txt':{ max: 4000,label: "What's New",      indexed: false },
};

const GOOGLE_LIMITS = {
  'title.txt':             { max: 30,   label: 'Title',             indexed: true  },
  'short_description.txt': { max: 80,   label: 'Short Description', indexed: true  },
  'full_description.txt':  { max: 4000, label: 'Full Description',  indexed: true  },
  'release_notes.txt':     { max: 500,  label: "What's New",        indexed: false },
};

let errors = 0;
let warnings = 0;

function validateDir(platform, limits, localeDir) {
  const locale = path.basename(localeDir);
  Object.entries(limits).forEach(([filename, rule]) => {
    const filePath = path.join(localeDir, filename);
    if (!fs.existsSync(filePath)) {
      console.warn(`  ⚠️  [${platform}/${locale}] MISSING: ${filename}`);
      warnings++;
      return;
    }
    const content = fs.readFileSync(filePath, 'utf8').trim();
    const len = content.length;
    if (len > rule.max) {
      console.error(`  ❌ [${platform}/${locale}] ${rule.label}: ${len}/${rule.max} chars — OVER BY ${len - rule.max}`);
      if (!rule.indexed) console.error(`     Note: This field is NOT indexed for search.`);
      errors++;
    } else if (len > rule.max * 0.95) {
      console.warn(`  ⚠️  [${platform}/${locale}] ${rule.label}: ${len}/${rule.max} chars — within 5% of limit`);
      warnings++;
    } else {
      console.log(`  ✅ [${platform}/${locale}] ${rule.label}: ${len}/${rule.max} chars`);
    }
    // Apple subtitle-specific check
    if (platform === 'ios' && filename === 'subtitle.txt' && len === 30) {
      console.warn(`     ⚠️  Subtitle is exactly 30 chars — Apple bug may not index last word. Consider -1 char.`);
      warnings++;
    }
    // Keywords comma check
    if (filename === 'keywords.txt') {
      if (content.includes(', ')) {
        console.error(`  ❌ [${platform}/${locale}] Keywords: contains spaces after commas — wastes characters`);
        errors++;
      }
    }
  });
}

console.log(`\n🔍 Validating metadata for app: ${appId}\n`);

// iOS
const iosRoot = path.join(metaRoot, 'ios');
if (fs.existsSync(iosRoot)) {
  console.log('── iOS ──────────────────────────────────────');
  fs.readdirSync(iosRoot).forEach(locale => {
    const localeDir = path.join(iosRoot, locale);
    if (fs.statSync(localeDir).isDirectory()) validateDir('ios', APPLE_LIMITS, localeDir);
  });
}

// Android
const androidRoot = path.join(metaRoot, 'android');
if (fs.existsSync(androidRoot)) {
  console.log('\n── Android ──────────────────────────────────');
  fs.readdirSync(androidRoot).forEach(locale => {
    const localeDir = path.join(androidRoot, locale);
    if (fs.statSync(localeDir).isDirectory()) validateDir('android', GOOGLE_LIMITS, localeDir);
  });
}

console.log(`\n${'─'.repeat(50)}`);
if (errors === 0) {
  console.log(`✅ All metadata valid. ${warnings} warning(s).`);
  process.exit(0);
} else {
  console.error(`❌ ${errors} error(s), ${warnings} warning(s). Fix before uploading.`);
  process.exit(1);
}
