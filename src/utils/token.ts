export const getAccessToken = () => localStorage.getItem("accessToken");
export const setAccessToken = (token: string) =>
  localStorage.setItem("accessToken", token);
export const setUserId = (userId: number) =>
  localStorage.setItem("userId", userId);
export const removeAccessToken = () => localStorage.removeItem("accessToken");
