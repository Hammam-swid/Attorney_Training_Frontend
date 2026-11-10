import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import toast from "react-hot-toast";
import { Download, Loader2, Printer } from "lucide-react";
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
} from "@/components/reports/ReportFilters";
import TraineeName, { NoteFlagLegend } from "@/components/TraineeName";
import {
  generateGroupedPrintHTML,
  nameCellStyle,
  openPrintWindow,
} from "@/lib/printUtils";
import { NoteFlag } from "@/types";

interface ComprehensiveTrainee {
  id: number;
  name: string;
  payGrade: string | null;
  employer: string;
  workplacePath: string | null;
  traineeType: string | null;
  rating: number | null;
  notes: string | null;
  noteFlag: NoteFlag;
}

interface ComprehensiveActivity {
  id: number;
  title: string;
  parentTitle: string | null;
  type: string | null;
  domain: string | null;
  status: string;
  startDate: string;
  endDate: string;
  hours: number;
  location: string;
  executor: string | null;
  host: string | null;
  rating: number | null;
  instructors: { name: string; rating: number | null }[];
  trainees: ComprehensiveTrainee[];
}

interface Summary {
  activitiesCount: number;
  totalHours: number;
  participations: number;
  uniqueTrainees: number;
}

const fmt = (d: string) => format(new Date(d), "dd-MM-yyyy");

const columns = [
  { label: "الاسم", value: "name" },
  { label: "الدرجة", value: "payGrade" },
  { label: "جهة العمل", value: "employer" },
  { label: "النوع", value: "traineeType" },
  { label: "التقييم", value: "rating" },
  { label: "ملاحظات", value: "notes" },
];

const cellValue = (t: ComprehensiveTrainee, field: string) => {
  const v = t[field as keyof ComprehensiveTrainee];
  return v === null || v === undefined || v === "" ? "-" : String(v);
};

const activityDetails = (a: ComprehensiveActivity) => [
  `النوع: ${a.type ?? "-"}`,
  `المجال: ${a.domain ?? "-"}`,
  `من: ${fmt(a.startDate)}`,
  `إلى: ${fmt(a.endDate)}`,
  `الساعات: ${a.hours}`,
  `المكان: ${a.location || "-"}`,
  `الجهة المنفذة: ${a.executor ?? "-"}`,
  `الجهة المستضيفة: ${a.host ?? "-"}`,
  `المدربون: ${a.instructors.map((i) => i.name).join("، ") || "-"}`,
  `عدد المتدربين: ${a.trainees.length}`,
];

/**
 * التقرير الشامل: كل نشاط بتفاصيله (التاريخ، الساعات، المدربين ...) ثم
 * المتدربون المشاركون فيه، في ملف إكسل واحد / طباعة واحدة.
 */
export default function ComprehensiveReport() {
  const { filters, update } = useReportFilters({ defaultPeriod: true });
  const [downloading, setDownloading] = useState(false);
  const { data: types } = useTraineeTypes();
  const typeName = types?.find((t) => String(t.id) === filters.traineeTypeId)?.name;
  const params = useMemo(() => filtersToParams(filters), [filters]);

  const { data, isLoading } = useQuery({
    queryKey: ["reports", "comprehensive", params.toString()],
    queryFn: async () => {
      const res = await api.get<{
        data: { activities: ComprehensiveActivity[]; summary: Summary };
      }>(`/api/v1/reports/comprehensive?${params.toString()}`);
      return res.data.data;
    },
  });

  const activities = data?.activities ?? [];
  const summaryLine = data
    ? `عدد الأنشطة: ${data.summary.activitiesCount}   إجمالي الساعات: ${data.summary.totalHours}   عدد المشاركات: ${data.summary.participations}   عدد المتدربين (بدون تكرار): ${data.summary.uniqueTrainees}`
    : "";

  const handleExcel = async () => {
    try {
      setDownloading(true);
      const p = new URLSearchParams(params);
      p.set("format", "xlsx");
      // styled workbook (colors, merged headers) built on the server with exceljs
      const res = await api.get(`/api/v1/reports/comprehensive?${p.toString()}`, {
        responseType: "blob",
      });
      const url = URL.createObjectURL(res.data);
      const link = document.createElement("a");
      link.href = url;
      link.download = "التقرير-الشامل.xlsx";
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error(error);
      toast.error("تعذر تنزيل الملف");
    } finally {
      setDownloading(false);
    }
  };

  const handlePrint = () => {
    if (!activities.length) return toast.error("لا يوجد بيانات للطباعة");
    openPrintWindow(
      generateGroupedPrintHTML({
        title: "التقرير الشامل للأنشطة التدريبية والمتدربين",
        subtitleLines: [...describeFilters(filters, typeName), summaryLine],
        columns,
        groups: activities.map((a) => ({
          title: a.parentTitle ? `${a.title} (تابع لـ: ${a.parentTitle})` : a.title,
          details: activityDetails(a),
          rows: a.trainees,
        })),
        getFieldValue: cellValue,
        getCellStyle: (t, f) => (f === "name" ? nameCellStyle(t) : undefined),
        showNoteLegend: true,
      }),
    ).catch(() => toast.error("تعذر فتح نافذة الطباعة"));
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <ReportFilters filters={filters} update={update} />
        <div className="flex gap-2">
          <Button variant="outline" onClick={handlePrint}>
            طباعة <Printer />
          </Button>
          <Button onClick={handleExcel} disabled={downloading}>
            {downloading ? <Loader2 className="animate-spin" /> : <Download />}
            تصدير إكسل
          </Button>
        </div>
      </div>
      <div className="flex items-center justify-between">
        <NoteFlagLegend />
        <span className="text-sm text-muted-foreground">{summaryLine}</span>
      </div>

      {isLoading ? (
        <Loader2 className="animate-spin" />
      ) : activities.length === 0 ? (
        <p className="text-center text-muted-foreground py-10">لا يوجد بيانات</p>
      ) : (
        activities.map((a, index) => (
          <section key={a.id} className="rounded-md border">
            <header className="bg-muted px-4 py-2">
              <h3 className="font-bold">
                {index + 1}- {a.title}
                {a.parentTitle && (
                  <span className="text-sm text-muted-foreground font-normal">
                    {" "}
                    (تابع لـ: {a.parentTitle})
                  </span>
                )}
              </h3>
              <div className="flex flex-wrap gap-x-5 gap-y-1 text-sm text-muted-foreground">
                {activityDetails(a).map((d) => (
                  <span key={d}>{d}</span>
                ))}
              </div>
            </header>
            <Table dir="rtl">
              <TableHeader>
                <TableRow className="*:text-right">
                  <TableHead>ت.</TableHead>
                  {columns.map((c) => (
                    <TableHead key={c.value}>{c.label}</TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {a.trainees.length ? (
                  a.trainees.map((t, i) => (
                    <TableRow key={t.id}>
                      <TableCell>{i + 1}</TableCell>
                      {columns.map((c) => (
                        <TableCell key={c.value}>
                          {c.value === "name" ? (
                            <TraineeName trainee={t} />
                          ) : (
                            cellValue(t, c.value)
                          )}
                        </TableCell>
                      ))}
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell
                      colSpan={columns.length + 1}
                      className="text-center text-muted-foreground"
                    >
                      لا يوجد متدربون
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </section>
        ))
      )}
    </div>
  );
}
