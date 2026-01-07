import { api } from "@/lib/axios";
import { Toast } from "@/lib/toast";

// Types
export type ChatRequest = {
  message: string;
};

export type ChatResponse = {
  answer: string;
};

type AppApiResponse<T> = {
  code?: number;
  message?: string;
  data: T;
};

export const chatbotService = {
  // ---------------- SEND MESSAGE ----------------
  async chat(message: string) {
    try {
      const res = await api.post(
        "/chat/chatbot",
        {
          message,
        }
      );

      return res?.data ?? null;
    } catch (error: any) {
      console.error("Chatbot Error:", error);
      Toast.error(
        error?.response?.data?.message || "Failed to get chatbot response"
      );
      return null;
    }
  },
};
