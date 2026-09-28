import { describe, expect, it } from "vitest";
import { authNotes, endpoints, type Auth } from "./api-spec";
import { buildOpenApi } from "./openapi";

const METHODS = ["GET", "POST", "PUT"];
const AUTHS: Auth[] = ["public", "apikey", "operator", "admin"];

describe("api-spec integrity", () => {
  it("has unique endpoint ids", () => {
    const ids = endpoints.map((e) => e.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("every endpoint has a valid method, an absolute path and a known auth", () => {
    for (const e of endpoints) {
      expect(METHODS).toContain(e.method);
      expect(e.path.startsWith("/")).toBe(true);
      expect(AUTHS).toContain(e.auth);
      expect(e.summary.length).toBeGreaterThan(0);
    }
  });

  it("documents a note for every auth level", () => {
    for (const a of AUTHS) expect(authNotes[a].length).toBeGreaterThan(0);
  });

  it("includes the batch, async, lookup and audit endpoints", () => {
    const paths = endpoints.map((e) => `${e.method} ${e.path}`);
    expect(paths).toContain("POST /v1/decisions/batch");
    expect(paths).toContain("POST /v1/decisions/async");
    expect(paths).toContain("GET /v1/decisions/:id");
    expect(paths).toContain("GET /v1/audit");
  });
});

describe("buildOpenApi", () => {
  const spec = buildOpenApi();
  const paths = spec.paths as Record<string, unknown>;

  it("produces a 3.x document with an entry per endpoint path", () => {
    expect(spec.openapi).toMatch(/^3\./);
    expect(Object.keys(paths).length).toBeGreaterThan(0);
    expect(paths["/v1/decisions/batch"]).toBeDefined();
    expect(paths["/v1/audit"]).toBeDefined();
  });

  it("maps a colon path param to an OpenAPI brace param", () => {
    // /v1/decisions/:id should be exposed as /v1/decisions/{id}
    expect(Object.keys(paths)).toContain("/v1/decisions/{id}");
  });
});
