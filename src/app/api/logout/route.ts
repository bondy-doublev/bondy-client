import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { logout } from "@/lib/actions/auth";

export async function POST() {
  const response = NextResponse.json({ message: "Logged out" });
  const session = await auth();
  if (session) {
    await logout();
  }

  response.cookies.set("token", "", {
    httpOnly: true,
    path: "/",
    maxAge: 0,
  });

  response.cookies.set("refreshToken", "", {
    httpOnly: true,
    path: "/",
    maxAge: 0,
  });

  return response;
}
