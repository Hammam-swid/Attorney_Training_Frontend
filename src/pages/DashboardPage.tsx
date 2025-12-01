import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { BookOpen, Users, User2, Building, RotateCcw } from "lucide-react";

import { useState } from "react";
import ActivityTypesCard from "@/components/ActivityTypesCard";
import { Helmet } from "react-helmet";
import { Button } from "@/components/ui/button";

import ActivitiesPerMonth from "@/components/stats/ActivitiesPerMonth";
import ActivitiesPerType from "@/components/stats/ActivitiesPerType";
import YearSelect from "@/components/ui/YearSelect";

import { useQuery } from "@tanstack/react-query";
import { DashboardService } from "@/services/dashboard.service";
import { Skeleton } from "@/components/ui/skeleton";

export default function DashboardPage() {
  const [year, setYear] = useState<number | undefined>(undefined);

  const { data: statistics, isLoading: isStatisticsLoading } = useQuery({
    queryKey: ["statistics", { year }],
    queryFn: () => DashboardService.getStatistics(year),
  });

  const { data: instructors } = useQuery({
    queryKey: ["top-5-instructors", { year }],
    queryFn: () => DashboardService.getTop5Instructors(year),
  });

  return (
    <div className="container mx-auto p-8">
      <Helmet>
        <title>إدارة التدريب | الصفحة الرئيسية</title>
        <meta name="description" content={`لوحة الإحصائيات لإدارة التدريب`} />
      </Helmet>
      <div className="flex justify-between mb-8 items-center">
        <h1 className="text-3xl font-bold">لوحة الإحصائيات</h1>
        <div className="flex items-center gap-2">
          {year && (
            <Button
              onClick={() => setYear(undefined)}
              variant="outline"
              size="icon"
            >
              <RotateCcw className="w-4 h-4" />
            </Button>
          )}
          <YearSelect year={year} setYear={setYear} />
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              إجمالي الأنشطة التدريبية
            </CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {isStatisticsLoading ? (
                <Skeleton className="h-5 rounded-full w-1/2 mt-1" />
              ) : statistics?.activitiesCount &&
                statistics?.activitiesCount > 0 ? (
                <span>{statistics.activitiesCount}</span>
              ) : (
                <span className="text-muted text-sm">لا يوجد نتائج</span>
              )}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              إجمالي المتدربين
            </CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {isStatisticsLoading ? (
                <Skeleton className="h-5 rounded-full w-1/2 mt-1" />
              ) : statistics?.traineesCount && statistics?.traineesCount > 0 ? (
                <span>{statistics.traineesCount}</span>
              ) : (
                <span className="text-muted text-sm">لا يوجد نتائج</span>
              )}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              إجمالي المدربين
            </CardTitle>
            <User2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {isStatisticsLoading ? (
                <Skeleton className="h-5 rounded-full w-1/2 mt-1" />
              ) : statistics?.instructorsCount &&
                statistics?.instructorsCount > 0 ? (
                <span>{statistics.instructorsCount}</span>
              ) : (
                <span className="text-muted text-sm">لا يوجد نتائج</span>
              )}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              عدد الجهات المختصة
            </CardTitle>
            <Building className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {isStatisticsLoading ? (
                <Skeleton className="h-5 rounded-full w-1/2 mt-1" />
              ) : statistics?.organizationsCount &&
                statistics?.organizationsCount > 0 ? (
                <span>{statistics.organizationsCount}</span>
              ) : (
                <span className="text-muted text-sm">لا يوجد نتائج</span>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <ActivitiesPerType />

        <ActivitiesPerMonth />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <Card>
          <CardHeader>
            <CardTitle>أعلى المدربين تقييما</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-8">
              {instructors?.map((instructor, index) => (
                <div key={index} className="flex items-center">
                  <Avatar className="h-9 w-9">
                    <AvatarImage
                      src={`/placeholder.svg?height=36&width=36`}
                      alt={instructor.name}
                    />
                    <AvatarFallback>{instructor.name[0]}</AvatarFallback>
                  </Avatar>
                  <div className="ms-4 space-y-1">
                    <p className="text-sm font-medium leading-none">
                      {instructor.name}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      التقييم:{" "}
                      {instructor.avgRating
                        ? parseFloat(instructor.avgRating + "").toFixed(2)
                        : "لا يوجد تقييمات"}
                    </p>
                  </div>
                  <div className="ms-auto font-medium">#{index + 1}</div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
        <ActivityTypesCard />
      </div>
    </div>
  );
}
