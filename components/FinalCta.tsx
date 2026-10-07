import { REPO_URL, withBase } from "@/lib/site";

export function FinalCta() {
  return (
    <section className="block">
      <div className="wrap">
        <div className="final cross">
          <span className="cx tl">+</span>
          <span className="cx tr">+</span>
          <span className="cx bl">+</span>
          <span className="cx br">+</span>
          <h2>Ship a verdict this afternoon.</h2>
          <p>
            Clone it, write three rules, and point your payment path at{" "}
            <span className="mono">/v1/decisions</span>. Grow into the platform on
            your own timeline.
          </p>
          <div className="cta-row">
            <a className="btn primary" href={withBase("/docs")}>
              Get Started →
            </a>
            <a className="btn ghost" href={REPO_URL} target="_blank" rel="noopener noreferrer">
              ★ Star on GitHub
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
