import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { Trainee } from "@/types";
import { SelectContent } from "@radix-ui/react-select";
import {
  Check,
  ChevronDown,
  CircleCheck,
  Download,
  Loader2,
  Printer,
} from "lucide-react";
import { useEffect, useState } from "react";
import { utils, writeFile as writeExcelFile } from "xlsx";
import TraineesTable from "./TraineesTable";
import DatePicker from "@/components/ui/DatePicker";
import { format } from "date-fns";
import { Checkbox } from "@/components/ui/checkbox";
import api from "@/lib/api";
import {
  generatePrintHTML,
  nameCellStyle,
  openPrintWindow,
} from "@/lib/printUtils";
import toast from "react-hot-toast";
import { useQuery } from "@tanstack/react-query";
import { TraineeTypeService } from "@/services/trainee-types.service";
import WorkplaceSelect, { WorkplaceValue } from "@/components/WorkplaceSelect";
import { NoteFlagLegend } from "@/components/TraineeName";
import { NOTE_FLAG_STYLES, noteFlagOf } from "@/lib/noteFlag";

type Field = {
  label: string;
  value: keyof Trainee;
};

const allFields: Field[] = [
  { label: "اسم المتدرب", value: "name" },
  { label: "رقم الهاتف", value: "phone" },
  { label: "العنوان", value: "address" },
  { label: "جهة العمل", value: "employer" },
  { label: "النوع", value: "traineeType" },
  { label: "الدرجة القضائية", value: "payGrade" },
  { label: "عدد الأنشطة", value: "activityCount" },
  { label: "ملاحظات", value: "notes" },
];

// Helper function to get field value as string for printing / export
const getPrintFieldValue = (trainee: Trainee, fieldValue: string): string => {
  const value = trainee[fieldValue as keyof Trainee];
  if (value === null || value === undefined || value === "") return "//";
  if (typeof value === "object" && "name" in value) return String(value.name);
  return value.toString();
};

