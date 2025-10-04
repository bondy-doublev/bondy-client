"use server";

import { signIn, signOut } from "@/auth";
import { getLocale } from "next-intl/server";

export const loginWithGithub = async () => {
  const locale = await getLocale();
  await signIn("github", {
    redirectTo: `/${locale}/auth-callback?provider=github`,
  });
};

export const loginWithGoogle = async () => {
  const locale = await getLocale();
  await signIn("google", {
    redirectTo: `/${locale}/auth-callback?provider=google`,
  });
};

export const loginWithDiscord = async () => {
  const locale = await getLocale();
  await signIn("discord", {
    redirectTo: `/${locale}/auth-callback?provider=discord`,
  });
};

export const logout = async () => {
  await signOut({ redirect: false });
};
