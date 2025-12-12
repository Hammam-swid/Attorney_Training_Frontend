import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { DashboardService } from "@/services/dashboard.service";
import { Skeleton } from "../ui/skeleton";

interface Props {
  year?: number;
}
export default function TraineesPerType({ year }: Props) {
  const { data, isLoading } = useQuery({
    queryKey: ["trainee-types", { year }],
    queryFn: () => DashboardService.getTraineeTypes(year),
  });
  return (
    <Card>
      <CardHeader>
        <CardTitle>عدد المتدربين لكل فئة</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {isLoading
          ? Array.from({ length: 3 }).map((_, index) => (
              <div
                key={index}
                className="flex justify-between items-center gap-2"
              >
                <Skeleton className="h-5 rounded-full w-1/2" />
                <Skeleton className="h-5 rounded-full w-24" />
              </div>
            ))
          : data?.map((traineeType) => (
              <div
                key={traineeType.id}
                className="flex justify-between items-center"
              >
                <span>{traineeType.name}</span>
                <span className="text-xl font-bold">
                  {traineeType.traineeCount}{" "}
                  <span className="text-sm font-normal text-gray-500">
                    متدرب/متدربين
                  </span>
                </span>
              </div>
            ))}
      </CardContent>
    </Card>
  );
}
