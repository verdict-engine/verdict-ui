"use client";

import { useEffect, useRef, useState } from "react";

const TARGET = 61;

const SIGNALS = [
  { name: "velocity.attempts", detail: "· 5 in 2m", weight: "+28" },
  { name: "device.first_seen", detail: "· now", weight: "+19" },
  { name: "geo.mismatch", detail: "· IP ≠ SIM", weight: "+14" },
];

export function LiveConsole() {
  const [score, setScore] = useState(0);
  const raf = useRef<number>();

  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) {
      setScore(TARGET);
      return;
    }
    const start = performance.now();
    const dur = 1000;
    const tick = (now: number) => {
      const p = Math.min((now - start) / dur, 1);
      const eased = 1 - Math.pow(1 - p, 3);
      setScore(Math.round(TARGET * eased));
      if (p < 1) raf.current = requestAnimationFrame(tick);
    };
    raf.current = requestAnimationFrame(tick);
    return () => {
      if (raf.current) cancelAnimationFrame(raf.current);
    };
  }, []);

  return (
    <section className="block">
      <div className="wrap">
        <div className="sec-head">
          <span className="lbl">Live decision</span>
          <span className="rule" />
        </div>
        <div className="sec-intro">
          <h2>One request in. One verdict out.</h2>
          <p>
            An event arrives, features are read, rules fire, a score resolves —
            and the caller gets a decision plus the exact signals behind it.
            Nothing hidden.
          </p>
        </div>

        <div
          className="console cross"
          role="img"
          aria-label="A decision request resolving to a REVIEW verdict with risk score 61 in 38 milliseconds."
        >
          <span className="cx tl">+</span>
          <span className="cx tr">+</span>
          <span className="cx bl">+</span>
          <span className="cx br">+</span>
          <div className="console-bar mono">
            <span className="method">POST</span>
            <span className="path">/v1/decisions</span>
            <span className="stat">
              <i /> 38ms · p99 92ms
            </span>
          </div>
          <div className="console-grid">
            <div className="cpane">
              <div className="tag">Request</div>
              <pre className="req">
                <span className="k">{"{"}</span>
                {"\n  "}
                <span className="k">&quot;type&quot;</span>:{" "}
                <span className="s">&quot;payment.authorize&quot;</span>,{"\n  "}
                <span className="k">&quot;amount&quot;</span>:{" "}
                <span className="n">4900.00</span>,{"\n  "}
                <span className="k">&quot;currency&quot;</span>:{" "}
                <span className="s">&quot;ETB&quot;</span>,{"\n  "}
                <span className="k">&quot;user&quot;</span>:{" "}
                <span className="s">&quot;usr_3f9a&quot;</span>,{"\n  "}
                <span className="k">&quot;device&quot;</span>:{" "}
                <span className="s">&quot;new&quot;</span>,{"\n  "}
                <span className="k">&quot;channel&quot;</span>:{" "}
                <span className="s">&quot;telebirr&quot;</span>
                {"\n"}
                <span className="k">{"}"}</span>
              </pre>
            </div>
            <div className="divider" />
            <div className="cpane">
              <div className="tag">Response</div>
              <div className="risk-top">
                <span className="num mono">{score}</span>
                <span className="of mono">/ 100 risk</span>
                <span className="pill">REVIEW</span>
              </div>
              <div className="meter">
                <div className="fill" style={{ width: `${score}%` }} />
                <span className="tick" style={{ left: "35%" }} />
                <span className="tick" style={{ left: "69%" }} />
              </div>
              <div className="bands">
                <span>allow</span>
                <span className="active">review</span>
                <span>deny</span>
              </div>
              <div className="signals">
                {SIGNALS.map((s) => (
                  <div className="sig" key={s.name}>
                    <span className="name">
                      {s.name} <span>{s.detail}</span>
                    </span>
                    <span className="w">{s.weight}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
