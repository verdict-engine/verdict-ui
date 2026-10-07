import { describe, expect, it } from "vitest";
import { highlightTerms, search } from "./search";

const top = (q: string) => search(q, 8);
const hrefs = (q: string) => top(q).map((r) => r.href);

describe("docs search — semantic / synonym matching", () => {
  it("matches on synonyms and plain-language phrasing, not just titles", () => {
    // "rings"/"cluster" phrasing → the entity-graph passage under #signals
    expect(hrefs("stop fraud rings")).toContain("/docs#signals");
    // "how fast" → performance/throughput passage under #capacity
    expect(hrefs("how fast is it")).toContain("/docs#capacity");
    // "who changed a setting" → the config-change audit passage under #operate
    expect(hrefs("who changed a setting")).toContain("/docs#operate");
    // "delete a user" / gdpr → erasure passage under #governance
    expect(hrefs("gdpr delete a user")).toContain("/docs#governance");
    // "cloud model" → the hot-swappable model passage under #verdicts
    expect(hrefs("load model from the cloud")).toContain("/docs#verdicts");
    // reason/decline codes → the reason-code reference under #reason-codes
    expect(hrefs("reason codes")).toContain("/docs#reason-codes");
    expect(hrefs("decline code catalog")).toContain("/docs#reason-codes");
    expect(hrefs("why was the payment blocked")).toContain("/docs#reason-codes");
  });

  it("ranks the most relevant passage first and returns a real sentence as the snippet", () => {
    const [best] = top("impossible travel geolocation");
    expect(best.href).toBe("/docs#signals");
    expect(best.snippet.toLowerCase()).toMatch(/travel|location/); // a real sentence from the passage
    expect(best.snippet.length).toBeGreaterThan(20);
  });

  it("still finds API endpoints", () => {
    expect(hrefs("score a batch of events")).toContain("/api-reference#decide-batch");
    expect(hrefs("storage usage on disk")).toContain("/api-reference#config-storage");
  });

  it("returns nothing when none of the query's own words match", () => {
    expect(search("xyzzy nonsense qwerty")).toHaveLength(0);
  });

  it("returns default suggestions for an empty query", () => {
    expect(search("").length).toBeGreaterThan(0);
  });
});

describe("highlightTerms", () => {
  it("drops stopwords, dedupes, and stems plurals for on-page highlighting", () => {
    expect(highlightTerms("how do I stop fraud rings")).toEqual(["stop", "fraud", "ring"]);
    expect(highlightTerms("the the storage")).toEqual(["storage"]);
    expect(highlightTerms("")).toEqual([]);
  });
});
