import api from "@/lib/api";
import { PaginatedData, User } from "@/types";

export class UsersService {
  static async getUsers(
    page = 1,
    search?: string,
    isActive?: boolean,
    role?: string
  ) {
    const pageQuery = `?page=${page}`;
    const searchQuery = search ? `&search=${search}` : "";
    const isActiveQuery = Boolean(isActive) ? `&isActive=${isActive}` : "";
    const roleQuery = role ? `&role=${role}` : "";
    const res = await api.get<PaginatedData<User>>(
      `/api/v1/users${pageQuery}${searchQuery}${isActiveQuery}${roleQuery}`
    );
    return res.data;
  }

  static async toggleUserStatus(userId: number, isActive: boolean) {
    const res = await api.patch(`/api/v1/users/${userId}/toggle-active`, {
      isActive,
    });
    return res.data;
  }
}
