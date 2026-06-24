import { describe, expect, it } from "vitest";
import { renderWithProviders, screen } from "@/test/test-utils";
import { StatusBadge } from "./status-badge";

describe("StatusBadge", () => {
  it("renders the status label", () => {
    renderWithProviders(<StatusBadge status="active" />);
    expect(screen.getByText("active")).toBeInTheDocument();
  });

  it("renders each status variant", () => {
    for (const status of ["active", "paused", "archived"] as const) {
      const { unmount } = renderWithProviders(<StatusBadge status={status} />);
      expect(screen.getByText(status)).toBeInTheDocument();
      unmount();
    }
  });
});
