import ActivitiesSelector from "@/components/activities/ActivitiesSelector";
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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import api from "@/lib/api";
import { Activity, Trainee } from "@/types";
import {
  Check,
  ChevronDown,
  CircleCheck,
  Download,
  Printer,
  RotateCcw,
} from "lucide-react";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { utils, writeFile } from "xlsx";
import {
  generatePrintHTML,
  nameCellStyle,
  openPrintWindow,
} from "@/lib/printUtils";
import TraineeName, { NoteFlagLegend } from "@/components/TraineeName";
import { NOTE_FLAG_STYLES, noteFlagOf } from "@/lib/noteFlag";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { TraineeTypeService } from "@/services/trainee-types.service";
import { useQuery } from "@tanstack/react-query";

const allFields = [
  { label: "الاسم", value: "name" },
  { label: "الهاتف", value: "phone" },
  { label: "العنوان", value: "address" },
  { label: "جهة العمل", value: "employer" },
  { label: "النوع", value: "traineeType[name]" },
  { label: "الدرجة القضائية", value: "payGrade" },
  { label: "التقييم", value: "rating" },
  { label: "ملاحظات", value: "notes" },
];

export default function OneActivity() {
  const [trainees, setTrainees] = useState<Trainee[]>([]);
  const [fields, setFields] = useState<string[]>(allFields.map((f) => f.value));
  const [selectedActivities, setSelectedActivities] = useState<Activity[]>([]);
  const [type, setType] = useState<string>("all");

  // Helper function to get field value from trainee
  const getFieldValue = (trainee: Trainee, fieldValue: string): string => {
    if (fieldValue === "traineeType[name]") {
      return trainee.traineeType?.name || "//";
    }

    const value = trainee[fieldValue as keyof Trainee];

    if (value === null || value === undefined) {
      return "//";
    }

    if (typeof value === "number") {
      return fieldValue === "rating" ? value.toFixed(2) : value.toString();
    }

    if (fieldValue === "payGrade") {
      return `${value.toString()} ${
        trainee.isChangedPayGrade ? " (تم تغيير الدرجة)" : ""
      }`;
    }

    if (fieldValue === "employer") {
      return `${value.toString()} ${
        trainee.isChangedEmployer ? " (منتقل)" : ""
      }`;
    }

    if (typeof value === "string") {
      return value;
    }

    return "//";
  };

  useEffect(() => {
    const fetchTrainees = async () => {
      if (selectedActivities.length === 0) {
        setTrainees([]);
        return;
      }
      const params = new URLSearchParams();
      params.set("activityIds", selectedActivities.map((a) => a.id).join(","));
      if (type !== "all") params.set("traineeTypeId", type);
      try {
        const res = await api.get(
          `/api/v1/reports/training-activities/trainees?${params.toString()}`
        );
        setTrainees(res.data.data.trainees);
      } catch (error) {
        console.error(error);
        toast.error("تعذر تحميل التقرير");
      }
    };
    fetchTrainees();
  }, [selectedActivities, type]);

  const handleExport = () => {
    if (trainees.length === 0) {
      toast.error("لا يوجد بيانات لتصديرها");
      return;
    }
    // same values as the table / print (fixes the missing "النوع" column)
    const data = trainees.map((trainee) => {
      const traineeData: Record<string, string> = {};
      allFields
        .filter((f) => fields.includes(f.value))
        .forEach((field) => {
          let value = getFieldValue(trainee, field.value);
          if (field.value === "name") {
            const flag = noteFlagOf(trainee);
            if (flag) value = `${value} (${NOTE_FLAG_STYLES[flag].label})`;
          }
          traineeData[field.label] = value;
        });
      return traineeData;
    });

    const workbook = utils.book_new();
    const titleRow = [
      [
        selectedActivities.length > 0
          ? `تقرير المتدربين للنشاط: ${selectedActivities
              .map((a) => a.title)
              .join(" - ")}`
          : "تقرير-الأنشطة-التدريبية",
      ],
    ];
    const worksheet = utils.aoa_to_sheet(titleRow);

    worksheet["!merges"] = [
      { s: { r: 0, c: 0 }, e: { r: 0, c: fields.length - 1 } },
    ];
    utils.sheet_add_json(worksheet, data, { origin: "A2" });
    worksheet["!cols"] = fields.map(() => ({ wch: 15 }));
    worksheet["!dir"] = "rtl";
    utils.book_append_sheet(workbook, worksheet, `تقرير-المتدربين-للنشاط`);

    writeFile(workbook, `تقرير-المتدربين-للنشاط.xlsx`);
  };

  const handlePrint = () => {
    if (trainees.length === 0) {
      toast.error("لا يوجد بيانات للطباعة");
      return;
    }

    const title =
      selectedActivities.length > 0
        ? `تقرير المتدربين للنشاط: ${selectedActivities
            .map((a) => a.title)
            .join(" - ")}`
        : "تقرير الأنشطة التدريبية";

    const columns = allFields
      .filter((f) => fields.includes(f.value))
      .map((f) => ({ label: f.label, value: f.value }));

    const html = generatePrintHTML({
      title,
      columns,
      data: trainees,
      getFieldValue,
      getCellStyle: (t, field) =>
        field === "name" ? nameCellStyle(t) : undefined,
      showNoteLegend: fields.includes("name"),
      subtitleLines: [`العدد: ${trainees.length}`],
    });

    openPrintWindow(html).catch((error) => {
      console.error("Print error:", error);
      toast.error("فشل في فتح نافذة الطباعة");
    });
  };

  return (
    <div>
      <div className="flex justify-between mb-4">
        <div className="flex items-center gap-2">
          {selectedActivities.length > 0 && (
            <Button
              variant={"outline"}
              onClick={() => setSelectedActivities([])}
            >
              <RotateCcw />
            </Button>
          )}
          <ActivitiesSelector
            selectedActivities={selectedActivities}
            setSelectedActivities={setSelectedActivities}
          >
            <Button variant={"outline"}>
              {selectedActivities.length > 0
                ? `${selectedActivities.length} نشاط/أنشطة`
                : "اختر النشاط"}
            </Button>
          </ActivitiesSelector>
        </div>
        <div className="flex gap-2">
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
                        if (field.value === "all") {
                          setFields(allFields.map((f) => f.value));
                        } else {
                          setFields([...fields, field.value]);
                        }
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

              <ul className="flex flex-col gap-2"></ul>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        <div>
          <TypeFilter type={type} setType={setType} />
        </div>
        <div className="flex gap-2">
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
      <Table dir="rtl">
        <TableHeader>
          <TableRow>
            <TableHead className="text-right">ت.</TableHead>
            {allFields
              .filter((f) => fields.includes(f.value))
              .map((field) => (
                <TableHead className="text-right" key={field.value}>
                  {field.label}
                </TableHead>
              ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {trainees.length > 0 ? (
            trainees.map((trainee, index) => (
              <TableRow key={trainee.id}>
                <TableCell className="text-right">{index + 1}</TableCell>
                {allFields
                  .filter((f) => fields.includes(f.value))
                  .map((field) => (
                    <TableCell key={field.value}>
                      {field.value === "name" ? (
                        <TraineeName trainee={trainee} />
                      ) : (
                        getFieldValue(trainee, field.value)
                      )}
                    </TableCell>
                  ))}
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell
                colSpan={allFields.length + 1}
                className="text-center text-muted"
              >
                لا يوجد بيانات
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
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
