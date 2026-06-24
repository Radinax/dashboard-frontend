import { createFileRoute, Navigate, Outlet } from "@tanstack/react-router";
import { Loader2Icon } from "lucide-react";
import { useAuthStore } from "@/lib/stores/useAuthStore";
import { AppShell } from "./_authed/-components/app-shell";

export const Route = createFileRoute("/_authed")({
  component: AuthedLayout,
});

/**
 * Pathless layout that guards every nested route. Auth lives in memory (the access token
 * isn't persisted), so we gate on the bootstrap status rather than a router loader.
 */
function AuthedLayout() {
  const status = useAuthStore((s) => s.status);

  if (status === "loading") {
    return (
      <div className="grid min-h-svh place-items-center">
        <Loader2Icon className="size-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (status === "unauthenticated") {
    return <Navigate to="/sign-in" />;
  }

  return (
    <AppShell>
      <Outlet />
    </AppShell>
  );
}
