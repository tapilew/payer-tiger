throw new Error("TEST: next.config.js is loaded!");

const path = require("node:path");

/** @type {import('next').NextConfig} */
const nextConfig = {
	webpack: (config, { isServer }) => {
		// Alias the problematic worker file from @sherrylinks/sdk to an empty module.
		// This prevents the file with the 'export {}' from being processed by
		// webpack and Terser, which was causing the build to fail.
		if (!isServer) {
			const emptyModule = path.resolve(__dirname, "src/lib/empty.js");
			const workerPath = "@sherrylinks/sdk/dist/esm/chunks/HeartbeatWorker.js";
			config.resolve.alias[workerPath] = emptyModule;
		}

		return config;
	},
};

module.exports = nextConfig;
