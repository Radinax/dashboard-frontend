import useSWR from "swr";
import { DASHBOARD_STATS_KEY, fetchDashboardStats } from "./dashboard";

export function useDashboardStats() {
  return useSWR(DASHBOARD_STATS_KEY, fetchDashboardStats);
}
