/* eslint-disable @typescript-eslint/no-unused-vars */
import { removeAccessToken, setAccessToken } from "@/utils/token";
import { api } from "@/lib/axios";

import axios, { AxiosResponse } from "axios";

const API_URL = `${process.env.NEXT_PUBLIC_API_URL}/auth`;

export const authService = {
  async signUp(email: string, password: string, address: string) {
    try {
      const response: AxiosResponse = await axios.post(`${API_URL}/signup`, {
        email,
        address,
        password,
      });

      return response;
    } catch (error) {
      throw new Error("Failed to sign up");
    }
  },

  // Đăng nhập
  async signIn(email: string, password: string) {
    try {
      const response: AxiosResponse = await axios.post(`${API_URL}/signin`, {
        email,
        password,
      });
      const { tokens } = response.data;

      // Lưu token vào localStorage và cookie
      setAccessToken(tokens.accessToken);
      localStorage.setItem("refreshToken", tokens.refreshToken); // Lưu refresh token vào localStorage

      await axios.post("/api/login", {
        accessToken: tokens.accessToken,
        refreshToken: tokens.refreshToken,
      });

      return response.data;
    } catch (error) {
      throw new Error("Invalid credentials");
    }
  },

  async signInOAuth(email: string, name: string, image?: string) {
    try {
      const response: AxiosResponse = await axios.post(`${API_URL}/oauth`, {
        email,
        name,
        image,
      });
      console.log(email, name, image, response);

      const { tokens } = response.data;

      // Lưu token vào localStorage và cookie
      setAccessToken(tokens.accessToken);
      localStorage.setItem("refreshToken", tokens.refreshToken); // Lưu refresh token vào localStorage

      await axios.post("/api/login", {
        accessToken: tokens.accessToken,
        refreshToken: tokens.refreshToken,
      });

      return response.data;
    } catch (error) {
      console.error("OAuth login failed:", error);
      throw new Error("OAuth login failed");
    }
  },

  async logout() {
    try {
      await axios.post("/api/logout");

      removeAccessToken();
      localStorage.removeItem("refreshToken");
    } catch (error) {
      throw new Error("Failed to log out");
    }
  },

  async getProfile() {
    const res = await api.get("/users/profile");
    return res.data; // user info
  },

  // Làm mới token (sử dụng refreshToken)
  async refreshTokens(refreshTokenParams: string) {
    try {
      const response: AxiosResponse = await axios.post(`${API_URL}/refresh`, {
        refreshToken: refreshTokenParams,
      });
      const { accessToken, refreshToken } = response.data;

      // Lưu token mới vào localStorage và cookie
      setAccessToken(accessToken);
      localStorage.setItem("refreshToken", refreshToken); // Lưu refresh token vào localStorage

      return response.data;
    } catch (error) {
      throw new Error("Failed to refresh tokens");
    }
  },

  // Gửi yêu cầu gửi mã OTP qua email
  async requestResetPassword(email: string) {
    try {
      const res = await axios.post(`${API_URL}/forgot`, { email });
      return res.data;
    } catch (error: any) {
      throw new Error(
        error?.response?.data?.message || "Failed to request OTP"
      );
    }
  },

  // Xác thực mã OTP và lấy resetPasswordToken
  async verifyOtp(email: string, otp: string) {
    try {
      const res = await axios.post(`${API_URL}/verify-otp`, { email, otp });
      return res.data;
    } catch (error: any) {
      throw new Error(
        error?.response?.data?.message || "Failed to verify OTP"
      );
    }
  },

  // Đặt lại mật khẩu bằng resetPasswordToken
  async resetPassword(resetPasswordToken: string, newPassword: string) {
    try {
      const res = await axios.post(`${API_URL}/reset-password`, {resetPasswordToken, newPassword,
      });
      return res.data;
    } catch (error: any) {
      throw new Error(
        error?.response?.data?.message || "Failed to reset password"
      );
    }
  },

// Đổi mật khẩu khi đang đăng nhập
async changePassword(oldPassword: string, newPassword: string) {
  try {
    const res = await api.post(`/auth/change-password`, {
      oldPassword,
      newPassword,
    });
    return res.data;
  } catch (error: any) {
    throw new Error(error?.response?.data?.message || "Failed to change password");
  }
},

};
