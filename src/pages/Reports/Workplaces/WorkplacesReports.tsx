import { useMemo, useState } from "react";
import WorkplacesSummary, { ratioOf, WorkplaceRow } from "./WorkplacesSummary";
import { Checkbox } from "@/components/ui/checkbox";
import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import toast from "react-hot-toast";
import { utils, writeFile } from "xlsx";
import { Download, FileSpreadsheet, Loader2, Printer } from "lucide-react";
import api from "@/lib/api";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import ReportFilters, {
  describeFilters,
  filtersToParams,
  useReportFilters,
  useTraineeTypes,
  useUrlParam,
} from "@/components/reports/ReportFilters";
import TraineeName, { NoteFlagLegend } from "@/components/TraineeName";
import {
  generatePrintHTML,
  nameCellStyle,
  openPrintWindow,
} from "@/lib/printUtils";
import { NOTE_FLAG_STYLES, noteFlagOf } from "@/lib/noteFlag";
import {
  NoteFlag,
  TraineeType,
  WORKPLACE_CATEGORIES,
  WorkplaceCategory,
} from "@/types";
import WorkplaceCategoryTabs from "@/components/WorkplaceCategoryTabs";
import { cn } from "@/lib/utils";

type Mode = "attended" | "notAttended" | "all";

interface WorkplaceTrainee {
  id: number;
  name: string;
  payGrade: string | null;
  employer: string;
  workplace: { id: number; name: string; path: string } | null;
  traineeType: TraineeType | null;
  notes: string | null;
  noteFlag: NoteFlag;
  attended: boolean;
  activities: {
    id: number;
    title: string;
    parentTitle: string | null;
    startDate: string;
    endDate: string;
    hours: number;
  }[];
  activitiesCount: number;
  totalHours: number;
}

const modeLabels: Record<Mode, string> = {
  attended: "المتحصلون على الدورات",
  notAttended: "غير المتحصلين على الدورات",
  all: "الكل",
};

const fmt = (d: string) => format(new Date(d), "dd-MM-yyyy");

