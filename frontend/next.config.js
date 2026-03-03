/** @type {import('next').NextConfig} */
const nextConfig = {
  // Only use 'export' for production builds (static site generation)
  // In development, we don't set output so rewrites work
  ...(process.env.NODE_ENV === 'production' && !process.env.BUILD_STANDALONE
    ? { output: 'export' }
    : {}),
  ...(process.env.BUILD_STANDALONE === 'true' ? { output: 'standalone' } : {}),
  trailingSlash: true,
  basePath: process.env.NODE_ENV === 'production' ? '/taskReporter' : '',
  images: {
    unoptimized: true,
  },
  // For local development with Flask backend
  async rewrites() {
    return process.env.NODE_ENV === 'development'
      ? [
          {
            source: '/api/:path*',
            destination: 'http://localhost:5001/api/:path*',
          },
        ]
      : [];
  },
};

module.exports = nextConfig;
