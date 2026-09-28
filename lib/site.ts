/**
 * Site-wide constants and the deploy base path.
 *
 * REPO_URL is the project's public GitHub repository (powers the nav star pill and links).
 *
 * BASE_PATH is the sub-path the site is served under. It is empty for local dev and a root/custom-domain
 * deploy, and set to "/verdict-ui" by the GitHub Pages build (NEXT_PUBLIC_BASE_PATH) because a project
 * Pages site lives at https://<org>.github.io/verdict-ui/. Internal absolute links are wrapped in
 * withBase() so they resolve under that sub-path; next.config.mjs applies the same value to framework
 * assets and routes.
 */
export const REPO_URL = "https://github.com/verdict-engine/verdict-engine";

export const BASE_PATH = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

/** Prefix an internal absolute path (e.g. "/docs") with BASE_PATH. Hash-only and external links pass through. */
export function withBase(path: string): string {
  if (!BASE_PATH || path.startsWith("#") || /^[a-z]+:/i.test(path)) return path;
  return `${BASE_PATH}${path.startsWith("/") ? "" : "/"}${path}`;
}
