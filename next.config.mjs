import withPWA from 'next-pwa';

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,

  // ✅ Force Webpack usage (next-pwa is not Turbopack compatible yet)
  webpack: (config) => config,
  turbopack: {}, // safely declare an empty config to silence warnings

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

  // ✅ PWA configuration
  pwa: {
    dest: 'public',
    register: true,
    skipWaiting: true,
    disable: process.env.NODE_ENV === 'development',
    runtimeCaching: [
      // Google Fonts
      {
        urlPattern: /^https:\/\/fonts\.(?:gstatic|googleapis)\.com\/.*/i,
        handler: 'CacheFirst',
        options: {
          cacheName: 'google-fonts',
          expiration: {
            maxEntries: 20,
            maxAgeSeconds: 31536000, // 1 year
          },
        },
      },
      // CDN assets (JS, CSS, icons, etc.)
      {
        urlPattern: /^https:\/\/cdn\.jsdelivr\.net\/.*/i,
        handler: 'CacheFirst',
        options: {
          cacheName: 'cdn-assets',
          expiration: {
            maxEntries: 30,
            maxAgeSeconds: 31536000,
          },
        },
      },
      // All other network requests (pages, APIs, images)
      {
        urlPattern: /^https?.*/i,
        handler: 'NetworkFirst',
        options: {
          cacheName: 'offline-cache',
          networkTimeoutSeconds: 10,
          expiration: {
            maxEntries: 100,
            maxAgeSeconds: 7 * 24 * 60 * 60, // 7 days
          },
          cacheableResponse: {
            statuses: [0, 200],
          },
        },
      },
    ],
  },
};

export default withPWA(nextConfig);
