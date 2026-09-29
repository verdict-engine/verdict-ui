"use client";

import { useEffect, useState } from "react";
import { withBase } from "@/lib/site";

/** Hamburger menu for small screens: the nav links collapse into a dropdown instead of being clipped
 * or hidden. Closes on link click, on Escape, or when the scrim behind it is tapped. */
export function MobileMenu({ links }: { links: { href: string; label: string }[] }) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open]);

  return (
    <div className="mnav">
      <button
        type="button"
        className="mnav-btn"
        aria-label={open ? "Close menu" : "Open menu"}
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
      >
        <span className={`mnav-icon${open ? " x" : ""}`} aria-hidden>
          <span />
          <span />
          <span />
        </span>
      </button>
      {open && (
        <>
          <button type="button" className="mnav-scrim" aria-label="Close menu" onClick={() => setOpen(false)} />
          <nav className="mnav-panel">
            {links.map((l) => (
              <a key={l.href} href={withBase(l.href)} onClick={() => setOpen(false)}>
                {l.label}
              </a>
            ))}
          </nav>
        </>
      )}
    </div>
  );
}
