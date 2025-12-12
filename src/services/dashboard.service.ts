import api from "@/lib/api";
import { Instructor, Statistics, TraineeType } from "@/types";
import { ActivityType } from "@/types";
export class DashboardService {
  static async getStatistics(year?: number) {
    const yearQuery = year ? `?year=${year}` : "";
    const res = await api.get<{ data: Statistics }>(
      `/api/v1/statistics${yearQuery}`
    );
    return res.data.data;
  }

  static async getTop5Instructors(year?: number) {
    const yearQuery = year ? `?year=${year}` : "";
    const res = await api.get<{ data: { instructors: Instructor[] } }>(
      `/api/v1/statistics/top-5-instructors${yearQuery}`
    );
    return res.data.data.instructors;
  }

  static async getActivitiesPerType(year?: number) {
    const yearQuery = year ? `?year=${year}` : "";
    const res = await api.get<{ data: { types: ActivityType[] } }>(
      `/api/v1/statistics/activity-per-type${yearQuery}`
    );
    return res.data.data.types;
  }

  static async getActivitiesPerMonth(year?: number) {
    const yearQuery = year ? `?year=${year}` : "";
    const res = await api.get<{ data: { activitiesPerMonth: any[] } }>(
      `/api/v1/statistics/activity-per-month${yearQuery}`
    );
    return res.data.data.activitiesPerMonth;
  }

  static async getTraineeTypes(year?: number) {
    const yearQuery = year ? `?year=${year}` : "";
    const res = await api.get<{ data: { traineeTypes: TraineeType[] } }>(
      `/api/v1/statistics/trainees-activities-per-type${yearQuery}`
    );
    return res.data.data.traineeTypes;
  }
}
