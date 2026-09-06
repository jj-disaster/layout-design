import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "export",
  devIndicators: false,
  // Static export has no image-optimization server: serve originals.
  images: { unoptimized: true },
  // Expose the Pages base path so raw <img>/<video>/<audio> URLs resolve.
  // See withBasePath() in src/lib/media.ts.
  env: { NEXT_PUBLIC_BASE_PATH: process.env.PAGES_BASE_PATH ?? "" },
  ...(process.env.PAGES_BASE_PATH
    ? { basePath: process.env.PAGES_BASE_PATH }
    : {}),
};

export default nextConfig;