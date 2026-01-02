import api from "@/lib/api";
import { ActivityDomain } from "@/types";

export class ActivityDomainsService {
  static async getDomains() {
    const res = await api.get<{ domains: ActivityDomain[] }>(
      "/api/v1/activity-domains"
    );
    return res.data.domains;
  }

  static async createDomain(data: { name: string; description: string }) {
    const res = await api.post<{ data: ActivityDomain }>(
      "/api/v1/activity-domains",
      data
    );
    return res.data.data;
  }

  static async updateDomain(
    id: number,
    data: { name: string; description: string }
  ) {
    const res = await api.patch<{ data: ActivityDomain }>(
      `/api/v1/activity-domains/${id}`,
      data
    );
    return res.data.data;
  }

  static async deleteDomain(id: number) {
    const res = await api.delete<{ data: ActivityDomain }>(
      `/api/v1/activity-domains/${id}`
    );
    return res.data.data;
  }
}
