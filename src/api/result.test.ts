import { describe, expect, it } from "vitest";
import { z } from "zod";
import { apiError, err, ok, parseResponse } from "./result";

describe("Result helpers", () => {
  it("ok / err build the discriminated union", () => {
    expect(ok(42)).toEqual({ ok: true, data: 42 });
    const e = apiError("X", "boom", 400);
    expect(err(e)).toEqual({ ok: false, error: e });
  });
});

describe("parseResponse", () => {
  const schema = z.object({ id: z.string(), n: z.number() });

  it("returns ok with parsed data on a valid shape", () => {
    const result = parseResponse({ id: "a", n: 1 }, schema, { endpoint: "GET /x" });
    expect(result).toEqual({ ok: true, data: { id: "a", n: 1 } });
  });

  it("returns a traceable schema_validation_failed error on a bad shape", () => {
    const result = parseResponse({ id: "a", n: "not-a-number" }, schema, { endpoint: "GET /x" });
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error.code).toBe("schema_validation_failed");
      expect(result.error.message).toContain("GET /x");
      expect(Array.isArray(result.error.details)).toBe(true);
    }
  });
});
