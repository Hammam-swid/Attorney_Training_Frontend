import api from "@/lib/api";
import { ActivityType } from "@/types";

interface AddFormValues {
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

  static async createActivityType(data: AddFormValues) {
    const res = await api.post("/api/v1/activity-types", data);
    return res.data;
  }
}
