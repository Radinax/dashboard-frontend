import { HttpResponse, http } from "msw";

/** Must match the test VITE_API_URL (see vite.config.ts → test.env). */
export const API = "http://localhost/api";

const user = {
  id: "u1",
  name: "Demo User",
  email: "demo@example.com",
  createdAt: "2026-06-01T00:00:00.000Z",
};

const project = (over: Partial<Record<string, unknown>> = {}) => ({
  id: "p1",
  name: "Acme Redesign",
  description: "A sample project.",
  status: "active",
  createdAt: "2026-06-20T00:00:00.000Z",
  updatedAt: "2026-06-20T00:00:00.000Z",
  ...over,
});

/** Default happy-path handlers. Individual tests override these with server.use(...). */
export const handlers = [
  http.post(`${API}/auth/login`, async ({ request }) => {
    const body = (await request.json()) as { email: string; password: string };
    if (body.password === "wrong") {
      return HttpResponse.json(
        { code: "INVALID_CREDENTIALS", message: "Email or password is incorrect" },
        { status: 401 },
      );
    }
    return HttpResponse.json({ user, accessToken: "test-access-token" });
  }),

  http.post(`${API}/auth/register`, () =>
    HttpResponse.json({ user, accessToken: "test-access-token" }, { status: 201 }),
  ),

  http.post(`${API}/auth/refresh`, () =>
    HttpResponse.json({ user, accessToken: "test-access-token" }),
  ),

  http.post(`${API}/auth/logout`, () => HttpResponse.json({ ok: true })),

  http.get(`${API}/auth/me`, () => HttpResponse.json({ user })),

  http.get(`${API}/projects`, ({ request }) => {
    const url = new URL(request.url);
    const status = url.searchParams.get("status");
    const items = [
      project({ id: "p1", name: "Acme Redesign", status: "active" }),
      project({ id: "p2", name: "Mobile App", status: "paused" }),
    ].filter((p) => !status || p.status === status);
    return HttpResponse.json({ items, total: items.length, page: 1, pageSize: 10 });
  }),

  http.get(`${API}/dashboard/stats`, () =>
    HttpResponse.json({
      totalProjects: 2,
      byStatus: { active: 1, paused: 1, archived: 0 },
      createdLast7Days: [{ date: "2026-06-20", count: 2 }],
      recentProjects: [
        {
          id: "p1",
          name: "Acme Redesign",
          status: "active",
          createdAt: "2026-06-20T00:00:00.000Z",
        },
      ],
    }),
  ),
];
