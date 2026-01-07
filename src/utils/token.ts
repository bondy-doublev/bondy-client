export const getAccessToken = () => localStorage.getItem("accessToken");
export const setAccessToken = (token: string) =>
  localStorage.setItem("accessToken", token);
export const setUserId = (userId: number) =>
  localStorage.setItem("userId", userId);
export const removeAccessToken = () => localStorage.removeItem("accessToken");
export const clearCookies = () => {
  document.cookie.split(";").forEach((cookie) => {
    const eqPos = cookie.indexOf("=");
    const name = eqPos > -1 ? cookie.substring(0, eqPos) : cookie;
    document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/`;
  });
};
