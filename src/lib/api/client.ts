import Cookies from "js-cookie";
import type {
  ApiErrorBody,
  ApiErrorDetail,
  ApiSuccess,
  Paginated,
} from "@/types";

export const TOKEN_COOKIE = "rn_token";

const API_URL = process.env.NEXT_PUBLIC_API_URL?.replace(/\/+$/, "");

const NETWORK_ERROR_MESSAGE =
  "We couldn't reach the server. Check your connection and try again.";

export class ApiError extends Error {
  readonly status: number;
  readonly errorDetails: ApiErrorDetail[];

  /** status is 0 when the request never got a response. */
  constructor(status: number, message: string, errorDetails: ApiErrorDetail[] = []) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.errorDetails = errorDetails;
  }
}

export function isApiError(error: unknown): error is ApiError {
  return error instanceof ApiError;
}

type QueryValue = string | number | boolean | null | undefined;

export type RequestOptions = {
  method?: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
  body?: unknown;
  query?: Record<string, QueryValue>;
  /** Overrides the cookie token (e.g. right after login, or on the server). */
  token?: string;
  signal?: AbortSignal;
};

function buildUrl(path: string, query?: RequestOptions["query"]) {
  const url = new URL(`${API_URL}${path}`);

  for (const [key, value] of Object.entries(query ?? {})) {
    if (value !== undefined && value !== null && value !== "") {
      url.searchParams.set(key, String(value));
    }
  }

  return url;
}

function fallbackMessage(status: number) {
  if (status === 404) return "The requested resource was not found.";
  if (status >= 500) return "Something went wrong on our side. Please try again.";
  return "The request could not be completed.";
}

// The cookie is only readable in the browser; server calls pass `token`.
function getClientToken() {
  return typeof window === "undefined" ? undefined : Cookies.get(TOKEN_COOKIE);
}

/** The single fetch wrapper for every backend call. Throws ApiError on failure. */
export async function apiRequest<T>(
  path: string,
  { method = "GET", body, query, token, signal }: RequestOptions = {},
): Promise<ApiSuccess<T>> {
  if (!API_URL) {
    throw new ApiError(0, "The API URL is not configured.");
  }

  const headers: Record<string, string> = { Accept: "application/json" };
  const authToken = token ?? getClientToken();

  if (body !== undefined) headers["Content-Type"] = "application/json";
  if (authToken) headers.Authorization = `Bearer ${authToken}`;

  let response: Response;

  try {
    response = await fetch(buildUrl(path, query), {
      method,
      headers,
      body: body === undefined ? undefined : JSON.stringify(body),
      signal,
    });
  } catch (error) {
    // Let TanStack Query see its own cancellations.
    if (signal?.aborted) throw error;
    throw new ApiError(0, NETWORK_ERROR_MESSAGE);
  }

  const payload = (await response.json().catch(() => null)) as
    | ApiSuccess<T>
    | ApiErrorBody
    | null;

  if (!response.ok || !payload?.success) {
    const errorBody = payload && !payload.success ? payload : null;

    throw new ApiError(
      response.status,
      errorBody?.message || fallbackMessage(response.status),
      errorBody?.errorDetails ?? [],
    );
  }

  return payload;
}

type MethodOptions = Omit<RequestOptions, "method" | "body">;

export const api = {
  get: async <T>(path: string, options?: MethodOptions) =>
    (await apiRequest<T>(path, options)).data,

  /** For list endpoints that return `meta`. */
  getPaginated: async <T>(
    path: string,
    options?: MethodOptions,
  ): Promise<Paginated<T>> => {
    const { data, meta } = await apiRequest<T[]>(path, options);

    return {
      data,
      meta: meta ?? { page: 1, limit: data.length, total: data.length, totalPage: 1 },
    };
  },

  post: async <T>(path: string, body?: unknown, options?: MethodOptions) =>
    (await apiRequest<T>(path, { ...options, method: "POST", body })).data,

  put: async <T>(path: string, body?: unknown, options?: MethodOptions) =>
    (await apiRequest<T>(path, { ...options, method: "PUT", body })).data,

  patch: async <T>(path: string, body?: unknown, options?: MethodOptions) =>
    (await apiRequest<T>(path, { ...options, method: "PATCH", body })).data,

  delete: async <T>(path: string, options?: MethodOptions) =>
    (await apiRequest<T>(path, { ...options, method: "DELETE" })).data,
};
