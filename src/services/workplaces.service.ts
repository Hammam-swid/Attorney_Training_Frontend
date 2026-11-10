import api from "@/lib/api";
import { Workplace, WorkplaceCategory, WorkplaceNode } from "@/types";

type ImportMessage = { row: number; name: string; message: string };

export interface WorkplacesImportSummary {
  preview: boolean;
  rows: number;
  created: { row: number; name: string }[];
  renamed: { row: number; from: string; to: string }[];
  moved: { row: number; name: string; from: string; to: string }[];
  aliasesAdded: { row: number; name: string; alias: string }[];
  recategorized: { row: number; name: string; from: string; to: string }[];
  unchanged: number;
  errors: ImportMessage[];
  warnings: ImportMessage[];
}

export class WorkplacesService {
  static async getWorkplaces(params: { search?: string; needsReview?: boolean } = {}) {
    const query = new URLSearchParams();
    if (params.search) query.set("search", params.search);
    if (params.needsReview) query.set("needsReview", "true");
    const res = await api.get<{ data: { workplaces: Workplace[] } }>(
      `/api/v1/workplaces?${query.toString()}`,
    );
    return res.data.data.workplaces;
  }

  static async getTree() {
    const res = await api.get<{ data: { tree: WorkplaceNode[] } }>(
      "/api/v1/workplaces/tree",
    );
    return res.data.data.tree;
  }

  static async create(data: {
    name: string;
    parentId?: number | null;
    category?: WorkplaceCategory;
  }) {
    const res = await api.post("/api/v1/workplaces", data);
    return res.data;
  }

  static async update(
    id: number,
    data: {
      name?: string;
      parentId?: number | null;
      needsReview?: boolean;
      category?: WorkplaceCategory;
    },
  ) {
    const res = await api.patch(`/api/v1/workplaces/${id}`, data);
    return res.data;
  }

  static async remove(id: number, force = false) {
    const res = await api.delete(
      `/api/v1/workplaces/${id}${force ? "?force=true" : ""}`,
    );
    return res.data;
  }

  static async merge(id: number, targetId: number) {
    const res = await api.post(`/api/v1/workplaces/${id}/merge`, { targetId });
    return res.data;
  }

  static async addAlias(id: number, name: string) {
    const res = await api.post(`/api/v1/workplaces/${id}/aliases`, { name });
    return res.data;
  }

  /** Excel template that contains the current tree */
  static async downloadTemplate() {
    const res = await api.get("/api/v1/workplaces/excel/template", {
      responseType: "blob",
    });
    const url = URL.createObjectURL(res.data);
    const link = document.createElement("a");
    link.href = url;
    link.download = "دليل-جهات-العمل.xlsx";
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
  }

  /** preview = true: computes the changes without saving them */
  static async importExcel(file: File, preview: boolean) {
    const formData = new FormData();
    formData.append("file", file);
    const res = await api.post<{ message: string; data: WorkplacesImportSummary }>(
      `/api/v1/workplaces/excel/import${preview ? "?preview=true" : ""}`,
      formData,
    );
    return res.data;
  }

  static async removeAlias(aliasId: number) {
    const res = await api.delete(`/api/v1/workplaces/aliases/${aliasId}`);
    return res.data;
  }
}
