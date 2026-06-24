import { z } from "zod";
import { ProjectStatusSchema } from "@/api/projects/types";

export const DashboardStatsSchema = z.object({
  totalProjects: z.number(),
  byStatus: z.object({
    active: z.number(),
    paused: z.number(),
    archived: z.number(),
  }),
  createdLast7Days: z.array(z.object({ date: z.string(), count: z.number() })),
  recentProjects: z.array(
    z.object({
      id: z.string(),
      name: z.string(),
      status: ProjectStatusSchema,
      createdAt: z.string(),
    }),
  ),
});
export type DashboardStats = z.infer<typeof DashboardStatsSchema>;
