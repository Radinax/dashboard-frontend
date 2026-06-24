import { z } from "zod";

export const PROJECT_STATUSES = ["active", "paused", "archived"] as const;
export const ProjectStatusSchema = z.enum(PROJECT_STATUSES);
export type ProjectStatus = z.infer<typeof ProjectStatusSchema>;

export const ProjectSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string(),
  status: ProjectStatusSchema,
  createdAt: z.string(),
  updatedAt: z.string(),
});
export type Project = z.infer<typeof ProjectSchema>;

export const ProjectListSchema = z.object({
  items: z.array(ProjectSchema),
  total: z.number(),
  page: z.number(),
  pageSize: z.number(),
});
export type ProjectList = z.infer<typeof ProjectListSchema>;

// ── Form contract (shared by RHF create/edit) ──
export const ProjectFormSchema = z.object({
  name: z.string().min(1, "Name is required").max(120),
  description: z.string().max(2000).optional(),
  status: ProjectStatusSchema,
});
export type ProjectFormInput = z.infer<typeof ProjectFormSchema>;

export interface ListProjectsParams {
  status?: ProjectStatus;
  q?: string;
  page?: number;
  pageSize?: number;
}
