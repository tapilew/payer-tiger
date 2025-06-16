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

    // Exclude Sherry SDK worker files from Terser minification
    if (!isServer) {
      for (const minimizer of config.optimization.minimizer) {
        if (minimizer.constructor.name === 'TerserPlugin') {
          minimizer.options.exclude = /HeartbeatWorker/;
          minimizer.options.terserOptions = {
            ...minimizer.options.terserOptions,
            parse: {
              ...minimizer.options.terserOptions?.parse,
              ecma: 2020,
            },
            compress: {
              ...minimizer.options.terserOptions?.compress,
              module: false,
            },
          };
        }
      }
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
