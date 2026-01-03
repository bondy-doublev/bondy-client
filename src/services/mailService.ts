import { api } from "../lib/axios";
import { AxiosResponse } from "axios";

const API_URL = `${process.env.NEXT_PUBLIC_API_URL}/advert/mail`;

export const mailService = {
  async sendPaymentRequest(params: {
    to: string;
    userName: string;
    advertTitle: string;
    amount: number;
    dueDate: string;
  }) {
    const response: AxiosResponse = await api.post(
      `${API_URL}/payment-request`,
      params
    );
    return response.data;
  },

  async sendPaymentSuccess(params: {
    to: string;
    userName: string;
    advertTitle: string;
    amount: number;
  }) {
    const response: AxiosResponse = await api.post(
      `${API_URL}/payment-success`,
      params
    );
    return response.data;
  },
};
