import { SECURITY_HEADERS } from "./src/lib/security-headers.mjs";

/** @type {import("next").NextConfig} */
const nextConfig = {
  async headers() {
    return [
      {
        source: "/:path*",
        headers: SECURITY_HEADERS,
      },
    ];
  },
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

