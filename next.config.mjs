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
        hostname: "*.public.blob.vercel-storage.com",
        port: "",
      },
      {
        protocol: "https",
        hostname: "cdn.discordapp.com",
        port: "",
      },
    ],
  },
};

export default nextConfig;
