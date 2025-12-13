import api from "@/lib/api";
import { Instructor, PaginatedData } from "@/types";

export class InstructorService {
  static async fetchInstructors(
    page: number = 1,
    limit: number = 10,
    search?: string
  ): Promise<PaginatedData<Instructor>> {
    const searchParam = search ? `&search=${search}` : "";
    const pageParam = `?page=${page}&limit=${limit}`;
    const res = await api.get<PaginatedData<Instructor>>(
      `/api/v1/instructors${pageParam}${searchParam}`
    );
    return res.data;
  }

  static async createInstructor(
    trainer: Partial<Instructor>
  ): Promise<Instructor> {
    const res = await api.post<{ data: { instructor: Instructor } }>(
      "/api/v1/instructors",
      trainer
    );
    return res.data.data.instructor;
  }

  static async editInstructor(trainer: Instructor): Promise<Instructor> {
    const res = await api.patch<{ data: { instructor: Instructor } }>(
      `/api/v1/instructors/${trainer.id}`,
      trainer
    );
    return res.data.data.instructor;
  }

  static async removeInstructor(id: number): Promise<void> {
    await api.delete(`/api/v1/instructors/${id}`);
  }
}
