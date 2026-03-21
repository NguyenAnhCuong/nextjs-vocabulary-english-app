// src/lib/api.ts
// Base fetcher dùng chung cho mọi API call - tự đính Bearer token

import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/auth.options";

const BACKEND_URL = process.env.BACKEND_URL ?? "http://localhost:3000/api/v1";

// ── Server-side fetch (dùng trong Server Components / page.tsx) ───────────────
export async function serverFetch<T>(
  path: string,
  options: RequestInit = {},
): Promise<T> {
  const session = await getServerSession(authOptions);

  const res = await fetch(`${BACKEND_URL}${path}`, {
    ...options,
    cache: "no-store",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${session?.access_token ?? ""}`,
      ...options.headers,
    },
  });

  if (!res.ok) {
    const error = await res.json().catch(() => ({}));
    throw new Error(error?.message ?? `API error ${res.status}: ${path}`);
  }

  return res.json();
}

// ── Client-side fetch (dùng trong Client Components / hooks) ─────────────────
export async function clientFetch<T>(
  path: string,
  options: RequestInit = {},
  token?: string,
): Promise<T> {
  const res = await fetch(`/api/proxy${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  });

  if (!res.ok) {
    const error = await res.json().catch(() => ({}));
    throw new Error(error?.message ?? `API error ${res.status}`);
  }

  return res.json();
}

// ── Typed API response wrapper ────────────────────────────────────────────────
export interface ApiResponse<T> {
  statusCode: number;
  message: string;
  data: T;
}

export interface PaginatedData<T> {
  meta: {
    current: number;
    pageSize: number;
    pages: number;
    total: number;
  };
  result: T[];
}
