import type { ReactNode } from "react";
import { authNotes, BASE_URL, endpoints, type Auth, type Endpoint, type Field } from "@/lib/api-spec";
import { CopyButton } from "./CopyButton";

function withVerdicts(text: string): ReactNode[] {
  return text.split(/%(allow|challenge|review|deny)%/g).map((part, i) =>
    i % 2 === 1 ? <span key={i} className={`vt-${part}`}>{part}</span> : <span key={i}>{part}</span>,
  );
}

/** The clean text to copy — strip the %verdict% display markers. */
const plain = (text: string): string => text.replace(/%(allow|challenge|review|deny)%/g, "$1");

function AuthBadge({ auth }: { auth: Auth }) {
  return <span className={`api-auth a-${auth}`}>{auth}</span>;
}

function FieldTable({ title, fields, kind = "request" }: { title: string; fields: Field[]; kind?: "request" | "response" }) {
  const flag = (required: boolean) =>
    kind === "response" ? (required ? "always" : "nullable") : required ? "required" : "optional";
  return (
    <div className="api-params">
      <div className="api-params-h">{title}</div>
      <table className="api-tbl">
        <tbody>
          {fields.map((f) => (
            <tr key={f.name}>
              <td className="p-name mono">{f.name}</td>
              <td className="p-type mono">{f.type}</td>
              <td className="p-req mono">{flag(f.required)}</td>
              <td className="p-desc">{withVerdicts(f.desc)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function EndpointBlock({ e }: { e: Endpoint }) {
  return (
    <section className="api-ep" id={e.id}>
      <div className="api-ep-head">
        <span className={`api-method m-${e.method.toLowerCase()}`}>{e.method}</span>
        <code className="api-path">{e.path}</code>
        <AuthBadge auth={e.auth} />
        <CopyButton className="copy-btn api-copy-url" label="copy URL" text={`{{baseUrl}}${e.path}`} />
      </div>
      <p className="api-summary">{e.summary}</p>
      {e.description ? <p className="api-desc">{e.description}</p> : null}

      {e.headers ? <FieldTable title="Headers" fields={e.headers} /> : null}
      {e.query ? <FieldTable title="Query" fields={e.query} /> : null}
      {e.body ? <FieldTable title="Body" fields={e.body} /> : null}

      <div className="api-io">
        {e.request ? (
          <div className="api-code-block">
            <div className="api-code-h">Request<CopyButton text={e.request} /></div>
            <pre className="api-code">{e.request}</pre>
          </div>
        ) : null}
        <div className="api-code-block">
          <div className="api-code-h">Response<CopyButton text={plain(e.response)} /></div>
          <pre className="api-code">{withVerdicts(e.response)}</pre>
        </div>
      </div>

      {e.responseFields ? <FieldTable title="Response fields" fields={e.responseFields} kind="response" /> : null}
      {e.note ? <p className="api-note">{withVerdicts(e.note)}</p> : null}
    </section>
  );
}

export function ApiReference() {
  const groups = [...new Set(endpoints.map((e) => e.group))];

  return (
    <section className="block" id="api">
      <div className="wrap">
        <div className="sec-head">
          <span className="lbl">API reference</span>
          <span className="rule" />
        </div>
        <div className="sec-intro">
          <h2>Every route the engine exposes.</h2>
          <p>
            Base URL <code className="mono">{BASE_URL}</code> in local dev. Operator and
            admin routes take <code className="mono">Authorization: Bearer &lt;token&gt;</code>.
          </p>
        </div>

        <div className="api-legend">
          {(["public", "apikey", "operator", "admin"] as Auth[]).map((a) => (
            <span className="api-legend-item" key={a}>
              <AuthBadge auth={a} /> {authNotes[a]}
            </span>
          ))}
        </div>

        <div className="api-index">
          {endpoints.map((e) => (
            <a key={e.id} href={`#${e.id}`} className="api-index-item">
              <span className={`api-method m-${e.method.toLowerCase()}`}>{e.method}</span>
              <code>{e.path}</code>
            </a>
          ))}
        </div>

        {groups.map((group) => (
          <div className="api-group" key={group}>
            <div className="api-group-h">
              <span className="lbl">{group}</span>
              <span className="rule" />
            </div>
            <div className="api-list">
              {endpoints.filter((e) => e.group === group).map((e) => (
                <EndpointBlock key={e.id} e={e} />
              ))}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
