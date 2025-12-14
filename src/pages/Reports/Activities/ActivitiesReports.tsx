import { Button } from "@/components/ui/button";
import DatePicker from "@/components/ui/DatePicker";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import api from "@/lib/api";
import { getDifferenceDays } from "@/lib/getDifferenceDays";
// import { generatePrintHTML, openPrintWindow } from "@/lib/printUtils";
import { useAppSelector } from "@/store/hooks";
import { Activity } from "@/types";
import { format } from "date-fns";
import {
  Check,
  ChevronDown,
  CircleCheck,
  Download,
  Printer,
} from "lucide-react";
import { useLayoutEffect, useState } from "react";
import toast from "react-hot-toast";
import { utils, writeFile as writeExcelFile } from "xlsx";

const allFields = [
  { label: "العنوان", value: "title" },
  { label: "عدد الساعات", value: "hours" },
  { label: "مكان الانعقاد", value: "location" },
  { label: "الحالة", value: "status" },
  { label: "النوع", value: "type" },
  { label: "تاريخ البداية", value: "startDate" },
  { label: "تاريخ النهاية", value: "endDate" },
  { label: "عدد الأيام", value: "daysCount" },
  { label: "الجهة المنفذة", value: "executor" },
  { label: "الجهة المنظمة", value: "host" },
  { label: "المدربون", value: "instructors" },
  { label: "تقييم المدربين", value: "instructorRatings" },
  { label: "عدد المتدربين", value: "trainees" },
  { label: "تقييم النشاط", value: "rating" },
];

const initialFields = [
  "title",
  "hours",
  "location",
  "status",
  "type",
  "startDate",
  "endDate",
  "daysCount",
  "executor",
  "host",
  "instructors",
  "instructorRatings",
  "trainees",
  "rating",
];

// Helper function to get field value for display
const getFieldValue = (
  activity: Activity,
  fieldValue: string
): React.ReactNode => {
  const emptyPlaceholder = (text: string) => (
    <span className="text-gray-400 dark:text-gray-600">{text}</span>
  );

  switch (fieldValue) {
    case "title":
      return activity.title;
    case "hours":
      return activity.hours ? `${activity.hours} ساعة` : null;
    case "location":
      return activity.location;
    case "status":
      return activity.status;
    case "type":
      return activity.type?.name;
    case "executor":
      return activity.executor?.name;
    case "host":
      return activity.host?.name;
    case "startDate":
      return activity.startDate
        ? format(new Date(activity.startDate), "dd-MM-yyyy")
        : null;
    case "endDate":
      return activity.endDate
        ? format(new Date(activity.endDate), "dd-MM-yyyy")
        : null;
    case "daysCount":
      return getDifferenceDays(
        new Date(activity.startDate),
        new Date(activity.endDate)
      );
    case "rating":
      return activity.rating || emptyPlaceholder("لا يوجد تقييم");
    case "instructors":
      return (
        activity.instructors
          ?.map((instructor) => instructor.name)
          ?.join(", ") || emptyPlaceholder("لا يوجد مدربين")
      );
    case "instructorRatings":
      return (
        activity.instructors
          ?.map((instructor) => instructor.rating)
          ?.join(", ") || emptyPlaceholder("لا يوجد تقييمات")
      );
    case "trainees":
      return activity.traineesCount || emptyPlaceholder("لا يوجد متدربين");
    default:
      return null;
  }
};

// Helper function to get field value for Excel export
const getExportFieldValue = (activity: Activity, field: string): string => {
  switch (field) {
    case "title":
      return activity.title || "//";
    case "hours":
      return activity.hours?.toString() || "//";
    case "location":
      return activity.location || "//";
    case "status":
      return activity.status || "//";
    case "type":
      return activity.type?.name || "//";
    case "executor":
      return activity.executor?.name || "//";
    case "host":
      return activity.host?.name || "//";
    case "instructors":
      return (
        activity.instructors
          ?.map((instructor) => instructor.name)
          ?.join(", ") || "//"
      );
    case "trainees":
      return activity.traineesCount?.toString() || "//";
    case "startDate":
      return activity.startDate
        ? format(new Date(activity.startDate), "dd-MM-yyyy")
        : "//";
    case "endDate":
      return activity.endDate
        ? format(new Date(activity.endDate), "dd-MM-yyyy")
        : "//";
    case "daysCount":
      return (
        String(
          getDifferenceDays(
            new Date(activity.startDate),
            new Date(activity.endDate)
          )
        ) || "-"
      );
    case "rating":
      return activity.rating?.toString() || "//";
    case "instructorRatings":
      return (
        activity.instructors
          ?.map((instructor) => instructor.rating)
          ?.join(", ") || "//"
      );
    default:
      return "//";
  }
};

