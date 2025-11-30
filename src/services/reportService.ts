import { api } from "@/lib/axios";
import { Toast } from "@/lib/toast";
import { CreateReportRequest } from "@/models/Report";
const API_URL = `${process.env.NEXT_PUBLIC_API_URL}`;

export const moderationService = {
  async createReport(body: CreateReportRequest) {
    try {
      await api.post(`${API_URL}/reports`, body);
      Toast.success("Report success");
    } catch (error: any) {
      console.log("Error: ", error);
      Toast.error("Report success");
    }
  },
};
