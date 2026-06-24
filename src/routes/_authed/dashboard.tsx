import { createFileRoute } from "@tanstack/react-router";
import { format, parseISO } from "date-fns";
import { ActivityIcon, ArchiveIcon, FolderKanbanIcon, PauseCircleIcon } from "lucide-react";
import type { ComponentType } from "react";
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis } from "recharts";
import { useDashboardStats } from "@/api/dashboard/useDashboardStats";
import { StatusBadge } from "@/components/blocks/status-badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export const Route = createFileRoute("/_authed/dashboard")({
  component: DashboardRoute,
});

function DashboardRoute() {
  const { data: stats, error, isLoading } = useDashboardStats();

  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Dashboard</h1>
        <p className="text-sm text-muted-foreground">An overview of your projects.</p>
      </div>

      {error && (
        <Card>
          <CardContent className="py-8 text-center text-sm text-destructive">
            Failed to load dashboard data. Please try again.
          </CardContent>
        </Card>
      )}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Total projects"
          value={stats?.totalProjects}
          loading={isLoading}
          icon={FolderKanbanIcon}
        />
        <StatCard
          label="Active"
          value={stats?.byStatus.active}
          loading={isLoading}
          icon={ActivityIcon}
        />
        <StatCard
          label="Paused"
          value={stats?.byStatus.paused}
          loading={isLoading}
          icon={PauseCircleIcon}
        />
        <StatCard
          label="Archived"
          value={stats?.byStatus.archived}
          loading={isLoading}
          icon={ArchiveIcon}
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-5">
        <Card className="lg:col-span-3">
          <CardHeader>
            <CardTitle>Projects created — last 7 days</CardTitle>
          </CardHeader>
          <CardContent className="h-64">
            {isLoading || !stats ? (
              <Skeleton className="h-full w-full" />
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={stats.createdLast7Days}>
                  <CartesianGrid vertical={false} strokeOpacity={0.15} />
                  <XAxis
                    dataKey="date"
                    tickLine={false}
                    axisLine={false}
                    fontSize={12}
                    tickFormatter={(d: string) => format(parseISO(d), "EEE")}
                  />
                  <Tooltip
                    cursor={{ fill: "var(--color-muted)" }}
                    contentStyle={{
                      background: "var(--color-popover)",
                      border: "1px solid var(--color-border)",
                      borderRadius: "0.5rem",
                      fontSize: "0.8rem",
                    }}
                    labelFormatter={(label) => format(parseISO(String(label)), "EEE, MMM d")}
                  />
                  <Bar dataKey="count" fill="var(--color-chart-1)" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Recent projects</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading || !stats ? (
              <div className="flex flex-col gap-2">
                {[0, 1, 2, 3, 4].map((i) => (
                  <Skeleton key={i} className="h-8 w-full" />
                ))}
              </div>
            ) : stats.recentProjects.length === 0 ? (
              <p className="py-6 text-center text-sm text-muted-foreground">No projects yet.</p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {stats.recentProjects.map((p) => (
                    <TableRow key={p.id}>
                      <TableCell className="font-medium">{p.name}</TableCell>
                      <TableCell>
                        <StatusBadge status={p.status} />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function StatCard({
  label,
  value,
  loading,
  icon: Icon,
}: {
  label: string;
  value: number | undefined;
  loading: boolean;
  icon: ComponentType<{ className?: string }>;
}) {
  return (
    <Card>
      <CardHeader className="flex-row items-center justify-between gap-2 space-y-0">
        <CardTitle className="text-sm font-medium text-muted-foreground">{label}</CardTitle>
        <Icon className="size-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        {loading ? (
          <Skeleton className="h-8 w-12" />
        ) : (
          <span className="text-3xl font-semibold tabular-nums">{value ?? 0}</span>
        )}
      </CardContent>
    </Card>
  );
}
