import withPWA from 'next-pwa';

/** @type {import('next').NextConfig} */
const nextConfig = {
  // ✅ Force Next.js to use Webpack instead of Turbopack
  turbopack: {}, // explicitly disable custom Turbopack config
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

  // ✅ PWA configuration (works only with Webpack)
  pwa: {
    dest: 'public',
    register: true,
    skipWaiting: true,
    disable: process.env.NODE_ENV === 'development',
    runtimeCaching: [
      {
        urlPattern: /^https:\/\/fonts\.(?:gstatic|googleapis)\.com\/.*/i,
        handler: 'CacheFirst',
        options: {
          cacheName: 'google-fonts',
          expiration: { maxEntries: 20, maxAgeSeconds: 31536000 },
        },
      },
      {
        urlPattern: /^https:\/\/cdn\.jsdelivr\.net\/.*/i,
        handler: 'CacheFirst',
        options: {
          cacheName: 'cdn-assets',
          expiration: { maxEntries: 30, maxAgeSeconds: 31536000 },
        },
      },
      {
        urlPattern: /^https?.*/i,
        handler: 'NetworkFirst',
        options: {
          cacheName: 'offline-cache',
          networkTimeoutSeconds: 10,
          expiration: { maxEntries: 100, maxAgeSeconds: 7 * 24 * 60 * 60 },
          cacheableResponse: { statuses: [0, 200] },
        },
      },
    ],
  },

  // ✅ Hook to make sure Webpack mode is used
  webpack: (config) => config,
};

export default withPWA(nextConfig);
