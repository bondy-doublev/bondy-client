import axios from "axios";
import {
  getAccessToken,
  setAccessToken,
  removeAccessToken,
  clearCookies,
} from "@/utils/token";

const baseURL = process.env.NEXT_PUBLIC_API_URL;

export const api = axios.create({
  baseURL,
  withCredentials: true,
});

let isRefreshing = false;
let failedQueue: Array<{
  resolve: (token: string) => void;
  reject: (error: any) => void;
}> = [];

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token as string);
    }
  });
  failedQueue = [];
};

api.interceptors.request.use((config) => {
  const token = getAccessToken();
  const apiKey = process.env.NEXT_PUBLIC_API_KEY;

  if (config.headers) {
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    if (apiKey) {
      config.headers["x-api-key"] = apiKey;
    }
  }

  return config;
});

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    const apiKey = process.env.NEXT_PUBLIC_API_KEY;

    const isLogoutRequest = originalRequest?.url?.includes("/auth/logout");

    if (error.response?.status === 401 && isLogoutRequest) {
      clearCookies();
      removeAccessToken();
      localStorage.removeItem("refresh_token");

      const pathname = window.location.pathname;
      const locale = pathname.split("/")[1] || "vi";
      window.location.href = `/${locale}/signin`;

      return Promise.reject(error);
    }

    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        return new Promise<string>((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        }).then((token: string) => {
          originalRequest.headers.Authorization = `Bearer ${token}`;
          originalRequest.headers["x-api-key"] = apiKey;
          return api(originalRequest);
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const res = await api.post(
          "/auth/refresh",
          {},
          {
            headers: {
              "x-api-key": apiKey,
            },
          }
        );

        const newAccessToken = res.data.data.accessToken;
        setAccessToken(newAccessToken);
        processQueue(null, newAccessToken);

        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
        originalRequest.headers["x-api-key"] = apiKey;

        return api(originalRequest);
      } catch (err) {
        processQueue(err, null);
        removeAccessToken();
        localStorage.removeItem("refresh_token");

        const pathname = window.location.pathname;
        const locale = pathname.split("/")[1] || "vi";
        window.location.href = `/${locale}/signin`;

        return Promise.reject(err);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);
