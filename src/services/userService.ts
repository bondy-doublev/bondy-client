import { api } from "../lib/axios";
import axios, { AxiosResponse } from "axios";

const API_URL = `${process.env.NEXT_PUBLIC_API_URL}/users`;

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

  async getProfileById({ userId }: { userId: number }) {
    try {
      const response: AxiosResponse = await api.get(
        `${API_URL}/${userId}/profile`
      );

      console.log(response.data);

      return response.data;
    } catch (error) {
      throw new Error("Failed to fetch profile");
    }
  },

  async updateProfile(data: {
    firstName?: string;
    middleName?: string;
    lastName?: string;
    dob?: string; // "YYYY-MM-DD"
    gender?: boolean;
  }) {
    try {
      const payload = {
        ...data,
        dob: data.dob ? `${data.dob}T00:00:00` : undefined,
      };

      const response = await api.put(`${API_URL}`, payload);
      return response.data;
    } catch (error) {
      throw new Error("Failed to update profile");
    }
  },

  async updateAvatar(file: File) {
    try {
      const formData = new FormData();
      formData.append("file", file);

      const response: AxiosResponse = await api.put(
        `${API_URL}/avatar`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );
      return response.data;
    } catch (error) {
      throw new Error("Failed to update avatar");
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

  async searchUsers(address?: string, name?: string) {
    try {
      const params: Record<string, any> = {};
      if (address) params.address = address;
      if (name) params.name = name;

      const response: AxiosResponse = await api.get(`${API_URL}/search`, {
        params,
      });

      return response.data.data;
    } catch (error) {
      throw new Error("Failed to search users");
    }
  },

  async getBasicProfile(userId: number) {
    try {
      const response: AxiosResponse = await api.get(
        `${API_URL}/${userId}/basic-profile`
      );
      return response.data;
    } catch (error) {
      throw new Error("Failed to fetch basic profile");
    }
  },
  async getBasicProfiles(userIds: number[]) {
    try {
      const response: AxiosResponse = await api.post(
        `${API_URL}/basic-profiles`,
        {
          userIds,
        }
      );
      return response.data;
    } catch (error) {
      throw new Error("Failed to fetch basic profile");
    }
  },
};
