import { api } from "@/lib/axios";
import { Toast } from "@/lib/toast";
import { removeAccessToken, setAccessToken } from "@/utils/token";
import axios, { AxiosResponse } from "axios";

const API_URL = `${process.env.NEXT_PUBLIC_API_URL}/auth`;

export const authService = {
  // Đăng nhập
  async login(email: string, password: string) {
    try {
      const response: AxiosResponse = await api.post(`${API_URL}/login`, {
        email,
        password,
      });
      const { accessToken } = response.data.data;

      // Lưu token vào localStorage và cookie
      setAccessToken(accessToken);

      await axios.post("/api/login", {
        accessToken: accessToken,
      });

      console.log(response);

      return response.data; // trả về AuthResponse
    } catch (error: any) {
      console.log("Login err: ", error);
      Toast.error(error);
    }
  },

  // OAuth2 login
  async oauth2(data: {
    provider: string;
    email: string;
    avatarUrl: string;
    firstName: string;
    middleName?: string;
    lastName: string;
  }) {
    try {
      const response: AxiosResponse = await api.post(`${API_URL}/oauth2`, data);
      const { accessToken } = response.data.data;

      // Lưu token vào localStorage và cookie
      setAccessToken(accessToken);

      await axios.post("/api/login", {
        accessToken: accessToken,
      });

      return response.data;
    } catch (error: any) {
      throw new Error(error?.response?.data?.message || "OAuth2 login failed");
    }
  },

  // Logout
  async logout() {
    try {
      await api.post("/auth/logout");
      await axios.post("/api/logout");

      removeAccessToken();
    } catch (error) {
      throw new Error("Failed to log out");
    }
  },

  // Refresh token (cookie-based)
  async refreshToken() {
    try {
      const response: AxiosResponse = await api.post(`${API_URL}/refresh`);
      return response.data; // trả về AuthResponse
    } catch (error: any) {
      throw new Error(error?.response?.data?.message || "Refresh token failed");
    }
  },

  // Register init
  async registerInit(data: {
    email: string;
    firstName: string;
    middleName?: string;
    lastName: string;
    gender: boolean;
    dob: string; // ISO string
    password: string;
  }) {
    try {
      const response: AxiosResponse = await api.post(
        `${API_URL}/register/init`,
        data
      );
      return response.data; // trả về MessageResponse
    } catch (error: any) {
      throw new Error(error?.response?.data?.message || "Register failed");
    }
  },

  // Register verify OTP
  async registerVerify(email: string, otpCode: string) {
    try {
      const response: AxiosResponse = await api.post(
        `${API_URL}/register/verify`,
        {
          email,
          otpCode,
        }
      );
      return response.data; // MessageResponse
    } catch (error: any) {
      throw new Error(error?.response?.data?.message || "Verify OTP failed");
    }
  },

  // Change password (user logged in)
  async changePassword(
    oldPassword: string,
    newPassword: string,
    confirmPassword: string
  ) {
    try {
      const response: AxiosResponse = await api.post(
        `${API_URL}/change-password`,
        {
          oldPassword,
          newPassword,
          confirmPassword,
        }
      );
      return response.data; // MessageResponse
    } catch (error: any) {
      throw new Error(
        error?.response?.data?.message || "Change password failed"
      );
    }
  },

  // Send reset password OTP
  async sendResetPasswordOtp(email: string) {
    try {
      const response: AxiosResponse = await api.post(
        `${API_URL}/reset-password-otp`,
        {
          email,
        }
      );
      return response.data; // MessageResponse
    } catch (error: any) {
      throw new Error(error?.response?.data?.message || "Send OTP failed");
    }
  },

  // Reset password using OTP
  async resetPassword(
    email: string,
    newPassword: string,
    confirmPassword: string,
    otpCode: string
  ) {
    try {
      const response: AxiosResponse = await api.post(
        `${API_URL}/reset-password`,
        {
          email,
          newPassword,
          confirmPassword,
          otpCode,
        }
      );
      return response.data; // MessageResponse
    } catch (error: any) {
      throw new Error(
        error?.response?.data?.message || "Reset password failed"
      );
    }
  },
};
