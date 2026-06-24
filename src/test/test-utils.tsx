import { render, renderHook } from "@testing-library/react";
import type { ReactElement, ReactNode } from "react";
import { SWRConfig } from "swr";

/**
 * Wrap rendered UI / hooks in a fresh SWR cache so tests don't leak state into one another.
 * (Auth/Router providers aren't included — add them per-test when a unit needs them.)
 */
function Providers({ children }: { children: ReactNode }) {
  return (
    <SWRConfig
      value={{
        provider: () => new Map(),
        dedupingInterval: 0,
        revalidateOnFocus: false,
        shouldRetryOnError: false,
      }}
    >
      {children}
    </SWRConfig>
  );
}

export function renderWithProviders(ui: ReactElement) {
  return render(ui, { wrapper: Providers });
}

export function renderHookWithProviders<T>(cb: () => T) {
  return renderHook(cb, { wrapper: Providers });
}

export * from "@testing-library/react";
