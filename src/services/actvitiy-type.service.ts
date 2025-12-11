import api from "@/lib/api";
import { ActivityType } from "@/types";

export interface AddFormValues {
  name: string;
  iconName: string;
  isHaveRating: boolean | null;
  instructorName: string;
  traineeName: string;
}

export class ActivityTypeService {
  static async getActivityTypes() {
    const res = await api.get<{ data: { types: ActivityType[] } }>(
      "/api/v1/activity-types"
    );
    return res.data.data.types;
  }
  static async getActivityType(id: number) {
    const res = await api.get<{ data: { type: ActivityType } }>(
      `/api/v1/activity-types/${id}`
    );
    return res.data.data.type;
  }

  static async createActivityType(data: AddFormValues) {
    const res = await api.post("/api/v1/activity-types", data);
    return res.data;
  }

  static async updateActivityType(id: number, data: AddFormValues) {
    const res = await api.patch(`/api/v1/activity-types/${id}`, data);
    return res.data;
  }

  static async deleteActivityType(id: number) {
    const res = await api.delete(`/api/v1/activity-types/${id}`);
    return res.data;
  }
}
