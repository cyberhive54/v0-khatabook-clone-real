import withPWA from 'next-pwa';

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,

  images: {
    unoptimized: true,
  },

  typescript: {
    ignoreBuildErrors: true,
  },

  eslint: {
    ignoreDuringBuilds: true,
  },

  experimental: {
    appDir: true,
  },

  output: 'standalone',

  webpack: (config, { isServer }) => {
    if (!isServer) {
      // Fixes packages that depend on `fs` in the browser
      config.resolve.fallback = {
        fs: false,
      };
    }
    return config;
  },

  // ✅ Add PWA support
  pwa: {
    dest: 'public',
    register: true,
    skipWaiting: true,
    disable: process.env.NODE_ENV === 'development',
  },
};

// ✅ Remove turbopack completely — PWA only works with Webpack.
export default withPWA(nextConfig);
