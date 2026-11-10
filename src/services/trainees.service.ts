import { PaginatedData, Trainee } from "@/types";
import api from "../lib/api";

export class TraineesService {
  static async getTrainees(
    page: number = 1,
    search: string,
    type?: string,
    typeId?: string,
    limit: number = 10,
    workplace?: { workplaceId: string | number; includeSub?: boolean },
  ) {
    const searchParam = search ? `&search=${encodeURIComponent(search)}` : "";
    const typeParam = type ? `&type=${type}` : "";
    const typeIdParam = typeId ? `&typeId=${typeId}` : "";
    const workplaceParam = workplace
      ? `&workplaceId=${workplace.workplaceId}${workplace.includeSub ? "&includeSub=true" : ""}`
      : "";

    const res = await api.get<PaginatedData<Trainee>>(
      `/api/v1/trainees?page=${page}&limit=${limit}${searchParam}${typeParam}${typeIdParam}${workplaceParam}`,
    );
    return res.data;
  }

  static async createTrainee(trainee: TraineeFormValues) {
    console.log(trainee);
    const res = await api.post(`/api/v1/trainees`, trainee);
    return res.data;
  }

  static async addMultiTrainees(typeId: string, file: File) {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("typeId", typeId);
    const res = await api.post<{
      message: string;
      data?: ImportSummary;
    }>(`/api/v1/trainees/import`, formData);
    return res.data;
  }

  static async updateTrainee(id: number, trainee: TraineeFormValues) {
    console.log(trainee);
    const res = await api.patch(`/api/v1/trainees/${id}`, trainee);
    return res.data;
  }

  static async deleteTrainee(id: number) {
    const res = await api.delete(`/api/v1/trainees/${id}`);
    return res.data;
  }

  static async checkTraineeName(name: string) {
    const res = await api.get(`/api/v1/trainees/check?search=${name}`);
    return res.data.data.isTrainee ? true : false;
  }

  static async addTraineesToActivity(
    activityId: number | string,
    traineesIds: number[],
  ) {
    const res = await api.post(
      `/api/v1/training-activities/${activityId}/trainee`,
      {
        traineesIds,
      },
    );
    return res.data;
  }
}

export interface ImportSummary {
  added: number;
  updated: number;
  skipped: number;
  errors: { row: number; name: string; message: string }[];
  warnings: { row: number; name: string; message: string }[];
  createdWorkplaces: { id: number; name: string; parentId: number | null }[];
}

export interface TraineeFormValues {
  name: string;
  phone: string;
  address: string;
  employer: string;
  workplaceId?: number | null;
  typeId?: number | null;
  payGrade?: string | null;
  notes?: string;
}
