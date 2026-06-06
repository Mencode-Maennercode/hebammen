import type { NextConfig } from "next";

// Wenn GITHUB_PAGES=true gesetzt ist (GitHub Actions Workflow),
// brauchen wir basePath weil die Seite unter /hebammen/ liegt.
// Mit Custom Domain (IONOS) → GITHUB_PAGES nicht setzen → kein basePath.
const basePath = process.env.GITHUB_PAGES === 'true' ? '/hebammen' : '';

const nextConfig: NextConfig = {
  output: 'export',
  trailingSlash: true,
  reactCompiler: true,
  basePath,
  assetPrefix: basePath,
  // Projektwurzel explizit festlegen. Ohne das wählt Turbopack wegen einer
  // fremden package-lock.json in C:\Users\Heidenreich faelschlich das Home-
  // Verzeichnis als Wurzel und der Build haengt/bricht ab.
  turbopack: {
    root: process.cwd(),
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'static.wixstatic.com',
      },
      {
        protocol: 'https',
        hostname: 'images.pexels.com',
      },
      {
        protocol: 'https',
        hostname: 'videos.pexels.com',
      },
      {
        protocol: 'https',
        hostname: 'drive.google.com',
      },
      {
        protocol: 'https',
        hostname: 'lh3.googleusercontent.com',
      },
    ],
    unoptimized: true,
  },
};

export default nextConfig;
