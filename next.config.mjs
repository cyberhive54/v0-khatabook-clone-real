/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,

  images: {
    unoptimized: true,
  },

  typescript: {
    ignoreBuildErrors: true,
  },

  output: 'standalone',

  // safe webpack hook
  webpack: (config) => {
    // fix for packages that reference 'fs' in browser builds
    if (!config.resolve) config.resolve = {};
    if (!config.resolve.fallback) config.resolve.fallback = {};
    config.resolve.fallback.fs = false;
    return config;
  },
};

export default nextConfig;
