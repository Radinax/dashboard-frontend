import { api } from "@/api/api";
import { parseResponse, type Result } from "@/api/result";
import {
  type ListProjectsParams,
  type Project,
  type ProjectFormInput,
  ProjectListSchema,
  ProjectSchema,
} from "./types";

/** Build the `/projects` query string from typed params (omitting empty values). */
export function projectsKey(params: ListProjectsParams = {}): string {
  const sp = new URLSearchParams();
  if (params.status) sp.set("status", params.status);
  if (params.q) sp.set("q", params.q);
  if (params.page) sp.set("page", String(params.page));
  if (params.pageSize) sp.set("pageSize", String(params.pageSize));
  const qs = sp.toString();
  return `/projects${qs ? `?${qs}` : ""}`;
}

export async function fetchProjects(path: string) {
  const res = await api.get<unknown>(path);
  if (!res.ok) throw res.error; // bridge Result → SWR error
  const parsed = parseResponse(res.data, ProjectListSchema, { endpoint: `GET ${path}` });
  if (!parsed.ok) throw parsed.error;
  return parsed.data;
}

export async function fetchProject(id: string) {
  const res = await api.get<unknown>(`/projects/${id}`);
  if (!res.ok) throw res.error;
  const parsed = parseResponse(res.data, ProjectSchema, { endpoint: `GET /projects/${id}` });
  if (!parsed.ok) throw parsed.error;
  return parsed.data;
}

export async function createProject(input: ProjectFormInput): Promise<Result<Project>> {
  const res = await api.post<unknown>("/projects", input);
  if (!res.ok) return res;
  return parseResponse(res.data, ProjectSchema, { endpoint: "POST /projects" });
}

export async function updateProject(
  id: string,
  input: Partial<ProjectFormInput>,
): Promise<Result<Project>> {
  const res = await api.patch<unknown>(`/projects/${id}`, input);
  if (!res.ok) return res;
  return parseResponse(res.data, ProjectSchema, { endpoint: `PATCH /projects/${id}` });
}

export function deleteProject(id: string): Promise<Result<void>> {
  return api.delete<void>(`/projects/${id}`);
}