export default function TraineesReports() {
  const [trainees, setTrainees] = useState<Trainee[]>([]);
  const [fields, setFields] = useState<string[]>(allFields.map((f) => f.value));
  const [type, setType] = useState<string>("all");
  const [payGrade, setPayGrade] = useState<string>("all");
  const [loading, setLoading] = useState<boolean>(false);
  const [workplace, setWorkplace] = useState<WorkplaceValue>({
    workplaceId: null,
    name: "",
  });
  const [includeSub, setIncludeSub] = useState<boolean>(true);
  // ------------------------------------------------------------------
  const [isDate, setIsDate] = useState<boolean>(false);

  const [dateFilter, setDateFilter] = useState<{
    startDate: Date | undefined;
    endDate: Date | undefined;
  }>({
    startDate: new Date(
      `${
        new Date().getMonth() >= 8
          ? new Date().getFullYear()
          : new Date().getFullYear() - 1
      }-09-01`
    ),
    endDate: new Date(
      `${
        new Date().getMonth() >= 8
          ? new Date().getFullYear() + 1
          : new Date().getFullYear()
      }-06-30`
    ),
  });
  // ------------------------------------------------------------------
  useEffect(() => {
    const fetchTrainees = async () => {
      try {
        setLoading(true);
        const startDate = dateFilter.startDate;
        const endDate = dateFilter.endDate;
        // all filters are sent to the server so that the table, the print and
        // the Excel export use exactly the same list (members only => members only)
        const params = new URLSearchParams();
        if (isDate && startDate && endDate) {
          params.set("startDate", format(startDate, "yyyy-MM-dd"));
          params.set("endDate", format(endDate, "yyyy-MM-dd"));
        }
        if (type !== "all") params.set("traineeTypeId", type);
        if (payGrade !== "all") params.set("payGrade", payGrade);
        if (workplace.workplaceId) {
          params.set("workplaceId", String(workplace.workplaceId));
          if (includeSub) params.set("includeSub", "true");
        }
        const res = await api.get(
          `/api/v1/reports/trainees?${params.toString()}`
        );
        setTrainees(res.data.data.trainees);
      } catch (error) {
        console.log(error);
        toast.error("تعذر تحميل التقرير");
      } finally {
        setLoading(false);
      }
    };
    fetchTrainees();
  }, [dateFilter, isDate, type, payGrade, workplace.workplaceId, includeSub]);

  const { data: types } = useQuery({
    queryKey: ["trainee-types"],
    queryFn: TraineeTypeService.getTraineeTypes,
  });

  const selectedType = types?.find((t) => String(t.id) === type);

  const reportTitle =
    isDate && dateFilter.startDate && dateFilter.endDate
      ? `تقرير المتدربين من ${format(
          dateFilter.startDate,
          "dd-MM-yyyy"
        )} إلى ${format(dateFilter.endDate, "dd-MM-yyyy")}`
      : "تقرير المتدربين";

  const filterLines = [
    selectedType ? `النوع: ${selectedType.name}` : "",
    payGrade !== "all" ? `الدرجة: ${payGrade}` : "",
    workplace.name
      ? `جهة العمل: ${workplace.name}${
          includeSub ? " (مع الجهات الفرعية)" : ""
        }`
      : "",
    `العدد: ${trainees.length}`,
  ].filter(Boolean);

  const handleExport = () => {
    if (trainees.length === 0) {
      toast.error("لا يوجد بيانات للتصدير");
      return;
    }
    const selected = allFields.filter((f) => fields.includes(f.value));
    const header = selected.map((f) => f.label);
    const rows = trainees.map((trainee) =>
      selected.map((field) => {
        const value = getPrintFieldValue(trainee, field.value);
        if (field.value === "name") {
          // SheetJS community build can't color cells: mark the flag in text
          const flag = noteFlagOf(trainee);
          return flag ? `${value} (${NOTE_FLAG_STYLES[flag].label})` : value;
        }
        return value === "//" ? "-" : value;
      })
    );
    const workbook = utils.book_new();
    const worksheet = utils.aoa_to_sheet([
      [reportTitle],
      [filterLines.join("   ")],
      header,
      ...rows,
    ]);
    worksheet["!merges"] = [
      { s: { r: 0, c: 0 }, e: { r: 0, c: header.length - 1 } },
      { s: { r: 1, c: 0 }, e: { r: 1, c: header.length - 1 } },
    ];
    worksheet["!cols"] = header.map(() => ({ wch: 25 }));
    workbook.Workbook = { Views: [{ RTL: true }] };
    utils.book_append_sheet(workbook, worksheet, "Trainees");
    writeExcelFile(workbook, `تقرير-المتدربين.xlsx`);
  };

  const handlePrint = async () => {
    if (trainees.length === 0) {
      toast.error("لا يوجد بيانات للطباعة");
      return;
    }

    // Generate columns for the print table
    const columns = allFields
      .filter((f) => fields.includes(f.value))
      .map((field) => ({
        label: field.label,
        value: field.value,
      }));

    // Generate print HTML using utility function
    const printHTML = generatePrintHTML({
      title: reportTitle,
      columns,
      data: trainees,
      getFieldValue: getPrintFieldValue,
      getCellStyle: (t, field) =>
        field === "name" ? nameCellStyle(t) : undefined,
      showNoteLegend: fields.includes("name"),
      subtitleLines: filterLines,
    });

    // Open print window using utility function
    try {
      await openPrintWindow(printHTML);
    } catch (error) {
      console.error("Error opening print window:", error);
      toast.error("تعذر فتح نافذة الطباعة");
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-4 flex-wrap gap-3">
        <div className="flex items-center gap-2">
          <Button
            variant={"secondary"}
            onClick={() => setFields(allFields.map((f) => f.value))}
          >
            <span>تحديد الكل</span>
            {fields.length === allFields.length && (
              <CircleCheck className="text-green-500" />
            )}
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger>
              <Button variant={"outline"}>
                {fields.length > 0
                  ? `تم تحديد ${
                      fields.length === allFields.length
                        ? "كل الحقول"
                        : fields.length + " حقل/حقول"
                    }`
                  : "اختر الحقول"}
                <ChevronDown className="text-muted-foreground" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuLabel dir="rtl">الحقول</DropdownMenuLabel>
              <DropdownMenuGroup dir="rtl">
                {allFields.map((field) => (
                  <DropdownMenuItem
                    onClick={() => {
                      if (fields.includes(field.value)) {
                        setFields(fields.filter((f) => f !== field.value));
                      } else {
                        setFields([...fields, field.value]);
                      }
                    }}
                    key={field.value}
                    className="flex items-center justify-between"
                  >
                    {field.label}
                    {fields.includes(field.value) && (
                      <Check className="ml-auto h-4 w-4" />
                    )}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuGroup>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        <div>
          <TypeFilter
            type={type}
            setType={(v) => {
              setType(v);
              if (payGrade !== "all") setPayGrade("all");
            }}
          />
        </div>
        <div>
          {selectedType?.hasPayGrade && (
            <PayGradeFilter payGrade={payGrade} setPayGrade={setPayGrade} />
          )}
        </div>
        <div className="flex items-center gap-2">
          <div className="w-64">
            <WorkplaceSelect
              value={workplace}
              onChange={setWorkplace}
              placeholder="كل جهات العمل"
            />
          </div>
          {workplace.workplaceId && (
            <label className="flex items-center gap-1 text-sm whitespace-nowrap">
              <Checkbox
                checked={includeSub}
                onCheckedChange={(c) => setIncludeSub(!!c)}
              />
              مع الفرعية
            </label>
          )}
        </div>
        <div className="flex items-center gap-3">
          <label htmlFor="date-filter">تصفية حسب التاريخ:</label>
          <Checkbox
            id="date-filter"
            checked={isDate}
            onCheckedChange={(checked: boolean) => {
              setIsDate(checked);
            }}
          />
          {isDate && (
            <>
              <div>
                <label>من:</label>
                <DatePicker
                  date={dateFilter.startDate as Date}
                  setDate={(date: Date) =>
                    setDateFilter({ ...dateFilter, startDate: date })
                  }
                />
              </div>
              <div>
                <label>إلى:</label>
                <DatePicker
                  date={dateFilter.endDate as Date}
                  setDate={(date: Date) =>
                    setDateFilter({ ...dateFilter, endDate: date })
                  }
                />
              </div>
            </>
          )}
        </div>

        <div className="flex items-center gap-2">
          <Button onClick={handlePrint} variant="outline">
            <span>طباعة</span>
            <Printer />
          </Button>
          <Button onClick={handleExport}>
            <span>تصدير</span>
            <Download />
          </Button>
        </div>
      </div>
      <div className="flex items-center justify-between mb-2">
        <NoteFlagLegend />
        <span className="text-sm text-muted-foreground">
          العدد: {trainees.length}
        </span>
      </div>
      {loading ? (
        <Loader2 className="animate-spin" />
      ) : (
        <TraineesTable
          trainees={trainees}
          fields={fields}
          allFields={allFields}
        />
      )}
    </div>
  );
}

interface TypeFilterProps {
  type: string;
  setType: React.Dispatch<React.SetStateAction<string>>;
}
function TypeFilter({ type, setType }: TypeFilterProps) {
  const { data: traineesTypes } = useQuery({
    queryKey: ["trainee-types"],
    queryFn: TraineeTypeService.getTraineeTypes,
  });
  return (
    <Select dir="rtl" value={type} onValueChange={setType}>
      <SelectTrigger dir="rtl" className="w-32">
        <SelectValue placeholder="النوع" />
      </SelectTrigger>
      <SelectContent dir="rtl" className="z-50 bg-background w-fit">
        <SelectGroup>
          <SelectLabel>النوع</SelectLabel>
          <SelectItem value="all">الكل</SelectItem>
          {traineesTypes?.map((type) => (
            <SelectItem key={type.id} value={String(type.id)}>
              {type.name}
            </SelectItem>
          ))}
        </SelectGroup>
      </SelectContent>
    </Select>
  );
}

interface PayGradeFilterProps {
  payGrade: string;
  setPayGrade: React.Dispatch<React.SetStateAction<string>>;
}

const AllPayGrades = [
  "محامي عام من الفئة أ",
  "محامي عام من الفئة ب",
  "رئيس نيابة",
  "نائب نيابة من الدرجة الأولى",
  "نائب نيابة من الدرجة الثانية",
  "وكيل نيابة من الدرجة الأولى",
  "وكيل نيابة من الدرجة الثانية",
  "وكيل نيابة من الدرجة الثالثة",
  "مساعد نيابة",
  "معاون نيابة",
  "أخرى",
];
function PayGradeFilter({ payGrade, setPayGrade }: PayGradeFilterProps) {
  return (
    <Select dir="rtl" value={payGrade} onValueChange={setPayGrade}>
      <SelectTrigger dir="rtl" className="w-52">
        <SelectValue placeholder="الدرجة القضائية" />
      </SelectTrigger>
      <SelectContent dir="rtl" className="z-50 bg-background w-52">
        <SelectGroup>
          <SelectLabel>الدرجة القضائية</SelectLabel>
          <SelectItem value="all">الكل</SelectItem>
          {AllPayGrades.map((payGrade) => (
            <SelectItem key={payGrade} value={payGrade}>
              {payGrade}
            </SelectItem>
          ))}
        </SelectGroup>
      </SelectContent>
    </Select>
  );
}
