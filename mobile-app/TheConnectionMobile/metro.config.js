const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

const projectRoot = __dirname;
const workspaceRoot = path.resolve(projectRoot, '../..');

const config = getDefaultConfig(projectRoot);

// Watch the entire workspace for changes (including shared/)
config.watchFolders = [workspaceRoot];

// Resolve node_modules from both project and workspace root
config.resolver.nodeModulesPaths = [
  path.resolve(projectRoot, 'node_modules'),
  path.resolve(workspaceRoot, 'node_modules'),
];

// Ensure proper platform support
config.resolver.platforms = ['ios', 'android', 'native', 'web'];

module.exports = config;
