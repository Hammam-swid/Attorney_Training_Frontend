import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import {
  ChartContainer,
  ChartLegend,
  ChartTooltip,
  ChartTooltipContent,
} from "../ui/chart";
import { Pie, PieChart, ResponsiveContainer } from "recharts";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { RotateCcw } from "lucide-react";
import { Button } from "../ui/button";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { DashboardService } from "../../services/dashboard.service";

export default function ActivitiesPerType() {
  const [year, setYear] = useState<number>();

  const { data: Types = [], isLoading } = useQuery({
    queryKey: ["activity-per-type", year],
    queryFn: () => DashboardService.getActivitiesPerType(year),
    select: (types) =>
      types.map((type, index) => ({
        ...type,
        fill: `hsl(var(--chart-${index + 1}))`,
      })),
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle>الأنشطة لكل نوع</CardTitle>
        <div className="flex items-center justify-end gap-2">
          {year && (
            <Button
              onClick={() => setYear(undefined)}
              variant="outline"
              size="icon"
            >
              <RotateCcw className="w-4 h-4" />
            </Button>
          )}

          <Select
            dir="rtl"
            value={year ? year.toString() : ""}
            onValueChange={(value) => setYear(Number(value))}
          >
            <SelectTrigger className="w-fit">
              <SelectValue placeholder="اختر السنة" />
            </SelectTrigger>
            <SelectContent>
              {Array.from({ length: 10 }, (_, i) => (
                <SelectItem key={i} value={`${new Date().getFullYear() - i}`}>
                  {new Date().getFullYear() - i}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
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
              <PieChart data={Types}>
                <ChartTooltip content={<ChartTooltipContent />} />
                <Pie
                  dataKey="activities"
                  nameKey="name"
                  data={Types}
                  legendType="plainline"
                  label
                  labelLine={false}
                />
                <ChartLegend />
              </PieChart>
            </ResponsiveContainer>
          </ChartContainer>
        )}
      </CardContent>
    </Card>
  );
}
