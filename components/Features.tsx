import type { ReactNode } from "react";

type Feature = {
  no: string;
  title: string;
  body: string;
  art: ReactNode;
};

const features: Feature[] = [
  {
    no: "01",
    title: "Real-time decision API",
    body: "One synchronous call returns a verdict, a score, and every signal that fired — inside a hard latency budget.",
    art: (
      <div className="chips">
        <span className="chip g">allow</span>
        <span className="chip a">review</span>
        <span className="chip d">deny</span>
        <span className="chip dash">+ challenge</span>
      </div>
    ),
  },
  {
    no: "02",
    title: "Rules you can read",
    body: "A declarative DSL, versioned in git, hot-reloaded and diffable in review. No black box to trust on faith.",
    art: (
      <pre className="code-lines">
        <span className="kw">when</span> velocity.attempts &gt; 4{"\n  "}
        <span className="kw">then</span> score <span className="a">+28</span>
      </pre>
    ),
  },
  {
    no: "03",
    title: "Velocity feature store",
    body: "Redis-backed counters and rolling aggregates computed at write time — attempts per minute, spend per hour.",
    art: (
      <div className="counter">
        <b>5</b>
        <span>attempts / 2m</span>
        <b style={{ marginLeft: 14 }}>3</b>
        <span>devices / user</span>
      </div>
    ),
  },
  {
    no: "04",
    title: "Weighted risk scoring",
    body: "Combine rule hits and features into a transparent 0–100 score. Swap in an ML model behind the same port later.",
    art: (
      <pre className="code-lines">
        score = <span className="a">61</span> <span className="kw">{"// 28 + 19 + 14"}</span>
        {"\n"}band = review <span className="kw">{"// 35–69"}</span>
      </pre>
    ),
  },
  {
    no: "05",
    title: "Case management",
    body: "Every review verdict opens a case. Analysts triage a queue, take action, and leave an audit trail.",
    art: (
      <div className="qrow">
        <span className="id">cse_71a</span>
        <span>usr_3f9a · payment</span>
        <span className="verd">REVIEW</span>
      </div>
    ),
  },
  {
    no: "06",
    title: "Feedback loop",
    body: "Chargebacks and analyst decisions become labels. Backtest a new rule against them before it touches prod.",
    art: (
      <div className="chips">
        <span className="chip">label: fraud</span>
        <span className="chip">label: legit</span>
        <span className="chip dash">→ backtest</span>
      </div>
    ),
  },
  {
    no: "07",
    title: "Entity graph",
    body: "Link users, devices, cards and phones to surface rings — the shared fingerprints one event can't reveal.",
    art: (
      <div className="avs">
        <i>U</i>
        <i>D</i>
        <i>C</i>
        <i>☎</i>
        <span className="chip dash" style={{ marginLeft: 10 }}>
          ring?
        </span>
      </div>
    ),
  },
  {
    no: "08",
    title: "Local-market signals",
    body: "Detectors Western tools skip — SIM-swap and OTP abuse, agent fraud, cash-on-delivery abuse — plus gateway connectors.",
    art: (
      <div className="chips">
        <span className="chip">chapa</span>
        <span className="chip">telebirr</span>
        <span className="chip">sms-otp</span>
        <span className="chip dash">+9</span>
      </div>
    ),
  },
  {
    no: "09",
    title: "Self-hosted & private",
    body: "Your data never leaves your infra. One Docker deploy today; the same code splits into services under load.",
    art: (
      <div className="chips">
        <span className="chip">apache-2.0</span>
        <span className="chip">single binary</span>
      </div>
    ),
  },
];

export function Features() {
  return (
    <section className="block" id="features">
      <div className="wrap">
        <div className="sec-head">
          <span className="lbl">Features</span>
          <span className="rule" />
        </div>
        <div className="sec-intro">
          <h2>Everything a fraud team reaches for.</h2>
          <p>In one deployable — not five SaaS invoices and a data-sharing agreement.</p>
        </div>
        <div className="feat-grid">
          {features.map((f) => (
            <div className="feat" key={f.no}>
              <span className="no">{f.no}</span>
              <h3>{f.title}</h3>
              <p>{f.body}</p>
              <div className="art">{f.art}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
