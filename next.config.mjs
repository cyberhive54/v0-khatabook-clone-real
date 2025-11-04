/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,

  typescript: {
    ignoreBuildErrors: true,
  },

  images: {
    unoptimized: true,
  },

  eslint: {
    ignoreDuringBuilds: true,
  },

  experimental: {
    appDir: true, // keep this only if you're using the /app directory (Next 13+)
  },

  output: 'standalone', // recommended for Vercel + future local deployments
};

export default nextConfig;
