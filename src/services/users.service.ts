import api from "@/lib/api";
import { PaginatedData, User } from "@/types";

export class UsersService {
  static async getUsers(
    page = 1,
    search?: string,
    status?: "all" | "active" | "inactive",
    role?: string
  ) {
    const pageQuery = `?page=${page}`;
    const searchQuery = search ? `&search=${search}` : "";
    const isActiveQuery =
      status && status !== "all" ? `&isActive=${status === "active"}` : "";
    const roleQuery = role ? `&role=${role}` : "";
    const res = await api.get<PaginatedData<User>>(
      `/api/v1/users${pageQuery}${searchQuery}${isActiveQuery}${roleQuery}`
    );
    return res.data;
  }
}
