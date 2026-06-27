// next.config.js
const withNextIntl = require('next-intl/plugin')();

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: [],
  },
  // ✅ Configuration Vercel pour les pages 404
  trailingSlash: false,
  async rewrites() {
    return [
      {
        source: '/:path((?!fr|en|ar|api|_next|favicon.ico|.*\\..*).*)',
        destination: '/fr/404',
      },
    ];
  },
  async redirects() {
    return [
      {
        source: '/:path((?!fr|en|ar|api|_next|favicon.ico|.*\\..*).*)',
        destination: '/fr/404',
        permanent: false,
      },
    ];
  },
};

module.exports = withNextIntl(nextConfig);
