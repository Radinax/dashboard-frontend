import { api } from "@/api/api";
import { parseResponse } from "@/api/result";
import { DashboardStatsSchema } from "./types";

export const DASHBOARD_STATS_KEY = "/dashboard/stats";

export async function fetchDashboardStats() {
  const res = await api.get<unknown>(DASHBOARD_STATS_KEY);
  if (!res.ok) throw res.error; // bridge Result → SWR error
  const parsed = parseResponse(res.data, DashboardStatsSchema, {
    endpoint: `GET ${DASHBOARD_STATS_KEY}`,
  });
  if (!parsed.ok) throw parsed.error;
  return parsed.data;
}
