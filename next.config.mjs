//for vercel
/** @type {import('next').NextConfig} */
const nextConfig = {
  env: {
    NEXT_PUBLIC_API_URL: ''
  }
}

export default nextConfig;

//for tauri use this part:
// /** @type {import('next').NextConfig} */
// const nextConfig = {
//   env: {
//     NEXT_PUBLIC_API_URL: process.env.NODE_ENV === 'development' ? 'http://localhost:3100' : 'http://localhost:6677'
//   },
//   ...(process.env.NODE_ENV === 'production' && {
//     output: 'export',
//   }),
// }

// export default nextConfig;