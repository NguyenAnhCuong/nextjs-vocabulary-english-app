// src/app/api/proxy/[...path]/route.ts
// Proxy route: Next.js client → /api/proxy/... → NestJS backend
// Tự đính Bearer token từ session

import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/auth.options";
import { NextRequest, NextResponse } from "next/server";

const BACKEND_URL = process.env.BACKEND_URL ?? "http://localhost:8000/api/v1";

// src/app/api/proxy/[...path]/route.ts

async function handler(
  req: NextRequest,
  // 1. Cập nhật Type: params bây giờ là một Promise
  context: { params: Promise<{ path: string[] }> },
) {
  const session = await getServerSession(authOptions);

  // 2. Unwrapping params bằng await
  const { path: pathArray } = await context.params;

  // Kiểm tra nếu pathArray tồn tại trước khi join
  const path = pathArray?.join("/") ?? "";
  const search = req.nextUrl.search;
  const backendUrl = `${BACKEND_URL}/${path}${search}`;

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };

  if (session?.access_token) {
    headers["Authorization"] = `Bearer ${session.access_token}`;
  }

  // Giữ nguyên phần xử lý body và fetch...
  const body =
    req.method !== "GET" && req.method !== "HEAD"
      ? await req.text()
      : undefined;

  const backendRes = await fetch(backendUrl, {
    method: req.method,
    headers,
    body,
  });

  const data = await backendRes.json().catch(() => null);
  return NextResponse.json(data, { status: backendRes.status });
}

export const GET = handler;
export const POST = handler;
export const PUT = handler;
export const PATCH = handler;
export const DELETE = handler;
