import api from "@/lib/api";
import { TraineeType } from "@/types";

export class TraineeTypeService {
  static async getTraineeTypes() {
    const res = await api.get<{ data: { traineeTypes: TraineeType[] } }>(
      "/api/v1/trainee-types"
    );
    return res.data.data.traineeTypes;
  }

  static async createTraineeType(name: string) {
    const res = await api.post<{ data: TraineeType }>("/api/v1/trainee-types", {
      name,
    });
    return res.data.data;
  }

  static async updateTraineeType(id: number, name: string) {
    const res = await api.put<{ data: TraineeType }>(
      `/api/v1/trainee-types/${id}`,
      { name }
    );
    return res.data.data;
  }

  static async deleteTraineeType(id: number) {
    const res = await api.delete<{ data: TraineeType }>(
      `/api/v1/trainee-types/${id}`
    );
    return res.data.data;
  }
}
