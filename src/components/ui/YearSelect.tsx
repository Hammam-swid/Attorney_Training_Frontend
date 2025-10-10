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
  const years = [];
  const start = new Date().getFullYear() + 3;
  for (let i = start; i >= 2020; i--) {
    years.push(i);
  }
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
        {years.map((i: number) => (
          <SelectItem key={i} value={`${i}`}>
            {i}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
