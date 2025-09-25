import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import DatePicker from "@/components/ui/DatePicker";
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
import { Instructor } from "@/types";
import { format } from "date-fns";
import { Check, ChevronDown, CircleCheck, Download } from "lucide-react";
import { useLayoutEffect, useState } from "react";
import { utils, writeFile as writeExcelFile } from "xlsx";

type Field = {
  label: string;
  value:
    | "name"
    | "phone"
    | "avgRating"
    | "activityCount"
    | "organization"
    | "hours";
};

const allFields: Field[] = [
  { label: "اسم المدرب", value: "name" },
  { label: "رقم الهاتف", value: "phone" },
  { label: "متوسط التقييم", value: "avgRating" },
  { label: "عدد الأنشطة", value: "activityCount" },
  { label: "عدد الساعات", value: "hours" },
  { label: "المؤسسة التابع لها", value: "organization" },
];

export default function InstructorsReports() {
  const [instructors, setInstructors] = useState<Instructor[]>([]);
  const [fields, setFields] = useState<string[]>(allFields.map((f) => f.value));

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

  useLayoutEffect(() => {
    const fetchInstructors = async () => {
      try {
        const startDate = dateFilter.startDate;
        const endDate = dateFilter.endDate;
        const dateQuery =
          isDate && startDate && endDate
            ? `?startDate=${format(startDate, "yyyy-MM-dd")}&endDate=${format(
                endDate,
                "yyyy-MM-dd"
              )}`
            : "";
        const res = await api.get(`/api/v1/reports/instructors${dateQuery}`);
        console.log(res);
        setInstructors(
          res.data.data.instructors.map((instructor: Instructor) => {
            return {
              ...instructor,
              // hours: res.data.data.summary?.totalHours,
              // activityCount: res.data.data.summary?.totalActivities,
            };
          })
        );
        console.log(res.data.data);
        console.log(res.data.data.instructors);
      } catch (error) {
        console.log(error);
      }
    };
    fetchInstructors();
  }, [isDate, dateFilter]);

  const handleExport = () => {
    const data = instructors.map((instructor) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const instructorData: any = {};
      allFields
        .filter((f) => fields.includes(f.value))
        .forEach((field) => {
          instructorData[field.label] =
            field.value === "name"
              ? instructor.name || "//"
              : field.value === "activityCount"
              ? instructor.activityCount || "//"
              : field.value === "organization"
              ? instructor.organization?.name || "//"
              : field.value === "phone"
              ? instructor.phone || "//"
              : field.value === "avgRating"
              ? instructor.avgRating || "//"
              : field.value === "hours"
              ? instructor.hours || "//"
              : "";
        });
      return instructorData;
    });
    const workbook = utils.book_new();
    const titleRow = [["تقرير-المدربين"]];

    const worksheet = utils.aoa_to_sheet(titleRow);
    worksheet["!merges"] = [
      { s: { r: 0, c: 0 }, e: { r: 0, c: fields.length - 1 } },
    ];

    utils.sheet_add_json(worksheet, data, { origin: "A2" });
    worksheet["!cols"] = fields.map(() => ({ wch: 15 }));
    utils.book_append_sheet(workbook, worksheet, "تقرير-المدربين");
    writeExcelFile(workbook, "تقرير-المدربين.xlsx");
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
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="text-right">ت.</TableHead>
            {allFields
              .filter((f) => fields.includes(f.value))
              .map((field) => (
                <TableHead className="text-center" key={field.value}>
                  {field.label}
                </TableHead>
              ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {instructors?.map((instructor, index) => (
            <TableRow key={instructor.id}>
              <TableCell>{index + 1}</TableCell>
              {allFields
                .filter((f) => fields.includes(f.value))
                .map((field) => (
                  <TableCell className="text-center" key={field.value}>
                    {field.value === "name"
                      ? instructor.name || (
                          <span className="text-gray-500">//</span>
                        )
                      : field.value === "activityCount"
                      ? instructor.activityCount || (
                          <span className="text-gray-500">//</span>
                        )
                      : field.value === "organization"
                      ? instructor.organization?.name || (
                          <span className="text-gray-500">//</span>
                        )
                      : field.value === "phone"
                      ? instructor.phone || (
                          <span className="text-gray-500">//</span>
                        )
                      : field.value === "avgRating"
                      ? instructor.avgRating || (
                          <span className="text-gray-500">//</span>
                        )
                      : field.value === "hours"
                      ? instructor.hours || (
                          <span className="text-gray-500">//</span>
                        )
                      : ""}
                  </TableCell>
                ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
