// lib/api-response.ts
// Standardised response helpers for all API route handlers.

import { NextResponse } from "next/server";

export type ApiSuccess<T = unknown> = {
  success: true;
  data: T;
  message?: string;
  meta?: {
    page?: number;
    pageSize?: number;
    total?: number;
    totalPages?: number;
  };
};

export type ApiError = {
  success: false;
  error: string;
  code?: string;
};

// ─── Success helpers ──────────────────────────────────────────────────────────

export function ok<T>(data: T, message?: string, status = 200): NextResponse<ApiSuccess<T>> {
  return NextResponse.json({ success: true, data, message }, { status });
}

export function created<T>(data: T, message = "Created successfully"): NextResponse<ApiSuccess<T>> {
  return NextResponse.json({ success: true, data, message }, { status: 201 });
}

export function withMeta<T>(
  data: T,
  meta: ApiSuccess<T>["meta"],
  message?: string
): NextResponse<ApiSuccess<T>> {
  return NextResponse.json({ success: true, data, meta, message }, { status: 200 });
}

// ─── Error helpers ────────────────────────────────────────────────────────────

export function badRequest(error: string): NextResponse<ApiError> {
  return NextResponse.json({ success: false, error }, { status: 400 });
}

export function unauthorized(error = "Unauthorized"): NextResponse<ApiError> {
  return NextResponse.json({ success: false, error }, { status: 401 });
}

export function forbidden(error = "Forbidden"): NextResponse<ApiError> {
  return NextResponse.json({ success: false, error }, { status: 403 });
}

export function notFound(resource = "Resource"): NextResponse<ApiError> {
  return NextResponse.json(
    { success: false, error: `${resource} not found` },
    { status: 404 }
  );
}

export function serverError(err: unknown): NextResponse<ApiError> {
  const message = err instanceof Error ? err.message : "Internal server error";
  console.error("[API Error]", err);
  return NextResponse.json({ success: false, error: message }, { status: 500 });
}

// ─── Pagination helper ────────────────────────────────────────────────────────

export function parsePagination(searchParams: URLSearchParams) {
  const page = Math.max(1, parseInt(searchParams.get("page") ?? "1", 10));
  const pageSize = Math.min(100, Math.max(1, parseInt(searchParams.get("pageSize") ?? "20", 10)));
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;
  return { page, pageSize, from, to };
}
