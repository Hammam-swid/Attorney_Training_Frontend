import api from "@/lib/api";
import { Activity, PaginatedData } from "@/types";

export class ActivityService {
  static async getActivities(
    typeId: number | string,
    page = 1,
    search?: string,
    status?: string,
    year?: number,
    startDate?: string,
    endDate?: string
  ) {
    const pageQuery = `?page=${page}`;
    const searchQuery = search ? `&search=${search}` : "";
    const statusQuery = status && status !== "الكل" ? `&status=${status}` : "";
    const dateQuery = year
      ? `&year=${year}`
      : startDate && endDate
      ? `&startDate=${startDate}&endDate=${endDate}`
      : "";
    const res = await api.get<PaginatedData<Activity>>(
      `/api/v1/training-activities/type/${typeId}${pageQuery}${searchQuery}${statusQuery}${dateQuery}`
    );
    return res.data;
  }

  static async getActivityById(id: number) {
    const res = await api.get<{ data: { activity: Activity } }>(
      `/api/v1/training-activities/${id}`
    );
    return res.data.data.activity;
  }

  static async createActivity(
    activity: ActivityFormValues,
    activityTypeId: number
  ) {
    const res = await api.post(
      "/api/v1/training-activities",
      { ...activity, activityTypeId },
      {
        headers: { Accept: "application/json" },
      }
    );
    return res.data.data;
  }

  static async updateActivity(id: number, activity: ActivityFormValues) {
    const res = await api.patch(`/api/v1/training-activities/${id}`, activity);
    return res.data.data;
  }

  static async deleteActivity(id: number) {
    const res = await api.delete(`/api/v1/training-activities/${id}`);
    return res.data.data;
  }

  static async rateActivity(id: number, rating: number | undefined) {
    const res = await api.post(`/api/v1/training-activities/${id}/rate`, {
      rating,
    });
    return res.data.data;
  }
}

export interface ActivityFormValues {
  title: string;
  location: string;
  hours: number | undefined;
  startDate: Date;
  endDate: Date;
  hostId: number | undefined;
  executorId: number | undefined;
  activityTypeId: number;
}
