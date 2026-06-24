import { Loader2Icon } from "lucide-react";
import type * as React from "react";
import { Button } from "@/components/ui/button";

/** A Button that shows a spinner and disables itself while a submission is in flight. */
export function SubmissionButton({
  loading,
  children,
  disabled,
  ...props
}: React.ComponentProps<typeof Button> & { loading?: boolean }) {
  return (
    <Button disabled={loading || disabled} {...props}>
      {loading && <Loader2Icon className="animate-spin" />}
      {children}
    </Button>
  );
}
