import api from "@/lib/api";
import { Activity, ActivityTrainee, Instructor, PaginatedData } from "@/types";

export class ActivityService {
  static async getActivities(
    typeId: number | string | null,
    page = 1,
    search?: string,
    status?: string,
    year?: number,
    startDate?: string,
    endDate?: string,
    parentId?: number | null,
    notParentId?: number | null,
    limit: number = 10
  ) {
    const pageQuery = `?page=${page}`;
    const searchQuery = search ? `&search=${search}` : "";
    const statusQuery = status && status !== "الكل" ? `&status=${status}` : "";
    const dateQuery = year
      ? `&year=${year}`
      : startDate && endDate
      ? `&startDate=${startDate}&endDate=${endDate}`
      : "";
    const typeIdQuery = typeId ? `&typeId=${typeId}` : "";
    const parentIdQuery =
      parentId || parentId === null ? `&parentId=${parentId}` : "";
    const notParentIdQuery =
      notParentId || notParentId === null ? `&notParentId=${notParentId}` : "";
    const res = await api.get<PaginatedData<Activity>>(
      `/api/v1/training-activities/type/${typeId}${pageQuery}${searchQuery}${statusQuery}${dateQuery}${typeIdQuery}${parentIdQuery}${notParentIdQuery}&limit=${limit}`
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

  static async getActivityTrainees(id: string) {
    const res = await api.get<{
      data: { activity: Activity; traineesForActivity: ActivityTrainee[] };
    }>(`/api/v1/training-activities/${id}/trainee`);
    return res.data.data;
  }

  static async removeTraineeFromActivity(
    activityId: string | number,
    traineeId: number
  ) {
    const res = await api.delete(
      `/api/v1/training-activities/${activityId}/trainee`,
      { data: { traineeId } }
    );
    return res.status;
  }

  static async rateTraineeFromActivity(
    activityId: string | number,
    traineeId: number,
    rating: number | undefined
  ) {
    const res = await api.post(
      `/api/v1/training-activities/${activityId}/trainee/rate`,
      { traineeId, rating }
    );
    return res.data;
  }

  static async getActivityInstructors(id: string) {
    const res = await api.get<{
      data: { instructors: Instructor[] };
    }>(`/api/v1/training-activities/${id}/instructor`);
    return res.data.data.instructors;
  }

  static async addInstructorsToActivity(
    activityId: string,
    instructorIds: number[]
  ) {
    const res = await api.post(
      `/api/v1/training-activities/${activityId}/instructor`,
      { instructorIds }
    );
    return res.data;
  }

  static async removeInstructorFromActivity(
    activityId: string,
    instructorId: number
  ) {
    const res = await api.delete(
      `/api/v1/training-activities/${activityId}/instructor`,
      { data: { instructorId } }
    );

    return res.data;
  }

  static async rateInstructor(
    activityId: string,
    instructorId: number,
    rating: number
  ) {
    const res = await api.patch(
      `/api/v1/training-activities/${activityId}/instructor/rate`,
      {
        instructorId,
        rating,
      }
    );
    return res.data;
  }

  static async moveSubActivities(parentId: number, childrenIds: number[]) {
    const res = await api.post(`/api/v1/training-activities/${parentId}/move`, {
      childrenIds,
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
  parentId: number | undefined | null;
  domainId: number | undefined | null;
}
