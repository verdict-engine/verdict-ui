"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { search, type SearchResult } from "@/lib/search";

export function DocSearch() {
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState("");
  const [active, setActive] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  // ⌘K / Ctrl+K opens the palette from anywhere; Esc closes it.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setOpen((v) => !v);
      } else if (e.key === "Escape") {
        setOpen(false);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  useEffect(() => {
    if (open) {
      setQ("");
      setActive(0);
      requestAnimationFrame(() => inputRef.current?.focus());
    }
  }, [open]);

  const results = useMemo(() => search(q, 10), [q]);
  useEffect(() => setActive(0), [q]);

  const go = (item: SearchResult | undefined) => {
    if (!item) return;
    setOpen(false);
    // Carry the query so the landing page can flash-highlight the matched words in that section.
    const [path, hash] = item.href.split("#");
    const hl = q.trim() ? `?hl=${encodeURIComponent(q.trim())}` : "";
    window.location.href = `${path}${hl}${hash ? `#${hash}` : ""}`;
  };

  const onInputKey = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActive((a) => Math.min(a + 1, results.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActive((a) => Math.max(a - 1, 0));
    } else if (e.key === "Enter") {
      e.preventDefault();
      go(results[active]);
    }
  };

  return (
    <>
      <button type="button" className="doc-search-btn" onClick={() => setOpen(true)} aria-label="Search documentation">
        <span className="doc-search-ic" aria-hidden>⌕</span>
        <span className="doc-search-txt">Search</span>
        <kbd className="doc-search-kbd mono">⌘K</kbd>
      </button>

      {open && (
        <div className="doc-search-overlay" role="dialog" aria-modal="true" aria-label="Search" onClick={() => setOpen(false)}>
          <div className="doc-search-panel" onClick={(e) => e.stopPropagation()}>
            <input
              ref={inputRef}
              className="doc-search-input"
              placeholder="Search the docs — try “stop fraud rings”, “how fast”, “who changed a setting”…"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              onKeyDown={onInputKey}
            />
            <ul className="doc-search-results">
              {results.length === 0 ? (
                <li className="doc-search-empty">No matches for “{q}”.</li>
              ) : (
                results.map((it, i) => (
                  <li key={`${it.href}-${i}`}>
                    <button
                      type="button"
                      className={`doc-search-row ${i === active ? "on" : ""}`}
                      onMouseEnter={() => setActive(i)}
                      onClick={() => go(it)}
                    >
                      <span className={`doc-search-kind k-${it.kind.toLowerCase()}`}>{it.kind}</span>
                      <span className="doc-search-main">
                        <span className="doc-search-title">
                          <span className="mono">{it.title}</span>
                          {it.section ? <span className="doc-search-crumb">{it.section}</span> : null}
                        </span>
                        <span className="doc-search-snip">{it.snippet}</span>
                      </span>
                    </button>
                  </li>
                ))
              )}
            </ul>
            <div className="doc-search-foot mono">
              <span><kbd>↑</kbd><kbd>↓</kbd> navigate</span>
              <span><kbd>↵</kbd> open</span>
              <span><kbd>esc</kbd> close</span>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
