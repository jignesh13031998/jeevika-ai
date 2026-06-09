/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  output: 'export',       // pure static HTML/CSS/JS — no server needed
  trailingSlash: true,
  images: { unoptimized: true },
}

module.exports = nextConfig
