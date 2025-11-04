import withPWA from 'next-pwa';

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,

<<<<<<< HEAD
  typescript: {
    ignoreBuildErrors: true,
  },

=======
>>>>>>> 3a379c0 (Add PWA support with offline caching and updated manifest/layout configuration)
  images: {
    unoptimized: true,
  },

<<<<<<< HEAD
=======
  typescript: {
    ignoreBuildErrors: true,
  },

>>>>>>> 3a379c0 (Add PWA support with offline caching and updated manifest/layout configuration)
  eslint: {
    ignoreDuringBuilds: true,
  },

  experimental: {
<<<<<<< HEAD
    appDir: true, // keep this only if you're using the /app directory (Next 13+)
  },

  output: 'standalone', // recommended for Vercel + future local deployments
};

export default nextConfig;
=======
    appDir: true,
  },

  output: 'standalone',

  // ✅ Enhanced PWA configuration
  pwa: {
    dest: 'public',
    register: true,
    skipWaiting: true,
    disable: process.env.NODE_ENV === 'development',
    runtimeCaching: [
      // Cache Google Fonts
      {
        urlPattern: /^https:\/\/fonts\.(?:gstatic|googleapis)\.com\/.*/i,
        handler: 'CacheFirst',
        options: {
          cacheName: 'google-fonts',
          expiration: { maxEntries: 20, maxAgeSeconds: 31536000 },
        },
      },
      // Cache CDN assets (JS, CSS, icons, etc.)
      {
        urlPattern: /^https:\/\/cdn\.jsdelivr\.net\/.*/i,
        handler: 'CacheFirst',
        options: {
          cacheName: 'cdn-assets',
          expiration: { maxEntries: 30, maxAgeSeconds: 31536000 },
        },
      },
      // Cache all other requests (pages, API responses, images)
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
};

export default withPWA(nextConfig);
>>>>>>> 3a379c0 (Add PWA support with offline caching and updated manifest/layout configuration)
