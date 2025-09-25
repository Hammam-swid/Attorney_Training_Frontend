import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import api from "@/lib/api";
import { Trainee } from "@/types";
import { Check, ChevronDown, CircleCheck, Download } from "lucide-react";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { utils, writeFile } from "xlsx";

const allFields = [
  { label: "الاسم", value: "name" },
  { label: "الهاتف", value: "phone" },
  { label: "العنوان", value: "address" },
  { label: "جهة العمل", value: "employer" },
  { label: "النوع", value: "type" },
  { label: "الدرجة القضائية", value: "payGrade" },
  { label: "التقييم", value: "rating" },
];

export default function OneActivity() {
  const [search, setSearch] = useState("");
  const [trainees, setTrainees] = useState<Trainee[]>([]);
  const [fields, setFields] = useState<string[]>(allFields.map((f) => f.value));
  useEffect(() => {
    const fetchTrainees = async () => {
      const res = await api.get(
        `/api/v1/reports/training-activities/trainees${
          search ? `?activityName=${search}` : ""
        }`
      );
      console.log(res);
      setTrainees(res.data.data.trainees);
    };
    fetchTrainees();
  }, [search]);

  const handleExport = () => {
    if (trainees.length === 0) {
      toast.error("لا يوجد بيانات لتصديرها");
      return;
    }
    const data = trainees.map((trainee) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const traineeData: any = {};
      fields.forEach((field) => {
        switch (field) {
          case "type":
            traineeData["النوع"] = trainee.type || "//";
            break;
          case "payGrade":
            traineeData["الدرجة القضائية"] = trainee.payGrade || "//";
            break;
          case "rating":
            traineeData["التقييم"] = trainee.rating
              ? trainee.rating.toFixed(2)
              : "//";
            break;
          case "name":
            traineeData["الاسم"] = trainee.name || "//";
            break;
          case "phone":
            traineeData["الهاتف"] = trainee.phone || "//";
            break;
          case "address":
            traineeData["العنوان"] = trainee.address || "//";
            break;
          case "employer":
            traineeData["جهة العمل"] = trainee.employer || "//";
            break;

          default:
            break;
        }
      });
      return traineeData;
    });

    const workbook = utils.book_new();
    const titleRow = [
      [search ? `تقرير-المتدربين-للنشاط-${search}` : "تقرير-الأنشطة-التدريبية"],
    ];
    const worksheet = utils.aoa_to_sheet(titleRow);

    worksheet["!merges"] = [
      { s: { r: 0, c: 0 }, e: { r: 0, c: fields.length - 1 } },
    ];
    utils.sheet_add_json(worksheet, data, { origin: "A2" });
    worksheet["!cols"] = fields.map(() => ({ wch: 15 }));
    worksheet["!dir"] = "rtl";
    utils.book_append_sheet(
      workbook,
      worksheet,
      `تقرير-المتدربين-للنشاط-${search}`
    );

    writeFile(workbook, `تقرير-المتدربين-للنشاط-${search}.xlsx`);
  };

  return (
    <div>
      <div className="flex justify-between mb-4">
        <Input
          placeholder="اكتب اسم النشاط"
          className="w-[300px]"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
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
        <Button onClick={handleExport}>
          <span>تصدير</span>
          <Download />
        </Button>
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
                      {trainee[field.value as keyof Trainee]}
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
