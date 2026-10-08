import { DocNav } from "./DocNav";
import { ScreenshotGallery } from "./ScreenshotGallery";
import { DOC_SECTIONS as SECTIONS } from "@/lib/doc-sections";
import { withBase } from "@/lib/site";

const QUICKSTART = `# 1 · bring up postgres + engine + dashboard
git clone https://github.com/verdict-engine/verdict-engine && cd verdict-engine
AUTH_SECRET=$(openssl rand -hex 32) docker compose up --build

#   db         postgres 16 · durable users, cases, verdicts, keys, graph
#   engine     http://localhost:4000   (POST /v1/decisions, /health)
#   dashboard  http://localhost:3000   (review queue, config, analytics)

# 2 · open the dashboard, create the admin account (first user),
#     then Keys → Create key, and copy it (shown once).

# 3 · send your first decision (next section).`;

const CURL = `curl -X POST http://localhost:4000/v1/decisions \\
  -H 'content-type: application/json' \\
  -H 'x-api-key: vk_live_…' \\
  -H 'idempotency-key: order_1837' \\
  -d '{
    "type": "card.authorize",
    "amount": 3500, "currency": "USD",
    "subject": { "userId": "usr_3f9a", "deviceId": "dev_2b1", "ip": "203.0.113.7", "channel": "visa" },
    "instrument": { "kind": "card", "bin": "411111", "threeDS": false }
  }'`;

const NODE = `const res = await fetch(VERDICT_API_URL + "/v1/decisions", {
  method: "POST",
  headers: {
    "content-type": "application/json",
    "x-api-key": process.env.VERDICT_API_KEY,
    "idempotency-key": order.id,       // retries return the same decision
    "x-correlation-id": traceId,        // threaded through logs + events
  },
  body: JSON.stringify({
    type: "card.authorize",
    amount: order.amount, currency: order.currency,
    subject: { userId: order.userId, deviceId, ip: req.ip, channel: "visa" },
    instrument: { kind: "card", bin: card.bin, threeDS: order.threeDS },
  }),
});

if (res.status === 429) return retryAfter(res.headers.get("retry-after"));
const { verdict, score, reasons } = await res.json();
switch (verdict) {
  case "deny":      return block();
  case "challenge": return stepUp();          // 3-D Secure / OTP
  case "review":    return hold(order.id);     // a case opens for an analyst
  default:          return proceed();          // "allow"
}`;

const SDK_TS = `import { VerdictClient } from "@verdict/sdk";

const verdict = new VerdictClient({ apiKey: process.env.VERDICT_API_KEY });

const decision = await verdict.decide({
  type: "card.authorize",
  amount: order.amount, currency: order.currency,
  subject: { userId: order.userId, ip: req.ip, fingerprint },
}, { idempotencyKey: order.id });        // retries return the same decision

switch (decision.verdict) {
  case "deny":      return block(decision.reasons);
  case "challenge": return stepUp();
  case "review":    return hold(order.id);
  default:          return proceed();
}`;

const SDK_DART = `import 'package:verdict_sdk/verdict.dart';

final verdict = VerdictClient(apiKey: apiKey);

final decision = await verdict.decide(const VerdictEvent(
  type: VerdictEventType.cardAuthorize,
  amount: 4900, currency: 'ETB',
  subject: Subject(userId: 'usr_3f9a', ip: '196.188.120.4', fingerprint: 'fp_9c1e'),
));

if (decision.verdict == Verdict.deny) block(decision.reasons);`;

const SDK_INSTALL = `# TypeScript / JavaScript (Node 18+, Deno, Bun, edge)
npm i @verdict/sdk

# Flutter / Dart — in pubspec.yaml:
#   dependencies:
#     verdict_sdk: ^0.1.0`;

const SDK_TS_ERRORS = `import {
  VerdictClient,
  VerdictRateLimitError, VerdictAuthError, VerdictConnectionError,
} from "@verdict/sdk";

const verdict = new VerdictClient({
  apiKey: process.env.VERDICT_API_KEY,
  baseUrl: "https://verdict.internal",  // default http://localhost:4000
  timeoutMs: 10_000,                     // per request
  maxRetries: 2,                         // 429 / 5xx / network, backoff + Retry-After
});

try {
  const decision = await verdict.decide(event, { idempotencyKey: order.id });
  // …act on decision.verdict…
} catch (err) {
  if (err instanceof VerdictRateLimitError)   await backoff(err.retryAfterMs);
  else if (err instanceof VerdictAuthError)   rotateKey();       // 401 / 403
  else if (err instanceof VerdictConnectionError) failOpen();    // outage — your call
  else throw err;                                                // 400 / 5xx
}

verdict.rateLimit;   // { limit, remaining } from the last response's headers`;

const SDK_TS_MORE = `// Batch — up to 100, order preserved; a bad event fails only its own entry
for (const r of await verdict.decideBatch(events)) {
  if (r.ok) act(r.decision);
  else      log(r.error.code);
}

// Async — 202 now, verdict later (poll, or subscribe a webhook to verdict.reached.v1)
const { id } = await verdict.decideAsync({ id: "evt_9f2a", ...event });
const decision = await verdict.getDecision(id);  // throws VerdictNotFoundError while pending

// Close the loop — record a chargeback as a fraud label (needs the "labels" scope)
await verdict.recordChargeback(order.eventId);`;

const SDK_DART_MORE = `try {
  final decision = await verdict.decide(event, idempotencyKey: order.id);
  if (decision.verdict == Verdict.deny) block(decision.reasons);
} on VerdictRateLimitException catch (e) {
  await Future<void>.delayed(e.retryAfter ?? const Duration(seconds: 1));
} on VerdictConnectionException {
  failOpen();   // engine outage — availability vs safety is your call
}

// Batch results are a sealed type — switch exhaustively
for (final item in await verdict.decideBatch(events)) {
  switch (item) {
    case BatchOk(:final decision): act(decision);
    case BatchError(:final code):  log(code);
  }
}`;

const RESPONSE = `{
  "id": "vd_0mu4…", "eventId": "evt_0mu4…",
  "verdict": "review", "score": 55,
  "reasons": [
    { "tag": "takeover", "points": 33 },
    { "tag": "no_3ds",   "points": 22 }
  ],
  "reasonCodes": [
    { "code": "ACCOUNT_TAKEOVER", "category": "authentication" },
    { "code": "AUTH_WEAK",        "category": "authentication" }
  ],
  "customerMessage": "This transaction is being reviewed and will be processed shortly.",
  "policyId": "pol_card_authorize", "policyVersion": "v0.4.0",
  "decidedAt": "2026-09-17T10:22:00.000Z"
}`;

const RULE = `rule r_takeover {
  when  device.firstSeen == true && geo.ipSimMismatch == true
  then  score += 33, tag "takeover"
}

rule r_ring {
  when  graph.ringSize > 6           // shared devices/IPs cluster
  then  score += 26, tag "ring"
}

rule r_amount_anomaly {
  when  anomaly.amountZScore > 3     // 3σ from this user's own baseline
  then  score += 22, tag "amount_spike"
}`;

const POLICY = `policy card_authorize {
  bands {
    allow      0..24
    challenge  25..44   → step-up (3DS)
    review     45..69   → queue "risk-ops"
    deny       70..100
  }
  on_error  fail_open   // degrade to allow, never silently block
}`;

const BACKTEST = `# would this policy change catch more fraud without more false positives?
curl -X POST http://localhost:4000/v1/backtest \\
  -H 'authorization: Bearer <admin-token>' \\
  -H 'content-type: application/json' \\
  -d '{ "eventType": "card.authorize",
        "policy": { "bands": [ … candidate bands … ] } }'

# → { "labeled": 312,
#     "candidate": { "precision": 0.83, "recall": 0.9, … },
#     "delta": { "fraudCaught": +20, "falsePositives": -15, "flips": 48 } }`;

const ERASE = `# right-to-erasure: wipe a user's graph identity, baseline and replay samples
curl -X POST http://localhost:4000/v1/privacy/erase \\
  -H 'authorization: Bearer <admin-token>' \\
  -H 'content-type: application/json' \\
  -d '{ "userId": "usr_3f9a" }'
# → { "userId": "usr_3f9a", "replaySamplesRemoved": 12, "activityEntriesRemoved": 12,
#     "graph": true, "baseline": true }`;

