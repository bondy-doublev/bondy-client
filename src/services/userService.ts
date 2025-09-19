/* eslint-disable @typescript-eslint/no-unused-vars */
import { api } from "../lib/axios";
import axios, { AxiosResponse } from "axios";

const API_URL = `${process.env.NEXT_PUBLIC_API_URL}/user`;

export const userService = {
  async getAll() {
    try {
      const response: AxiosResponse = await api.get(`${API_URL}`);

      return response.data;
    } catch (error) {
      throw new Error("Failed to fetch users");
    }
  },

  async getUsers(search?: string, page: number = 1, limit: number = 10) {
    try {
      const params: Record<string, any> = { page, limit };
      if (search) params.search = search;

      const response: AxiosResponse = await api.get(`${API_URL}/users`, {
        params,
      });
      return response.data;
    } catch (error) {
      throw new Error("Failed to fetch users");
    }
  },

  async getProfile() {
    try {
      const response: AxiosResponse = await api.get(`${API_URL}/profile`);
      return response.data;
    } catch (error) {
      throw new Error("Failed to fetch profile");
    }
  },

async updateProfile(data: {
    name?: string;
    phone?: string;
    avatar?: string;
    address?: string;
    shippingAddress?: string;
  }) {
    try {
      const response: AxiosResponse = await api.put(
        `${API_URL}/me`,
        data
      );
      return response.data;
    } catch (error) {
      throw new Error("Failed to update profile");
    }
  },

  async updateUser(data: {
    userId: number;
    name?: string;
    phone?: string;
    avatar?: string;
    address?: string;
    shippingAddress?: string;
  }) {
    try {
      const response: AxiosResponse = await api.put(
        `${API_URL}/update-user`,
        data
      );
      return response.data;
    } catch (error) {
      throw new Error("Failed to update user");
    }
  },

  async toggleActiveUser(userId: number) {
    try {
      const response: AxiosResponse = await api.put(
        `${API_URL}/toggle-active-user`,
        { userId }
      );
      return response.data;
    } catch (error) {
      throw new Error("Failed to toggle user");
    }
  },
  
};