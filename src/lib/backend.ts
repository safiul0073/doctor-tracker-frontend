import type { NextResponse } from "next/server";

export const COOKIE_NAME = "dt_token";

export function getBackendApiUrl(): string {
  const raw = process.env.BACKEND_API_URL || "http://localhost:5001/api/v1";
  return raw.replace(/\/+$/, "");
}

export function setAuthCookie(response: NextResponse, token: string): void {
  response.cookies.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 7 * 24 * 60 * 60,
  });
}

export function clearAuthCookie(response: NextResponse): void {
  response.cookies.set(COOKIE_NAME, "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  });
}
