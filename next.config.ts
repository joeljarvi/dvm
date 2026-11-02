import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    viewTransition: true,
  },

  async redirects() {
    return [
      { source: "/index", destination: "/archive", permanent: true },

      ...["www.danielvonmalmborg.com", "dvm-zeta.vercel.app"].map((host) => ({
        source: "/:path*",
        has: [{ type: "host" as const, value: host }],
        destination: "https://danielvonmalmborg.com/:path*",
        permanent: true,
      })),
    ];
  },
};

export default nextConfig;
