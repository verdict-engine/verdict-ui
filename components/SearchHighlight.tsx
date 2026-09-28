"use client";

import { useEffect } from "react";
import { highlightTerms } from "@/lib/search";

const MAX_MATCHES = 200;
const FLASH_MS = 950; // bright pop on arrival
const SETTLE_MS = 4200; // then a soft highlight lingers before it fades away
const HL_NAME = "verdict-search";
const escape = (t: string) => t.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

// Minimal typing for the CSS Custom Highlight API (not in every TS lib yet) — no `any`.
type HighlightCtor = new (...ranges: Range[]) => unknown;
interface HighlightRegistry {
  set(name: string, highlight: unknown): void;
  delete(name: string): void;
}
const highlightApi = (): { Ctor: HighlightCtor; registry: HighlightRegistry } | null => {
  const Ctor = (window as unknown as { Highlight?: HighlightCtor }).Highlight;
  const registry = (CSS as unknown as { highlights?: HighlightRegistry }).highlights;
  return Ctor && registry ? { Ctor, registry } : null;
};

/** Text nodes under `root`, skipping scripts/styles and already-marked text. */
function textNodes(root: HTMLElement): Text[] {
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, {
    acceptNode(node) {
      const p = node.parentElement;
      if (!p || !node.nodeValue || !node.nodeValue.trim()) return NodeFilter.FILTER_REJECT;
      if (p.tagName === "SCRIPT" || p.tagName === "STYLE" || p.closest("mark.doc-hl")) return NodeFilter.FILTER_REJECT;
      return NodeFilter.FILTER_ACCEPT;
    },
  });
  const out: Text[] = [];
  for (let n = walker.nextNode(); n; n = walker.nextNode()) out.push(n as Text);
  return out;
}

/** Build a Range for every match of `re` under `root` (used by the Highlight API — no DOM mutation). */
function buildRanges(root: HTMLElement, re: RegExp): Range[] {
  const ranges: Range[] = [];
  for (const node of textNodes(root)) {
    const text = node.nodeValue ?? "";
    re.lastIndex = 0;
    for (let m = re.exec(text); m; m = re.exec(text)) {
      if (m[0].length === 0) {
        re.lastIndex++;
        continue;
      }
      const range = document.createRange();
      range.setStart(node, m.index);
      range.setEnd(node, m.index + m[0].length);
      ranges.push(range);
      if (ranges.length >= MAX_MATCHES) return ranges;
    }
  }
  return ranges;
}

/** Fallback for browsers without the Highlight API: wrap matches in <mark> and later unwrap them. */
function markFallback(root: HTMLElement, re: RegExp): () => void {
  const marks: HTMLElement[] = [];
  for (const node of textNodes(root)) {
    const text = node.nodeValue ?? "";
    re.lastIndex = 0;
    if (!re.test(text)) continue;
    re.lastIndex = 0;
    const frag = document.createDocumentFragment();
    let last = 0;
    for (let m = re.exec(text); m; m = re.exec(text)) {
      if (m[0].length === 0) {
        re.lastIndex++;
        continue;
      }
      if (m.index > last) frag.appendChild(document.createTextNode(text.slice(last, m.index)));
      const mark = document.createElement("mark");
      mark.className = "doc-hl";
      mark.textContent = m[0];
      frag.appendChild(mark);
      marks.push(mark);
      last = m.index + m[0].length;
      if (marks.length >= MAX_MATCHES) break;
    }
    if (last < text.length) frag.appendChild(document.createTextNode(text.slice(last)));
    node.parentNode?.replaceChild(frag, node);
    if (marks.length >= MAX_MATCHES) break;
  }
  return () => {
    for (const mark of marks) {
      const parent = mark.parentNode;
      if (!parent) continue;
      parent.replaceChild(document.createTextNode(mark.textContent ?? ""), mark);
      parent.normalize();
    }
  };
}

/**
 * When you arrive from the docs search (…?hl=your+query#section), this scrolls to that section and
 * flash-highlights the words you searched — bright on arrival, then settling and fading away — before
 * cleaning the URL. It uses the CSS Custom Highlight API so the highlight survives React re-renders
 * (no DOM nodes injected into the content); older browsers fall back to <mark> wrapping.
 *
 * The query is read and stripped from the URL synchronously, so React StrictMode's second effect
 * invocation in dev finds no query and does nothing — no extra guard needed.
 */
export function SearchHighlight() {
  useEffect(() => {
    const hl = new URLSearchParams(window.location.search).get("hl");
    if (!hl) return;
    const terms = highlightTerms(hl);
    const hash = window.location.hash.slice(1);
    history.replaceState(null, "", window.location.pathname + (hash ? `#${hash}` : ""));
    if (terms.length === 0) return;

    const target = hash ? document.getElementById(hash) : document.querySelector("main");
    if (!(target instanceof HTMLElement)) return;

    // Match each term at a word start, extending to the word end (so "ring" also lights up "ringSize").
    const re = new RegExp(`\\b(?:${terms.map(escape).join("|")})[a-z0-9]*`, "gi");
    const root = document.documentElement;

    // Not cleared on cleanup: this one-shot flash should complete even under StrictMode's
    // mount/unmount/mount, and the page hard-reloads on the next search anyway.
    window.setTimeout(() => {
      const first = target.querySelector("h3, h2") ?? target;
      first.scrollIntoView({ behavior: "smooth", block: "start" });

      const api = highlightApi();
      if (api) {
        // (Re)build ranges from the CURRENT DOM and register the highlight. Rebuilding matters because
        // a late re-render (React hydration) can replace the text nodes the ranges point at, detaching
        // them — so we paint now and once more after the DOM has settled.
        const paint = (): number => {
          const ranges = buildRanges(target, re);
          if (ranges.length === 0) return 0;
          api.registry.set(HL_NAME, new api.Ctor(...ranges));
          ranges[0].startContainer.parentElement?.scrollIntoView({ behavior: "smooth", block: "center" });
          return ranges.length;
        };
        if (paint() === 0) return;
        root.classList.add("hl-on", "hl-flash");
        window.setTimeout(paint, 700); // self-heal against a late re-render that detached the ranges
        window.setTimeout(() => root.classList.remove("hl-flash"), FLASH_MS);
        window.setTimeout(() => {
          root.classList.add("hl-dim");
          window.setTimeout(() => {
            api.registry.delete(HL_NAME);
            root.classList.remove("hl-on", "hl-dim");
          }, 500);
        }, SETTLE_MS);
        return;
      }

      // Fallback: <mark> wrapping (works on static pages that don't re-render).
      const cleanup = markFallback(target, re);
      window.setTimeout(cleanup, SETTLE_MS);
    }, 160);
  }, []);

  return null;
}
