import "client-only";
import axios, {
  AxiosInstance,
  AxiosRequestConfig,
  AxiosError,
  AxiosResponse,
} from "axios";
import { config } from "@/config";
import { ApiResponse } from "@/infrastructure/interface/response";

const http: AxiosInstance = axios.create({
  baseURL: config.apiUrl,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 40000,
});

const handleRequest = async <T>(
  requestFn: () => Promise<AxiosResponse<ApiResponse<T>>>,
): Promise<ApiResponse<T>> => {
  try {
    const response = await requestFn();
    return {
      data: response.data.data,
      status: response.data.status,
      statusCode: response.data?.statusCode || "SUCCESS",
    };
  } catch (error) {
    const axiosError = error as AxiosError<ApiResponse<T>>;
    const errorData = axiosError.response?.data;

    throw new Error(
      errorData?.error ||
        errorData?.message ||
        axiosError.message ||
        "An unexpected error occurred",
    );
  }
};

export const httpClient = {
  get: <T>(url: string, config?: AxiosRequestConfig) =>
    handleRequest<T>(() => http.get(url, config)),

  post: <T>(url: string, data?: unknown, config?: AxiosRequestConfig) =>
    handleRequest<T>(() => http.post(url, data, config)),

  put: <T>(url: string, data?: unknown, config?: AxiosRequestConfig) =>
    handleRequest<T>(() => http.put(url, data, config)),

  delete: <T>(url: string, config?: AxiosRequestConfig) =>
    handleRequest<T>(() => http.delete(url, config)),

  patch: <T>(url: string, data?: unknown, config?: AxiosRequestConfig) =>
    handleRequest<T>(() => http.patch(url, data, config)),
};

export default httpClient;
