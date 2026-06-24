import { createFileRoute, Navigate } from "@tanstack/react-router";
import { useAuthStore } from "@/lib/stores/useAuthStore";

export const Route = createFileRoute("/")({
  component: IndexRoute,
});

/** Bounce to the dashboard when signed in, otherwise to sign-in. */
function IndexRoute() {
  const status = useAuthStore((s) => s.status);
  if (status === "loading") return null;
  return <Navigate to={status === "authenticated" ? "/dashboard" : "/sign-in"} />;
}
