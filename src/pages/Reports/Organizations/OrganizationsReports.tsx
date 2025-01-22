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
import { Organization } from "@/types";
import axios from "axios";
import { Check, ChevronDown, CircleCheck, Download } from "lucide-react";
import { useLayoutEffect, useState } from "react";
import { utils, writeFile as writeExcelFile } from "xlsx";

type Field = {
  label: string;
  value: "name" | "hostedCount" | "executedCount" | "instructorsCount";
};

const allFields: Field[] = [
  { label: "اسم المؤسسة", value: "name" },
  { label: "عدد الأنشطة التي تم تنظيمها", value: "hostedCount" },
  { label: "عدد الأنشطة التي تم تنفيذها", value: "executedCount" },
  { label: "عدد المدربين التابعين لها", value: "instructorsCount" },
];

export default function OrganizationsReports() {
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [fields, setFields] = useState<string[]>(allFields.map((f) => f.value));
  useLayoutEffect(() => {
    const fetchOrganizations = async () => {
      try {
        const res = await axios.get("/api/v1/reports/organizations");
        setOrganizations(res.data.data.organizations);
      } catch (error) {
        console.log(error);
      }
    };
    fetchOrganizations();
  }, []);

  const handleExport = () => {
    const data = organizations.map((org) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const orgData: any = {};
      allFields
        .filter((f) => fields.includes(f.value))
        .forEach((field) => {
          orgData[field.label] = org[field.value] || "//";
        });
      return orgData;
    });
    const workbook = utils.book_new();
    const worksheet = utils.json_to_sheet(data);
    utils.book_append_sheet(workbook, worksheet, "Organizations");
    writeExcelFile(workbook, "organizations.xlsx");
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
              .filter((f) => fields.includes(f.value))
              .map((field) => (
                <TableHead className="text-center" key={field.value}>
                  {field.label}
                </TableHead>
              ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {organizations?.map((organization, index) => (
            <TableRow key={organization.id}>
              <TableCell>{index + 1}</TableCell>
              {allFields
                .filter((f) => fields.includes(f.value))
                .map((field) => (
                  <TableCell className="text-center" key={field.value}>
                    {organization[field.value] || (
                      <span className="text-gray-500">//</span>
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
