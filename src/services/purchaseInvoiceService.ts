import { api } from "../lib/axios";
import { AxiosResponse } from "axios";

const API_URL = `${process.env.NEXT_PUBLIC_API_URL}/purchase-invoices`;

export const purchaseInvoiceService = {
  // Tạo hóa đơn nhập
  async createInvoice(data: {
    invoiceNumber: string;
    supplier: string;
    note?: string;
    items: {
      book: string;
      variant: string;
      quantity: number;
      unitPrice: number;
      note?: string;
    }[];
  }) {
    const res: AxiosResponse = await api.post(API_URL, data);
    return res.data;
  },

  // Lấy tất cả hóa đơn
  async getInvoices() {
    const res: AxiosResponse = await api.get(API_URL);
    return res.data;
  },

  // Lấy chi tiết 1 hóa đơn
  async getInvoice(id: string) {
    const res: AxiosResponse = await api.get(`${API_URL}/${id}`);
    return res.data;
  },

  // Cập nhật hóa đơn
  async updateInvoice(
    id: string,
    data: {
      invoiceNumber: string;
      supplier: string;
      note?: string;
      items: {
        book: string;
        variant: string;
        quantity: number;
        unitPrice: number;
        note?: string;
      }[];
    }
  ) {
    const res: AxiosResponse = await api.put(`${API_URL}/${id}`, data);
    return res.data;
  },

  // Xóa hóa đơn
  async removeInvoice(id: string) {
    const res: AxiosResponse = await api.delete(`${API_URL}/${id}`);
    return res.data;
  },

  // Tạo hóa đơn + nhập nhiều sách 1 lần
  async createLot(data: {
    invoiceNumber: string;
    supplier: string;
    note?: string;
    items: {
      book: string;
      variant: string;
      quantity: number;
      unitPrice: number;
      note?: string;
    }[];
  }) {
    const res: AxiosResponse = await api.post(`${API_URL}/create-lot`, data);
    return res.data;
  },
};
