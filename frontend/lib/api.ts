/**
 * Authenticated API client for calling the FastAPI backend.
 *
 * Usage:
 *   import { apiFetch } from "@/lib/api";
 *
 *   // In a server component or server action:
 *   const data = await apiFetch<MyType>("/environmental/emission-factors");
 *
 *   // In a client component (pass the accessToken from useSession):
 *   const data = await apiFetch<MyType>("/environmental/emission-factors", {}, token);
 */

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1";

export class ApiError extends Error {
  status: number;
  detail: string;

  constructor(status: number, detail: string) {
    super(detail);
    this.name = "ApiError";
    this.status = status;
    this.detail = detail;
  }
}

/**
 * Generic fetch wrapper for the FastAPI backend.
 *
 * @param endpoint - API path (e.g., "/environmental/emission-factors")
 * @param options  - Standard RequestInit options
 * @param token    - Optional access token (if not provided, request is unauthenticated)
 */
export async function apiFetch<T>(
  endpoint: string,
  options: RequestInit = {},
  token?: string
): Promise<T> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const res = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers,
    credentials: "include",
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({ detail: res.statusText }));
    throw new ApiError(res.status, body.detail || res.statusText);
  }

  // 204 No Content
  if (res.status === 204) {
    return undefined as T;
  }

  return res.json();
}
