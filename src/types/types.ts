import type { AxiosError, AxiosRequestConfig, AxiosResponse, InternalAxiosRequestConfig } from "axios";

export interface interceptorsMap<T = AxiosResponse> {
  before?: (config: customInternalAxiosRequestConfig) => customInternalAxiosRequestConfig
  after?: (res: T) => T
  error?: (err: AxiosError) => void
  final?: (res: T) => void
}

export interface customInternalAxiosRequestConfig extends InternalAxiosRequestConfig {
  [key: string]: any
}

export interface customAxiosRequestConfig<T = AxiosResponse> extends AxiosRequestConfig {
  interceptors?: interceptorsMap<T>
  cancelable?: Boolean
}

export interface customAxiosDownloadSteamConfig<T = AxiosResponse> extends AxiosRequestConfig {
  cancelable?: Boolean
  filename: string
}

export interface requestMethods {
  post<T = any>(config: customAxiosRequestConfig<T>): Promise<T>
  put<T = any>(config: customAxiosRequestConfig<T>): Promise<T>
  patch<T = any>(config: customAxiosRequestConfig<T>): Promise<T>
  get<T = any>(config: customAxiosRequestConfig<T>): Promise<T>
  delete<T = any>(config: customAxiosRequestConfig<T>): Promise<T>
  head<T = any>(config: customAxiosRequestConfig<T>): Promise<T>
  options<T = any>(config: customAxiosRequestConfig<T>): Promise<T>
  downloadSteam(config: customAxiosDownloadSteamConfig): Promise<void>
}
