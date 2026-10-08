import { InstallCommand } from "./InstallCommand";
import { withBase } from "@/lib/site";

export function Hero() {
  return (
    <section className="hero" id="top">
      <div className="wrap">
        <a className="announce mono" href={withBase("/docs")}>
          <span className="arw">▲</span> Beta{" "}
          <b>| Verdict is currently in beta — v1.0.3-beta</b> <span className="arw">→</span>
        </a>
        <h1 className="headline">
          The open-source fraud engine that returns a verdict.
        </h1>
        <p className="sub">
          Verdict scores every event against rules you can read and answers{" "}
          <code>allow / review / deny</code> in under 100ms — a modular monolith
          you can split into services the day you outgrow it.
        </p>
        <div className="cta-row">
          <a className="btn primary" href={withBase("/docs")}>
            Get Started →
          </a>
          <a className="btn ghost cross" href="#architecture">
            <span className="cx tl">+</span>
            <span className="cx tr">+</span>
            <span className="cx bl">+</span>
            <span className="cx br">+</span>
            Read the docs
          </a>
        </div>
        <InstallCommand />
      </div>
    </section>
  );
}
