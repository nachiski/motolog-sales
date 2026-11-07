import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Use the TypeScript API in-process so the build works in restricted
  // environments that block spawning the TypeScript CLI.
  typescript: { ignoreBuildErrors: false },
  experimental: { useTypeScriptCli: false },
};

export default nextConfig;
