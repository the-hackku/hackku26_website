/** @type {import('next').NextConfig} */
const nextConfig = {
  async redirects() {
    return [
      {
        source: "/mlh/code-of-conduct",
        destination: "https://github.com/MLH/mlh-policies/blob/main/code-of-conduct.md",
        permanent: true,
      }
    ]
  }, 

  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "my-blob-store.public.blob.vercel-storage.com",
        port: "",
      },
    ],
  },
};

export default nextConfig;
