#!/usr/bin/env node

/**
 * Script to update the latest app version for the update prompt system
 * Usage: node scripts/update-version.js 1.0.11
 */

const fs = require('fs');
const path = require('path');

const newVersion = process.argv[2];

if (!newVersion) {
  console.error('❌ Please provide a version number');
  console.log('Usage: node scripts/update-version.js 1.0.11');
  process.exit(1);
}

// Validate version format (basic semver check)
const versionRegex = /^\d+\.\d+\.\d+$/;
if (!versionRegex.test(newVersion)) {
  console.error('❌ Invalid version format. Use format: X.Y.Z (e.g., 1.0.11)');
  process.exit(1);
}

console.log(`🔄 Updating latest app version to ${newVersion}...`);

// Update app.config.js
const appConfigPath = path.join(__dirname, '../apps/mobile/app.config.js');
try {
  const appConfig = fs.readFileSync(appConfigPath, 'utf8');
  const updatedConfig = appConfig.replace(
    /version:\s*['"][^'"]*['"]/,
    `version: '${newVersion}'`
  );
  fs.writeFileSync(appConfigPath, updatedConfig);
  console.log('✅ Updated app.config.js');
} catch (error) {
  console.error('❌ Failed to update app.config.js:', error.message);
}

// Update package.json version (if it exists)
const packageJsonPath = path.join(__dirname, '../apps/mobile/package.json');
try {
  if (fs.existsSync(packageJsonPath)) {
    const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
    packageJson.version = newVersion;
    fs.writeFileSync(
      packageJsonPath,
      JSON.stringify(packageJson, null, 2) + '\n'
    );
    console.log('✅ Updated package.json');
  }
} catch (error) {
  console.error('❌ Failed to update package.json:', error.message);
}

console.log(`\n🎉 Version updated to ${newVersion}!`);
console.log('\n📋 Next steps:');
console.log('1. Set LATEST_APP_VERSION environment variable in your .env file');
console.log(`   LATEST_APP_VERSION=${newVersion}`);
console.log('2. Deploy your API with the new environment variable');
console.log('3. Build and submit your app to the App Store');
console.log('4. Users with older versions will see the update prompt!');
