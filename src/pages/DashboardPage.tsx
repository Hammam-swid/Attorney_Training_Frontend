import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { BookOpen, Users, User2, Building, Files } from "lucide-react";
import {
  ChartContainer,
  ChartLegend,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  PieChart,
  Pie,
} from "recharts";
import { useEffect, useState } from "react";
import axios from "axios";
import { ActivityType, Instructor } from "@/types";
import ActivityTypesCard from "@/components/ActivityTypesCard";
import { Helmet } from "react-helmet";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

interface StatisticsState {
  activitiesCount: number | undefined;
  organizationsCount: number | undefined;
  instructorsCount: number | undefined;
  traineesCount: number | undefined;
}

export default function DashboardPage() {
  const [statistics, setStatistics] = useState<StatisticsState>({
    activitiesCount: undefined,
    organizationsCount: undefined,
    instructorsCount: undefined,
    traineesCount: undefined,
  });
  const [top5Instructors, setTop5Instructors] = useState<Instructor[]>([]);

  const [Types, setTypes] = useState<ActivityType[]>([]);
  const [activitiesPerMonth, setActivitiesPerMonth] = useState([]);
  useEffect(() => {
    const fetchStatistics = async () => {
      try {
        const response = await axios.get("/api/v1/statistics");
        if (response.status === 200) {
          const data = response.data.data;
          setStatistics(() => ({
            instructorsCount: data.instructorsCount,
            traineesCount: data.traineesCount,
            activitiesCount: data.activitiesCount,
            organizationsCount: data.organizationsCount,
          }));
        }
      } catch (error) {
        console.error("Error fetching statistics:", error);
      }
    };
    fetchStatistics();
  }, []);

  useEffect(() => {
    const fetchTop5Instructors = async () => {
      try {
        const response = await axios.get(
          "/api/v1/statistics/top-5-instructors"
        );
        if (response.status === 200) {
          setTop5Instructors(response.data.data.instructors);
        }
      } catch (error) {
        console.error("Error fetching top 5 instructors:", error);
      }
    };
    fetchTop5Instructors();
  }, []);

  useEffect(() => {
    const fetchActivityPerType = async () => {
      try {
        const response = await axios.get<
          undefined,
          { data: { data: { types: ActivityType[] } }; status: number }
        >("/api/v1/statistics/activity-per-type");
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
  }, []);

  useEffect(() => {
    const fetchActivitiesPerMonth = async () => {
      try {
        const response = await axios.get(
          "/api/v1/statistics/activity-per-month"
        );
        console.log("data from activity per month", response.data);
        if (response.status === 200) {
          setActivitiesPerMonth(response.data.data.activitiesPerMonth);
        }
      } catch (error) {
        console.error("Error fetching activities per month:", error);
      }
    };
    fetchActivitiesPerMonth();
  }, []);

  return (
    <div className="container mx-auto p-8">
      <Helmet>
        <title>إدارة المتدربين | الصفحة الرئيسية</title>
        <meta name="description" content={`لوحة الإحصائيات لإدارة المتدربين`} />
      </Helmet>
      <div className="flex justify-between mb-8 items-center">
        <h1 className="text-3xl font-bold">لوحة الإحصائيات</h1>
        <Link to={"/reports"}>
          <Button variant={"link"}>
            <span>إنشاء التقارير</span>
            <Files />
          </Button>
        </Link>
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
              {statistics.activitiesCount ? (
                <span>{statistics.activitiesCount}</span>
              ) : statistics.activitiesCount === 0 ? (
                <span className="text-muted text-sm">
                  لا يوجد أنشطة مسجلة في النظام
                </span>
              ) : (
                <span className="animate-pulse h-7 rounded-md bg-muted block mt-1" />
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
              {statistics.traineesCount ? (
                <span>{statistics.traineesCount}</span>
              ) : statistics.traineesCount === 0 ? (
                <span className="text-muted text-sm">
                  لا يوجد متدربين مسجلين في النظام
                </span>
              ) : (
                <span className="animate-pulse h-7 rounded-md bg-muted block mt-1" />
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
              {statistics.instructorsCount ? (
                <span>{statistics.instructorsCount}</span>
              ) : statistics.instructorsCount === 0 ? (
                <span className="text-muted text-sm">
                  لا يوجد مدربين مسجلين في النظام
                </span>
              ) : (
                <span className="animate-pulse h-7 rounded-md bg-muted block mt-1" />
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
              {statistics.organizationsCount ? (
                <span>{statistics.organizationsCount}</span>
              ) : statistics.organizationsCount === 0 ? (
                <span className="text-muted text-sm">
                  لا يوجد جهات مسجلة في النظام
                </span>
              ) : (
                <span className="animate-pulse h-7 rounded-md bg-muted block mt-1" />
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <Card>
          <CardHeader>
            <CardTitle>الأنشطة لكل نوع</CardTitle>
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
        <Card>
          <CardHeader>
            <CardTitle>الأنشطة في كل شهر</CardTitle>
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
                <BarChart data={activitiesPerMonth}>
                  <XAxis dataKey="month" name="month" />
                  <YAxis dataKey={"activities"} name="activities" />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Bar dataKey="activities" fill="var(--color-activities)" />
                </BarChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
          <CardFooter>
            <CardDescription className="text-xs text-gray-400 dark:text-gray-600">
              هذا البيانات مبنية على أساس تاريخ بداية كل نشاط
            </CardDescription>
          </CardFooter>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <Card>
          <CardHeader>
            <CardTitle>أعلى المدربين تقييما</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-8">
              {top5Instructors.map((instructor, index) => (
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
                      {parseFloat(instructor.avgRating + "").toFixed(2)}
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
