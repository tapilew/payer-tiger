const path = require('node:path');

/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack: (config, { isServer, webpack }) => {
    // Handle Sherry SDK issues
    config.resolve.fallback = {
      ...config.resolve.fallback,
      fs: false,
      net: false,
      tls: false,
    };

    if (!isServer) {
      // Alias the problematic worker file to an empty module.
      // This prevents the file from being processed by webpack and Terser.
      config.resolve.alias['@sherrylinks/sdk/dist/esm/chunks/HeartbeatWorker.js'] = path.resolve(__dirname, 'src/lib/empty.js');
    }

    return config;
  },
  // Disable ESLint during builds to avoid blocking
  eslint: {
    ignoreDuringBuilds: true,
  },
  // Handle experimental features
  experimental: {
    esmExternals: 'loose',
  },
  // Transpile Sherry SDK
  transpilePackages: ['@sherrylinks/sdk'],
};

module.exports = nextConfig;
