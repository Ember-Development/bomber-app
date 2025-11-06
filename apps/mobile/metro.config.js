const { getDefaultConfig } = require(`@expo/metro-config`);
const path = require('path');

const projectRoot = __dirname;
const monorepoRoot = path.resolve(__dirname, '../..');

const config = getDefaultConfig(projectRoot);

config.resolver.unstable_enableSymlinks = true;

// Tell Metro to watch the monorepo root for packages
config.watchFolders = [path.join(monorepoRoot, 'node_modules'), monorepoRoot];

// Tell Metro to resolve modules from both root and project node_modules
config.resolver.nodeModulesPaths = [
  path.join(monorepoRoot, 'node_modules'),
  path.join(projectRoot, 'node_modules'),
];

module.exports = config;
