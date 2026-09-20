"use client";

import { useState } from "react";

type TabKey = "rule" | "policy" | "api" | "log";

const tabs: { k: TabKey; label: string }[] = [
  { k: "rule", label: "Rule DSL" },
  { k: "policy", label: "Policy" },
  { k: "api", label: "Decision API" },
  { k: "log", label: "Verdict Log" },
];

/** Trusted snippets, kept in step with the real engine. Spans carry highlight classes. */
const snippets: Record<TabKey, string> = {
  rule: `<span class="cm">// rules/card.authorize.vd — versioned, hot-reloaded</span>
<span class="kw">rule</span> r_velocity {
  <span class="kw">when</span>  velocity.attemptsLast2m > 4
  <span class="kw">then</span>  score += 28, tag "velocity"
}
<span class="kw">rule</span> r_takeover {
  <span class="kw">when</span>  device.firstSeen == true && geo.ipSimMismatch == true
  <span class="kw">then</span>  score += 33, tag "takeover"
}`,
  policy: `<span class="cm">// policies/card.authorize.vd</span>
<span class="kw">policy</span> card_authorize {
  bands {
    <span class="allow">allow</span>       0..24
    <span class="challenge">challenge</span>  25..44   → step-up (3DS)
    <span class="review">review</span>     45..69   → queue "risk-ops"
    <span class="deny">deny</span>       70..100
  }
  on_error  fail_open   <span class="cm">// degrade to allow, never silently block</span>
}`,
  api: `<span class="cm">// one synchronous call, &lt;100ms</span>
<span class="kw">const</span> v = <span class="kw">await</span> verdict.<span class="fn">decide</span>({
  type: <span class="str">"card.authorize"</span>,
  amount: 3500, currency: <span class="str">"USD"</span>,
  subject: { userId, deviceId, channel: <span class="str">"visa"</span> },
  instrument: { kind: <span class="str">"card"</span>, threeDS: false },
})

<span class="kw">if</span> (v.verdict === <span class="challenge">"challenge"</span>) stepUp(v.id)
<span class="kw">if</span> (v.verdict === <span class="review">"review"</span>)    hold(v.id)`,
  log: `<span class="cm">// append-only · replayable</span>
{
  id: <span class="str">"vd_9c2f"</span>, eventId: <span class="str">"evt_71a"</span>,
  verdict: <span class="review">"review"</span>, score: 55,
  reasons: [
    { tag: <span class="str">"takeover"</span>, points: 33 },
    { tag: <span class="str">"no_3ds"</span>, points: 22 }
  ],
  policyVersion: <span class="str">"v0.4.0"</span>,
  decidedAt: <span class="str">"2026-09-17T10:22:00Z"</span>
}`,
};

export function Configure() {
  const [active, setActive] = useState<TabKey>("rule");

  return (
    <section className="block" id="configure">
      <div className="wrap">
        <div className="sec-head">
          <span className="lbl">Configure</span>
          <span className="rule" />
        </div>
        <div className="sec-intro">
          <h2>Declarative from the first line.</h2>
          <p>
            Rules, policies and connectors are code — reviewed, versioned and
            rolled back like everything else you ship.
          </p>
        </div>
        <div className="cfg cross">
          <span className="cx tl">+</span>
          <span className="cx tr">+</span>
          <span className="cx bl">+</span>
          <span className="cx br">+</span>
          <pre
            className="cfg-code"
            dangerouslySetInnerHTML={{ __html: snippets[active] }}
          />
          <div className="cfg-tabs" role="tablist">
            {tabs.map((t) => (
              <button
                key={t.k}
                type="button"
                role="tab"
                aria-selected={active === t.k}
                onClick={() => setActive(t.k)}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
