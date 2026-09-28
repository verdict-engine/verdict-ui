"use client";

import { useEffect, useState } from "react";
import { withBase } from "@/lib/site";

const EXTERNAL = [
  { href: "/api-reference", label: "API reference →" },
  { href: "/swagger.html", label: "Swagger UI →" },
  { href: "/openapi.json", label: "OpenAPI spec →" },
  { href: "/llms.txt", label: "llms.txt (for AI) →" },
];

export function DocNav({ sections }: { sections: [string, string][] }) {
  const [active, setActive] = useState(sections[0]?.[0] ?? "");

  useEffect(() => {
    const ids = sections.map(([id]) => id);
    const els = ids
      .map((id) => document.getElementById(id))
      .filter((el): el is HTMLElement => el !== null);
    if (els.length === 0) return;

    const visible = new Set<string>();
    const observer = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) visible.add(e.target.id);
          else visible.delete(e.target.id);
        }
        // Highlight the first section (in document order) currently in view.
        const current = ids.find((id) => visible.has(id));
        if (current) setActive(current);
      },
      // Shrink the viewport: offset the sticky nav at top, and require the section to
      // reach the upper part of the screen before it counts as "current".
      { rootMargin: "-84px 0px -55% 0px", threshold: 0 },
    );
    els.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [sections]);

  return (
    <aside className="doc-nav">
      {sections.map(([id, label]) => (
        <a key={id} href={`#${id}`} className={active === id ? "active" : ""} aria-current={active === id ? "true" : undefined}>
          {label}
        </a>
      ))}
      {EXTERNAL.map((e) => (
        <a key={e.href} className="doc-nav-ext" href={withBase(e.href)}>
          {e.label}
        </a>
      ))}
    </aside>
  );
}
