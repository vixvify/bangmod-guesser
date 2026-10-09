import "client-only";
import axios, {
  AxiosInstance,
  AxiosRequestConfig,
  AxiosError,
  AxiosResponse,
} from "axios";
import { config } from "@/lib/config";
import { ApiResponse } from "@/infrastructure/interface/response";

let http: AxiosInstance | undefined;

function getHttp(): AxiosInstance {
  http ??= axios.create({
    baseURL: config.apiUrl,
    withCredentials: true,
    headers: { "Content-Type": "application/json" },
    timeout: 40000,
  });
  return http;
}

export class HttpError extends Error {
  constructor(message: string, public readonly status?: number) {
    super(message);
    this.name = "HttpError";
  }
}

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

    throw new HttpError(
      errorData?.error ||
        errorData?.message ||
        axiosError.message ||
        "An unexpected error occurred",
      axiosError.response?.status,
    );
  }
};

export const httpClient = {
  get: <T>(url: string, config?: AxiosRequestConfig) =>
    handleRequest<T>(() => getHttp().get(url, config)),

  post: <T>(url: string, data?: unknown, config?: AxiosRequestConfig) =>
    handleRequest<T>(() => getHttp().post(url, data, config)),

  put: <T>(url: string, data?: unknown, config?: AxiosRequestConfig) =>
    handleRequest<T>(() => getHttp().put(url, data, config)),

  delete: <T>(url: string, config?: AxiosRequestConfig) =>
    handleRequest<T>(() => getHttp().delete(url, config)),

  patch: <T>(url: string, data?: unknown, config?: AxiosRequestConfig) =>
    handleRequest<T>(() => getHttp().patch(url, data, config)),
};

export default httpClient;
