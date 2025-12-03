import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis } from "recharts";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { DashboardService } from "../../services/dashboard.service";

export default function ActivitiesPerMonth() {
  const [year, setYear] = useState(new Date().getFullYear());

  const { data: activitiesPerMonth = [], isLoading } = useQuery({
    queryKey: ["activities-per-month", year],
    queryFn: () => DashboardService.getActivitiesPerMonth(year),
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle>الأنشطة في كل شهر</CardTitle>
        <Select
          dir="rtl"
          value={year.toString()}
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
      </CardHeader>

      <CardContent>
        {isLoading ? (
          <p>جاري التحميل...</p>
        ) : (
          <ChartContainer
            config={{
              activities: {
                label: "الأنشطة التدريبية",
                color: "hsl(var(--chart-1))",
              },
            }}
            className="w-full"
          >
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={activitiesPerMonth}>
                <XAxis dataKey="month" name="month" />
                <YAxis dataKey={"activities"} name="activities" />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Bar dataKey="activities" fill="var(--color-activities)" />
              </BarChart>
            </ResponsiveContainer>
          </ChartContainer>
        )}
      </CardContent>

      <CardFooter>
        <CardDescription className="text-xs text-gray-400 dark:text-gray-600">
          هذا البيانات مبنية على أساس تاريخ بداية كل نشاط
        </CardDescription>
      </CardFooter>
    </Card>
  );
}
