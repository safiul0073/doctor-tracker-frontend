import { NextRequest, NextResponse } from "next/server";
import { clearAuthCookie, COOKIE_NAME, getBackendApiUrl } from "@/lib/backend";

async function proxyRequest(
  request: NextRequest,
  context: { params: Promise<{ path: string[] }> }
) {
  const { path } = await context.params;
  const token = request.cookies.get(COOKIE_NAME)?.value;

  const targetUrl = new URL(`${getBackendApiUrl()}/${path.join("/")}`);
  request.nextUrl.searchParams.forEach((value, key) => {
    targetUrl.searchParams.append(key, value);
  });

  const headers: Record<string, string> = {
    Accept: "application/json",
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  let body: string | undefined;
  if (!["GET", "HEAD"].includes(request.method)) {
    const contentType = request.headers.get("content-type");
    if (contentType) {
      headers["Content-Type"] = contentType;
    }
    body = await request.text();
  }

  try {
    const backendRes = await fetch(targetUrl.toString(), {
      method: request.method,
      headers,
      body: body && body.length > 0 ? body : undefined,
      cache: "no-store",
    });

    const responseText = await backendRes.text();
    let parsed: unknown;
    try {
      parsed = responseText ? JSON.parse(responseText) : {};
    } catch {
      parsed = { success: backendRes.ok, message: responseText };
    }

    const res = NextResponse.json(parsed, { status: backendRes.status });

    if (backendRes.status === 401) {
      clearAuthCookie(res);
    }

    return res;
  } catch {
    return NextResponse.json(
      {
        success: false,
        message: "Unable to reach backend API server.",
      },
      { status: 503 }
    );
  }
}

export const GET = proxyRequest;
export const POST = proxyRequest;
export const PUT = proxyRequest;
export const PATCH = proxyRequest;
export const DELETE = proxyRequest;
