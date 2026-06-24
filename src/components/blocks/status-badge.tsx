import type { ProjectStatus } from "@/api/projects/types";
import { Badge } from "@/components/ui/badge";

const STATUS_VARIANT: Record<ProjectStatus, React.ComponentProps<typeof Badge>["variant"]> = {
  active: "default",
  paused: "secondary",
  archived: "outline",
};

/** Render a project status as a consistently-styled badge across the app. */
export function StatusBadge({ status }: { status: ProjectStatus }) {
  return (
    <Badge variant={STATUS_VARIANT[status]} className="capitalize">
      {status}
    </Badge>
  );
}
