import { CalendarIcon } from "lucide-react";
import { Button } from "./button";
import { Popover, PopoverContent, PopoverTrigger } from "./popover";
import { Calendar } from "./calendar";
import { format } from "date-fns";

interface DatePickerProps {
  date?: Date;
  setDate: (date: Date) => void;
  title?: string;
}
export default function DatePicker({ date, setDate, title }: DatePickerProps) {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline">
          <CalendarIcon className="mr-2 h-4 w-4" />
          {date ? format(date, "yyyy-MM-dd") : title || "تاريخ البداية"}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar
          mode="single"
          selected={date}
          defaultMonth={date}
          toYear={new Date().getFullYear() + 5}
          fromYear={2020}
          captionLayout="dropdown"
          onSelect={(date) => {
            setDate(date as Date);
          }}
        />
      </PopoverContent>
    </Popover>
  );
}
