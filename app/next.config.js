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
      // Add IgnorePlugin to prevent HeartbeatWorker from being processed by webpack.
      // This is an aggressive approach, but it should stop Terser from seeing the file.
      config.plugins.push(
        new webpack.IgnorePlugin({
          resourceRegExp: /HeartbeatWorker\.js$/,
          contextRegExp: /@sherrylinks\/sdk/,
        }),
      );
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
