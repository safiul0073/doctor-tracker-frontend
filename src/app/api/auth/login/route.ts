import { NextRequest, NextResponse } from "next/server";
import { getBackendApiUrl, setAuthCookie } from "@/lib/backend";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const backendRes = await fetch(`${getBackendApiUrl()}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
      cache: "no-store",
    });

    const data = await backendRes.json().catch(() => ({
      success: false,
      message: "Invalid response from authentication service",
    }));

    if (!backendRes.ok) {
      return NextResponse.json(data, { status: backendRes.status });
    }

    const token: string | undefined = data?.data?.token;
    const user = data?.data?.user;

    const response = NextResponse.json(
      {
        success: true,
        message: data.message || "Logged in successfully",
        data: { user },
      },
      { status: 200 }
    );

    if (token) {
      setAuthCookie(response, token);
    }

    return response;
  } catch {
    return NextResponse.json(
      {
        success: false,
        message: "Unable to connect to authentication server. Ensure backend is running.",
      },
      { status: 503 }
    );
  }
}
