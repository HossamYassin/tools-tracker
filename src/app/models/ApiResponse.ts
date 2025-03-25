export interface ApiResponse<T> {
  status: string; // "success", "fail", "error"
  data?: T;
  errors?: string[];
}
