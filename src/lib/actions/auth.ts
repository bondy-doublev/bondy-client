"use server";

import { signIn, signOut } from "@/auth";
import { getLocale } from "next-intl/server";

export const loginWithGithub = async () => {
  const locale = await getLocale();
  await signIn("github", { redirectTo: `/${locale}/auth-callback` });
};

export const loginWithGoogle = async () => {
  const locale = await getLocale();
  await signIn("google", { redirectTo: `/${locale}/auth-callback` });
};

export const loginWithDiscord = async () => {
  const locale = await getLocale();
  await signIn("discord", { redirectTo: `/${locale}/auth-callback` });
};

export const logout = async () => {
  await signOut({ redirect: false });
};
