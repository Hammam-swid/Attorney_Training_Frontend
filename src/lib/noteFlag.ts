import { NoteFlag } from "@/types";

/**
 * Same rules as the backend (src/utils/note-flags.ts), checked in this order:
 *   متوفى => deceased (red), منتدب => seconded (blue),
 *   منتقل => transferred (amber), any other note => other (green)
 */
export const getNoteFlag = (notes?: string | null): NoteFlag => {
  const text = (notes ?? "").replace(/[ً-ْـ]/g, "").trim();
  if (!text) return null;
  if (/متوفى|متوفي|متوفاة|متوفاه|توفي|وفاة|وفاه|المرحوم|المرحومة/.test(text)) return "deceased";
  if (/منتدب|انتداب/.test(text)) return "seconded";
  if (/منتقل|انتقال|منقول/.test(text)) return "transferred";
  return "other";
};

/** legend order = this object's order */
export const NOTE_FLAG_STYLES: Record<
  Exclude<NoteFlag, null>,
  { label: string; className: string; printBg: string }
> = {
  deceased: {
    label: "متوفى",
    className: "bg-red-200 text-red-950 dark:bg-red-800/60 dark:text-red-50",
    printBg: "#fecaca",
  },
  seconded: {
    label: "منتدب",
    className: "bg-blue-200 text-blue-950 dark:bg-blue-700/60 dark:text-blue-50",
    printBg: "#bfdbfe",
  },
  transferred: {
    label: "منتقل",
    className:
      "bg-amber-200 text-amber-950 dark:bg-amber-700/60 dark:text-amber-50",
    printBg: "#fde68a",
  },
  other: {
    label: "لديه ملاحظة",
    className: "bg-green-200 text-green-950 dark:bg-green-800/60 dark:text-green-50",
    printBg: "#bbf7d0",
  },
};

/** values of the notes filter ("all" = no filter) */
export type NoteFilter = Exclude<NoteFlag, null> | "none" | "any" | "all";

export const NOTE_FILTER_OPTIONS: { value: NoteFilter; label: string }[] = [
  { value: "all", label: "كل المتدربين" },
  { value: "none", label: "بدون ملاحظات" },
  { value: "any", label: "لديهم ملاحظات (الكل)" },
  { value: "deceased", label: "متوفى" },
  { value: "seconded", label: "منتدب" },
  { value: "transferred", label: "منتقل" },
  { value: "other", label: "ملاحظات أخرى" },
];

export const isNoteFilter = (v: unknown): v is NoteFilter =>
  NOTE_FILTER_OPTIONS.some((o) => o.value === v);

/** does a trainee pass the notes filter */
export const matchesNoteFilter = (
  t: { notes?: string | null; noteFlag?: NoteFlag } | null | undefined,
  filter: NoteFilter,
) => {
  if (filter === "all") return true;
  const flag = noteFlagOf(t);
  if (filter === "none") return flag === null;
  if (filter === "any") return flag !== null;
  return flag === filter;
};

export const noteFilterLabel = (filter: NoteFilter) =>
  NOTE_FILTER_OPTIONS.find((o) => o.value === filter)?.label ?? "";

/**
 * The flag sent by the server can be from an older rule set (e.g. no
 * "deceased" / "other" yet), so the notes are always re-read here.
 */
export const noteFlagOf = (t?: { notes?: string | null; noteFlag?: NoteFlag } | null) =>
  t ? (t.notes !== undefined ? getNoteFlag(t.notes) : (t.noteFlag ?? null)) : null;
