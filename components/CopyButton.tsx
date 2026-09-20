"use client";

import { useState } from "react";

/** A tiny copy-to-clipboard control for code blocks. Falls back silently if clipboard is blocked. */
export function CopyButton({ text, label = "copy", className = "copy-btn" }: { text: string; label?: string; className?: string }) {
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // clipboard unavailable (insecure context / denied) — leave the UI unchanged
    }
  };

  return (
    <button type="button" className={className} onClick={copy} aria-label={`Copy ${label}`}>
      {copied ? "copied ✓" : label}
    </button>
  );
}
