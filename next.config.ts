import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // `/index` cannot be an app-router directory: normalizePagePath escapes it
  // to `/index/index` to keep it clear of the root page, which also
  // normalizes to `/index` — and Next 16's segment-cache output writes and
  // reads that escaped path inconsistently, so the build fails looking for
  // .next/server/app/index/index.segments/__PAGE__.segment.rsc.
  //
  // The page lives at app/archive instead, and this rewrite keeps the public
  // URL as /index. Nothing linking to /index has to change.
  async rewrites() {
    return [{ source: "/index", destination: "/archive" }];
  },
};

export default nextConfig;
