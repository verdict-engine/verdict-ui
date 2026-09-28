type Item = { label: string; done?: boolean };

type Phase = {
  ver: string;
  status: string;
  state: "done" | "now" | "next" | "future";
  title: string;
  goal: string;
  items: Item[];
};

const phases: Phase[] = [
  {
    ver: "v0.1",
    status: "Shipped",
    state: "done",
    title: "The decision loop",
    goal: "A verdict, end to end.",
    items: [
      { label: "Event ingest & normalize" },
      { label: "Declarative rules engine" },
      { label: "Sync decision API" },
      { label: "Redis velocity counters" },
      { label: "Append-only verdict log" },
    ],
  },
  {
    ver: "v0.4",
    status: "Shipped",
    state: "done",
    title: "Decisioning depth",
    goal: "Smarter, safer verdicts.",
    items: [
      { label: "Weighted risk scoring" },
      { label: "Step-up / challenge" },
      { label: "Block / allow / watch lists" },
      { label: "Versioned policies" },
      { label: "Idempotency & outbox" },
    ],
  },
  {
    ver: "v0.7",
    status: "Shipped",
    state: "done",
    title: "Human in the loop",
    goal: "Grey areas get a person.",
    items: [
      { label: "Case management" },
      { label: "Analyst audit trail" },
      { label: "Label + chargeback capture" },
      { label: "Operator dashboard" },
      { label: "Password auth · Postgres" },
    ],
  },
  {
    ver: "v0.8",
    status: "Shipped",
    state: "done",
    title: "Intelligence",
    goal: "Learn from every label.",
    items: [
      { label: "Analytics read-model", done: true },
      { label: "Adaptive scoring model", done: true },
      { label: "Rule & policy backtesting", done: true },
      { label: "Entity graph & rings", done: true },
      { label: "Per-user anomaly detection", done: true },
    ],
  },
  {
    ver: "v0.9",
    status: "Shipped",
    state: "done",
    title: "Built to integrate",
    goal: "Wire it in, in an afternoon.",
    items: [
      { label: "MCP server (LLM-native)", done: true },
      { label: "Outbound webhooks", done: true },
      { label: "OpenAPI & Swagger UI", done: true },
      { label: "API activity log", done: true },
      { label: "Slack / Telegram / webhook alerts", done: true },
    ],
  },
  {
    ver: "v1.0",
    status: "Shipped",
    state: "done",
    title: "Production-ready",
    goal: "Hardened for real traffic.",
    items: [
      { label: "Fail-closed config & container hardening", done: true },
      { label: "Atomic idempotency & transactional outbox", done: true },
      { label: "Schema migrations & indexes", done: true },
      { label: "Observability, metrics & durable webhooks", done: true },
      { label: "Auth hardening, scoped keys & revocation", done: true },
      { label: "Load & failure testing", done: true },
      { label: "Data retention & pruning", done: true },
    ],
  },
  {
    ver: "v1.1",
    status: "Now",
    state: "now",
    title: "Scale & operability",
    goal: "Run it big, run it calm.",
    items: [
      { label: "Durable, throttled notifications", done: true },
      { label: "Batch & async decisions", done: true },
      { label: "Config-change audit log", done: true },
      { label: "Dashboard / docs test coverage", done: true },
      { label: "Cloud-backed, hot-swappable model", done: true },
      { label: "Storage stats & disk reclaim", done: true },
      { label: "Typed tables for high-volume reads" },
      { label: "SDK development (client SDKs)" },
    ],
  },
  {
    ver: "v1.2",
    status: "Shipped",
    state: "done",
    title: "Smarter signals",
    goal: "Catch more, explain it all.",
    items: [
      { label: "IP geolocation & impossible travel", done: true },
      { label: "Device fingerprinting & cloning signals", done: true },
      { label: "Trained ML scorer (synthetic data)", done: true },
      { label: "Explainable per-feature reasons", done: true },
    ],
  },
  {
    ver: "v2.0",
    status: "Vision",
    state: "future",
    title: "Ecosystem & scale",
    goal: "Split, connect, grow.",
    items: [
      { label: "Broker event bus (Kafka/BullMQ)" },
      { label: "Distributed tracing" },
      { label: "Multi-tenant & RBAC" },
      { label: "Managed feature store" },
      { label: "Streaming ingest" },
    ],
  },
];

export function Roadmap() {
  return (
    <section className="block" id="roadmap">
      <div className="wrap">
        <div className="sec-head">
          <span className="lbl">Roadmap</span>
          <span className="rule" />
        </div>
        <div className="sec-intro">
          <h2>From a rules engine to a fraud platform — in public.</h2>
          <p>
            Each phase ships a coherent, usable slice. The order is deliberate: a
            decision loop first, then depth, then the human layer, then
            intelligence and the surfaces that make it easy to integrate — and now
            the hardening that makes it production-ready.
          </p>
        </div>
        <div className="road">
          {phases.map((p) => (
            <div className={`ph ${p.state}`} key={p.title}>
              <div className="ph-top">
                <span className="ver">{p.ver}</span>
                <span className="st">{p.status}</span>
              </div>
              <h3>{p.title}</h3>
              <p className="goal">{p.goal}</p>
              <ul>
                {p.items.map((it) => (
                  <li className={it.done ? "done" : ""} key={it.label}>
                    {it.label}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
