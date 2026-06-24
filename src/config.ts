/**
 * The single place env vars are read. Everything imports typed values from here —
 * never reach for `import.meta.env` elsewhere (the article's "config in one module" rule).
 */
export const config = {
  /** Base URL for the dashboard-backend API. Defaults to the Vite dev proxy path. */
  apiUrl: import.meta.env.VITE_API_URL ?? "/api",
  isProd: import.meta.env.PROD,
} as const;
