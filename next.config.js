/** @type {import('next').NextConfig} */
const domain = process.env.REPLIT_DOMAINS?.split(',')[0]?.trim();

const nextConfig = {
  // Expose the public-facing app URL to client-side code.
  // This is needed because the Replit preview iframe loads the app at
  // http://0.0.0.0:5000 (internal), so relative URLs don't work for OAuth.
  env: {
    NEXT_PUBLIC_APP_URL: domain ? `https://${domain}` : '',
  },
  async headers() {
    return []
  },
}

module.exports = nextConfig
