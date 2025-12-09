import api from "@/lib/api";
import { Instructor, PaginatedData, Organization } from "@/types";

export const fetchInstructors = async (
  page: number = 1,
  limit: number = 10,
  search?: string
): Promise<PaginatedData<Instructor>> => {
  const searchParam = search ? `&search=${search}` : "";
  const pageParam = `?page=${page}&limit=${limit}`;
  const res = await api.get<PaginatedData<Instructor>>(
    `/api/v1/instructors${pageParam}${searchParam}`
  );
  return res.data;
};

export const fetchOrganizations = async (): Promise<Organization[]> => {
  const res = await api.get<{ data: { organizations: Organization[] } }>(
    "/api/v1/organizations/all"
  );
  return res.data.data.organizations;
};

export const createInstructor = async (
  trainer: Partial<Instructor>
): Promise<Instructor> => {
  const res = await api.post<{ data: { instructor: Instructor } }>(
    "/api/v1/instructors",
    trainer
  );
  return res.data.data.instructor;
};

export const editInstructor = async (
  trainer: Instructor
): Promise<Instructor> => {
  const res = await api.patch<{ data: { instructor: Instructor } }>(
    `/api/v1/instructors/${trainer.id}`,
    trainer
  );
  return res.data.data.instructor;
};

export const removeInstructor = async (id: number): Promise<void> => {
  await api.delete(`/api/v1/instructors/${id}`);
};
