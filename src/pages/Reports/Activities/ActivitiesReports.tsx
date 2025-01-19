import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
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
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
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
import { useAppSelector } from "@/store/hooks";
import { Activity } from "@/types";
import axios from "axios";
import { format } from "date-fns";
import {
  CalendarIcon,
  Check,
  ChevronDown,
  CircleCheck,
  Download,
} from "lucide-react";
import { useLayoutEffect, useState } from "react";
import { utils, writeFile as writeExcelFile } from "xlsx";

const allFields = [
  { label: "العنوان", value: "title" },
  { label: "عدد الساعات", value: "hours" },
  { label: "مكان الانعقاد", value: "location" },
  { label: "الحالة", value: "status" },
  { label: "النوع", value: "type" },
  { label: "تاريخ البداية", value: "startDate" },
  { label: "تاريخ النهاية", value: "endDate" },
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
  "executor",
  "host",
  "instructors",
  "instructorRatings",
  "trainees",
  "rating",
];

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
        const res = await axios.get(
          `/api/v1/reports/training-activities?fields=${fields.join(
            ","
          )}&startDate=${
            dateFilter.startDate
              ? format(dateFilter.startDate, "yyyy-MM-dd")
              : ""
          }&endDate=${
            dateFilter.endDate ? format(dateFilter.endDate, "yyyy-MM-dd") : ""
          }&typeId=${selectedType !== "all" ? selectedType : ""}`
        );
        setActivities(res.data.data.activities);
      } catch (error) {
        console.log(error);
      }
    };
    fetchActivities();
  }, [fields, dateFilter, selectedType]);

  const handleExport = () => {
    const workbook = utils.book_new();

    // Add title row
    const titleRow = [
      [
        `تقرير-الأنشطة-التدريبية-من-${format(
          dateFilter.startDate,
          "yyy-MM-dd"
        )}-إلى-${format(dateFilter.endDate, "yyyy-MM-dd")}`,
      ],
    ];
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
          case "trainees":
            data["عدد المتدربين"] = activity.traineesCount || "//";
            break;
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
      `تقرير-الأنشطة-التدريبية-من-${format(
        dateFilter.startDate,
        "yyy-MM-dd"
      )}-إلى-${format(dateFilter.endDate, "yyyy-MM-dd")}.xlsx`
    );
  };
  console.log(activities);
  return (
    <div>
      <div className="flex justify-between mb-4">
        <div className="flex items-center gap-2">
          <Button
            variant={"secondary"}
            onClick={() => setFields(initialFields)}
          >
            تحديد الكل
            {fields.length === allFields.length && <CircleCheck className="text-green-500" />}
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
        <Select value={selectedType} onValueChange={setSelectedType}>
          <SelectTrigger dir="rtl" className="w-[180px]">
            <SelectValue dir="rtl" />
          </SelectTrigger>
          <SelectContent dir="rtl">
            <SelectGroup>
              <SelectLabel>الأنواع</SelectLabel>
              <SelectItem value="all">الكل</SelectItem>
              {activityTypes.map((type) => (
                <SelectItem value={type.id.toString()}>{type.name}</SelectItem>
              ))}
            </SelectGroup>
          </SelectContent>
        </Select>
        <div className="flex items-center gap-2">
          <Label>من: </Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline">
                <CalendarIcon className="mr-2 h-4 w-4" />
                {dateFilter.startDate
                  ? format(dateFilter.startDate, "yyyy-MM-dd")
                  : "تاريخ البداية"}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={dateFilter.startDate}
                onSelect={(date) => {
                  setDateFilter({
                    ...dateFilter,
                    startDate: date,
                  });
                }}
                initialFocus
              />
            </PopoverContent>
          </Popover>
          <Label>إلى: </Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline">
                <CalendarIcon className="mr-2 h-4 w-4" />
                {dateFilter.endDate
                  ? format(dateFilter.endDate, "yyyy-MM-dd")
                  : "تاريخ النهاية"}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={dateFilter.endDate}
                onSelect={(date) => {
                  setDateFilter({
                    ...dateFilter,
                    endDate: date,
                  });
                }}
                initialFocus
              />
            </PopoverContent>
          </Popover>
        </div>
        <Button onClick={handleExport}>
          <span>تصدير</span>
          <Download />
        </Button>
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
                              لا يوجد تقييم
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
                              لا يوجد مدربين
                            </span>
                          )
                        : field.value === "instructorRatings"
                        ? activity.instructors
                            ?.map((instructor) => instructor.rating)
                            ?.join(", ") || (
                            <span className="text-gray-400 dark:text-gray-600">
                              لا يوجد تقييمات
                            </span>
                          )
                        : field.value === "trainees"
                        ? activity?.traineesCount || (
                            <span className="text-gray-400 dark:text-gray-600">
                              لا يوجد متدربين
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
