import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Check, ChevronsUpDown, Loader2, Plus, X } from "lucide-react";
import { Button } from "./ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog";
import { Input } from "./ui/input";
import { WorkplacesService } from "@/services/workplaces.service";
import { normalizeName } from "@/lib/normalizeName";
import { cn } from "@/lib/utils";
import { Workplace, WORKPLACE_CATEGORIES, WorkplaceCategory } from "@/types";
import WorkplaceCategoryTabs from "./WorkplaceCategoryTabs";

export interface WorkplaceValue {
  workplaceId: number | null;
  /** display / free text name */
  name: string;
}

interface Props {
  value: WorkplaceValue;
  onChange: (value: WorkplaceValue) => void;
  /** allow typing a name that is not in the tree yet (it will be created as "needs review") */
  allowFreeText?: boolean;
  allowClear?: boolean;
  placeholder?: string;
  className?: string;
  /** title of the selection modal */
  title?: string;
  /** ids that cannot be chosen (e.g. the workplace itself when choosing a parent) */
  excludeIds?: number[];
  /** tree shown first (النيابات / الجهات الأخرى); default: the selected workplace's tree */
  category?: WorkplaceCategory;
  /** only the `category` tree can be chosen (no tabs) */
  lockCategory?: boolean;
}

export const useWorkplaces = () =>
  useQuery({
    queryKey: ["workplaces"],
    queryFn: () => WorkplacesService.getWorkplaces(),
    staleTime: 60_000,
  });

/** depth of each workplace for indentation (based on parentId), sorted as a tree */
const withDepth = (list: Workplace[]) => {
  const byId = new Map(list.map((w) => [w.id, w]));
  const depthOf = (w: Workplace, guard = 0): number =>
    w.parentId && byId.has(w.parentId) && guard < 20
      ? 1 + depthOf(byId.get(w.parentId)!, guard + 1)
      : 0;
  return list
    .map((w) => ({ ...w, depth: depthOf(w) }))
    .sort((a, b) => (a.path ?? a.name).localeCompare(b.path ?? b.name, "ar"));
};

/**
 * Workplace (جهة العمل) picker. Opens a modal with a searchable tree list.
 * A modal is used (instead of a popover) so it works inside other dialogs.
 */
