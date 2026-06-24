import { beforeEach, describe, expect, it } from "vitest";
import { useAuthStore } from "./useAuthStore";

const session = {
  user: {
    id: "u1",
    name: "Demo",
    email: "demo@example.com",
    createdAt: "2026-06-01T00:00:00.000Z",
  },
  accessToken: "tok",
};

describe("useAuthStore", () => {
  beforeEach(() => {
    useAuthStore.setState({ user: null, accessToken: null, status: "loading" });
  });

  it("starts in the loading state", () => {
    expect(useAuthStore.getState().status).toBe("loading");
  });

  it("setSession stores the user + token and marks authenticated", () => {
    useAuthStore.getState().setSession(session);
    const s = useAuthStore.getState();
    expect(s.user?.email).toBe("demo@example.com");
    expect(s.accessToken).toBe("tok");
    expect(s.status).toBe("authenticated");
  });

  it("clear wipes the session and marks unauthenticated", () => {
    useAuthStore.getState().setSession(session);
    useAuthStore.getState().clear();
    const s = useAuthStore.getState();
    expect(s.user).toBeNull();
    expect(s.accessToken).toBeNull();
    expect(s.status).toBe("unauthenticated");
  });
});