export default function WorkplacesReports() {
  const { filters, update } = useReportFilters();
  // report options kept in the url (with the filters)
  const [mode, setMode] = useUrlParam<Mode>("mode", "attended");
  const [matchAllParam, setMatchAllParam] = useUrlParam<"0" | "1">("matchAll", "0");
  const matchAll = matchAllParam === "1";
  const setMatchAll = (v: boolean) => setMatchAllParam(v ? "1" : "0");
  const [hideEmptyParam, setHideEmptyParam] = useUrlParam<"0" | "1">("hideEmpty", "1");
  const hideEmpty = hideEmptyParam === "1";
  const setHideEmpty = (v: boolean) => setHideEmptyParam(v ? "1" : "0");
  const [exportingAll, setExportingAll] = useState(false);
  const { data: types } = useTraineeTypes();
  const typeName = types?.find((t) => String(t.id) === filters.traineeTypeId)?.name;

  const baseParams = useMemo(() => {
    const p = filtersToParams(filters);
    if (matchAll) p.set("match", "all");
    return p;
  }, [filters, matchAll]);

  // per-workplace counts, one tree at a time (النيابات / الجهات الأخرى)
  const [summaryCategory, setSummaryCategory] = useUrlParam<WorkplaceCategory | "all">(
    "tree",
    "prosecution",
  );
  const summaryParams = useMemo(() => {
    const p = new URLSearchParams(baseParams);
    if (summaryCategory !== "all") p.set("category", summaryCategory);
    return p;
  }, [baseParams, summaryCategory]);
  const summaryQuery = useQuery({
    queryKey: ["reports", "workplaces", summaryParams.toString()],
    queryFn: async () => {
      const res = await api.get<{
        data: {
          workplaces: WorkplaceRow[];
          unlinked: { trainees: number; attended: number; notAttended: number };
        };
      }>(`/api/v1/reports/workplaces?${summaryParams.toString()}`);
      return res.data.data;
    },
  });

  // trainees of the selected workplace
  const traineesParams = useMemo(() => {
    const p = new URLSearchParams(baseParams);
    p.set("mode", mode);
    return p;
  }, [baseParams, mode]);
  const traineesQuery = useQuery({
    queryKey: ["reports", "workplaces", "trainees", traineesParams.toString()],
    queryFn: async () => {
      const res = await api.get<{
        data: {
          trainees: WorkplaceTrainee[];
          summary: { total: number; attended: number; notAttended: number; count: number };
        };
      }>(`/api/v1/reports/workplaces/trainees?${traineesParams.toString()}`);
      return res.data.data;
    },
    enabled: !!filters.workplace.workplaceId,
  });

  const activityCriteria = filters.activities.length
    ? matchAll
      ? "كل الأنشطة المحددة"
      : "أي من الأنشطة المحددة"
    : filters.isDate
      ? "أي نشاط في الفترة المحددة"
      : "أي نشاط";

  const headerLines = [
    ...describeFilters(filters, typeName),
    `معيار التحصل: ${activityCriteria}`,
  ];

  // ---------------- summary export / print ----------------
  // printed / exported rows follow "hide empty"; ordered as a tree (path)
  const summaryRows = (summaryQuery.data?.workplaces ?? [])
    .filter((r) => !hideEmpty || r.totalTrainees > 0)
    .sort((a, b) => a.path.localeCompare(b.path, "ar"));
  const summaryTitle = `تقرير جهات العمل والمتحصلين على الدورات${
    summaryCategory !== "all" ? ` — ${WORKPLACE_CATEGORIES[summaryCategory]}` : ""
  }`;
  const summaryColumns = [
    { label: "جهة العمل", value: "path" },
    { label: "عدد المستهدفين", value: "totalTrainees" },
    { label: "المتحصلون", value: "totalAttended" },
    { label: "غير المتحصلين", value: "totalNotAttended" },
    { label: "النسبة", value: "ratio" },
  ];
  const summaryValue = (row: WorkplaceRow, field: string) => {
    if (field === "ratio") {
      const ratio = ratioOf(row);
      return ratio === null ? "-" : `${ratio}%`;
    }
    return String(row[field as keyof WorkplaceRow] ?? "-");
  };

  const exportSummary = () => {
    if (!summaryRows.length) return toast.error("لا يوجد بيانات");
    const ws = utils.aoa_to_sheet([
      [summaryTitle],
      ...headerLines.map((l) => [l]),
      summaryColumns.map((c) => c.label),
      ...summaryRows.map((r) => summaryColumns.map((c) => summaryValue(r, c.value))),
    ]);
    ws["!cols"] = [{ wch: 50 }, { wch: 15 }, { wch: 15 }, { wch: 15 }, { wch: 10 }];
    const wb = utils.book_new();
    wb.Workbook = { Views: [{ RTL: true }] };
    utils.book_append_sheet(wb, ws, "جهات العمل");
    writeFile(wb, "تقرير-جهات-العمل.xlsx");
  };

  const printSummary = () => {
    if (!summaryRows.length) return toast.error("لا يوجد بيانات");
    openPrintWindow(
      generatePrintHTML({
        title: summaryTitle,
        subtitleLines: headerLines,
        columns: summaryColumns,
        data: summaryRows,
        getFieldValue: summaryValue,
      }),
    ).catch(() => toast.error("تعذر فتح نافذة الطباعة"));
  };

  // ---------------- one Excel file, one sheet per main workplace ----------------
  // the not-attended trainees of each main workplace (with its sub offices),
  // ready to be sent to each office
  const exportPerOffice = async () => {
    const rows = summaryQuery.data?.workplaces ?? [];
    if (!rows.length) return toast.error("لا يوجد بيانات");
    try {
      setExportingAll(true);
      const p = new URLSearchParams(baseParams);
      p.delete("workplaceId");
      p.delete("includeSub");
      p.set("mode", "notAttended");
      const res = await api.get<{ data: { trainees: WorkplaceTrainee[] } }>(
        `/api/v1/reports/workplaces/trainees?${p.toString()}`,
      );
      // main workplace of each workplace of the current tree
      const byId = new Map(rows.map((r) => [r.id, r]));
      const rootOf = (id: number) => {
        let current = byId.get(id);
        let guard = 0;
        while (current?.parentId && byId.has(current.parentId) && guard++ < 50) {
          current = byId.get(current.parentId);
        }
        return current;
      };
      const groups = new Map<number, { root: WorkplaceRow; trainees: WorkplaceTrainee[] }>();
      for (const t of res.data.data.trainees) {
        const root = t.workplace ? rootOf(t.workplace.id) : undefined;
        if (!root) continue; // other tree or not linked
        if (!groups.has(root.id)) groups.set(root.id, { root, trainees: [] });
        groups.get(root.id)!.trainees.push(t);
      }
      if (!groups.size) return toast.error("لا يوجد غير متحصلين");

      const wb = utils.book_new();
      wb.Workbook = { Views: [{ RTL: true }] };
      const used = new Set<string>();
      // Excel sheet names: max 31 chars, unique, no \ / ? * [ ] :
      const sheetName = (name: string) => {
        const base = name.replace(/[\\/?*[\]:]/g, " ").slice(0, 28).trim() || "جهة";
        let n = base;
        for (let i = 2; used.has(n); i++) n = `${base.slice(0, 25)} ${i}`;
        used.add(n);
        return n;
      };
      const cols = ["ت.", "الاسم", "الدرجة", "جهة العمل", "النوع", "ملاحظات"];
      const groupList = [...groups.values()].sort((a, b) =>
        a.root.name.localeCompare(b.root.name, "ar"),
      );
      // summary sheet first
      const summary = utils.aoa_to_sheet([
        ["غير المتحصلين حسب الجهة"],
        ...headerLines.map((l) => [l]),
        ["الجهة", "عدد غير المتحصلين"],
        ...groupList.map((g) => [g.root.name, g.trainees.length]),
      ]);
      summary["!cols"] = [{ wch: 50 }, { wch: 18 }];
      utils.book_append_sheet(wb, summary, sheetName("الملخص"));
      for (const g of groupList) {
        const ws = utils.aoa_to_sheet([
          [`غير المتحصلين على الدورات — ${g.root.name}`],
          ...headerLines.map((l) => [l]),
          [`العدد: ${g.trainees.length}`],
          cols,
          ...g.trainees.map((t, i) => {
            const flag = noteFlagOf(t);
            return [
              i + 1,
              flag ? `${t.name} (${NOTE_FLAG_STYLES[flag].label})` : t.name,
              t.payGrade || "-",
              t.workplace?.path || t.employer || "-",
              t.traineeType?.name || "-",
              t.notes || "",
            ];
          }),
        ]);
        ws["!cols"] = [{ wch: 5 }, { wch: 32 }, { wch: 28 }, { wch: 45 }, { wch: 16 }, { wch: 30 }];
        utils.book_append_sheet(wb, ws, sheetName(g.root.name));
      }
      writeFile(wb, "غير-المتحصلين-حسب-الجهة.xlsx");
    } catch (error) {
      console.error(error);
      toast.error("تعذر إنشاء الملف");
    } finally {
      setExportingAll(false);
    }
  };

  // ---------------- trainees export / print ----------------
  const trainees = traineesQuery.data?.trainees ?? [];
  const traineeColumns = [
    { label: "الاسم", value: "name" },
    { label: "الدرجة", value: "payGrade" },
    { label: "جهة العمل", value: "workplace" },
    { label: "النوع", value: "traineeType" },
    { label: "الدورات المتحصل عليها", value: "activities" },
    { label: "عدد الدورات", value: "activitiesCount" },
    { label: "مجموع الساعات", value: "totalHours" },
    { label: "ملاحظات", value: "notes" },
  ];
  const traineeValue = (t: WorkplaceTrainee, field: string): string => {
    switch (field) {
      case "workplace":
        return t.workplace?.path || t.employer || "-";
      case "traineeType":
        return t.traineeType?.name || "-";
      case "activities":
        return (
          t.activities
            .map((a) => `${a.title} (${fmt(a.startDate)})`)
            .join("، ") || "-"
        );
      default: {
        const v = t[field as keyof WorkplaceTrainee];
        return v === null || v === undefined || v === "" ? "-" : String(v);
      }
    }
  };
  const traineesTitle = `${modeLabels[mode]} - ${filters.workplace.name}`;
  const traineesLines = [
    ...headerLines,
    traineesQuery.data
      ? `إجمالي المستهدفين: ${traineesQuery.data.summary.total}   المتحصلون: ${traineesQuery.data.summary.attended}   غير المتحصلين: ${traineesQuery.data.summary.notAttended}`
      : "",
  ].filter(Boolean);

  const exportTrainees = () => {
    if (!trainees.length) return toast.error("لا يوجد بيانات");
    const ws = utils.aoa_to_sheet([
      [traineesTitle],
      ...traineesLines.map((l) => [l]),
      ["ت.", ...traineeColumns.map((c) => c.label)],
      ...trainees.map((t, i) => [
        i + 1,
        ...traineeColumns.map((c) => {
          const v = traineeValue(t, c.value);
          const flag = c.value === "name" ? noteFlagOf(t) : null;
          return flag ? `${v} (${NOTE_FLAG_STYLES[flag].label})` : v;
        }),
      ]),
    ]);
    ws["!cols"] = [{ wch: 5 }, { wch: 30 }, { wch: 25 }, { wch: 35 }, { wch: 15 }, { wch: 60 }, { wch: 10 }, { wch: 10 }, { wch: 30 }];
    const wb = utils.book_new();
    wb.Workbook = { Views: [{ RTL: true }] };
    utils.book_append_sheet(wb, ws, "المستهدفون");
    writeFile(wb, `تقرير-${filters.workplace.name}.xlsx`);
  };

  const printTrainees = () => {
    if (!trainees.length) return toast.error("لا يوجد بيانات");
    openPrintWindow(
      generatePrintHTML({
        title: traineesTitle,
        subtitleLines: traineesLines,
        columns: traineeColumns,
        data: trainees,
        getFieldValue: traineeValue,
        getCellStyle: (t, f) => (f === "name" ? nameCellStyle(t) : undefined),
        showNoteLegend: true,
      }),
    ).catch(() => toast.error("تعذر فتح نافذة الطباعة"));
  };

  return (
    <div className="space-y-6">
      <div className="space-y-3">
        <ReportFilters filters={filters} update={update} />
        {filters.activities.length > 1 && (
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={matchAll}
              onChange={(e) => setMatchAll(e.target.checked)}
            />
            يجب أن يكون المتدرب متحصلاً على كل الأنشطة المحددة (وليس أحدها فقط)
          </label>
        )}
        <p className="text-sm text-muted-foreground">
          معيار التحصل: {activityCriteria}
        </p>
      </div>

      {/* ---------------- trainees of selected workplace ---------------- */}
      {filters.workplace.workplaceId ? (
        <section className="space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              {(Object.keys(modeLabels) as Mode[]).map((m) => (
                <Button
                  key={m}
                  variant={mode === m ? "default" : "outline"}
                  onClick={() => setMode(m)}
                >
                  {modeLabels[m]}
                  {traineesQuery.data &&
                    ` (${
                      m === "all"
                        ? traineesQuery.data.summary.total
                        : traineesQuery.data.summary[m]
                    })`}
                </Button>
              ))}
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={printTrainees}>
                طباعة <Printer />
              </Button>
              <Button onClick={exportTrainees}>
                تصدير <Download />
              </Button>
            </div>
          </div>
          <NoteFlagLegend />
          {traineesQuery.isLoading ? (
            <Loader2 className="animate-spin" />
          ) : (
            <Table dir="rtl">
              <TableHeader>
                <TableRow className="*:text-right">
                  <TableHead>ت.</TableHead>
                  {traineeColumns.map((c) => (
                    <TableHead key={c.value}>{c.label}</TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {trainees.length ? (
                  trainees.map((t, i) => (
                    <TableRow key={t.id}>
                      <TableCell>{i + 1}</TableCell>
                      {traineeColumns.map((c) => (
                        <TableCell
                          key={c.value}
                          className={cn(c.value === "activities" && "max-w-96 text-xs")}
                        >
                          {c.value === "name" ? (
                            <TraineeName trainee={t} />
                          ) : (
                            traineeValue(t, c.value)
                          )}
                        </TableCell>
                      ))}
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell
                      colSpan={traineeColumns.length + 1}
                      className="text-center text-muted-foreground"
                    >
                      لا يوجد بيانات
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          )}
        </section>
      ) : (
        <p className="text-muted-foreground">
          اختر جهة عمل لعرض قائمة المتحصلين / غير المتحصلين على الدورات، أو
          استخدم الجدول التالي لعرض الأعداد لكل الجهات.
        </p>
      )}

      {/* ---------------- counts per workplace ---------------- */}
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <h2 className="text-xl font-bold">أعداد المستهدفين حسب جهة العمل</h2>
            <WorkplaceCategoryTabs
              value={summaryCategory}
              onChange={setSummaryCategory}
              withAll
            />
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={printSummary}>
              طباعة <Printer />
            </Button>
            <Button onClick={exportSummary}>
              تصدير <Download />
            </Button>
            <Button
              variant="secondary"
              onClick={exportPerOffice}
              disabled={exportingAll}
              title="ملف إكسل بورقة لكل جهة رئيسية فيها غير المتحصلين"
            >
              {exportingAll ? <Loader2 className="animate-spin" /> : <FileSpreadsheet />}
              غير المتحصلين لكل جهة
            </Button>
          </div>
        </div>
        <label className="flex items-center gap-2 text-sm">
          <Checkbox checked={hideEmpty} onCheckedChange={(c) => setHideEmpty(!!c)} />
          إخفاء الجهات التي ليس بها مستهدفون
        </label>
        <WorkplacesSummary
          rows={summaryQuery.data?.workplaces ?? []}
          unlinked={summaryQuery.data?.unlinked}
          isLoading={summaryQuery.isLoading}
          hideEmpty={hideEmpty}
          selectedId={filters.workplace.workplaceId}
          onSelect={(r) => update({ workplace: { workplaceId: r.id, name: r.name } })}
        />
      </section>
    </div>
  );
}
