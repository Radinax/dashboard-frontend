import { createRouter, RouterProvider } from "@tanstack/react-router";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { SWRConfig } from "swr";
import { Toaster } from "@/components/ui/sonner";
import { AuthProvider } from "@/context/auth";
import { routeTree } from "./routeTree.gen";
import "./styles.css";

const router = createRouter({
  routeTree,
  defaultPreload: "intent",
  scrollRestoration: true,
});

// Register the router instance for full type-safety across the app.
declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}

// Global SWR config — the three settings the article calls out to prevent request storms.
const swrConfig = {
  revalidateOnFocus: false,
  dedupingInterval: 5000,
  shouldRetryOnError: false,
};

const rootEl = document.getElementById("root");
if (!rootEl) throw new Error("Root element #root not found");

createRoot(rootEl).render(
  <StrictMode>
    <SWRConfig value={swrConfig}>
      <AuthProvider>
        <RouterProvider router={router} />
        <Toaster richColors position="top-right" />
      </AuthProvider>
    </SWRConfig>
  </StrictMode>,
);
