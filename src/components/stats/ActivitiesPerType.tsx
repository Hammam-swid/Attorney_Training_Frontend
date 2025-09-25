import { ActivityType } from "@/types";
import { useEffect, useState } from "react";
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
import api from "@/lib/api";

export default function ActivitiesPerType() {
  const [Types, setTypes] = useState<ActivityType[]>([]);
  const [year, setYear] = useState<number>();
  useEffect(() => {
    const fetchActivityPerType = async () => {
      try {
        const yearQuery = year ? `?year=${year}` : "";
        const response = await api.get<
          undefined,
          { data: { data: { types: ActivityType[] } }; status: number }
        >(`/api/v1/statistics/activity-per-type${yearQuery}`);
        if (response.status === 200) {
          setTypes(
            response.data.data.types.map((type, index) => ({
              ...type,
              fill: `hsl(var(--chart-${index + 1}))`,
            }))
          );
        }
      } catch (error) {
        console.error("error", error);
      }
    };
    fetchActivityPerType();
  }, [year]);
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
              {Array.from({ length: 10 }, (_, i: number) => (
                <SelectItem key={i} value={`${new Date().getFullYear() - i}`}>
                  {new Date().getFullYear() - i}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      <CardContent>
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
      </CardContent>
    </Card>
  );
}
