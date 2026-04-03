import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  typedRoutes: true,
  serverExternalPackages: [
    "tree-sitter",
    "tree-sitter-javascript",
    "tree-sitter-typescript",
    "tree-sitter-python",
    "tree-sitter-c-sharp"
  ],
  turbopack: {
    root: process.cwd()
  }
};

export default nextConfig;
