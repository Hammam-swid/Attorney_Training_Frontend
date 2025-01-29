import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
import { Check, ChevronDown, CircleCheck, Download } from "lucide-react";
import { Activity } from "@/types";
import { useLayoutEffect, useState } from "react";
import { utils, writeFile as writeExcelFile } from "xlsx";
import toast from "react-hot-toast";

const allFields = [
  { label: "العنوان", value: "title" },
  { label: "عدد الساعات", value: "hours" },
  { label: "مكان الانعقاد", value: "location" },
  { label: "الحالة", value: "status" },
  { label: "النوع", value: "type" },
  { label: "تاريخ البداية", value: "startDate" },
  { label: "تاريخ النهاية", value: "endDate" },
  { label: "الجهة المنظمة", value: "host" },
  { label: "الجهة المنفذة", value: "executor" },
  { label: "المدربون", value: "instructors" },
  { label: "تقييم المدربين", value: "instructorRatings" },
  // { label: "عدد المتدربين", value: "trainees" },
  { label: "تقييم النشاط", value: "rating" },
  { label: "تقييم المتدرب", value: "traineeRating" },
];

export default function TraineeActivity() {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [search, setSearch] = useState<string>("");
  const [fields, setFields] = useState<string[]>(allFields.map((f) => f.value));

  useLayoutEffect(() => {
    const fetchTrainees = async () => {
      try {
        const response = await fetch(
          `/api/v1/reports/trainees/training-activities${
            search ? `?search=${search}` : ""
          }`
        );
        const data = await response.json();
        setActivities(data.data.activities);
      } catch (error) {
        console.error(error);
      }
    };
    fetchTrainees();
  }, [search]);
  const handleExport = () => {
    if (activities.length === 0) {
      toast.error("لا يوجد بيانات لتصديرها");
      return;
    }
    const workbook = utils.book_new();

    // Add title row
    const titleRow = [[`تقرير-الأنشطة-التدريبية-الخاصة-بالمتدرب-${search}`]];
    const worksheet = utils.aoa_to_sheet(titleRow);

    // Merge cells for title based on selected fields length
    worksheet["!merges"] = [
      { s: { r: 0, c: 0 }, e: { r: 0, c: fields.length - 1 } },
    ];

    // Create dynamic data mapping based on selected fields
    const exportData = activities.map((activity) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const data: any = {};
      fields.forEach((field) => {
        switch (field) {
          case "title":
            data["العنوان"] = activity.title || "//";
            break;
          case "hours":
            data["عدد الساعات"] = activity.hours || "//";
            break;
          case "location":
            data["مكان الانعقاد"] = activity.location || "//";
            break;
          case "status":
            data["الحالة"] = activity.status || "//";
            break;
          case "type":
            data["النوع"] = activity.type?.name || "//";
            break;
          case "executor":
            data["الجهة المنفذة"] = activity.executor?.name || "//";
            break;
          case "host":
            data["الجهة المنظمة"] = activity.host?.name || "//";
            break;
          case "instructors":
            data["المدربون"] =
              activity?.instructors
                ?.map((instructor) => instructor?.name)
                ?.join(", ") || "//";
            break;
          // case "trainees":
          //   data["عدد المتدربين"] = activity.traineesCount || "//";
          //   break;
          case "startDate":
            data["تاريخ البداية"] = activity.startDate
              ? new Date(activity.startDate).toLocaleDateString()
              : "//";
            break;
          case "endDate":
            data["تاريخ النهاية"] = activity.endDate
              ? new Date(activity.endDate).toLocaleDateString()
              : "//";
            break;
          case "rating":
            data["تقييم النشاط"] = activity.rating || "//";
            break;
          case "instructorRatings":
            data["تقييم المدربين"] =
              activity.instructors
                ?.map((instructor) => instructor.rating)
                ?.join(", ") || "//";
            break;
          case "traineeRating":
            data["تقييم المتدرب"] =
              activity?.activityTrainees
                ?.filter((at) =>
                  new RegExp(search as string).test(at?.trainee?.name)
                )
                .map((at) => at.rating)
                .join("") || "//";
            break;
        }
      });
      return data;
    });

    // Add data starting from row 2
    utils.sheet_add_json(worksheet, exportData, { origin: "A2" });

    // Style all cells to be centered
    const range = utils.decode_range(worksheet["!ref"] || "A1");
    for (let R = range.s.r; R <= range.e.r; ++R) {
      for (let C = range.s.c; C <= range.e.c; ++C) {
        const cell_address = utils.encode_cell({ r: R, c: C });
        if (!worksheet[cell_address]) continue;

        worksheet[cell_address].s = {
          alignment: { horizontal: "center", vertical: "center" },
          font: {
            // Bold for header row and title
            bold: R <= 1,
            sz: R === 0 ? 14 : 12,
          },
        };
      }
    }

    // Other existing code...
    worksheet["!cols"] = fields.map(() => ({ wch: 15 }));
    worksheet["!dir"] = "rtl";

    utils.book_append_sheet(workbook, worksheet, "Activities");
    writeExcelFile(
      workbook,
      `تقرير-الأنشطة-التدريبية-الخاصة-بالمتدرب-${search}.xlsx`
    );
  };
  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <Input
          placeholder="ابحث عن متدرب"
          className="w-[250px]"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
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

              <ul className="flex flex-col gap-2"></ul>
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
              .filter((field) => fields.includes(field.value))
              .map((field) => (
                <TableHead key={field.value}>{field.label}</TableHead>
              ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {activities.length > 0 ? (
            activities.map((activity, index) => (
              <TableRow key={activity.id}>
                <TableCell className="text-right">{index + 1}</TableCell>
                {allFields
                  ?.filter((field) => fields.includes(field.value))
                  ?.map((field) => (
                    <TableCell key={field.value}>
                      {field.value === "title"
                        ? activity[field.value]
                        : field.value === "hours"
                        ? activity[field.value] + " ساعة"
                        : field.value === "location"
                        ? activity[field.value]
                        : field.value === "status"
                        ? activity[field.value]
                        : field.value === "startDate"
                        ? new Date(activity[field.value]).toLocaleDateString()
                        : field.value === "endDate"
                        ? new Date(activity[field.value]).toLocaleDateString()
                        : field.value === "type"
                        ? activity?.type?.name
                        : field.value === "rating"
                        ? activity?.rating || (
                            <span className="text-gray-400 dark:text-gray-600">
                              //
                            </span>
                          )
                        : field.value === "executor"
                        ? activity?.executor?.name
                        : field.value === "host"
                        ? activity?.host?.name
                        : field.value === "instructors"
                        ? activity?.instructors
                            ?.map((instructor) => instructor.name)
                            ?.join(", ") || (
                            <span className="text-gray-400 dark:text-gray-600">
                              //
                            </span>
                          )
                        : field.value === "instructorRatings"
                        ? activity.instructors
                            ?.map((instructor) => instructor.rating)
                            ?.join(", ") || (
                            <span className="text-gray-400 dark:text-gray-600">
                              //
                            </span>
                          )
                        : // : field.value === "trainees"
                        // ? activity?.traineesCount || (
                        //     <span className="text-gray-400 dark:text-gray-600">
                        //       //
                        //     </span>
                        //   )
                        field.value === "traineeRating"
                        ? activity?.activityTrainees
                            ?.filter((at) =>
                              new RegExp(search as string).test(
                                at?.trainee?.name
                              )
                            )
                            .map((at) => at.rating)
                            .join("") || (
                            <span className="text-gray-400 dark:text-gray-600">
                              //
                            </span>
                          )
                        : null}
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
                لا يوجد نشاطات
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}
