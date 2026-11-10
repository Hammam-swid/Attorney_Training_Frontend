import { NoteFlag } from "@/types";

/** same rules as the backend (src/utils/note-flags.ts) */
export const getNoteFlag = (notes?: string | null): NoteFlag => {
  if (!notes) return null;
  const text = notes.replace(/[ً-ْـ]/g, "");
  if (/منتدب|انتداب|منتدبة|منتدبه/.test(text)) return "seconded";
  if (/منتقل|انتقال|منقول/.test(text)) return "transferred";
  return null;
};

export const NOTE_FLAG_STYLES: Record<
  Exclude<NoteFlag, null>,
  { label: string; className: string; printBg: string }
> = {
  transferred: {
    label: "منتقل",
    className:
      "bg-amber-200 text-amber-950 dark:bg-amber-700/60 dark:text-amber-50",
    printBg: "#fde68a",
  },
  seconded: {
    label: "منتدب",
    className: "bg-blue-200 text-blue-950 dark:bg-blue-700/60 dark:text-blue-50",
    printBg: "#bfdbfe",
  },
};

export const noteFlagOf = (t?: { notes?: string | null; noteFlag?: NoteFlag } | null) =>
  t ? (t.noteFlag !== undefined ? t.noteFlag : getNoteFlag(t.notes)) : null;
