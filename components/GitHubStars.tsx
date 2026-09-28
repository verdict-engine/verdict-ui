"use client";

import { useEffect, useState } from "react";
import { REPO_URL } from "@/lib/site";

// The site is a static export (no server), so the count is fetched in the browser from the public
// GitHub API on load. Unauthenticated requests are rate-limited per visitor IP (60/hr) — plenty for
// a docs site — and any failure (rate limit, offline, blocked network) simply keeps the "Star" label.
const REPO = REPO_URL.replace(/^https?:\/\/github\.com\//, "");
const API = `https://api.github.com/repos/${REPO}`;

function formatStars(n: number): string {
  if (n < 1000) return String(n);
  const k = n / 1000;
  return `${k >= 10 ? Math.round(k) : k.toFixed(1)}k`;
}

export function GitHubStars() {
  const [label, setLabel] = useState("Star");

  useEffect(() => {
    let alive = true;
    fetch(API, { headers: { Accept: "application/vnd.github+json" } })
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error(`github ${r.status}`))))
      .then((data: { stargazers_count?: number }) => {
        if (alive && typeof data.stargazers_count === "number") {
          setLabel(formatStars(data.stargazers_count));
        }
      })
      .catch(() => {
        // Keep the "Star" call-to-action label on any failure.
      });
    return () => {
      alive = false;
    };
  }, []);

  return (
    <a
      className="ghpill mono"
      href={REPO_URL}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={`Verdict on GitHub — ${label === "Star" ? "star the repo" : `${label} stars`}`}
    >
      ★ {label}
    </a>
  );
}
