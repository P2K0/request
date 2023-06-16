import axios from "axios";

import type {
  AxiosError,
  AxiosInstance,
  AxiosResponse,
  CancelTokenSource,
  CustomAxiosDownloadSteamConfig,
  CustomAxiosRequestConfig,
  CustomAxiosResponse,
  CustomInternalAxiosRequestConfig,
  ErrorType,
  IRequest,
  InterceptorsMap
} from "../types/types";

import { createTipsMap, defaultConfig, errorFn, isBrowser, runQueue } from "../utils/utils";

class Request implements IRequest {
  private readonly instance: AxiosInstance;
  private readonly interceptors: InterceptorsMap;
  private readonly cancelTokenSourceMap: Map<string, CancelTokenSource>;
  private backupConfig: any;

  constructor(config: CustomAxiosRequestConfig) {
    this.instance = axios.create(config);

    this.interceptors = defaultConfig;
    this.cancelTokenSourceMap = new Map();

    this.useCustomInterceptors();
  }

  before(callback: (config: CustomInternalAxiosRequestConfig) => CustomInternalAxiosRequestConfig): Request {
    this.interceptors.before.push(callback);

    return this;
  }

  after(callback: (res: CustomAxiosResponse) => CustomAxiosResponse): Request {
    this.interceptors.after.push(callback);

    return this;
  }

  error(callback: (res: AxiosError) => void): Request {
    this.interceptors.error.push(callback);

    return this;
  }

  finally(callback: (err: AxiosError, res: CustomAxiosResponse) => void): Request {
    this.interceptors.finally.push(callback);

    return this;
  }

  post<T = any>(config: CustomAxiosRequestConfig): Promise<T> {
    return this.request({ ...config, method: "post" });
  }

  put<T = any>(config: CustomAxiosRequestConfig): Promise<T> {
    return this.request({ ...config, method: "put" });
  }

  patch<T = any>(config: CustomAxiosRequestConfig): Promise<T> {
    return this.request({ ...config, method: "patch" });
  }

  get<T = any>(config: CustomAxiosRequestConfig): Promise<T> {
    return this.request({ ...config, method: "get" });
  }

  delete<T = any>(config: CustomAxiosRequestConfig): Promise<T> {
    return this.request({ ...config, method: "delete" });
  }

  head<T = any>(config: CustomAxiosRequestConfig): Promise<T> {
    return this.request({ ...config, method: "head" });
  }

  options<T = any>(config: CustomAxiosRequestConfig): Promise<T> {
    return this.request({ ...config, method: "options" });
  }

  async downloadSteam(config: CustomAxiosDownloadSteamConfig): Promise<void | ErrorType> {
    return isBrowser() ? await this.browserDownloadSteam(config) : await this.nodeDownloadSteam(config);
  }

  async request<T = any>(config: CustomAxiosRequestConfig): Promise<T> {
    const cancelFlag: string | null = this.useCancelableRequest(config);
    let backError;

    try {
      return await this.instance.request<any, T>(config);
    }
    catch (error: ErrorType) {
      backError = error;
      for await (const cb of this.interceptors.error) cb(error);

      return error;
    }
    finally {
      cancelFlag && this.cancelTokenSourceMap.delete(cancelFlag);

      for await (const cb of this.interceptors.finally) cb(backError, this.backupConfig);
    }
  }

  private async browserDownloadSteam(config: CustomAxiosDownloadSteamConfig): Promise<void | ErrorType> {
    const cancelFlag: string | null = this.useCancelableRequest(config);

    try {
      const res: AxiosResponse<Blob> = await axios({ ...config, responseType: "blob" });
      const blob: string = window.URL.createObjectURL(new Blob([res?.data]));
      const link: HTMLAnchorElement = document.createElement("a");
      link.href = blob;
      link.setAttribute("download", config.filename);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
    catch (error: ErrorType) {
      return error;
    }
    finally {
      cancelFlag && this.cancelTokenSourceMap.delete(cancelFlag);
    }
  }

  private async nodeDownloadSteam(config: CustomAxiosDownloadSteamConfig): Promise<void | ErrorType> {
    /* eslint-disable @typescript-eslint/no-var-requires */
    const fs = require("node:fs");
    const path = require("node:path");
    const stream = require("node:stream");
    const util = require("node:util");
    const pipeline = util.promisify(stream.pipeline);
    /* eslint-enable @typescript-eslint/no-var-requires */

    const cancelFlag: string | null = this.useCancelableRequest(config);

    try {
      const res: AxiosResponse<NodeJS.ReadableStream> = await this.instance.request({
        ...config,
        responseType: "stream"
      });
      const downloadPath = config.filePath || path.join(__dirname, "/downloads", config.filename);
      const writer = fs.createWriteStream(downloadPath);
      await pipeline(res.data, writer);
    }
    catch (error: ErrorType) {
      return error;
    }
    finally {
      cancelFlag && this.cancelTokenSourceMap.delete(cancelFlag);
    }
  }

  private useCustomInterceptors(): void {
    const {
      instance: {
        interceptors: { request, response }
      },
      interceptors: { before, after }
    } = this;

    request.use((config) => {
      const result: CustomInternalAxiosRequestConfig | undefined | null = runQueue<CustomInternalAxiosRequestConfig>(
        before,
        config
      );

      return result || Promise.reject(Object.assign(config, createTipsMap("未通过前置拦截")));
    }, errorFn);

    response.use((config) => {
      const result: CustomAxiosResponse | undefined | null = runQueue<CustomAxiosResponse>(after, config);

      return result || Promise.reject(Object.assign(config, createTipsMap("未通过后置拦截")));
    }, errorFn);

    this.backupConfigInterceptors();
  }

  private backupConfigInterceptors(): void {
    this.instance.interceptors.response.use((backup) => {
      this.backupConfig = backup;

      return backup;
    }, errorFn);
  }

  private useCancelableRequest(config: CustomAxiosRequestConfig): string | null {
    const cancelFlag: string = JSON.stringify(config);

    if (!config.cancelable)
      return null;

    if (this.cancelTokenSourceMap.has(cancelFlag)) {
      this.cancelTokenSourceMap.get(cancelFlag)!.cancel();
    }
    else {
      const source: CancelTokenSource = axios.CancelToken.source();
      config.cancelToken = source.token;
      this.cancelTokenSourceMap.set(cancelFlag, source);
    }

    return cancelFlag;
  }
}

export default Request;
