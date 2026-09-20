const notes = [
  {
    no: "A",
    title: "Ports & adapters",
    body: "Every context depends on interfaces, not implementations. Redis, MySQL, Kafka and the ML scorer are swappable adapters.",
  },
  {
    no: "B",
    title: "Append-only verdict log",
    body: "Decisions are events, never mutated. Replay the log to backtest a rule change or reconstruct any verdict.",
  },
  {
    no: "C",
    title: "Extract without rewrite",
    body: "Scoring melting under load? It already talks over the bus. Move it to its own service; nothing upstream changes.",
  },
];

const MONO = "var(--font-mono), monospace";
const SANS = "var(--font-sans), sans-serif";

export function Architecture() {
  return (
    <section className="block" id="architecture">
      <div className="wrap">
        <div className="sec-head">
          <span className="lbl">Architecture</span>
          <span className="rule" />
        </div>
        <div className="sec-intro">
          <h2>A modular monolith whose seams are already service boundaries.</h2>
          <p>
            Seven bounded contexts, each owning its data, talking over an event
            bus and typed ports — never a shared table. Ships as one process.
            Every arrow that crosses a context is exactly where you&apos;d cut to
            extract a service.
          </p>
        </div>

        <figure className="arch-fig">
          <svg
            viewBox="0 0 960 440"
            role="img"
            aria-label="Data-flow: an event enters Ingest, flows through Rules and Scoring to Decision, which emits allow, review or deny. A Feature Store feeds Rules and Scoring. Review verdicts open Cases whose labels feed Feedback back into Rules."
          >
            <defs>
              <marker
                id="ar"
                viewBox="0 0 10 10"
                refX="9"
                refY="5"
                markerWidth="7"
                markerHeight="7"
                orient="auto-start-reverse"
              >
                <path d="M0 0L10 5L0 10z" fill="currentColor" />
              </marker>
            </defs>

            <rect
              x="24"
              y="46"
              width="800"
              height="344"
              fill="none"
              stroke="var(--line-2)"
              strokeWidth="1.2"
              strokeDasharray="6 6"
            />
            <text
              x="40"
              y="68"
              fontFamily={MONO}
              fontSize="11"
              fill="var(--mute)"
              letterSpacing="0.06em"
            >
              ONE DEPLOYABLE · SPLIT ALONG THE SEAMS
            </text>

            <g fontFamily={SANS} fontSize="14" fontWeight="600">
              <g>
                <rect x="44" y="170" width="140" height="62" fill="var(--panel)" stroke="var(--line-2)" />
                <text x="114" y="198" textAnchor="middle" fill="var(--ink)">Ingest</text>
                <text x="114" y="216" textAnchor="middle" fontFamily={MONO} fontSize="10" fontWeight="400" fill="var(--faint)">normalize</text>
              </g>
              <g>
                <rect x="248" y="170" width="140" height="62" fill="var(--panel)" stroke="var(--line-2)" />
                <text x="318" y="198" textAnchor="middle" fill="var(--ink)">Rules</text>
                <text x="318" y="216" textAnchor="middle" fontFamily={MONO} fontSize="10" fontWeight="400" fill="var(--faint)">evaluate DSL</text>
              </g>
              <g>
                <rect x="452" y="170" width="140" height="62" fill="var(--panel)" stroke="var(--line-2)" />
                <text x="522" y="198" textAnchor="middle" fill="var(--ink)">Scoring</text>
                <text x="522" y="216" textAnchor="middle" fontFamily={MONO} fontSize="10" fontWeight="400" fill="var(--faint)">weight → 0–100</text>
              </g>
              <g>
                <rect x="656" y="170" width="140" height="62" fill="var(--panel)" stroke="var(--ink)" strokeWidth="1.6" />
                <text x="726" y="198" textAnchor="middle" fill="var(--ink)">Decision</text>
                <text x="726" y="216" textAnchor="middle" fontFamily={MONO} fontSize="10" fontWeight="400" fill="var(--faint)">apply policy</text>
              </g>
            </g>

            <rect x="300" y="70" width="240" height="50" fill="var(--panel-2)" stroke="var(--line-2)" />
            <text x="420" y="91" textAnchor="middle" fontFamily={SANS} fontSize="13.5" fontWeight="600" fill="var(--ink)">Feature Store</text>
            <text x="420" y="107" textAnchor="middle" fontFamily={MONO} fontSize="10" fill="var(--faint)">velocity · aggregates</text>

            <g fontFamily={SANS} fontSize="13.5" fontWeight="600">
              <rect x="656" y="298" width="140" height="50" fill="var(--panel)" stroke="var(--line-2)" />
              <text x="726" y="328" textAnchor="middle" fill="var(--ink)">Cases</text>
              <rect x="248" y="298" width="140" height="50" fill="var(--panel)" stroke="var(--line-2)" />
              <text x="318" y="328" textAnchor="middle" fill="var(--ink)">Feedback</text>
            </g>

            <g stroke="currentColor" strokeWidth="1.5" fill="none" color="var(--mute)">
              <line x1="6" y1="201" x2="40" y2="201" markerEnd="url(#ar)" />
              <line x1="184" y1="201" x2="244" y2="201" markerEnd="url(#ar)" />
              <line x1="388" y1="201" x2="448" y2="201" markerEnd="url(#ar)" />
              <line x1="592" y1="201" x2="652" y2="201" markerEnd="url(#ar)" />
              <line x1="360" y1="120" x2="332" y2="166" markerEnd="url(#ar)" />
              <line x1="480" y1="120" x2="508" y2="166" markerEnd="url(#ar)" />
              <line x1="726" y1="232" x2="726" y2="294" markerEnd="url(#ar)" />
              <line x1="652" y1="323" x2="392" y2="323" markerEnd="url(#ar)" />
              <line x1="318" y1="298" x2="318" y2="236" markerEnd="url(#ar)" />
            </g>

            <line x1="796" y1="201" x2="854" y2="201" stroke="var(--ink)" strokeWidth="1.6" markerEnd="url(#ar)" color="var(--ink)" />
            <g fontFamily={MONO} fontSize="11.5" fontWeight="600">
              <rect x="860" y="178" width="86" height="19" fill="none" stroke="var(--allow)" />
              <text x="903" y="191" textAnchor="middle" fill="var(--allow)">allow</text>
              <rect x="860" y="201" width="86" height="19" fill="none" stroke="var(--review)" />
              <text x="903" y="214" textAnchor="middle" fill="var(--review)">review</text>
              <rect x="860" y="224" width="86" height="19" fill="none" stroke="var(--deny)" />
              <text x="903" y="237" textAnchor="middle" fill="var(--deny)">deny</text>
            </g>

            <g fontFamily={MONO} fontSize="10" fill="var(--faint)" textAnchor="middle">
              <text x="214" y="193">event</text>
              <text x="418" y="193">hits</text>
              <text x="622" y="193">score</text>
              <text x="330" y="150" textAnchor="end">features</text>
              <text x="512" y="150" textAnchor="start">features</text>
              <text x="738" y="270" textAnchor="start">review</text>
              <text x="522" y="316">labels</text>
              <text x="330" y="272" textAnchor="start">tunes</text>
            </g>
          </svg>
          <figcaption>
            ONE REQUEST IN, ONE VERDICT OUT — WITH A FEEDBACK ARC THAT KEEPS THE
            RULES HONEST
          </figcaption>
        </figure>

        <div className="arch-notes">
          {notes.map((n) => (
            <div className="an" key={n.no}>
              <span className="no">{n.no}</span>
              <h4>{n.title}</h4>
              <p>{n.body}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
