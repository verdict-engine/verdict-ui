/** @type {import('next').NextConfig} */

// Empty for local dev and a root / custom-domain deploy; set to "/verdict-ui" by the
// GitHub Pages build so a project Pages site (…github.io/verdict-ui/) resolves its assets.
const basePath = process.env.NEXT_PUBLIC_BASE_PATH || "";

const nextConfig = {
  reactStrictMode: true,
  // Static HTML export for GitHub Pages (no Node server) — emits to ./out on `next build`.
  output: "export",
  // GitHub Pages has no image optimizer, so serve images as-is.
  images: { unoptimized: true },
  // Export each route as a directory with index.html, so /docs/ works without a server rewrite.
  trailingSlash: true,
  ...(basePath ? { basePath, assetPrefix: basePath } : {}),
};

export default nextConfig;
