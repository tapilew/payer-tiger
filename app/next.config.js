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
      // Completely disable Terser minification to avoid HeartbeatWorker issues
      config.optimization.minimize = false;
      
      // Alternative: If we want to keep minification for other files, replace Terser
      // config.optimization.minimizer = config.optimization.minimizer.filter(
      //   minimizer => minimizer.constructor.name !== 'TerserPlugin'
      // );
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
