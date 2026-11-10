import { useMemo, useState } from "react";
import { ChevronDown, ChevronLeft, Loader2 } from "lucide-react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  LabelList,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export interface WorkplaceRow {
  id: number;
  name: string;
  parentId: number | null;
  path: string;
  trainees: number;
  attended: number;
  notAttended: number;
  totalTrainees: number;
  totalAttended: number;
  totalNotAttended: number;
}

export const ratioOf = (r: WorkplaceRow) =>
  r.totalTrainees ? Math.round((r.totalAttended / r.totalTrainees) * 100) : null;

interface Props {
  rows: WorkplaceRow[];
  unlinked?: { trainees: number; attended: number; notAttended: number };
  isLoading: boolean;
  hideEmpty: boolean;
  selectedId: number | null;
  onSelect: (row: WorkplaceRow) => void;
}

/** rows arranged as a tree (a row whose parent is not in the list is a root) */
const buildTree = (rows: WorkplaceRow[]) => {
  const ids = new Set(rows.map((r) => r.id));
  const children = new Map<number, WorkplaceRow[]>();
  const roots: WorkplaceRow[] = [];
  for (const r of rows) {
    if (r.parentId && ids.has(r.parentId)) {
      if (!children.has(r.parentId)) children.set(r.parentId, []);
      children.get(r.parentId)!.push(r);
    } else roots.push(r);
  }
  const byName = (a: WorkplaceRow, b: WorkplaceRow) => a.name.localeCompare(b.name, "ar");
  roots.sort(byName);
  children.forEach((list) => list.sort(byName));
  return { roots, children };
};

/** counts per workplace: collapsible tree table + attendance ratio chart */
export default function WorkplacesSummary({
  rows,
  unlinked,
  isLoading,
  hideEmpty,
  selectedId,
  onSelect,
}: Props) {
  const [expanded, setExpanded] = useState<Set<number>>(new Set());
  const visibleRows = useMemo(
    () => (hideEmpty ? rows.filter((r) => r.totalTrainees > 0) : rows),
    [rows, hideEmpty],
  );
  const { roots, children } = useMemo(() => buildTree(visibleRows), [visibleRows]);

  // chart: main workplaces with trainees, best ratio first
  const chartData = useMemo(
    () =>
      roots
        .filter((r) => r.totalTrainees > 0)
        .map((r) => ({ name: r.name, ratio: ratioOf(r) ?? 0, total: r.totalTrainees }))
        .sort((a, b) => b.ratio - a.ratio),
    [roots],
  );

  if (isLoading) return <Loader2 className="animate-spin" />;

  const toggle = (id: number) =>
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  const allParentIds = [...children.keys()];

  const renderRow = (r: WorkplaceRow, depth: number): React.ReactNode[] => {
    const kids = children.get(r.id) ?? [];
    const isOpen = expanded.has(r.id);
    const ratio = ratioOf(r);
    return [
      <TableRow
        key={r.id}
        className={cn("cursor-pointer", selectedId === r.id && "bg-muted")}
        title="اضغط لعرض المستهدفين"
        onClick={() => onSelect(r)}
      >
        <TableCell>
          <div className="flex items-center gap-1" style={{ paddingInlineStart: `${depth * 1.5}rem` }}>
            {kids.length ? (
              <button
                type="button"
                className="p-0.5"
                title={isOpen ? "طي" : "عرض الجهات الفرعية"}
                onClick={(e) => {
                  e.stopPropagation();
                  toggle(r.id);
                }}
              >
                {isOpen ? <ChevronDown className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
              </button>
            ) : (
              <span className="w-5" />
            )}
            <span className={cn(depth === 0 && "font-medium")}>{r.name}</span>
            {kids.length > 0 && (
              <span className="text-xs text-muted-foreground">({kids.length} فرعية)</span>
            )}
          </div>
        </TableCell>
        <TableCell>{r.totalTrainees}</TableCell>
        <TableCell>{r.totalAttended}</TableCell>
        <TableCell>{r.totalNotAttended}</TableCell>
        <TableCell>
          {ratio === null ? (
            "-"
          ) : (
            <div className="flex items-center gap-2 min-w-28">
              <div className="h-2 flex-1 rounded bg-muted overflow-hidden">
                <div className="h-full bg-primary" style={{ width: `${ratio}%` }} />
              </div>
              <span className="text-xs w-9 text-end">{ratio}%</span>
            </div>
          )}
        </TableCell>
      </TableRow>,
      ...(isOpen ? kids.flatMap((k) => renderRow(k, depth + 1)) : []),
    ];
  };

  return (
    <div className="space-y-6">
      {chartData.length > 1 && (
        <div className="rounded-md border p-4">
          <h3 className="font-semibold mb-1">نسبة المتحصلين حسب الجهة الرئيسية</h3>
          <p className="text-xs text-muted-foreground mb-3">
            النسبة = المتحصلون ÷ عدد المستهدفين في الجهة وفروعها
          </p>
          <ResponsiveContainer width="100%" height={Math.max(160, chartData.length * 28 + 40)}>
            <BarChart data={chartData} layout="vertical" margin={{ left: 8, right: 40 }}>
              <CartesianGrid horizontal={false} strokeDasharray="3 3" />
              <XAxis type="number" domain={[0, 100]} tickFormatter={(v) => `${v}%`} reversed />
              <YAxis
                type="category"
                dataKey="name"
                width={220}
                orientation="right"
                tick={{ fontSize: 12 }}
                interval={0}
              />
              <Tooltip
                formatter={(v: number, _n, item) => [`${v}% من ${item.payload.total}`, "المتحصلون"]}
              />
              <Bar dataKey="ratio" fill="hsl(var(--primary))" radius={[4, 0, 0, 4]} barSize={16}>
                <LabelList
                  dataKey="ratio"
                  position="left"
                  formatter={(v: number) => `${v}%`}
                  style={{ fontSize: 11 }}
                />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {allParentIds.length > 0 && (
        <Button
          variant="ghost"
          size="sm"
          onClick={() =>
            setExpanded((prev) => (prev.size ? new Set() : new Set(allParentIds)))
          }
        >
          {expanded.size ? "طي كل الجهات" : "عرض كل الجهات الفرعية"}
        </Button>
      )}
      <Table dir="rtl">
        <TableHeader>
          <TableRow className="*:text-right">
            <TableHead>جهة العمل</TableHead>
            <TableHead>عدد المستهدفين</TableHead>
            <TableHead>المتحصلون</TableHead>
            <TableHead>غير المتحصلين</TableHead>
            <TableHead>النسبة</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {roots.length ? (
            roots.flatMap((r) => renderRow(r, 0))
          ) : (
            <TableRow>
              <TableCell colSpan={5} className="text-center text-muted-foreground">
                لا توجد جهات
              </TableCell>
            </TableRow>
          )}
          {!!unlinked?.trainees && (
            <TableRow className="text-muted-foreground">
              <TableCell>غير مرتبطين بجهة في الدليل</TableCell>
              <TableCell>{unlinked.trainees}</TableCell>
              <TableCell>{unlinked.attended}</TableCell>
              <TableCell>{unlinked.notAttended}</TableCell>
              <TableCell>-</TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}
