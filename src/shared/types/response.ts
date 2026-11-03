export interface ApiResponse<T> {
  data: T;
  status: number;
  statusCode?: string;
  error?: string;
  message?: string;
}