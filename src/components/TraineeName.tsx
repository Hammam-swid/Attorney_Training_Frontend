import { cn } from "@/lib/utils";
import { NOTE_FLAG_STYLES, noteFlagOf } from "@/lib/noteFlag";
import { NoteFlag } from "@/types";

interface Props {
  trainee?: { name?: string; notes?: string | null; noteFlag?: NoteFlag } | null;
  name?: string;
  className?: string;
}

/** trainee name colored when the notes say منتقل / منتدب */
export default function TraineeName({ trainee, name, className }: Props) {
  const flag = noteFlagOf(trainee);
  const text = name ?? trainee?.name ?? "";
  if (!flag) return <span className={className}>{text}</span>;
  return (
    <span
      title={trainee?.notes ?? NOTE_FLAG_STYLES[flag].label}
      className={cn(
        "rounded px-1.5 py-0.5 font-medium",
        NOTE_FLAG_STYLES[flag].className,
        className,
      )}
    >
      {text}
    </span>
  );
}

export function NoteFlagLegend({ className }: { className?: string }) {
  return (
    <div className={cn("flex items-center gap-3 text-sm", className)}>
      <span className="text-muted-foreground">دلالة الألوان:</span>
      {Object.values(NOTE_FLAG_STYLES).map((s) => (
        <span key={s.label} className={cn("rounded px-2 py-0.5", s.className)}>
          {s.label}
        </span>
      ))}
    </div>
  );
}
