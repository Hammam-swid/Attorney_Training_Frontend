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
export default function ActivityFieldsSelector({
  fields,
  allFields,
  setFields,
}: Props) {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant={"outline"}>تحديد الحقول</Button>
      </DialogTrigger>
      <DialogContent>
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
              className="flex items-center justify-between"
            >
              {field.label}
              {fields.includes(field.value) && (
                <Check className="ml-auto h-4 w-4" />
              )}
            </Badge>
          ))}
        </div>
        <DialogFooter className="flex items-center gap-2">
          <Button
            variant={"outline"}
            onClick={() => {
              setFields(allFields.map((f) => f.value));
            }}
            disabled={allFields.length === fields.length}
          >
            تحديد الكل
          </Button>
          <div className="text-muted-foreground">
            تم تحديد
            {allFields.length === fields.length
              ? "كل الحقول"
              : `${fields.length} حقول/حقلاً`}
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
