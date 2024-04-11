//for vercel
/** @type {import('next').NextConfig} */
const nextConfig = {
  env: {
    NEXT_PUBLIC_API_URL: ''
  },
  images: {
    domains: [
      'lh3.googleusercontent.com',
      'oaidalleapiprodscus.blob.core.windows.net',
    ],
  }
}
export default nextConfig;

// //for tauri use this part:
// /** @type {import('next').NextConfig} */
// const nextConfig = {
//   env: {
//     NEXT_PUBLIC_API_URL: 'http://localhost:6677'
//   },
//   ...(process.env.NODE_ENV === 'production' && {
//     output: 'export',
//   }),
// }
// export default nextConfig;