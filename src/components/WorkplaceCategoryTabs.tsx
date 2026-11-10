import { cn } from "@/lib/utils";
import { WORKPLACE_CATEGORIES, WorkplaceCategory } from "@/types";

interface Props {
  value: WorkplaceCategory | "all";
  onChange: (value: WorkplaceCategory | "all") => void;
  /** show an "all" tab (reports) */
  withAll?: boolean;
  counts?: Partial<Record<WorkplaceCategory | "all", number>>;
  className?: string;
}

/** النيابات / جهات العمل الأخرى switch */
export default function WorkplaceCategoryTabs({
  value,
  onChange,
  withAll = false,
  counts,
  className,
}: Props) {
  const options: { value: WorkplaceCategory | "all"; label: string }[] = [
    ...(withAll ? [{ value: "all" as const, label: "الكل" }] : []),
    { value: "prosecution", label: WORKPLACE_CATEGORIES.prosecution },
    { value: "other", label: WORKPLACE_CATEGORIES.other },
  ];
  return (
    <div
      role="tablist"
      className={cn("inline-flex rounded-lg bg-muted p-1 gap-1", className)}
    >
      {options.map((o) => (
        <button
          key={o.value}
          type="button"
          role="tab"
          aria-selected={value === o.value}
          onClick={() => onChange(o.value)}
          className={cn(
            "rounded-md px-3 py-1.5 text-sm transition-colors",
            value === o.value
              ? "bg-background text-primary font-semibold shadow-sm"
              : "text-muted-foreground hover:text-foreground",
          )}
        >
          {o.label}
          {counts?.[o.value] !== undefined && (
            <span className="ms-1 text-xs opacity-70">({counts[o.value]})</span>
          )}
        </button>
      ))}
    </div>
  );
}
