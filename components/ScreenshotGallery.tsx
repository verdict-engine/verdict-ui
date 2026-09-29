"use client";

import { useCallback, useEffect, useState } from "react";
import { withBase } from "@/lib/site";

export interface Shot {
  src: string;
  alt: string;
  caption: string;
}

/** Dashboard screenshot grid with a click-to-zoom lightbox, so the full-resolution capture is legible.
 * Closes on Escape / scrim / ×; arrow keys move between shots. */
export function ScreenshotGallery({ shots }: { shots: Shot[] }) {
  const [active, setActive] = useState<number | null>(null);
  const close = useCallback(() => setActive(null), []);
  const step = useCallback(
    (d: number) => setActive((i) => (i === null ? i : (i + d + shots.length) % shots.length)),
    [shots.length],
  );

  useEffect(() => {
    if (active === null) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
      else if (e.key === "ArrowRight") step(1);
      else if (e.key === "ArrowLeft") step(-1);
    };
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [active, close, step]);

  const open = active !== null ? shots[active] : null;

  return (
    <>
      <div className="dash-shots">
        {shots.map((s, i) => (
          <figure key={s.src}>
            <button type="button" className="shot-btn" onClick={() => setActive(i)} aria-label={`Enlarge: ${s.alt}`}>
              <img src={withBase(s.src)} alt={s.alt} loading="lazy" />
            </button>
            <figcaption>{s.caption}</figcaption>
          </figure>
        ))}
      </div>

      {open && (
        <div className="shot-modal" role="dialog" aria-modal="true" aria-label={open.alt} onClick={close}>
          <button type="button" className="shot-close" aria-label="Close" onClick={close}>
            ×
          </button>
          {shots.length > 1 && (
            <>
              <button
                type="button"
                className="shot-nav prev"
                aria-label="Previous"
                onClick={(e) => {
                  e.stopPropagation();
                  step(-1);
                }}
              >
                ‹
              </button>
              <button
                type="button"
                className="shot-nav next"
                aria-label="Next"
                onClick={(e) => {
                  e.stopPropagation();
                  step(1);
                }}
              >
                ›
              </button>
            </>
          )}
          <figure className="shot-modal-fig" onClick={(e) => e.stopPropagation()}>
            <img src={withBase(open.src)} alt={open.alt} />
            <figcaption>{open.caption}</figcaption>
          </figure>
        </div>
      )}
    </>
  );
}
