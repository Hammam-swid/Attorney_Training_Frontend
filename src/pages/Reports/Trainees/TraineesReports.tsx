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
import axios from "axios";
import {
  Check,
  ChevronDown,
  CircleCheck,
  Download,
  Loader2,
} from "lucide-react";
import { useEffect, useState } from "react";
import { utils, writeFile as writeExcelFile } from "xlsx";
import TraineesTable from "./TraineesTable";
import DatePicker from "@/components/ui/DatePicker";
import { format } from "date-fns";
import { Checkbox } from "@/components/ui/checkbox";

type Field = {
  label: string;
  value: keyof Trainee;
  // | "name"
  // | "phone"
  // | "address"
  // | "employer"
  // | "type"
  // | "activitiesCount"
  // | "payGrade";
};

const allFields: Field[] = [
  { label: "اسم المتدرب", value: "name" },
  { label: "رقم الهاتف", value: "phone" },
  { label: "العنوان", value: "address" },
  { label: "جهة العمل", value: "employer" },
  { label: "النوع", value: "type" },
  { label: "الدرجة القضائية", value: "payGrade" },
  { label: "عدد الأنشطة", value: "activityCount" },
];

export default function TraineesReports() {
  const [trainees, setTrainees] = useState<Trainee[]>([]);
  const [fields, setFields] = useState<string[]>(allFields.map((f) => f.value));
  const [type, setType] = useState<string>("all");
  const [payGrade, setPayGrade] = useState<string>("all");
  const [loading, setLoading] = useState<boolean>(false);
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
        const dateQuery =
          isDate && startDate && endDate
            ? `?startDate=${format(startDate, "yyyy-MM-dd")}&endDate=${format(
                endDate,
                "yyyy-MM-dd"
              )}`
            : "";
        const res = await axios.get(`/api/v1/reports/trainees${dateQuery}`);
        setTrainees(res.data.data.trainees);
      } catch (error) {
        console.log(error);
      } finally {
        setLoading(false);
      }
    };
    fetchTrainees();
  }, [dateFilter, isDate]);

  const handleExport = () => {
    const data = trainees.map((trainee) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const traineeData: any = {};
      allFields
        .filter((f) => fields.includes(f.value))
        .forEach((field) => {
          traineeData[field.label] =
            trainee[field.value as keyof Trainee] ?? "لا يوجد بيانات";
        });
      return traineeData;
    });
    const workbook = utils.book_new();
    const worksheet = utils.json_to_sheet(data);
    utils.book_append_sheet(workbook, worksheet, "Trainees");
    writeExcelFile(workbook, "trainees.xlsx");
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
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
          {type === "عضو نيابة" && (
            <PayGradeFilter payGrade={payGrade} setPayGrade={setPayGrade} />
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

        <Button onClick={handleExport}>
          <span>تصدير</span>
          <Download />
        </Button>
      </div>
      {loading ? (
        <Loader2 className="animate-spin" />
      ) : (
        <TraineesTable
          trainees={trainees}
          fields={fields}
          type={type}
          payGrade={payGrade}
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
  return (
    <Select value={type} onValueChange={setType}>
      <SelectTrigger dir="rtl" className="w-32">
        <SelectValue placeholder="النوع" />
      </SelectTrigger>
      <SelectContent dir="rtl" className="z-50 bg-background w-32">
        <SelectGroup>
          <SelectLabel>النوع</SelectLabel>
          <SelectItem value="all">الكل</SelectItem>
          {["موظف", "ضابط", "عضو نيابة", "أخرى"].map((type) => (
            <SelectItem key={type} value={type}>
              {type}
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
  "معاون نيابة",
  "أخرى",
];
function PayGradeFilter({ payGrade, setPayGrade }: PayGradeFilterProps) {
  return (
    <Select value={payGrade} onValueChange={setPayGrade}>
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
