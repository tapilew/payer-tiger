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
      // Add rule to handle HeartbeatWorker as raw asset to avoid Terser processing
      config.module.rules.push({
        test: /HeartbeatWorker\.js$/,
        type: 'asset/resource',
        generator: {
          filename: 'static/js/[name].[contenthash][ext]',
        },
      });

      // Handle Sherry SDK HeartbeatWorker minification issue
      if (config.optimization.minimizer) {
        config.optimization.minimizer = config.optimization.minimizer.map((minimizer) => {
          if (minimizer.constructor.name === 'TerserPlugin') {
            return new minimizer.constructor({
              ...minimizer.options,
              test: /\.js(\?.*)?$/i,
              exclude: [
                /HeartbeatWorker/i,
                /\.worker\.js$/i,
                /node_modules\/@sherrylinks\/sdk.*HeartbeatWorker.*\.js$/i,
              ],
              terserOptions: {
                parse: {
                  ecma: 2020,
                },
                compress: {
                  ...minimizer.options.terserOptions?.compress,
                  module: false,
                  drop_console: false,
                },
                mangle: {
                  safari10: true,
                },
                format: {
                  comments: false,
                },
              },
            });
          }
          return minimizer;
        });
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
