const path = require('node:path');

/** @type {import('next').NextConfig} */
const nextConfig = {
	webpack: (config, { isServer }) => {
		// Alias the problematic worker file from @sherrylinks/sdk to an empty module.
		// This prevents the file with the 'export {}' from being processed by
		// webpack and Terser, which was causing the build to fail.
		if (!isServer) {
			const emptyModule = path.resolve(__dirname, 'src/lib/empty.js');
			const workerPath = '@sherrylinks/sdk/dist/esm/chunks/HeartbeatWorker.js';
			config.resolve.alias[workerPath] = emptyModule;
			// Add broader alias just in case
			config.resolve.alias['@sherrylinks/sdk/dist/esm/chunks/HeartbeatWorker'] = emptyModule;
			console.log('Aliased', workerPath, 'and .js-less version to', emptyModule);
			console.log('Current alias map:', config.resolve.alias);
			// Add null-loader rule for HeartbeatWorker.js
			config.module.rules.push({
				test: /HeartbeatWorker\.js$/,
				use: 'null-loader',
			});
		}
		return config;
	},
};

console.log('Loaded next.config.js from', __dirname);

module.exports = nextConfig;
