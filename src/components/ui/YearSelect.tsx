import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./select";

interface YearSelectProps {
  year?: number;
  setYear: (year: number) => void;
}
export default function YearSelect({ year, setYear }: YearSelectProps) {
  return (
    <Select
      dir="rtl"
      value={year ? year.toString() : ""}
      onValueChange={(value) => setYear(Number(value))}
    >
      <SelectTrigger className="w-fit ms-auto">
        <SelectValue placeholder="اختر السنة" />
      </SelectTrigger>
      <SelectContent>
        {Array.from({ length: 10 }, (_, i: number) => (
          <SelectItem key={i} value={`${new Date().getFullYear() - i}`}>
            {new Date().getFullYear() - i}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
