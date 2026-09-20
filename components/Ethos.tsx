import type { ReactNode } from "react";

type Principle = { no: string; title: string; body: ReactNode };

const principles: Principle[] = [
  {
    no: "01",
    title: "No shared tables",
    body: (
      <>
        Contexts own their data and talk through <code>events</code> and typed
        ports. The schema can never become the coupling.
      </>
    ),
  },
  {
    no: "02",
    title: "Dependency injection",
    body: "Adapters arrive through constructors; a default instance is exported. Every unit tests against a mock, not real Redis.",
  },
  {
    no: "03",
    title: "Transactional integrity",
    body: (
      <>
        Money, stock and case state move inside <code>$transaction</code>. A
        verdict is written, or nothing is.
      </>
    ),
  },
  {
    no: "04",
    title: "Fail on purpose",
    body: (
      <>
        Each policy declares <code>fail-open</code> or <code>fail-closed</code>. A
        degraded scorer never silently blocks or waves through.
      </>
    ),
  },
  {
    no: "05",
    title: "Additive by default",
    body: "New signals, outcomes and fields — never a breaking change to a live integration. Old callers keep working.",
  },
  {
    no: "06",
    title: "Slow work is async",
    body: "Enrichment, graph updates and notifications run on queues. The decision path stays inside its budget.",
  },
];

export function Ethos() {
  return (
    <section className="block" id="ethos">
      <div className="wrap">
        <div className="sec-head">
          <span className="lbl">Principles</span>
          <span className="rule" />
        </div>
        <div className="sec-intro">
          <h2>Elegant is a constraint, not a coat of paint.</h2>
          <p>
            A contributor should be able to hold one context in their head. These
            are the rules the codebase enforces.
          </p>
        </div>
        <div className="eth-grid">
          {principles.map((p) => (
            <div className="et" key={p.no}>
              <span className="no">{p.no}</span>
              <h4>{p.title}</h4>
              <p>{p.body}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
