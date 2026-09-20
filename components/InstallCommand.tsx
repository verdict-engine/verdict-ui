"use client";

import { useState } from "react";

const COMMAND = "docker run -p 4000:4000 verdict/engine";

export function InstallCommand() {
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(COMMAND);
      setCopied(true);
      setTimeout(() => setCopied(false), 1400);
    } catch {
      /* clipboard blocked — no-op */
    }
  };

  return (
    <div className="install mono">
      <span className="dollar">$</span>
      <span className="cmd">{COMMAND}</span>
      <button type="button" className="copy" onClick={copy}>
        {copied ? "COPIED" : "COPY"}
      </button>
    </div>
  );
}
