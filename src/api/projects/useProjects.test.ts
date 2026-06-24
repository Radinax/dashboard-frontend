import { HttpResponse, http } from "msw";
import { describe, expect, it } from "vitest";
import { API } from "@/test/msw/handlers";
import { server } from "@/test/msw/server";
import { renderHookWithProviders, waitFor } from "@/test/test-utils";
import { useProjects } from "./useProjects";

describe("useProjects", () => {
  it("fetches, validates, and returns the projects list", async () => {
    const { result } = renderHookWithProviders(() => useProjects());
    await waitFor(() => expect(result.current.data).toBeDefined());
    expect(result.current.data?.total).toBe(2);
    expect(result.current.data?.items[0].name).toBe("Acme Redesign");
    expect(result.current.error).toBeUndefined();
  });

  it("passes the status filter through to the request", async () => {
    const { result } = renderHookWithProviders(() => useProjects({ status: "paused" }));
    await waitFor(() => expect(result.current.data).toBeDefined());
    expect(result.current.data?.items).toHaveLength(1);
    expect(result.current.data?.items[0].status).toBe("paused");
  });

  it("surfaces a schema_validation_failed error when the wire shape drifts", async () => {
    server.use(
      http.get(`${API}/projects`, () =>
        // `total` should be a number — this is a contract violation.
        HttpResponse.json({ items: [], total: "lots", page: 1, pageSize: 10 }),
      ),
    );
    const { result } = renderHookWithProviders(() => useProjects());
    await waitFor(() => expect(result.current.error).toBeDefined());
    expect(result.current.error.code).toBe("schema_validation_failed");
  });

  it("surfaces the backend error envelope on a non-2xx response", async () => {
    server.use(
      http.get(`${API}/projects`, () =>
        HttpResponse.json({ code: "BOOM", message: "Server on fire" }, { status: 500 }),
      ),
    );
    const { result } = renderHookWithProviders(() => useProjects());
    await waitFor(() => expect(result.current.error).toBeDefined());
    expect(result.current.error.code).toBe("BOOM");
    expect(result.current.error.status).toBe(500);
  });
});
