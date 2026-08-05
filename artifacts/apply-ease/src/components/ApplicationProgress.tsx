import React from "react";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

const stages = [
  { key: "draft", label: "Draft" },
  { key: "ready", label: "Ready" },
  { key: "submitted", label: "Submitted" },
  { key: "verified", label: "Under review" },
];

export default function ApplicationProgress({ status }) {
  const currentIndex = stages.findIndex((s) => s.key === status);
  const reached = currentIndex >= 0;
  const percent = reached
    ? Math.round(((currentIndex + 1) / stages.length) * 100)
    : 0;

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-3">
        <div className="h-2.5 flex-1 overflow-hidden rounded-full bg-muted">
          <div
            className="h-full rounded-full bg-primary transition-all duration-500"
            style={{ width: `${percent}%` }}
          />
        </div>
        <span className="w-10 text-right text-xs font-semibold text-primary">
          {percent}%
        </span>
      </div>
      <div className="flex items-center gap-1 sm:gap-2">
      {stages.map((stage, i) => {
        const isComplete = reached && i < currentIndex;
        const isActive = reached && i === currentIndex;
        const isPending = !reached || i > currentIndex;
        return (
          <React.Fragment key={stage.key}>
            <div className="flex flex-col items-center gap-1">
              <div
                className={cn(
                  "flex h-7 w-7 items-center justify-center rounded-full border text-xs font-semibold transition-colors",
                  isComplete && "border-primary bg-primary text-primary-foreground",
                  isActive && "border-primary bg-primary/10 text-primary ring-2 ring-primary/20",
                  isPending && "border-border bg-muted text-muted-foreground"
                )}
              >
                {isComplete ? <Check className="h-3.5 w-3.5" /> : i + 1}
              </div>
              <span
                className={cn(
                  "text-[10px] font-medium sm:text-xs",
                  isActive ? "text-primary" : "text-muted-foreground"
                )}
              >
                {stage.label}
              </span>
            </div>
            {i < stages.length - 1 && (
              <div
                className={cn(
                  "mb-4 h-0.5 flex-1 rounded-full transition-colors",
                  isComplete ? "bg-primary" : "bg-border"
                )}
              />
            )}
          </React.Fragment>
        );
      })}
      </div>
    </div>
  );
}