export default function WorkplaceSelect({
  value,
  onChange,
  allowFreeText = false,
  allowClear = true,
  placeholder = "اختر جهة العمل",
  className,
  title = "اختيار جهة العمل",
  excludeIds = [],
  category,
  lockCategory = false,
}: Props) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [tab, setTab] = useState<WorkplaceCategory>(category ?? "prosecution");
  const { data, isLoading } = useWorkplaces();

  const items = useMemo(() => withDepth(data ?? []), [data]);
  const normalizedSearch = normalizeName(search);
  const matches = items.filter(
    (w) =>
      !excludeIds.includes(w.id) &&
      (!normalizedSearch ||
        normalizeName(w.path ?? w.name).includes(normalizedSearch) ||
        w.aliases?.some((a) => normalizeName(a.name).includes(normalizedSearch))),
  );
  const filtered = matches.filter((w) => w.category === tab);
  const otherTab: WorkplaceCategory = tab === "prosecution" ? "other" : "prosecution";
  const otherMatches = lockCategory
    ? 0
    : matches.filter((w) => w.category === otherTab).length;
  const counts = {
    prosecution: items.filter((w) => w.category === "prosecution").length,
    other: items.filter((w) => w.category === "other").length,
  };
  const exactMatch = items.find(
    (w) =>
      normalizeName(w.name) === normalizedSearch ||
      w.aliases?.some((a) => normalizeName(a.name) === normalizedSearch),
  );

  const selected = value.workplaceId
    ? items.find((w) => w.id === value.workplaceId)
    : undefined;
  const label = selected?.path ?? selected?.name ?? value.name;

  const openPicker = () => {
    // open on the tree of the selected workplace, else the requested tree
    setTab(lockCategory ? category ?? "prosecution" : selected?.category ?? category ?? "prosecution");
    setOpen(true);
  };

  const choose = (v: WorkplaceValue) => {
    onChange(v);
    setOpen(false);
    setSearch("");
  };

  return (
    <>
      <div className={cn("flex w-full items-center gap-1", className)}>
        <Button
          type="button"
          variant="outline"
          className="flex-1 min-w-0 justify-between font-normal"
          onClick={openPicker}
        >
          <span className={cn("truncate", !label && "text-muted-foreground")}>
            {label || placeholder}
            {!value.workplaceId && value.name && (
              <span className="text-xs text-amber-600 ms-2">(جديدة)</span>
            )}
          </span>
          <ChevronsUpDown className="h-4 w-4 opacity-50 shrink-0" />
        </Button>
        {allowClear && (value.workplaceId || value.name) && (
          <Button
            type="button"
            variant="ghost"
            size="icon"
            title="إلغاء الاختيار"
            onClick={() => onChange({ workplaceId: null, name: "" })}
          >
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>

      <Dialog
        open={open}
        onOpenChange={(o) => {
          setOpen(o);
          if (!o) setSearch("");
        }}
      >
        <DialogContent dir="rtl" className="max-w-xl">
          <DialogHeader>
            <DialogTitle>
              {title}
              {lockCategory && ` — ${WORKPLACE_CATEGORIES[tab]}`}
            </DialogTitle>
            <DialogDescription>
              ابحث بالاسم (يشمل الأسماء البديلة)، ثم اضغط على الجهة لاختيارها.
            </DialogDescription>
          </DialogHeader>
          {!lockCategory && (
            <WorkplaceCategoryTabs
              value={tab}
              onChange={(v) => v !== "all" && setTab(v)}
              counts={counts}
              className="w-full [&>button]:flex-1"
            />
          )}
          <Input
            autoFocus
            placeholder="ابحث عن جهة العمل..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => {
              // do not submit the parent form
              if (e.key === "Enter") e.preventDefault();
            }}
          />
          <ul className="h-[50vh] overflow-y-auto rounded-md border p-1 space-y-0.5">
            {isLoading ? (
              <Loader2 className="block mx-auto my-4 text-primary animate-spin" />
            ) : (
              <>
                {allowFreeText && normalizedSearch && !exactMatch && (
                  <li>
                    <button
                      type="button"
                      className="w-full text-start rounded px-2 py-2 hover:bg-muted flex items-center gap-2 text-primary"
                      onClick={() => choose({ workplaceId: null, name: search.trim() })}
                    >
                      <Plus className="h-4 w-4" />
                      إضافة جهة جديدة: "{search.trim()}"
                    </button>
                  </li>
                )}
                {filtered.length === 0 && (
                  <li className="text-center text-muted-foreground py-4">
                    لا توجد نتائج في {WORKPLACE_CATEGORIES[tab]}
                  </li>
                )}
                {otherMatches > 0 && normalizedSearch && (
                  <li>
                    <button
                      type="button"
                      className="w-full rounded px-2 py-2 text-sm text-primary hover:bg-muted"
                      onClick={() => setTab(otherTab)}
                    >
                      توجد {otherMatches} نتيجة في {WORKPLACE_CATEGORIES[otherTab]} — عرضها
                    </button>
                  </li>
                )}
                {filtered.map((w) => (
                  <li key={w.id}>
                    <button
                      type="button"
                      onClick={() => choose({ workplaceId: w.id, name: w.name })}
                      style={{
                        paddingInlineStart: `${0.5 + (normalizedSearch ? 0 : w.depth) * 1.25}rem`,
                      }}
                      className={cn(
                        "w-full text-start rounded py-2 pe-2 hover:bg-muted flex items-center justify-between gap-2",
                        value.workplaceId === w.id && "bg-muted font-semibold",
                      )}
                    >
                      <span className="truncate">
                        {!normalizedSearch && w.depth > 0 && (
                          <span className="text-muted-foreground">└ </span>
                        )}
                        {/* while searching show the full path to tell sub offices apart */}
                        {normalizedSearch ? w.path ?? w.name : w.name}
                        {w.needsReview && (
                          <span className="text-xs text-amber-600 ms-1">
                            (تحتاج مراجعة)
                          </span>
                        )}
                      </span>
                      {value.workplaceId === w.id && <Check className="h-4 w-4 shrink-0" />}
                    </button>
                  </li>
                ))}
              </>
            )}
          </ul>
          {allowClear && (value.workplaceId || value.name) && (
            <Button
              type="button"
              variant="outline"
              onClick={() => choose({ workplaceId: null, name: "" })}
            >
              إلغاء الاختيار
            </Button>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
