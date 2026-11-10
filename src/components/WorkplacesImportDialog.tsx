import { ReactNode, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { AxiosError } from "axios";
import toast from "react-hot-toast";
import { Download, Eye, Loader2, Upload } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./ui/dialog";
import { Button } from "./ui/button";
import Dropzone from "./common/Dropzone";
import excelMimeTypes from "@/lib/excelMimeTypes";
import {
  WorkplacesImportSummary,
  WorkplacesService,
} from "@/services/workplaces.service";

const errorMessage = (error: unknown) =>
  error instanceof AxiosError
    ? error.response?.data?.message || "حدث خطأ"
    : "حدث خطأ";

/**
 * Import / edit the workplaces tree from an Excel file (the downloadable
 * template contains the current tree). Preview first, then apply.
 */
export default function WorkplacesImportDialog({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);
  const [file, setFile] = useState<globalThis.File | null>(null);
  const [summary, setSummary] = useState<WorkplacesImportSummary | null>(null);
  const queryClient = useQueryClient();

  const reset = () => {
    setFile(null);
    setSummary(null);
  };

  const download = useMutation({
    mutationFn: WorkplacesService.downloadTemplate,
    onError: (e) => toast.error(errorMessage(e)),
  });

  const run = useMutation({
    mutationFn: (preview: boolean) => WorkplacesService.importExcel(file!, preview),
    onSuccess: (res) => {
      setSummary(res.data);
      if (!res.data.preview) {
        toast.success(res.message);
        queryClient.invalidateQueries({ queryKey: ["workplaces"] });
        queryClient.invalidateQueries({ queryKey: ["trainees"] });
      }
    },
    onError: (e) => toast.error(errorMessage(e)),
  });

  const changes = summary
    ? summary.created.length +
      summary.renamed.length +
      summary.moved.length +
      summary.aliasesAdded.length +
      summary.recategorized.length
    : 0;

  return (
    <Dialog
      open={open}
      onOpenChange={(o) => {
        setOpen(o);
        if (!o) reset();
      }}
    >
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent dir="rtl" className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>استيراد / تعديل دليل جهات العمل من إكسل</DialogTitle>
          <DialogDescription>
            نزّل القالب (يحتوي على الشجرة الحالية)، أضف الجهات الجديدة أو عدّل
            الأسماء والجهات الرئيسية، ثم ارفع الملف. استخدم "معاينة" لمراجعة
            التغييرات قبل تنفيذها.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <Button
            type="button"
            variant="outline"
            className="w-full"
            disabled={download.isPending}
            onClick={() => download.mutate()}
          >
            {download.isPending ? <Loader2 className="animate-spin" /> : <Download />}
            تنزيل القالب (الشجرة الحالية)
          </Button>

          <ul className="list-disc ps-5 text-sm text-muted-foreground space-y-1">
            <li>الأعمدة: "المعرف"، "اسم الجهة" (إلزامي)، "الجهة الرئيسية"، "التصنيف"، "أسماء بديلة".</li>
            <li>
              التصنيف: "النيابات" أو "جهات العمل الأخرى"، يُحدَّد للجهات الرئيسية،
              والجهة الفرعية تتبع جهتها الرئيسية دائماً.
            </li>
            <li>جهة جديدة: صف بدون معرف. الجهة الرئيسية الفارغة = جهة رئيسية.</li>
            <li>تغيير الاسم: عدّل الاسم مع إبقاء المعرف (يُحفظ القديم كاسم بديل).</li>
            <li>حذف صف من الملف لا يحذف الجهة من النظام.</li>
          </ul>

          <Dropzone
            accept=".xlsx"
            file={file as never}
            onDrop={(files) => {
              const f = files[0] as unknown as globalThis.File | undefined;
              if (f && excelMimeTypes.includes(f.type)) {
                setFile(f);
                setSummary(null);
              } else {
                toast.error("الرجاء اختيار ملف إكسل (.xlsx)");
              }
            }}
          />

          <div className="flex gap-2">
            <Button
              type="button"
              variant="secondary"
              className="flex-1"
              disabled={!file || run.isPending}
              onClick={() => run.mutate(true)}
            >
              {run.isPending && run.variables ? <Loader2 className="animate-spin" /> : <Eye />}
              معاينة
            </Button>
            <Button
              type="button"
              className="flex-1"
              disabled={
                !file ||
                run.isPending ||
                !summary?.preview ||
                changes === 0
              }
              title={!summary?.preview ? "قم بالمعاينة أولاً" : undefined}
              onClick={() => run.mutate(false)}
            >
              {run.isPending && !run.variables ? <Loader2 className="animate-spin" /> : <Upload />}
              تنفيذ التغييرات
            </Button>
          </div>

          {summary && <SummaryView summary={summary} changes={changes} />}
        </div>
      </DialogContent>
    </Dialog>
  );
}

function SummaryView({
  summary,
  changes,
}: {
  summary: WorkplacesImportSummary;
  changes: number;
}) {
  return (
    <div className="rounded-md border p-3 text-sm space-y-3">
      <p className="font-semibold">
        {summary.preview ? "معاينة (لم يتم حفظ شيء): " : "تم التنفيذ: "}
        {summary.rows} صف — {changes} تغيير، {summary.unchanged} بدون تغيير
      </p>
      <Section title={`جهات جديدة (${summary.created.length})`}>
        {summary.created.map((c, i) => (
          <li key={i}>صف {c.row}: {c.name}</li>
        ))}
      </Section>
      <Section title={`تغيير أسماء (${summary.renamed.length})`}>
        {summary.renamed.map((c, i) => (
          <li key={i}>صف {c.row}: {c.from} ← {c.to}</li>
        ))}
      </Section>
      <Section title={`نقل في الشجرة (${summary.moved.length})`}>
        {summary.moved.map((c, i) => (
          <li key={i}>
            صف {c.row}: {c.name}: من "{c.from}" إلى "{c.to}"
          </li>
        ))}
      </Section>
      <Section title={`تغيير التصنيف (${summary.recategorized.length})`}>
        {summary.recategorized.map((c, i) => (
          <li key={i}>
            {c.row ? `صف ${c.row}: ` : ""}
            {c.name}: من "{c.from}" إلى "{c.to}"
          </li>
        ))}
      </Section>
      <Section title={`أسماء بديلة (${summary.aliasesAdded.length})`}>
        {summary.aliasesAdded.map((c, i) => (
          <li key={i}>صف {c.row}: {c.name} ← {c.alias}</li>
        ))}
      </Section>
      <Section title={`أخطاء (${summary.errors.length})`} className="text-destructive">
        {summary.errors.map((c, i) => (
          <li key={i}>صف {c.row} ({c.name}): {c.message}</li>
        ))}
      </Section>
      <Section title={`تنبيهات (${summary.warnings.length})`} className="text-amber-600">
        {summary.warnings.map((c, i) => (
          <li key={i}>صف {c.row}{c.name ? ` (${c.name})` : ""}: {c.message}</li>
        ))}
      </Section>
    </div>
  );
}

function Section({
  title,
  children,
  className,
}: {
  title: string;
  children: ReactNode[];
  className?: string;
}) {
  if (!children.length) return null;
  return (
    <details open={children.length <= 10} className={className}>
      <summary className="cursor-pointer font-medium">{title}</summary>
      <ul className="max-h-40 overflow-y-auto ps-4 mt-1 space-y-0.5">{children}</ul>
    </details>
  );
}
