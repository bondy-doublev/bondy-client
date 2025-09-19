import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const body = await req.json();
  const { accessToken, refreshToken } = body;

  const response = NextResponse.json({ message: "Set cookie success" });

  response.cookies.set("token", accessToken, {
    httpOnly: true,
    path: "/",
    maxAge: 60 * 60 * 24,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
  });

  response.cookies.set("refreshToken", refreshToken, {
    httpOnly: true,
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
  });

  return response;
}