const MCP_CONFIG = `{
  "mcpServers": {
    "verdict": {
      "command": "node",
      "args": ["/path/to/verdict-mcp/dist/index.js"],
      "env": {
        "VERDICT_API_URL": "http://localhost:4000",
        "VERDICT_API_KEY": "vk_live_…",   // for the decide tool
        "VERDICT_TOKEN":   "eyJ…"          // operator token, for reads/admin
      }
    }
  }
}`;

const COMPOSE = `# from verdict-engine/
AUTH_SECRET=$(openssl rand -hex 32) docker compose up --build`;

const BOOTFAIL = `✗ verdict-engine cannot start — fix these environment variables:
    • AUTH_SECRET is required in production — it signs operator tokens.
    • DATABASE_URL is required in production for durable persistence.`;

function Field({ n, t, d }: { n: string; t: string; d: string }) {
  return (
    <tr>
      <td className="p-name mono">{n}</td>
      <td className="p-type mono">{t}</td>
      <td className="p-desc">{d}</td>
    </tr>
  );
}

export function DocsContent() {
  return (
    <section className="block" id="docs">
      <div className="wrap">
        <div className="sec-head">
          <span className="lbl">Documentation</span>
          <span className="rule" />
        </div>
        <div className="sec-intro">
          <h2>Everything to integrate, configure and self-host.</h2>
          <p>From your first decision to a production deployment — the full path, in depth.</p>
        </div>

        <div className="doc-beta" role="note">
          <span className="doc-beta-tag mono">Beta</span>
          <p>
            Verdict is <b>currently in beta</b> (<span className="mono">v1.0.3-beta</span>, a pre-release of
            1.0). It&apos;s functional and self-hostable, but APIs, schemas, and defaults may still change
            before the stable 1.0 —{" "}
            <b>pin a version</b>, review the changelog before upgrading, and evaluate carefully before relying
            on it in production. It&apos;s open source (Apache-2.0); issues and contributions are welcome.
          </p>
        </div>

        <div className="doc-layout">
          <DocNav sections={SECTIONS} />

          <div className="doc-main">
            <section id="intro" className="doc-sec">
              <h3>Introduction</h3>
              <p>
                Verdict is an open-source fraud &amp; risk <b>decisioning</b> engine. You send it an
                event; it evaluates the event against rules you can read and returns a verdict —{" "}
                <span className="vt-allow">allow</span>, <span className="vt-challenge">challenge</span>,{" "}
                <span className="vt-review">review</span>, or <span className="vt-deny">deny</span> — in a
                single synchronous call, along with a 0–100 score and the exact reasons behind it.
              </p>
              <p>
                It is deliberately a <b>decisioning</b> layer, not a data vendor. You bring the signals you
                already have — the transaction, the device, the IP, whatever your enrichment provides — and
                Verdict turns them into a consistent, auditable, versioned decision. That is the half most
                teams end up rebuilding badly: the rules, the scoring, the policy, the human review loop, and
                the record of <i>why</i>. Verdict is that half, self-hosted and transparent.
              </p>
              <p>
                Under the hood it is a <b>modular monolith</b> (NestJS + TypeScript): bounded contexts —
                ingest, feature store, rules, scoring, decision, lists, cases, feedback, analytics,{" "}
                <b>graph</b>, <b>anomaly</b>, auth and API keys — that talk only over typed ports and events,
                so any one can be extracted into its own service when you outgrow it. Two surfaces sit on top:
                the <b>engine API</b> (documented here) and the <b>operator dashboard</b> (review queue,
                configuration, analytics, graph explorer, keys).
              </p>
              <div className="doc-flow mono">event → features + graph + anomaly → rules → score 0–100 → policy bands → verdict</div>
            </section>

            <section id="quickstart" className="doc-sec">
              <h3>Quickstart</h3>
              <p>
                You need Docker with the Compose plugin (<span className="mono">docker compose version</span>).
                One command brings up Postgres, the engine, and the dashboard, wired together over the compose
                network — no CORS, nothing else to configure:
              </p>
              <pre className="doc-code">{QUICKSTART}</pre>
              <p>
                The <b>first person to register</b> in the dashboard becomes the admin; public sign-up then
                closes and further operators are added by an admin under <span className="mono">Team</span>.
                Create a service <b>API key</b> under <span className="mono">Keys</span> — it is shown once and
                stored only as a SHA-256 hash — and you are ready to send decisions. Confirm the engine is up
                with <span className="mono">curl localhost:4000/health</span>.
              </p>
            </section>

            <section id="integrate" className="doc-sec">
              <h3>Integration</h3>
              <p>
                Integrating Verdict is five steps: get a key, call the decision API on the path you want to
                protect, act on the verdict, feed outcomes back so it learns, then tune and go live. Each step
                below is self-contained — you can be live with steps 1–3 in an afternoon and layer in 4–5 later.
              </p>
              <ol className="doc-steps">
                <li>
                  <div className="doc-step-h">Create a service API key</div>
                  <p>
                    In the dashboard, <span className="mono">Keys → Create key</span>. It&apos;s shown{" "}
                    <b>once</b> — store it as a secret (env var / secret manager). Every call to the decision
                    API sends it as <span className="mono">X-API-Key</span>.
                  </p>
                </li>
                <li>
                  <div className="doc-step-h">Call the decision API on your critical path</div>
                  <p>
                    Right before you commit the action you want to protect — authorize a charge, complete a
                    login, release a payout — send the event to <span className="mono">POST /v1/decisions</span>{" "}
                    and wait for the verdict (a single synchronous call). Send every identifier you have; absent
                    fields simply mean the rules that read them don&apos;t fire. Backfilling or scoring in bulk?
                    Use <span className="mono">POST /v1/decisions/batch</span> (up to 100 events at once) or, to
                    keep it off your response path, <span className="mono">POST /v1/decisions/async</span> (202 +
                    an id you poll at <span className="mono">GET /v1/decisions/&#123;id&#125;</span> or receive by webhook).
                  </p>
                </li>
                <li>
                  <div className="doc-step-h">Act on the verdict</div>
                  <p>
                    Branch on <span className="mono">verdict</span>: proceed on{" "}
                    <span className="vt-allow">allow</span>, step the user up (3-D Secure / OTP) on{" "}
                    <span className="vt-challenge">challenge</span>, hold for an analyst on{" "}
                    <span className="vt-review">review</span> (a case opens automatically), and block on{" "}
                    <span className="vt-deny">deny</span>. The <span className="mono">reasons</span> tell you
                    exactly why.
                  </p>
                </li>
                <li>
                  <div className="doc-step-h">Feed outcomes back</div>
                  <p>
                    Close the loop so the engine learns: analysts resolve review cases in the dashboard, and
                    your PSP posts chargebacks to <span className="mono">POST /v1/labels/chargeback</span>.
                    Those labels sharpen the adaptive model and power backtesting.
                  </p>
                </li>
                <li>
                  <div className="doc-step-h">Tune, then go to production</div>
                  <p>
                    Author rules and policies in <span className="mono">Configure</span>, backtest a change
                    against your labeled history before publishing, and deploy with a real{" "}
                    <span className="mono">AUTH_SECRET</span> and Postgres (see Deployment).
                  </p>
                </li>
              </ol>
              <p>
                <span className="mono">POST /v1/decisions</span> is a machine-to-machine endpoint — it takes a
                service <b>API key</b>, not an operator login. Here it is end to end:
              </p>
              <div className="doc-code-h mono">curl</div>
              <pre className="doc-code">{CURL}</pre>
              <div className="doc-code-h mono">Node / TypeScript</div>
              <pre className="doc-code">{NODE}</pre>
              <p>
                Two headers make integration robust. Pass an{" "}
                <span className="mono">Idempotency-Key</span> (an order id works well) so a retry returns the
                original decision instead of scoring twice; without one it defaults to the event id. Pass an{" "}
                <span className="mono">X-Correlation-Id</span> to thread the request through the engine&apos;s
                logs and internal events for tracing.
              </p>
              <p>
                The endpoint is <b>rate-limited per API key</b> (default 600/min): over budget it returns{" "}
                <span className="mono">429</span> with a <span className="mono">Retry-After</span> header, and
                every response carries <span className="mono">X-RateLimit-Limit</span> and{" "}
                <span className="mono">X-RateLimit-Remaining</span>. A malformed event returns{" "}
                <span className="mono">400</span> with a coded reason; a transient internal failure returns the
                policy&apos;s <span className="mono">on_error</span> verdict rather than an error, so you always
                get a decision. The response is fully explainable:
              </p>
              <pre className="doc-code">{RESPONSE}</pre>
              <p>
                A decline explains itself to three audiences without tipping off a fraudster:{" "}
                <span className="mono">reasons</span> (the exact rules that fired, for your analysts),{" "}
                <span className="mono">reasonCodes</span> (stable codes like{" "}
                <span className="mono">ACCOUNT_TAKEOVER</span> for your ops/dispute team), and{" "}
                <span className="mono">customerMessage</span> (one vague, verdict-level line safe to show the
                cardholder — it never names a signal).
              </p>
              <p>
                Every field of the request and response is defined in the{" "}
                <a href={withBase("/api-reference")}>API reference</a>. Prefer a client library? The{" "}
                <a href="#sdks">official SDKs</a> wrap all of this — typed calls, retries and timeouts included.
              </p>
            </section>

            <section id="sdks" className="doc-sec">
              <h3>SDKs</h3>
              <p>
                Official client libraries wrap the API-key data plane so you don&apos;t hand-write HTTP: typed
                events and verdicts, a per-request timeout, and automatic retry with backoff on{" "}
                <span className="mono">429</span>/<span className="mono">5xx</span>/network errors (honoring{" "}
                <span className="mono">Retry-After</span>). They cover the integrator endpoints only — operator
                and admin actions (auth, cases, rules, config) stay in the dashboard.
              </p>
              <table className="doc-tbl full">
                <tbody>
                  <tr><td>TypeScript / JavaScript</td><td className="mono">@verdict/sdk</td><td>Available</td></tr>
                  <tr><td>Dart / Flutter</td><td className="mono">verdict_sdk</td><td>Available</td></tr>
                  <tr><td>Python</td><td className="mono">verdict-sdk</td><td>Planned</td></tr>
                  <tr><td>React Native</td><td className="mono">@verdict/react-native</td><td>Planned</td></tr>
                </tbody>
              </table>

              <div className="doc-code-h mono">1 · Install</div>
              <pre className="doc-code">{SDK_INSTALL}</pre>

              <div className="doc-code-h mono">2 · Score an event</div>
              <p>
                Construct a client once with your service key, then call <span className="mono">decide</span> on
                your critical path. The <span className="mono">idempotencyKey</span> (an order id works well)
                makes a retry return the original decision instead of scoring twice.
              </p>
              <div className="doc-code-h mono">TypeScript</div>
              <pre className="doc-code">{SDK_TS}</pre>
              <div className="doc-code-h mono">Flutter / Dart</div>
              <pre className="doc-code">{SDK_DART}</pre>

              <div className="doc-code-h mono">3 · Handle failure — decide how to fail</div>
              <p>
                A <span className="vt-deny">deny</span> should block; a <b>transport failure is a product
                decision</b>. Each SDK throws a typed error/exception so you branch on the kind — rate limit,
                auth, or an engine outage — and choose fail-open (allow, favor availability) or fail-closed
                (challenge/deny, favor safety) per event type, mirroring the policy&apos;s{" "}
                <span className="mono">on_error</span>. The client also surfaces the rate-limit budget from the
                last response.
              </p>
              <div className="doc-code-h mono">TypeScript</div>
              <pre className="doc-code">{SDK_TS_ERRORS}</pre>
              <div className="doc-code-h mono">Flutter / Dart</div>
              <pre className="doc-code">{SDK_DART_MORE}</pre>

              <div className="doc-code-h mono">4 · Batch, async & feedback</div>
              <p>
                Score in bulk, move scoring off your response path, and feed outcomes back — all typed. Poll{" "}
                <span className="mono">getDecision</span> for an async verdict, or (better at volume) subscribe a
                webhook to <span className="mono">verdict.reached.v1</span>.
              </p>
              <pre className="doc-code">{SDK_TS_MORE}</pre>

              <div className="api-params">
                <div className="api-params-h">Method → endpoint</div>
                <table className="api-tbl doc-tbl">
                  <tbody>
                    <Field n="decide(event, opts?)" t="POST /v1/decisions" d="Score one event synchronously → Decision." />
                    <Field n="decideBatch(events)" t="POST /v1/decisions/batch" d="Up to 100 events; per-entry ok/error, order preserved." />
                    <Field n="decideAsync(event)" t="POST /v1/decisions/async" d="202 + event id; verdict computed off the response path." />
                    <Field n="getDecision(id)" t="GET /v1/decisions/:id" d="Fetch an async verdict; not-found error while pending." />
                    <Field n="recordChargeback(id)" t="POST /v1/labels/chargeback" d="Record a chargeback as a fraud label (labels scope)." />
                  </tbody>
                </table>
              </div>

              <p className="doc-callout">
                <b>Keep service keys server-side.</b> A key shipped in a mobile or browser binary can be
                extracted, so score from a trusted backend or proxy through your server — the SDKs target that
                integrator context, not untrusted clients. Full method docs, options and error tables are in each
                package&apos;s README (<span className="mono">@verdict/sdk</span> and{" "}
                <span className="mono">verdict_sdk</span>); every field is in the{" "}
                <a href={withBase("/api-reference")}>API reference</a>.
              </p>
            </section>

            <section id="bestpractices" className="doc-sec">
              <h3>Best practices</h3>
              <p>
                Everything above gets you a verdict. These are the habits that make an integration robust in
                production — how to call the engine, how to fail, and how to keep decisions getting better over
                time. None are required to start; adopt them as you harden.
              </p>

              <div className="doc-code-h mono">Calling the engine</div>
              <ul className="doc-list">
                <li>
                  <b>Call it from your backend, never a browser or mobile client.</b> The service key is a
                  secret — keep it in an env var / secret manager, server-side. The decision and label endpoints
                  authenticate with <span className="mono">X-API-Key</span>; every dashboard, admin and read
                  endpoint uses a short-lived <b>operator bearer token</b> instead. Client code should hold
                  neither. Rotate keys under <span className="mono">Keys</span> and revoke a leaked one instantly.
                </li>
                <li>
                  <b>Put the call on the critical path, with a timeout.</b> Send the event right before the
                  irreversible action and wait for the verdict. Set a tight client timeout (≈1–2&nbsp;s) and
                  decide your fallback <i>per surface</i>: on a network failure or timeout, let a login through
                  but hold a payout. The engine already degrades its own faults to the policy&apos;s{" "}
                  <span className="mono">on_error</span> verdict — but a failure between you and the engine is
                  yours to handle.
                </li>
                <li>
                  <b>Always send an <span className="mono">Idempotency-Key</span>.</b> Use a natural id — the
                  order id, the login-attempt id. Retries then return the <i>same</i> verdict instead of scoring
                  twice, so a network retry is always safe.
                </li>
                <li>
                  <b>Send every identifier you have.</b> <span className="mono">userId</span>,{" "}
                  <span className="mono">deviceId</span>, <span className="mono">ip</span> and{" "}
                  <span className="mono">phone</span> feed the entity graph and the anomaly baseline; a field you
                  omit simply means the rules that read it don&apos;t fire. More context, better decisions.
                </li>
                <li>
                  <b>Respect rate limits.</b> Back off on <span className="mono">429</span> using the{" "}
                  <span className="mono">Retry-After</span> header, and watch{" "}
                  <span className="mono">X-RateLimit-Remaining</span> so you tune concurrency before you hit it.
                </li>
                <li>
                  <b>Thread a correlation id.</b> Pass <span className="mono">X-Correlation-Id</span> so one
                  request is traceable across your logs, the engine&apos;s logs, and its events.
                </li>
              </ul>

              <div className="doc-code-h mono">Acting on the verdict</div>
              <ul className="doc-list">
                <li>
                  <b>Handle all four verdicts, not just allow/deny.</b> Wire{" "}
                  <span className="vt-challenge">challenge</span> to a real step-up (3-D Secure / OTP) and{" "}
                  <span className="vt-review">review</span> to a hold — collapsing them to a block is where good
                  users get lost. Keep the <span className="mono">reasons</span> with the transaction for support
                  and compliance.
                </li>
                <li>
                  <b>Treat a <span className="mono">-1</span> score as &ldquo;short-circuited&rdquo;, not
                  low-risk.</b> A watchlist hit or a degraded decision reports <span className="mono">-1</span>{" "}
                  with an explanatory tag — branch on the <span className="mono">verdict</span>, never on the raw
                  score.
                </li>
              </ul>

              <div className="doc-code-h mono">Getting better over time</div>
              <ul className="doc-list">
                <li>
                  <b>Close the loop — it&apos;s the whole point.</b> Resolve review cases in the dashboard and
                  post chargebacks to <span className="mono">POST /v1/labels/chargeback</span>. Chargebacks are
                  the <i>only</i> signal for fraud you <b>allowed</b> and never reviewed, so this is what makes
                  the adaptive scorer and backtests trustworthy.
                </li>
                <li>
                  <b>Backtest before you publish, and roll out gradually.</b> Replay any rule or policy change
                  against your labeled history first. When you go live, start lenient — or run in{" "}
                  <b>shadow mode</b> (<span className="mono">X-Verdict-Mode: shadow</span>), which scores live
                  traffic without enforcing it. Read <span className="mono">GET /v1/shadow/report</span> to see what
                  Verdict would have blocked and — as chargebacks land — what share of confirmed fraud it would have
                  caught vs your current rules, then tighten the bands as the data confirms them.
                </li>
                <li>
                  <b>Audit what you send.</b> Send a card <span className="mono">bin</span> only, never a full
                  PAN. The engine masks phone numbers and IPs in its own logs, and the{" "}
                  <b>API activity log</b> (<span className="mono">GET /v1/activity</span>, or the dashboard&apos;s
                  Activity tab) lets you see exactly what each call sent and what it got back.
                </li>
                <li>
                  <b>Monitor the mix, not just uptime.</b> Watch verdict distribution, false-positive rate, p99
                  latency and 429s on the Analytics tab (or scrape <span className="mono">GET /metrics</span>).
                  Wire outcomes onward two ways, for two audiences: <b>alert notifications</b> ping a{" "}
                  <b>person</b> (a Slack channel on a <span className="vt-deny">deny</span> spike or a dead-letter),
                  while <b>webhooks</b> feed a <b>system</b> — the event goes to your own services so they can
                  react automatically (update a risk store, kick off downstream automation, land it in your
                  warehouse). Same events, different consumer.
                </li>
              </ul>

              <p className="doc-callout">
                <b>Develop against live, interactive docs.</b> The engine serves Swagger UI at{" "}
                <span className="mono">http://localhost:4000/docs</span> — log in with an operator account right
                on the page and call any endpoint against your own instance, with request and response schemas
                for every field.
              </p>
            </section>

            <section id="usecases" className="doc-sec">
              <h3>Use cases</h3>
              <p>
                The same event → verdict shape covers very different risk surfaces. Here are four common ones —
                the event you&apos;d send, and how you&apos;d act on the answer.
              </p>
              <div className="doc-uc">
                <div className="doc-uc-card">
                  <div className="doc-uc-h">Card payment authorization</div>
                  <p className="doc-uc-when">Protect checkout — score a card charge before you authorize it.</p>
                  <pre className="doc-code">{`POST /v1/decisions
{ "type": "card.authorize",
  "amount": 4200, "currency": "USD",
  "subject": { "userId": "usr_9", "deviceId": "dev_3", "ip": "…" },
  "instrument": { "kind": "card", "bin": "411111", "threeDS": false } }`}</pre>
                  <p className="doc-uc-act">
                    <span className="vt-allow">allow</span> → charge · <span className="vt-challenge">challenge</span> → trigger 3-D
                    Secure · <span className="vt-review">review</span> → hold &amp; queue · <span className="vt-deny">deny</span> → decline.
                    Signals: velocity, no-3DS, device takeover, amount.
                  </p>
                </div>

                <div className="doc-uc-card">
                  <div className="doc-uc-h">Account login / takeover</div>
                  <p className="doc-uc-when">Catch credential stuffing and account takeover at sign-in.</p>
                  <pre className="doc-code">{`POST /v1/decisions
{ "type": "account.login",
  "subject": { "userId": "usr_9", "deviceId": "dev_new", "ip": "203.0.113.7", "channel": "web" } }`}</pre>
                  <p className="doc-uc-act">
                    <span className="vt-allow">allow</span> → sign in · <span className="vt-challenge">challenge</span> → send an OTP ·{" "}
                    <span className="vt-deny">deny</span> → block. Signals: login velocity, new device, shared-IP ring.
                  </p>
                </div>

                <div className="doc-uc-card">
                  <div className="doc-uc-h">Wallet withdrawal / payout</div>
                  <p className="doc-uc-when">Guard money leaving the platform — where a miss is expensive, so fail closed.</p>
                  <pre className="doc-code">{`POST /v1/decisions
{ "type": "wallet.withdraw",
  "amount": 9000, "currency": "USD",
  "subject": { "userId": "usr_9", "deviceId": "dev_3" } }`}</pre>
                  <p className="doc-uc-act">
                    <span className="vt-review">review</span> / <span className="vt-deny">deny</span> hold or block a suspicious
                    payout. The policy&apos;s <span className="mono">on_error</span> is <b>fail_closed</b> here. Signals: amount
                    anomaly (vs the user&apos;s own history), dormant-then-spike, velocity.
                  </p>
                </div>

                <div className="doc-uc-card">
                  <div className="doc-uc-h">Signup &amp; promo abuse</div>
                  <p className="doc-uc-when">Stop one actor farming bonuses across many fake accounts.</p>
                  <pre className="doc-code">{`POST /v1/decisions
{ "type": "account.login",
  "subject": { "userId": "usr_new", "deviceId": "dev_shared", "ip": "198.51.100.4" } }`}</pre>
                  <p className="doc-uc-act">
                    The entity graph links accounts that share a device or IP; a large{" "}
                    <span className="mono">graph.ringSize</span> flags the ring → <span className="vt-review">review</span> or{" "}
                    <span className="vt-deny">deny</span>. Explore any entity&apos;s cluster in the dashboard&apos;s Graph tab.
                  </p>
                </div>
              </div>
            </section>

            <section id="mcp" className="doc-sec">
              <h3>LLM &amp; MCP integration</h3>
              <p>
                Verdict ships an official <b>Model Context Protocol server</b> (<span className="mono">verdict-mcp</span>),
                so any LLM client — Claude Code, Claude Desktop, Cursor — can drive the engine as tools. Integrate,
                operate and explore in plain language, no glue code:
              </p>
              <ul className="doc-list">
                <li>&ldquo;Score a $4,200 card authorization for user usr_9 on a new device.&rdquo;</li>
                <li>&ldquo;What&apos;s our false-positive rate this week?&rdquo;</li>
                <li>&ldquo;Show me the ring around device dev_shared.&rdquo;</li>
                <li>&ldquo;Backtest moving the review band to 35–69 for card.authorize.&rdquo;</li>
              </ul>
              <p>
                The server exposes tools for <span className="mono">decide</span>,{" "}
                <span className="mono">recent_decisions</span>, <span className="mono">analytics_summary</span>,{" "}
                <span className="mono">lookup_entity</span>, <span className="mono">list_rules</span>,{" "}
                <span className="mono">model_weights</span> and <span className="mono">backtest_policy</span>. Build it
                (<span className="mono">npm install &amp;&amp; npm run build</span> in <span className="mono">verdict-mcp/</span>),
                then point your client at it:
              </p>
              <pre className="doc-code">{MCP_CONFIG}</pre>
              <p>
                Credentials are scoped by what you pass: omit <span className="mono">VERDICT_API_KEY</span> for a
                read-only client, or omit <span className="mono">VERDICT_TOKEN</span> for a decisions-only one — a tool
                without its credential refuses rather than acting.
              </p>
              <p>
                Prefer to wire it yourself with an LLM? Point your coding agent at{" "}
                <a href={withBase("/llms.txt")}><span className="mono">/llms.txt</span></a> — a self-contained integration brief
                (auth, the event schema, verdict handling, every endpoint, the signal namespace) written for code
                assistants. Drop it into your repo or hand it to your agent and it can scaffold the integration
                against the real contract; the full field-by-field <a href={withBase("/api-reference")}>API reference</a> is
                there too.
              </p>
            </section>

            <section id="events" className="doc-sec">
              <h3>Events &amp; fields</h3>
              <p>
                Every channel is mapped into one normalized event, so the engine reasons about payments,
                logins and withdrawals the same way. Supported <span className="mono">type</span> values:{" "}
                <span className="mono">card.authorize · card.capture · card.refund · payment.authorize · wallet.withdraw · account.login · order.place</span>.
                Adding a channel is a field mapping, not a core change.
              </p>
              <p>
                Send as much as you have — every field is a potential signal, and absent fields simply mean
                the rules that read them do not fire. Identifiers you send (<span className="mono">userId</span>,{" "}
                <span className="mono">deviceId</span>, <span className="mono">ip</span>) are what the entity
                graph links, and <span className="mono">amount</span> feeds each user&apos;s anomaly baseline.
              </p>
              <div className="api-params">
                <div className="api-params-h">Request fields</div>
                <table className="api-tbl doc-tbl">
                  <tbody>
                    <Field n="type" t="enum (required)" d="Event type — selects the ruleset and policy." />
                    <Field n="amount / currency" t="number / string(3)" d="Value + ISO-4217 code for money-bearing events. Feeds amount and anomaly signals." />
                    <Field n="subject.userId" t="string (required)" d="The acting user — the primary graph node and anomaly key." />
                    <Field n="subject.deviceId" t="string" d="Stable device/client id — velocity, first-seen and device-linking signals." />
                    <Field n="subject.fingerprint" t="string" d="Device fingerprint hash — reuse across users and fingerprint↔device mismatch (cloning/spoofing), independent of deviceId." />
                    <Field n="subject.ip" t="string" d="Client IP — resolved to a location for geo signals, and linked in the graph (shared-IP / ring). Never placed in URLs or logs." />
                    <Field n="subject.phone" t="string" d="MSISDN for mobile-money / telecom rails — a graph entity; many accounts on one phone flags a SIM box." />
                    <Field n="subject.channel" t="string" d="Origin rail, e.g. visa, telebirr, web." />
                    <Field n="instrument.kind" t='"card" | "wallet" | "bank"' d="Payment instrument type." />
                    <Field n="instrument.bin" t="string(6–8)" d="Card issuer BIN only — never a full PAN." />
                    <Field n="instrument.issuerCountry" t="string(2)" d="ISO-3166 issuer country." />
                    <Field n="instrument.threeDS" t="boolean" d="Whether the transaction carried a 3-D Secure result." />
                    <Field n="attributes" t="object" d="Extra validated scalars, e.g. { geoMismatch: true }. Readable in rules as attr.<key>." />
                  </tbody>
                </table>
              </div>
            </section>

            <section id="signals" className="doc-sec">
              <h3>Signals &amp; rules</h3>
              <p>
                Rules read a flat namespace of <b>signals</b> derived from the event and the engine&apos;s
                own state. Some come straight off the event; others are computed at decision time by the
                feature store (velocity), the entity graph, and the anomaly baseline. Any of these can appear
                in a rule condition:
              </p>
              <div className="api-params">
                <div className="api-params-h">Signal namespaces</div>
                <table className="api-tbl doc-tbl">
                  <tbody>
                    <Field n="event.*" t="type · channel · amount · currency" d="Straight from the event." />
                    <Field n="instrument.*" t="kind · bin · issuerCountry · threeDS" d="Payment instrument metadata." />
                    <Field n="velocity.*" t="attemptsLast2m · attemptsLast24h · amountLast1h" d="Rolling counters from the feature store." />
                    <Field n="device.*" t="firstSeen · usersOnDevice · usersOnFingerprint · fingerprintFirstSeen · fingerprintDeviceMismatch" d="Device & fingerprint recency, sharing, and cloning/spoofing." />
                    <Field n="geo.*" t="country · distanceKm · countryChanged · impossibleTravel · ipSimMismatch" d="IP-resolved location, distance from the user's last location, and travel faster than a jet." />
                    <Field n="graph.*" t="ringSize · usersOnDevice · usersOnIp · usersOnPhone · devicesOnUser" d="Entity-graph link counts and cluster size — incl. accounts sharing a phone (SIM box)." />
                    <Field n="anomaly.*" t="amountZScore · amountMean · samples" d="Deviation from this user's own history." />
                    <Field n="attr.*" t="any scalar you send" d="Your custom attributes." />
                  </tbody>
                </table>
              </div>
              <p>
                A rule <b>proposes</b>: when its condition matches it adds weight under a tag — it never
                decides on its own. Rules are authored in a small DSL, versioned in git, hot-reloaded, and
                diffable in review. That separation (rules propose, scoring weighs, policy decides) is what
                keeps every verdict attributable.
              </p>
              <pre className="doc-code">{RULE}</pre>
            </section>

            <section id="verdicts" className="doc-sec">
              <h3>Verdicts &amp; scoring</h3>
              <p>
                <b>Scoring</b> sums the weights of every matched rule, per tag, into a single 0–100 number.
                A <b>policy</b> then maps score bands to one of four verdicts. How you act on each is up to
                your integration:
              </p>
              <table className="doc-tbl full">
                <tbody>
                  <tr><td><span className="vt-allow">allow</span></td><td>Let it through.</td></tr>
                  <tr><td><span className="vt-challenge">challenge</span></td><td>Step the user up (3-D Secure / OTP) before proceeding.</td></tr>
                  <tr><td><span className="vt-review">review</span></td><td>Hold and let an analyst decide — a case opens automatically.</td></tr>
                  <tr><td><span className="vt-deny">deny</span></td><td>Block it.</td></tr>
                </tbody>
              </table>
              <p>
                Every verdict carries the <span className="mono">score</span> and the{" "}
                <span className="mono">reasons</span> (tag + points) that produced it — so a decision is
                always auditable, and a support or compliance question has a concrete answer. A watchlist or
                degraded short-circuit reports a score of <span className="mono">-1</span> with an explanatory
                tag. Because decisions are written to an <b>append-only verdict log</b>, any of them can be
                replayed or backtested later.
              </p>
              <p>
                <b>Three scorers, one seam.</b> The default is the transparent hand-weighted sum. Set{" "}
                <span className="mono">SCORER=learned</span> for the adaptive model that learns each tag&apos;s
                fraud rate from your labels, or <span className="mono">SCORER=ml</span> for a{" "}
                <b>trained logistic-regression model</b> that consumes the whole feature vector — velocity,
                device fingerprint, geolocation, graph and anomaly signals, plus the rules&apos; own score — and
                returns a calibrated risk with the per-feature terms as the <span className="mono">reasons</span>.
                It is trained offline on a <b>synthetic dataset</b> (<span className="mono">npm run train:model</span>);
                inference is a single dot-product plus a sigmoid, so it adds nothing to decision latency. All
                three implement the same port, so switching is one environment variable — nothing else moves.
                The ML weights are <b>hot-swappable</b> and can load from a <b>local file</b>
                (<span className="mono">MODEL_PATH</span>), an <b>HTTPS URL</b> (<span className="mono">MODEL_URL</span>),
                or <b>S3-compatible storage</b> (<span className="mono">MODEL_S3_*</span> — AWS S3, MinIO, R2, Spaces),
                refreshed on a timer — validated against the feature vector, with the bundled weights as a safe
                fallback — so you roll out a retrained model without a redeploy. See the active model and its
                per-feature weights at <span className="mono">GET /v1/config/model</span>.
              </p>
              <p>
                <b>Scaling the ML pipeline.</b> Serving and training scale independently by design.{" "}
                <b>Serving</b> is a fixed-cost dot-product held in the image — no model server, no network hop,
                no GPU — so it adds microseconds and scales horizontally with engine replicas, which each load
                and validate the same weights. The practical ceiling at very high volume is the feature{" "}
                <i>reads</i> (velocity, graph), not the model. <b>Training</b> is fully decoupled: the engine
                never trains at runtime and only consumes a validated JSON weights file, so the bundled
                gradient-descent trainer is just a reference — you can train on real labels at any scale in an
                external batch job (Python, a GBM, a feature store) and publish the weights to{" "}
                <span className="mono">MODEL_S3_*</span> on whatever cadence you retrain. Because labels arrive
                as events (analyst resolutions and chargebacks), the same loop that improves the adaptive scorer
                is the training set for the ML model.
              </p>
            </section>

            <section id="reason-codes" className="doc-sec">
              <h3>Reason codes</h3>
              <p>
                Every verdict carries three layers of &quot;why&quot;, each for a different audience, so a
                decline can be explained without teaching a fraudster which rule fired:{" "}
                <span className="mono">reasons</span> (the rule tags + points, for your analysts),{" "}
                <span className="mono">reasonCodes</span> (the stable codes below, for your ops / dispute team),
                and <span className="mono">customerMessage</span> (one vague line safe to show the cardholder).
                The codes are a published contract — stable and safe to log, alert on, and map. A custom
                (operator-authored) rule with no mapping returns <span className="mono">RISK_OTHER</span>.
              </p>
              <div className="api-params">
                <div className="api-params-h">Reason code · category · meaning</div>
                <table className="api-tbl doc-tbl">
                  <tbody>
                    <Field n="VELOCITY_HIGH" t="velocity" d="Too many attempts in a short window." />
                    <Field n="ACCOUNT_TAKEOVER" t="authentication" d="New device combined with a location/SIM mismatch — possible takeover." />
                    <Field n="AUTH_WEAK" t="authentication" d="Strong authentication (e.g. 3-D Secure) was absent on a risky transaction." />
                    <Field n="DEVICE_NEW" t="device" d="First time this device/client has been seen." />
                    <Field n="DEVICE_SHARED" t="device" d="Device shared across an unusual number of users." />
                    <Field n="NETWORK_SHARED_IP" t="network" d="IP shared across an unusual number of users." />
                    <Field n="NETWORK_RING" t="network" d="Entity sits in a dense cluster — a likely fraud ring." />
                    <Field n="NETWORK_SIM" t="network" d="Phone/SIM shared across many users — possible SIM farm." />
                    <Field n="AMOUNT_HIGH" t="amount" d="Transaction amount above the configured threshold." />
                    <Field n="AMOUNT_ANOMALY" t="anomaly" d="Amount far outside this user's normal range." />
                    <Field n="ANOMALY" t="anomaly" d="Behaviour outside this user's baseline (e.g. a dormant account spiking)." />
                    <Field n="BLOCKLISTED" t="list" d="A subject on the block list." />
                    <Field n="WATCHLISTED" t="list" d="A subject on the watch list — routed to review." />
                    <Field n="SYSTEM_DEGRADED" t="system" d="A dependency was degraded; the policy's fail-open/closed verdict was applied." />
                    <Field n="RISK_OTHER" t="other" d="A custom (operator-authored) rule fired, with no mapped code." />
                  </tbody>
                </table>
              </div>
            </section>

            <section id="configure" className="doc-sec">
              <h3>Configuration</h3>
              <p>
                Rules, scoring and policies are <b>configuration you own</b> — versioned like code, editable
                live in the dashboard. Rules add weighted tags (previous section). Scoring sums them. A{" "}
                <b>policy</b> maps score bands to verdicts, with an <span className="mono">on_error</span> mode
                (fail-open / fail-closed) that decides the outcome when a dependency is degraded — on purpose,
                never silently.
              </p>
              <pre className="doc-code">{POLICY}</pre>
              <p>
                Admins edit a policy&apos;s bands and <b>publish a new version</b>; every version is retained,
                so you can <b>roll back</b> in one click and <b>simulate</b> a score before shipping. Bands
                must cover 0–100 with no gaps or overlaps — the engine validates this on publish and refuses an
                invalid policy. All of this is live in the dashboard&apos;s <span className="mono">Configure</span>{" "}
                tab, or over the <a href={withBase("/api-reference")}>config API</a>.
              </p>
            </section>

            <section id="dashboard" className="doc-sec">
              <h3>The operator dashboard</h3>
              <p>
                Everything below is driven from a self-hosted operator console (a separate Next.js app that
                talks to the engine&apos;s API). Analysts work the review queue and resolve cases; admins
                configure rules, policies, scoring, retention, keys and webhooks — all server-side, nothing
                the client can bypass.
              </p>
              <ScreenshotGallery
                shots={[
                  {
                    src: "/screenshots/dashboard.jpg",
                    alt: "Verdict operator dashboard — review queue",
                    caption: "Review queue — cases the engine sent to review, ready to triage, assign and resolve.",
                  },
                  {
                    src: "/screenshots/case.jpg",
                    alt: "Case detail with risk score and resolution",
                    caption: "Case detail — risk score, the event/verdict ids, and the resolution + audit trail.",
                  },
                  {
                    src: "/screenshots/scoring-model.jpg",
                    alt: "Configure — scoring model panel",
                    caption: "Configure → Scoring model — the active scorer, model provenance and per-feature weights.",
                  },
                  {
                    src: "/screenshots/storage.jpg",
                    alt: "Configure — storage and server disk health",
                    caption: "Configure → Storage — document-store size plus server-disk health per mount.",
                  },
                  {
                    src: "/screenshots/analytics.jpg",
                    alt: "Analytics read-model",
                    caption: "Analytics — decision and outcome rollups, projected from the verdict log.",
                  },
                ]}
              />
            </section>

            <section id="operate" className="doc-sec">
              <h3>Operating</h3>
              <p>
                A <span className="vt-review">review</span> verdict opens a <b>case</b> in the dashboard queue.
                An analyst assigns it to themselves, works it, and resolves it as{" "}
                <span className="vt-deny">fraud</span>, <span className="vt-allow">legit</span>, or
                inconclusive. Every action is recorded on an append-only <b>audit trail</b>, and the analyst is
                always taken from the authenticated token, never the request body.
              </p>
              <p>
                Configuration changes are audited too. Every operator mutation — a rate-limit or retention
                tweak, a published policy, a new alert channel or API key — is written to a{" "}
                <b>config-change audit log</b> (<span className="mono">GET /v1/audit</span>) with the actor, the
                action, the time and the result; secret-ish fields (URLs, tokens) are redacted before storage.
                So &ldquo;who changed this, and when?&rdquo; always has an answer.
              </p>
              <p>
                Resolving a case records a <b>label</b> — ground truth about that event. Chargebacks post the
                same kind of label from your PSP via <span className="mono">POST /v1/labels/chargeback</span>,
                which crucially covers the frauds you <i>allowed</i> and never sent to review. Both feed the
                same learning loop.
              </p>
              <p>
                The <b>Analytics</b> tab shows verdict mix, score distribution, top signals, decisions per day,
                label counts (including chargebacks), and the false-positive rate — a read-model maintained by
                a projector that consumes events, so it never touches the decision path.
              </p>
              <p>
                The <b>Activity</b> tab is the API interaction log: every scored call, newest first, pairing the
                exact request payload with the verdict it produced (<span className="mono">GET /v1/activity</span>).
                It&apos;s your audit trail for &ldquo;what did we send and what did we get back&rdquo; — with
                phone numbers and IPs masked and card data BIN-only, so the log itself is safe to keep.
              </p>
              <p>
                <b>Webhooks</b> push those same events to your systems in real time. Register an endpoint in the
                dashboard (admin → Webhooks) for <span className="mono">verdict.reached</span>,{" "}
                <span className="mono">case.resolved</span> or <span className="mono">label.recorded</span>; each
                delivery is a signed <span className="mono">POST</span> — verify the{" "}
                <span className="mono">X-Verdict-Signature</span> header (HMAC-SHA256 of the body) before trusting
                it. Deliveries are durable: retried with backoff and dead-lettered after repeated failure, off
                the decision path — inspect and re-drive them under Webhooks.
              </p>
              <p>
                <b>Alert notifications</b> send those events to a person, not a system. Add a{" "}
                <b>Slack</b> incoming-webhook, a <b>Telegram</b> bot (URL{" "}
                <span className="mono">https://api.telegram.org/bot&lt;token&gt;/sendMessage</span> plus a chat id), or a
                generic HTTPS channel (<span className="mono">POST /v1/notifications</span>),
                subscribe it to the events you care about, and — for <span className="mono">verdict.reached</span> —
                set a minimum severity so you only get pinged on, say, <span className="vt-deny">deny</span>.
                Built-in <span className="mono">alert.anomaly</span> (a decision whose amount is far from the
                user&apos;s own baseline — tune the z-score threshold under Configure) and{" "}
                <span className="mono">alert.dead_letter</span> (a delivery that finally gave up) events mean
                unusual activity and operational failures reach you too. Delivery is <b>durable</b> — each
                alert is queued, retried with backoff and dead-lettered if it never lands (inspect and re-drive
                via <span className="mono">GET/POST /v1/notifications/deliveries</span>), all off the request
                path — and <b>throttled per channel</b> (set <span className="mono">throttlePerMin</span>) so an
                alert storm can&apos;t bury an operator or rate-limit your Slack.
              </p>
            </section>

            <section id="intelligence" className="doc-sec">
              <h3>Intelligence</h3>
              <p>
                Four capabilities turn that feedback into better decisions. All are optional and observable.
              </p>
              <p>
                <b>Adaptive scoring.</b> Set <span className="mono">SCORER=learned</span> and the scorer weights
                each signal by how often it has ridden a fraud label in your own resolved cases and
                chargebacks — a tag keeps its hand weight until it has enough labels to trust, so a fresh
                deploy behaves exactly like the weighted scorer and drifts toward your data. Inspect the learned
                weights any time at <span className="mono">GET /v1/model</span> (or the Analytics page), even
                while the weighted scorer is live.
              </p>
              <p>
                <b>Rule &amp; policy backtesting.</b> Before you ship a change, replay it against your labeled
                history and see how it <i>would</i> have performed — precision, recall, and the deltas in fraud
                caught, false positives, and verdict flips versus the live policy. It is read-only; nothing is
                published.
              </p>
              <pre className="doc-code">{BACKTEST}</pre>
              <p>
                <b>Entity graph.</b> Users, devices and IPs are linked as they co-occur on events. Rules can
                read <span className="mono">graph.ringSize</span> and the link counts to flag rings a single
                event can&apos;t reveal, and analysts can explore any entity&apos;s cluster at{" "}
                <span className="mono">GET /v1/graph/:kind/:id</span> or the dashboard&apos;s Graph tab.
              </p>
              <p>
                <b>Anomaly detection.</b> The engine keeps a per-user spending baseline and exposes{" "}
                <span className="mono">anomaly.amountZScore</span> — how many standard deviations a charge sits
                from that user&apos;s own history — so a rule can flag &quot;this doesn&apos;t look like this
                account&quot; without a fixed threshold.
              </p>
            </section>

            <section id="governance" className="doc-sec">
              <h3>Data governance</h3>
              <p>
                Verdict stores the identifiers you send and the decisions it makes about them. It expects a
                card <span className="mono">bin</span> only and <b>never a full PAN</b>. Personal data lives in
                four places: the entity graph, the per-user anomaly baseline, the replay log (which keeps whole
                events for backtesting), and the activity log (which keeps the masked request per decision).
              </p>
              <p>
                <b>Right to erasure.</b> An admin can remove a user across all four with one call. The
                append-only verdict log is intentionally out of scope — it holds only an event id, verdict and
                tags — and should be aged out with a retention window instead.
              </p>
              <pre className="doc-code">{ERASE}</pre>
              <p>
                Postgres is the system of record; back it up on your normal schedule. The dashboard holds no
                data of its own.
              </p>
            </section>

            <section id="deploy" className="doc-sec">
              <h3>Deployment</h3>
              <p>Bring up Postgres, the engine, and the dashboard with one command:</p>
              <pre className="doc-code">{COMPOSE}</pre>
              <p>
                <b>There is no fallback for <span className="mono">AUTH_SECRET</span></b> — the stack refuses to
                start until you supply a real one (placeholders and repeated-character filler are rejected too).
                Generate it once and keep it stable across restarts, or existing operator tokens stop verifying.
              </p>
              <div className="api-params">
                <div className="api-params-h">What runs where</div>
                <table className="api-tbl doc-tbl">
                  <tbody>
                    <Field n="engine" t=":4000 · private" d="The API and the interactive Swagger at /docs. Speaks plain HTTP — keep the port private and put a TLS proxy in front. This is the only service that must reach Postgres and Redis." />
                    <Field n="dashboard" t=":3000 · internal" d="The operator UI (review queue, config, analytics, keys). Reaches the engine over VERDICT_API_URL; expose it only to your team." />
                    <Field n="postgres / redis" t="not published" d="Backing services on the compose network — no host ports. Postgres is the system of record; Redis is optional (shared idempotency/velocity/rate-limits)." />
                  </tbody>
                </table>
              </div>
              <p className="doc-callout">
                <b>Docs vs. your deployment.</b> This documentation site and its Swagger preview are the public
                project site — they are <i>not</i> part of the stack you run. Your own live, try-it-out API docs
                are served by the engine itself at <span className="mono">/docs</span> on port 4000, behind your
                proxy. Nothing you deploy runs on port 3001.
              </p>
              <div className="api-params">
                <div className="api-params-h">Environment</div>
                <table className="api-tbl doc-tbl">
                  <tbody>
                    <Field n="AUTH_SECRET" t="required in prod" d="Signs operator tokens. Generate with: openssl rand -hex 32" />
                    <Field n="DATABASE_URL" t="required in prod" d="postgres:// connection string. Durable users, cases, verdicts, keys, graph." />
                    <Field n="DATABASE_POOL_MAX" t="default 20" d="Max Postgres connections per engine replica. Raise it if decisions queue under load." />
                    <Field n="REDIS_URL" t="multi-replica" d="redis:// connection. Shares idempotency, velocity and rate limits across replicas — required to run more than one engine replica." />
                    <Field n="PORT" t="default 4000" d="Engine HTTP port." />
                    <Field n="VERDICT_API_URL" t="dashboard" d="Where the dashboard reaches the engine (e.g. http://engine:4000)." />
                    <Field n="PERSISTENCE" t="optional" d="Set to `memory` to explicitly accept a non-persistent deploy (demos only)." />
                    <Field n="SCORER" t="optional" d="`weighted` (default), `learned` (adaptive), or `ml` (trained model). Set MODEL_URL to hot-load ML weights from a cloud bucket." />
                    <Field n="RATE_LIMIT_DECISIONS_PER_MIN" t="default 600" d="Per-API-key budget for POST /v1/decisions before a 429." />
                    <Field n="RATE_LIMIT_LOGIN_PER_MIN" t="default 10" d="Per-IP budget for login — a brute-force brake." />
                    <Field n="TRUST_PROXY" t="default off" d="Proxy hops to trust for the real client IP (per-IP limits). Default ignores X-Forwarded-For so it can't be spoofed; set 1 behind a single LB." />
                    <Field n="AUTH_SECRET_PREVIOUS" t="rotation" d="Previous signing secret(s), comma-separated, kept valid while you rotate AUTH_SECRET — see the security section." />
                  </tbody>
                </table>
              </div>
              <p>
                The engine <b>validates its environment at startup and refuses to boot</b> if it is
                misconfigured — so a bad deploy fails loudly instead of coming up insecure or without a
                database:
              </p>
              <pre className="doc-code">{BOOTFAIL}</pre>
              <p>
                <b>Persistence is Postgres</b>, durable across restarts; the in-memory store is for dev and
                tests only. Put a TLS-terminating reverse proxy in front and keep the engine port private —
                it speaks plain HTTP. Health for probes: <span className="mono">GET /health</span>. The engine
                emits one structured JSON log line per operational event (a degraded decision logs{" "}
                <span className="mono">engine.degraded</span> with a scrubbed cause) — ship these to your log
                stack. Metrics are exposed at <span className="mono">GET /metrics</span> in Prometheus format
                (decision latency and outcomes, 429s, outbox and webhook delivery counters and queue depth,
                retention rows pruned) — keep that endpoint on the private port.
              </p>
              <p className="doc-callout">
                <b>Running at scale?</b> Set <span className="mono">REDIS_URL</span> and run several engine
                replicas behind a load balancer — idempotency, velocity and rate limits are shared in Redis, so
                a retry or a burst is enforced consistently across nodes. The transactional outbox is durable
                (Postgres) and delivers at-least-once with backoff and a dead-letter, so an event survives a
                crash. The full guide — scaling limits, sizing, key rotation and a security checklist — is in{" "}
                <span className="mono">DEPLOYMENT.md</span>.
              </p>
            </section>

            <section id="capacity" className="doc-sec">
              <h3>Requirements &amp; capacity</h3>
              <p>
                Verdict is light to run. The engine is an IO-bound Node process and the dashboard is
                stateless — <b>Postgres is the component you size for growth</b>. A small setup comfortably
                handles a startup&apos;s traffic; the numbers below are a starting point, not a ceiling.
              </p>
              <div className="api-params">
                <div className="api-params-h">Recommended servers (to start)</div>
                <table className="api-tbl doc-tbl">
                  <tbody>
                    <Field n="Engine (per replica)" t="1–2 vCPU · 1 GB" d="Stateless behind Postgres; mostly waiting on the database. Scale out once the Redis adapters land (see below)." />
                    <Field n="Dashboard" t="0.5 vCPU · 512 MB" d="Stateless Next.js. One instance is plenty for an ops team." />
                    <Field n="PostgreSQL 16" t="2 vCPU · 4 GB · SSD" d="The system of record. Give it fast disk, backups, and room to grow with your history." />
                  </tbody>
                </table>
              </div>
              <p>
                <b>Measured throughput.</b> A single engine replica sustained <b>~300 decisions/second</b> in
                our benchmark — and that was a dev laptop running Postgres over Docker Desktop, a deliberately
                pessimistic setup for database round-trip latency. Latency was <b>~20&nbsp;ms</b> for a lone
                request, and <b>p50&nbsp;~70&nbsp;ms · p99&nbsp;~140&nbsp;ms</b> under moderate concurrency,
                with zero errors up to 64 requests in flight. On a tuned Linux host with Postgres on a
                low-latency network, expect materially higher throughput and lower latency.
              </p>
              <p>
                <b>What sets the ceiling.</b> Each decision makes several database round-trips — velocity, the
                entity graph, the anomaly baseline, the policy, then the log and outbox writes — so per-node
                throughput is bound by <i>database latency</i>, not CPU. The two levers are (1) keeping
                Postgres close and sizing the pool (<span className="mono">DATABASE_POOL_MAX</span>, default
                20), and (2) setting <span className="mono">REDIS_URL</span> so the hot velocity reads and
                idempotency go to <b>Redis</b> — which also lets you run <b>several engine replicas</b> behind
                a load balancer, sharing one budget. Without it, those are per-replica, so run a single one.
                Postgres and the dashboard scale out either way.
              </p>
              <p>
                <b>Sizing storage.</b> Budget roughly three rows per decision — the append-only verdict log,
                the replay sample (which holds the whole event, for backtesting), and a scoring sample —
                plus a graph node per new entity. That is on the order of a few GB per million decisions.
              </p>
              <p>
                <b>Retention &amp; pruning.</b> A built-in job keeps those append-only collections from growing
                without limit: on a timer it deletes rows older than each collection&apos;s window — verdict
                log, activity log, replay samples, idempotency keys and dead-lettered events. Defaults are 365 /
                90 / 90 / 7 / 30 days; a window of <span className="mono">0</span> keeps a collection forever.
                Tune them per deployment via <span className="mono">RETENTION_*</span> env vars, or at runtime on
                the dashboard&apos;s Configure tab (<span className="mono">GET/PUT /v1/config/retention</span>);{" "}
                <span className="mono">POST /v1/config/retention/run</span> forces a sweep. Counts are exported as{" "}
                <span className="mono">verdict_retention_pruned_total</span>. For disk management,{" "}
                <span className="mono">GET /v1/config/storage</span> reports the store&apos;s size on disk and
                per-collection row counts (also sampled into the <span className="mono">verdict_storage_*</span>{" "}
                metrics each sweep) — so you can see what&apos;s growing; set{" "}
                <span className="mono">RETENTION_VACUUM=true</span> to reclaim freed space promptly.
              </p>
              <p>
                <b>Server disk health.</b> For Docker deployments where data sits on a volume, the same{" "}
                <span className="mono">GET /v1/config/storage</span> (and the dashboard&apos;s Storage panel) also
                reports the <b>filesystem</b> health of the disks that data lives on — total, free and used, per
                mount — plus a <b>per-service breakdown</b> of what&apos;s consuming the disk (the document store,
                and a disk-backed model file). Point <span className="mono">DISK_HEALTH_PATHS</span> at the volume
                mounts you want watched; the engine can only see filesystems mounted into its <i>own</i>{" "}
                container, so to watch the Postgres volume from here, bind-mount it (read-only) into the engine —
                otherwise monitor the database container&apos;s volume with node_exporter or cAdvisor. The values
                are exported as <span className="mono">verdict_disk_total_bytes</span>,{" "}
                <span className="mono">verdict_disk_free_bytes</span>,{" "}
                <span className="mono">verdict_disk_used_ratio</span> and{" "}
                <span className="mono">verdict_disk_component_bytes</span> for alerting.
              </p>
            </section>

            <section id="security" className="doc-sec">
              <h3>Security</h3>
              <ul className="doc-list">
                <li><b>API keys</b> are random (<span className="mono">vk_live_…</span>), SHA-256-hashed at rest, shown once, and revocable instantly. They can be <b>scoped</b> (decisions / labels) and given an <b>expiry</b>; a request outside a key&apos;s scope is rejected with 403.</li>
                <li><b>Operator auth</b> uses scrypt-hashed passwords and signed bearer tokens (12-hour expiry) carrying issuer, audience, a key id and a unique token id, with roles (admin / analyst). The first user bootstraps as admin; public registration then closes.</li>
                <li><b>Session revocation</b>: <span className="mono">POST /v1/auth/logout</span> revokes the current token immediately (before it expires), <span className="mono">/logout-all</span> ends every session for the user, and <span className="mono">/refresh</span> slides a session — so a leaked or stale token can be cut off, not just waited out.</li>
                <li><b>Key rotation</b>: each token records the key that signed it (<span className="mono">kid</span>), so <span className="mono">AUTH_SECRET</span> rotates with zero forced logouts — set the old secret as <span className="mono">AUTH_SECRET_PREVIOUS</span> until its tokens age out. Placeholder/weak secrets are rejected at boot.</li>
                <li><b>Rate limiting</b> guards the decision endpoint (per key) and login (per IP), returning 429 + Retry-After. Per-IP limits use the proxy-aware client IP (<span className="mono">TRUST_PROXY</span>), never a spoofable header.</li>
                <li><b>Data</b>: BIN only, never a full PAN; the verdict log is append-only; phone/IP are masked in the activity log; personal data is erasable per user (see Data governance).</li>
                <li><b>Ownership</b> is enforced server-side — a case action uses the analyst from the token, never an id from the body.</li>
                <li><b>Webhooks</b> are HMAC-signed (<span className="mono">X-Verdict-Signature</span>); deliveries are durable with retry, backoff and a dead-letter you can inspect and re-drive.</li>
                <li>Payment callbacks and chargebacks are machine endpoints — key them, and re-verify amount and status server-side before fulfilling.</li>
                <li><b>Supply chain</b>: CI runs <span className="mono">npm audit</span> (high+ severity) alongside type-check and tests on every change.</li>
              </ul>
            </section>
          </div>
        </div>
      </div>
    </section>
  );
}
