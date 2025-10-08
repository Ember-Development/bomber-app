// AI generated something, supposedly will help with monorepo packages
import { resolve, join } from 'path';
import { getDefaultConfig } from '@expo/metro-config';

// monorepo root
const projectRoot = __dirname;
const monorepoRoot = resolve(__dirname, '../../..');

const config = getDefaultConfig(projectRoot);

// Tell Metro to also watch the monorepo root for node_modules
config.watchFolders = [
  join(monorepoRoot, 'node_modules'), // root node_modules (where hoisted deps like color2k may live)
  monorepoRoot,
];

// // Block duplicate modules from being resolved (helps avoid version mismatches)
// config.resolver.blockList = require('metro-config/src/defaults/exclusionList')([
//   // if you're on Windows or have different temp folders, adapt these
//   /.*\/\.pnpm\/.*/,
//   /.*\/node_modules\/.*\/node_modules\/react-native\/.*/, // Prevent metro from resolving nested react-native
// ]);

// Extra: tell Metro to resolve modules from the root
config.resolver.nodeModulesPaths = [
  join(monorepoRoot, 'node_modules'),
  join(projectRoot, 'node_modules'),
];

export default config;
