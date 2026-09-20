import { BASE_URL, endpoints, type Auth, type Endpoint, type Field } from "./api-spec";

type Schema = Record<string, unknown>;

/**
 * JSON Schema from an api-spec type string (which is human-readable, not strict). Composite
 * shapes — arrays, object literals, Record<>, enums — are matched BEFORE scalar names, so a
 * type like "{ tag: string; points: number }[]" becomes an array (not a number because it
 * happens to contain the word "number"), and "Record<string, string|number|boolean>" becomes an
 * object (not a boolean). Integrators generate clients from this, so the shape must be right.
 */
function typeToSchema(raw: string): Schema {
  const type = raw.trim();
  const t = type.toLowerCase();

  // Enum: a union of quoted literals, e.g. "delivered" | "failed".
  const quoted = type.match(/"([^"]+)"/g);
  if (quoted && type.includes("|")) {
    return { type: "string", enum: quoted.map((s) => s.replace(/"/g, "")) };
  }

  // Array: "X[]" or "array of X" — recurse on the element type.
  if (t.endsWith("[]")) return { type: "array", items: typeToSchema(type.slice(0, type.lastIndexOf("[]"))) };
  if (t.startsWith("array")) return { type: "array", items: {} };

  // Record<K, V> → object with typed additional properties (union value → any).
  const rec = type.match(/record<\s*[^,]+,\s*(.+)>$/i);
  if (rec) {
    const valueType = rec[1].trim();
    return { type: "object", additionalProperties: valueType.includes("|") ? true : typeToSchema(valueType) };
  }

  // Inline object literal, e.g. "{ tag: string; points: number }" → typed properties.
  if (t.startsWith("{") && type.includes("}")) {
    const inner = type.slice(type.indexOf("{") + 1, type.lastIndexOf("}"));
    const properties: Record<string, Schema> = {};
    for (const part of inner.split(/[;,]/)) {
      const m = part.match(/^\s*([a-zA-Z0-9_]+)\??\s*:\s*(.+?)\s*$/);
      if (m) properties[m[1]] = typeToSchema(m[2]);
    }
    return Object.keys(properties).length > 0 ? { type: "object", properties } : { type: "object" };
  }
  if (t.startsWith("object")) return { type: "object" };

  // Scalars — anchored so a scalar word inside a composite never wins.
  if (t.startsWith("boolean")) return { type: "boolean" };
  if (t.startsWith("number") || t.startsWith("integer") || t.startsWith("int(") || t === "int") return { type: "number" };
  return { type: "string" };
}

/** Best-effort JSON Schema from an api-spec field, carrying its description. */
function fieldSchema(field: Field): Schema {
  return { ...typeToSchema(field.type), description: field.desc };
}

/** Nest dotted field names (subject.userId, instrument.bin) into an object schema. */
function bodySchema(fields: Field[]): Schema {
  const root: Schema = { type: "object", properties: {} };
  const required: string[] = [];
  for (const f of fields) {
    const isArray = f.name.includes("[]");
    const parts = f.name.replace(/\[\]/g, "").split(".");
    let node = root;
    for (let i = 0; i < parts.length - 1; i++) {
      const props = node.properties as Record<string, Schema>;
      props[parts[i]] = props[parts[i]] ?? { type: "object", properties: {} };
      node = props[parts[i]];
    }
    const leaf = parts[parts.length - 1];
    const value = isArray ? { type: "array", items: fieldSchema(f) } : fieldSchema(f);
    (node.properties as Record<string, Schema>)[leaf] = value;
    if (f.required && parts.length === 1) required.push(leaf);
  }
  if (required.length > 0) root.required = required;
  return root;
}

/** Parse an api-spec example string into JSON where possible (many carry `…` / comments and won't). */
function example(raw?: string): unknown {
  if (!raw) return undefined;
  const cleaned = raw.replace(/%(allow|challenge|review|deny)%/g, "$1").replace(/\/\/[^\n]*/g, "");
  try {
    return JSON.parse(cleaned);
  } catch {
    return undefined;
  }
}

const security = (auth: Auth): Array<Record<string, string[]>> => {
  if (auth === "apikey") return [{ ApiKeyAuth: [] }];
  if (auth === "operator" || auth === "admin") return [{ BearerAuth: [] }];
  return [];
};

function operation(e: Endpoint): Schema {
  const parameters: Schema[] = [];
  for (const m of e.path.matchAll(/:([a-zA-Z]+)/g)) {
    parameters.push({ name: m[1], in: "path", required: true, schema: { type: "string" } });
  }
  for (const q of e.query ?? []) {
    parameters.push({ name: q.name, in: "query", required: q.required, schema: fieldSchema(q), description: q.desc });
  }
  for (const h of e.headers ?? []) {
    if (h.name.toLowerCase() === "x-api-key") continue; // covered by security scheme
    parameters.push({ name: h.name, in: "header", required: h.required, schema: { type: "string" }, description: h.desc });
  }

  const responseExample = example(e.response);
  const op: Schema = {
    operationId: e.id,
    tags: [e.group],
    summary: e.summary,
    description: [e.description, e.note].filter(Boolean).join(" "),
    security: security(e.auth),
    responses: {
      "200": {
        description: "Success",
        content: {
          "application/json": {
            schema: e.responseFields ? bodySchema(e.responseFields) : { type: "object" },
            ...(responseExample !== undefined ? { example: responseExample } : {}),
          },
        },
      },
    },
  };

  if (e.body) {
    const requestExample = example(e.request);
    op.requestBody = {
      required: true,
      content: {
        "application/json": {
          schema: bodySchema(e.body),
          ...(requestExample !== undefined ? { example: requestExample } : {}),
        },
      },
    };
  }
  if (parameters.length > 0) op.parameters = parameters;
  return op;
}

/** An OpenAPI 3.1 document generated from the documented API contract — always in sync with it. */
export function buildOpenApi(): Schema {
  const paths: Record<string, Schema> = {};
  for (const e of endpoints) {
    const path = e.path.replace(/:([a-zA-Z]+)/g, "{$1}");
    paths[path] = paths[path] ?? {};
    (paths[path] as Record<string, Schema>)[e.method.toLowerCase()] = operation(e);
  }
  return {
    openapi: "3.1.0",
    info: {
      title: "Verdict Engine API",
      version: "0.7.0",
      description:
        "The self-hosted Verdict fraud & risk decisioning engine. Send an event, get an auditable verdict. Base URL is the engine you deploy.",
      license: { name: "Apache-2.0" },
    },
    servers: [{ url: BASE_URL, description: "Local dev — replace with your engine's URL" }],
    tags: [...new Set(endpoints.map((e) => e.group))].map((name) => ({ name })),
    components: {
      securitySchemes: {
        ApiKeyAuth: { type: "apiKey", in: "header", name: "X-API-Key" },
        BearerAuth: { type: "http", scheme: "bearer" },
      },
    },
    paths,
  };
}
