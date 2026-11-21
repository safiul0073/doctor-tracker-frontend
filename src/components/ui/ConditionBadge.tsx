import { memo } from "react";
import { CONDITION_STYLES, cn } from "@/lib/utils";
import type { PatientCondition } from "@/types";

interface ConditionBadgeProps {
  condition: PatientCondition;
  className?: string;
}

export const ConditionBadge = memo(function ConditionBadge({
  condition,
  className,
}: ConditionBadgeProps) {
  const style = CONDITION_STYLES[condition] ?? CONDITION_STYLES.Stable;
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium whitespace-nowrap",
        style.badge,
        className
      )}
    >
      <span className={cn("h-1.5 w-1.5 rounded-full", style.dot)} />
      {condition}
    </span>
  );
});
