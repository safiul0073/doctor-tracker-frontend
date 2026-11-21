import { NextRequest, NextResponse } from "next/server";
import { clearAuthCookie, COOKIE_NAME, getBackendApiUrl } from "@/lib/backend";

export async function GET(request: NextRequest) {
  const token = request.cookies.get(COOKIE_NAME)?.value;

  if (!token) {
    return NextResponse.json(
      { success: false, message: "Not authenticated" },
      { status: 401 }
    );
  }

  try {
    const backendRes = await fetch(`${getBackendApiUrl()}/auth/me`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      cache: "no-store",
    });

    const data = await backendRes.json().catch(() => ({}));

    if (!backendRes.ok) {
      const response = NextResponse.json(
        { success: false, message: data.message || "Session expired" },
        { status: backendRes.status }
      );
      if (backendRes.status === 401) {
        clearAuthCookie(response);
      }
      return response;
    }

    return NextResponse.json(data, { status: 200 });
  } catch {
    return NextResponse.json(
      { success: false, message: "Backend service unavailable" },
      { status: 503 }
    );
  }
}
