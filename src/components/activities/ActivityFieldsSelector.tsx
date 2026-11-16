import { Check } from "lucide-react";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../ui/dialog";

interface Props {
  fields: string[];
  allFields: {
    label: string;
    value: string;
  }[];
  setFields: (fields: string[]) => void;
}

/** column chooser of the reports: a modal of clickable badges */
export default function ActivityFieldsSelector({
  fields,
  allFields,
  setFields,
}: Props) {
  const selectedCount = allFields.filter((f) => fields.includes(f.value)).length;
  const allSelected = selectedCount === allFields.length;

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant={"outline"}>
          تحديد الحقول
          <span className="text-muted-foreground text-xs">
            ({allSelected ? "الكل" : `${selectedCount} من ${allFields.length}`})
          </span>
        </Button>
      </DialogTrigger>
      <DialogContent dir="rtl">
        <DialogHeader>
          <DialogTitle>اختيار الحقول</DialogTitle>
        </DialogHeader>
        <div className="flex gap-3 flex-wrap">
          {allFields.map((field) => (
            <Badge
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
              variant={fields.includes(field.value) ? "default" : "secondary"}
              className="flex items-center justify-between gap-1 cursor-pointer select-none"
            >
              {field.label}
              {fields.includes(field.value) && (
                <Check className="ml-auto h-4 w-4" />
              )}
            </Badge>
          ))}
        </div>
        <DialogFooter className="flex items-center gap-2 sm:justify-start">
          <Button
            variant={"outline"}
            onClick={() => {
              setFields(allFields.map((f) => f.value));
            }}
            disabled={allSelected}
          >
            تحديد الكل
          </Button>
          <Button
            variant={"outline"}
            onClick={() => setFields([])}
            disabled={selectedCount === 0}
          >
            إلغاء الكل
          </Button>
          <div className="text-muted-foreground text-sm">
            {allSelected
              ? "تم تحديد كل الحقول"
              : selectedCount === 0
                ? "لم يتم تحديد أي حقل"
                : `تم تحديد ${selectedCount} من ${allFields.length} حقول`}
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