// Helper function to get field label
const getFieldLabel = (fieldValue: string): string => {
  return allFields.find((f) => f.value === fieldValue)?.label || "";
};

export default function ActivitiesReports() {
  const [activities, setActivities] = useState<Activity[]>([]);
  const activityTypes = useAppSelector((state) => state.ui.activityTypes);
  const [selectedType, setSelectedType] = useState<string>("all");
  const [fields, setFields] = useState<string[]>(initialFields);
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
    const fetchActivities = async () => {
      try {
        const res = await api.get(
          `/api/v1/reports/training-activities?fields=${fields
            .filter((field) => field !== "daysCount")
            .join(",")}&startDate=${
            dateFilter.startDate
              ? format(dateFilter.startDate, "yyyy-MM-dd")
              : ""
          }&endDate=${
            dateFilter.endDate ? format(dateFilter.endDate, "yyyy-MM-dd") : ""
          }&typeId=${selectedType !== "all" ? selectedType : ""}`
        );
        setActivities(res.data.data.activities);
      } catch (error) {
        console.error("Error fetching activities:", error);
        toast.error("حدث خطأ أثناء جلب البيانات");
      }
    };
    fetchActivities();
  }, [fields, dateFilter, selectedType]);

  const handlePrint = () => {
    if (activities.length === 0) {
      toast.error("لا يوجد بيانات للطباعة");
      return;
    }

    // Create a print-friendly window
    const printWindow = window.open("", "_blank");
    if (!printWindow) {
      toast.error("تعذر فتح نافذة الطباعة");
      return;
    }

    const reportTitle =
      dateFilter.startDate && dateFilter.endDate
        ? `تقرير الأنشطة التدريبية من ${format(
            dateFilter.startDate,
            "dd-MM-yyyy"
          )} إلى ${format(dateFilter.endDate, "dd-MM-yyyy")}`
        : "تقرير الأنشطة التدريبية";

    // Generate table HTML
    const tableHTML = `
      <!DOCTYPE html>
      <html dir="rtl" lang="ar">
        <head>
          <meta charset="UTF-8">
          <title>${reportTitle}</title>
          <style>
            body {
              font-family: 'Arial', sans-serif;
              direction: rtl;
              padding: 20px;
            }
            h1 {
              text-align: center;
              margin-bottom: 30px;
              color: #333;
            }
            table {
              width: 100%;
              border-collapse: collapse;
              margin-top: 20px;
            }
            th, td {
              border: 1px solid #ddd;
              padding: 12px 8px;
              text-align: center;
            }
            th {
              background-color: #f5f5f5;
              font-weight: bold;
              color: #333;
            }
            tr:nth-child(even) {
              background-color: #f9f9f9;
            }
            @media print {
              body {
                padding: 10px;
              }
              h1 {
                font-size: 18px;
                margin-bottom: 15px;
              }
              table {
                font-size: 12px;
              }
              th, td {
                padding: 6px 4px;
              }
            }
            .empty-value {
              color: #999;
              font-style: italic;
            }
          </style>
        </head>
        <body>
          <h1>${reportTitle}</h1>
          <table>
            <thead>
              <tr>
                <th>ت.</th>
                ${fields
                  .map((field) => `<th>${getFieldLabel(field)}</th>`)
                  .join("")}
              </tr>
            </thead>
            <tbody>
              ${activities
                .map(
                  (activity, index) => `
                <tr>
                  <td>${index + 1}</td>
                  ${fields
                    .map((field) => {
                      const value = getExportFieldValue(activity, field);
                      return `<td>${
                        value === "//"
                          ? '<span class="empty-value">-</span>'
                          : value
                      }</td>`;
                    })
                    .join("")}
                </tr>
              `
                )
                .join("")}
            </tbody>
          </table>
        </body>
      </html>
    `;

    printWindow.document.write(tableHTML);
    printWindow.document.close();

    // Wait for content to load then print
    printWindow.onload = () => {
      printWindow.print();
    };
  };

  const handleExport = () => {
    if (activities.length === 0) {
      toast.error("لا يوجد بيانات لتصديرها");
      return;
    }

    try {
      const workbook = utils.book_new();

      // Create title text
      const titleText =
        dateFilter.startDate && dateFilter.endDate
          ? `تقرير الأنشطة التدريبية من ${format(
              dateFilter.startDate,
              "dd-MM-yyyy"
            )} إلى ${format(dateFilter.endDate, "dd-MM-yyyy")}`
          : "تقرير الأنشطة التدريبية";

      // Add title row
      const titleRow = [[titleText]];
      const worksheet = utils.aoa_to_sheet(titleRow);

      // Merge cells for title based on selected fields length
      worksheet["!merges"] = [
        { s: { r: 0, c: 0 }, e: { r: 0, c: fields.length - 1 } },
      ];

      // Create dynamic data mapping based on selected fields
      const exportData = activities.map((activity) => {
        const data: Record<string, string> = {};
        fields.forEach((field) => {
          const label = getFieldLabel(field);
          data[label] = getExportFieldValue(activity, field);
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
              bold: R <= 1, // Bold for header row and title
              sz: R === 0 ? 14 : 12,
            },
          };
        }
      }

      // Set column widths based on content
      worksheet["!cols"] = fields.map(() => ({ wch: 20 }));
      worksheet["!dir"] = "rtl";

      utils.book_append_sheet(workbook, worksheet, "Activities");

      // Generate filename
      const filename =
        dateFilter.startDate && dateFilter.endDate
          ? `تقرير-الأنشطة-التدريبية-من-${format(
              dateFilter.startDate,
              "yyyy-MM-dd"
            )}-إلى-${format(dateFilter.endDate, "yyyy-MM-dd")}.xlsx`
          : "تقرير-الأنشطة-التدريبية.xlsx";

      writeExcelFile(workbook, filename);
      toast.success("تم تصدير التقرير بنجاح");
    } catch (error) {
      console.error("Error exporting to Excel:", error);
      toast.error("حدث خطأ أثناء تصدير التقرير");
    }
  };

  return (
    <div>
      <div className="flex justify-between mb-4">
        <div className="flex items-center gap-2">
          <Button
            variant={"secondary"}
            onClick={() => setFields(initialFields)}
          >
            تحديد الكل
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
        <Select dir="rtl" value={selectedType} onValueChange={setSelectedType}>
          <SelectTrigger dir="rtl" className="w-[180px]">
            <SelectValue dir="rtl" />
          </SelectTrigger>
          <SelectContent dir="rtl">
            <SelectGroup>
              <SelectLabel>الأنواع</SelectLabel>
              <SelectItem value="all">الكل</SelectItem>
              {activityTypes.map((type) => (
                <SelectItem key={type.id} value={type.id.toString()}>
                  {type.name}
                </SelectItem>
              ))}
            </SelectGroup>
          </SelectContent>
        </Select>
        <div className="flex items-center gap-2">
          <Label>من: </Label>
          <DatePicker
            title="من"
            date={dateFilter.startDate}
            setDate={(date) => {
              setDateFilter({
                ...dateFilter,
                startDate: date,
              });
            }}
          />
          <Label>إلى: </Label>
          <DatePicker
            title="إلى"
            date={dateFilter.endDate}
            setDate={(date) => {
              setDateFilter({
                ...dateFilter,
                endDate: date,
              });
            }}
          />
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
      <Table>
        <TableHeader>
          <TableRow>
            <TableCell>ت.</TableCell>
            {allFields
              .filter((field) => fields.includes(field.value))
              .map((field) => (
                <TableCell key={field.value}>{field.label}</TableCell>
              ))}
          </TableRow>
        </TableHeader>
        <TableBody key={activities?.length}>
          {activities.length > 0 ? (
            activities.map((activity, index) => (
              <TableRow key={activity.id}>
                <TableCell>{index + 1}</TableCell>
                {allFields
                  ?.filter((field) => fields.includes(field.value))
                  ?.map((field) => (
                    <TableCell key={field.value}>
                      {getFieldValue(activity, field.value)}
                    </TableCell>
                  ))}
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell
                className="text-center text-gray-400 dark:text-gray-600"
                colSpan={allFields.length + 1}
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
