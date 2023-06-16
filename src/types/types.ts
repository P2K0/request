import type {
  AxiosError,
  AxiosInstance,
  AxiosRequestConfig,
  AxiosResponse,
  CancelTokenSource,
  InternalAxiosRequestConfig
} from "axios";

interface AnyMap {
  [key: string | number | symbol]: any
}

interface CancelableMap {
  cancelable?: Boolean
}

interface CustomInternalAxiosRequestConfig extends InternalAxiosRequestConfig, AnyMap {
}

interface CustomAxiosResponse extends AxiosResponse, AnyMap {
}

interface CustomAxiosRequestConfig extends AxiosRequestConfig, CancelableMap {
}

interface CustomAxiosDownloadSteamConfig extends AxiosRequestConfig, CancelableMap {
  filename: string
  filePath?: string
}

interface InterceptorsMap<T = CustomAxiosResponse> {
  before: ((config: CustomInternalAxiosRequestConfig) => CustomInternalAxiosRequestConfig)[]

  after: ((res: T) => T)[]

  error: ((err: AxiosError) => void)[]

  finally: ((err: AxiosError, res: T) => void)[]
}

interface RequestMethods {
  request<T = any>(config: CustomAxiosRequestConfig): Promise<T>

  get<T = any>(config: CustomAxiosRequestConfig): Promise<T>

  post<T = any>(config: CustomAxiosRequestConfig): Promise<T>

  put<T = any>(config: CustomAxiosRequestConfig): Promise<T>

  patch<T = any>(config: CustomAxiosRequestConfig): Promise<T>

  delete<T = any>(config: CustomAxiosRequestConfig): Promise<T>

  head<T = any>(config: CustomAxiosRequestConfig): Promise<T>

  options<T = any>(config: CustomAxiosRequestConfig): Promise<T>

  downloadSteam(config: CustomAxiosDownloadSteamConfig): Promise<void>
}

interface IRequest extends RequestMethods {
  before(callback: (config: CustomInternalAxiosRequestConfig) => CustomInternalAxiosRequestConfig): IRequest

  after(callback: (res: CustomAxiosResponse) => CustomAxiosResponse): IRequest

  error(callback: (err: AxiosError) => void): IRequest

  finally(callback: (err: AxiosError, res: CustomAxiosResponse) => void): IRequest
}

type ErrorType = AxiosError | Error | any;

export type {
  AnyMap,
  AxiosError,
  AxiosInstance,
  AxiosResponse,
  CancelableMap,
  CancelTokenSource,
  CustomAxiosDownloadSteamConfig,
  CustomAxiosRequestConfig,
  CustomAxiosResponse,
  CustomInternalAxiosRequestConfig,
  ErrorType,
  InterceptorsMap,
  IRequest,
  RequestMethods
};
