import { api } from "@/lib/axios";

import { AxiosResponse } from "axios";

const API_URL = `${process.env.NEXT_PUBLIC_API_URL}/advert/payment`;

export const paymentService = {
  async payWithMomo(amount: number, redirectUrl?: string) {
    try {
      const response: any = await api.post(`${API_URL}/momo`, {
        amount,
        redirectUrl,
      });

      return response.data;
    } catch (error) {
      throw new Error("Failed to pay with Momo");
    }
  },

  async payWithVnpay(amount: number, redirectUrl?: string) {
    try {
      const response: AxiosResponse<{
        paymentUrl: string;
        txnRef: string;
      }> = await api.post(`${API_URL}/vnpay`, { amount, redirectUrl });

      return response.data; // { paymentUrl, txnRef }
    } catch (error) {
      console.error("VNPay Error:", error);
      throw new Error("Failed to create VNPay payment URL");
    }
  },
};
