import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  NOTE_FILTER_OPTIONS,
  NOTE_FLAG_STYLES,
  NoteFilter,
} from "@/lib/noteFlag";
import { cn } from "@/lib/utils";

interface Props {
  value: NoteFilter;
  onChange: (value: NoteFilter) => void;
  className?: string;
}

/** filter trainees by their notes (same categories as the name colors) */
export default function NoteFilterSelect({ value, onChange, className }: Props) {
  return (
    <Select dir="rtl" value={value} onValueChange={(v) => onChange(v as NoteFilter)}>
      <SelectTrigger dir="rtl" className={cn("w-48", className)} title="تصفية حسب الملاحظات">
        <SelectValue placeholder="الملاحظات" />
      </SelectTrigger>
      <SelectContent dir="rtl">
        <SelectGroup>
          <SelectLabel>الملاحظات</SelectLabel>
          {NOTE_FILTER_OPTIONS.map((o) => {
            const style =
              o.value in NOTE_FLAG_STYLES
                ? NOTE_FLAG_STYLES[o.value as keyof typeof NOTE_FLAG_STYLES]
                : null;
            return (
              <SelectItem key={o.value} value={o.value}>
                <span className="flex items-center gap-2">
                  {style && (
                    <span className={cn("inline-block h-3 w-3 rounded-sm", style.className)} />
                  )}
                  {o.label}
                </span>
              </SelectItem>
            );
          })}
        </SelectGroup>
      </SelectContent>
    </Select>
  );
}
