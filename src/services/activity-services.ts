import api from "@/lib/api";
import { Activity } from "@/types";

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
    const statusQuery = status && status !== "all" ? `&status=${status}` : "";
    const dateQuery = year
      ? `&year=${year}`
      : startDate && endDate
      ? `&startDate=${startDate}&endDate=${endDate}`
      : "";
    const res = await api.get<{
      data: { count: number; activities: Activity[] };
    }>(
      `/api/v1/training-activities/type/${typeId}${pageQuery}${searchQuery}${statusQuery}${dateQuery}`
    );
    return res.data.data;
  }
}
