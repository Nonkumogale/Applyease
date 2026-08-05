import React from "react";
import { cn } from "@/lib/utils";

const styles = {
  draft: "bg-muted text-muted-foreground",
  ready: "bg-blue-100 text-blue-700",
  submitted: "bg-amber-100 text-amber-700",
  verified: "bg-emerald-100 text-emerald-700",
};

export default function StatusBadge({ status }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold capitalize",
        styles[status] || styles.draft
      )}
    >
      {status}
    </span>
  );
}
