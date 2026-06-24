import useSWR, { useSWRConfig } from "swr";
import { fetchProject, fetchProjects, projectsKey } from "./projects";
import type { ListProjectsParams } from "./types";

/**
 * Server state lives in SWR hooks — the cache boundary. Components call these, never the
 * raw `fetch*` functions. Hook naming: `use<Domain><Entity>`.
 */
export function useProjects(params: ListProjectsParams = {}) {
  return useSWR(projectsKey(params), fetchProjects);
}

export function useProject(id: string | undefined) {
  // A `null` key disables the fetch until we have an id.
  return useSWR(id ? `/projects/${id}` : null, () => fetchProject(id as string));
}

/**
 * Revalidate every projects list + the dashboard stats after a mutation. Returned from a
 * hook so components don't reach into SWR's cache key conventions themselves.
 */
export function useRevalidateProjects() {
  const { mutate } = useSWRConfig();
  return () =>
    mutate(
      (key) =>
        typeof key === "string" && (key.startsWith("/projects") || key === "/dashboard/stats"),
      undefined,
      { revalidate: true },
    );
}
