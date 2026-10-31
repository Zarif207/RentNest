// Response envelope from the backend's sendResponse / globalErrorHandler.

export type Meta = {
  page: number;
  limit: number;
  total: number;
  totalPage: number;
  /** GET /notifications only: every unread notification, whatever the filter. */
  unreadCount?: number;
};

export type ApiSuccess<T> = {
  success: true;
  message: string;
  meta?: Meta;
  data: T;
};

export type ApiErrorDetail = {
  /** Bare field name (e.g. "email", "amenities.0"), or "" for non-field errors. */
  path: string;
  message: string;
};

export type ApiErrorBody = {
  success: false;
  message: string;
  errorDetails: ApiErrorDetail[];
};

export type Paginated<T> = {
  data: T[];
  meta: Meta;
};

/** Query params shared by every paginated list endpoint. */
export type PaginationQuery<TSortBy extends string = string> = {
  page?: number;
  limit?: number;
  sortBy?: TSortBy;
  sortOrder?: "asc" | "desc";
};
