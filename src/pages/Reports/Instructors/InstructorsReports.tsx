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
import axios from "axios";
import { Check, ChevronDown, CircleCheck, Download } from "lucide-react";
import { useLayoutEffect, useState } from "react";
import { utils, writeFile as writeExcelFile } from "xlsx";

type Instructor = {
  id: number;
  name: string;
  phone: string;
  averageRating: number | null;
  activityCount: number;
};

type Field = {
  label: string;
  value: "name" | "phone" | "averageRating" | "activityCount";
};

const allFields: Field[] = [
  { label: "اسم المدرب", value: "name" },
  { label: "رقم الهاتف", value: "phone" },
  { label: "متوسط التقييم", value: "averageRating" },
  { label: "عدد الأنشطة", value: "activityCount" },
];

export default function InstructorsReports() {
  const [instructors, setInstructors] = useState<Instructor[]>([]);
  const [fields, setFields] = useState<string[]>(allFields.map((f) => f.value));

  useLayoutEffect(() => {
    const fetchInstructors = async () => {
      try {
        const res = await axios.get("/api/v1/reports/instructors");
        setInstructors(res.data.data.instructors);
      } catch (error) {
        console.log(error);
      }
    };
    fetchInstructors();
  }, []);

  const handleExport = () => {
    const data = instructors.map((instructor) => {
      const instructorData: any = {};
      allFields
        .filter((f) => fields.includes(f.value))
        .forEach((field) => {
          instructorData[field.label] =
            instructor[field.value] ?? "لا يوجد بيانات";
        });
      return instructorData;
    });
    const workbook = utils.book_new();
    const worksheet = utils.json_to_sheet(data);
    utils.book_append_sheet(workbook, worksheet, "Instructors");
    writeExcelFile(workbook, "instructors.xlsx");
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
                    {instructor[field.value] ?? (
                      <span className="text-gray-500">لا يوجد بيانات</span>
                    )}
                  </TableCell>
                ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
