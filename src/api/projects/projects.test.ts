import { describe, expect, it } from "vitest";
import { projectsKey } from "./projects";

describe("projectsKey", () => {
  it("builds a bare key with no params", () => {
    expect(projectsKey()).toBe("/projects");
  });

  it("includes only the params that are set", () => {
    expect(projectsKey({ status: "active" })).toBe("/projects?status=active");
    expect(projectsKey({ q: "acme", page: 2 })).toBe("/projects?q=acme&page=2");
  });

  it("serializes all params together", () => {
    expect(projectsKey({ status: "paused", q: "x", page: 3, pageSize: 10 })).toBe(
      "/projects?status=paused&q=x&page=3&pageSize=10",
    );
  });

  it("produces stable keys for equal params (SWR dedup relies on this)", () => {
    expect(projectsKey({ status: "active", page: 1 })).toBe(
      projectsKey({ status: "active", page: 1 }),
    );
  });
});
