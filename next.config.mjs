/** @type {import('next').NextConfig} */
const nextConfig = {
    env: {
      NEXT_PUBLIC_API_URL: process.env.NODE_ENV === 'development' ? 'http://localhost:3100' : 'http://localhost:6677'
    },
    ...(process.env.NODE_ENV === 'production' && {
      output: 'export',
    }),
  }

export default nextConfig;