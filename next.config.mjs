/** @type {import("next").NextConfig} */
const nextConfig = {
  experimental: {
    serverActions: {
      bodySizeLimit: "55mb",
    },
  },

  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "abjxeaxqieythvaomavm.supabase.co",
        port: "",
        pathname: "/storage/v1/object/public/**",
      },
    ],
  },
};

export default nextConfig;
