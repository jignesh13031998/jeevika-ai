/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  env: {
    CIW_PREFER_LIVE: process.env.CIW_PREFER_LIVE || '0',
  },
}

module.exports = nextConfig
