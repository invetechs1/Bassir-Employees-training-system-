/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  experimental: {
    // Multi-tenant subdomain routing is resolved in middleware; keep serverActions safe.
  },
};

module.exports = nextConfig;
