import api from "@/lib/api";
import { Organization, PaginatedData } from "@/types";

export class OrganizationService {
  static async getOrganization(page = 1, search?: string, limit = 10) {
    const res = await api.get<PaginatedData<Organization>>(
      `/api/v1/organizations?page=${page}&search=${search}&limit=${limit}`
    );
    return res.data;
  }
  static async getAllOrganization() {
    const res = await api.get<{ data: { organizations: Organization[] } }>(
      "/api/v1/organizations/all"
    );
    return res.data.data.organizations;
  }

  static async createOrganization(name: string) {
    const res = await api.post("/api/v1/organizations", { name });
    return res.data;
  }

  static async updateOrganization(id: number, name: string) {
    const res = await api.patch(`/api/v1/organizations/${id}`, { name });
    return res.data;
  }

  static async deleteOrganization(id: number) {
    const res = await api.delete(`/api/v1/organizations/${id}`);
    return res.data;
  }
}
