import axios from "axios";

import type { AxiosInstance, AxiosResponse, CancelTokenSource } from "axios";
import type {
  customAxiosDownloadSteamConfig,
  customAxiosRequestConfig,
  customInternalAxiosRequestConfig,
  interceptorsMap,
  requestMethods
} from "../types/types";

import { defaultConfig, isBrowser } from "../utils/utils";

class Request implements requestMethods {
  private readonly instance: AxiosInstance;
  private readonly interceptors: interceptorsMap;
  private readonly cancelTokenSourceMap: Map<string, CancelTokenSource>;
  private backupConfig: any;

  constructor({ interceptors = {}, ...config }: customAxiosRequestConfig) {
    this.instance = axios.create(config);

    this.interceptors = { ...defaultConfig, ...interceptors };
    this.cancelTokenSourceMap = new Map();

    this.useCustomInterceptors();
  }

  post<T = any>(config: customAxiosRequestConfig<T>): Promise<T> {
    return this.request({ ...config, method: "post" });
  }

  put<T = any>(config: customAxiosRequestConfig<T>): Promise<T> {
    return this.request({ ...config, method: "put" });
  }

  patch<T = any>(config: customAxiosRequestConfig<T>): Promise<T> {
    return this.request({ ...config, method: "patch" });
  }

  get<T = any>(config: customAxiosRequestConfig<T>): Promise<T> {
    return this.request({ ...config, method: "get" });
  }

  delete<T = any>(config: customAxiosRequestConfig<T>): Promise<T> {
    return this.request({ ...config, method: "delete" });
  }

  head<T = any>(config: customAxiosRequestConfig<T>): Promise<T> {
    return this.request({ ...config, method: "head" });
  }

  options<T = any>(config: customAxiosRequestConfig<T>): Promise<T> {
    return this.request({ ...config, method: "options" });
  }

  async downloadSteam(config: customAxiosDownloadSteamConfig): Promise<void> {
    return isBrowser ? await this.browserDownloadSteam(config) : await this.nodeDownloadSteam(config);
  }

  private async browserDownloadSteam(config: customAxiosDownloadSteamConfig): Promise<void> {
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
    finally {
      cancelFlag && this.cancelTokenSourceMap.delete(cancelFlag);
    }
  }

  private async nodeDownloadSteam(config: customAxiosDownloadSteamConfig): Promise<void> {
    /* eslint-disable @typescript-eslint/no-var-requires */
    const fs = require("node:fs");
    const path = require("node:path");
    const stream = require("node:stream");
    const util = require("node:util");
    const pipeline = util.promisify(stream.pipeline);
    /* eslint-enable @typescript-eslint/no-var-requires */

    const cancelFlag: string | null = this.useCancelableRequest(config);

    try {
      const res: AxiosResponse<NodeJS.ReadableStream> = await this.instance.request({ ...config, responseType: "stream" });
      const downloadPath = path.join(__dirname, "/download", config.filename);
      const writer = fs.createWriteStream(downloadPath);
      await pipeline(res.data, writer);
    }
    finally {
      cancelFlag && this.cancelTokenSourceMap.delete(cancelFlag);
    }
  }

  private async request<T = any>({ interceptors = {}, ...config }: customAxiosRequestConfig<T>): Promise<T> {
    const cancelFlag: string | null = this.useCancelableRequest(config);

    try {
      if (interceptors.before)
        config = interceptors.before(config as customInternalAxiosRequestConfig);

      let res: T = await this.instance.request<any, T>(config);

      if (interceptors.after)
        res = interceptors.after(res);

      return res;
    }
    finally {
      cancelFlag && this.cancelTokenSourceMap.delete(cancelFlag);

      if (interceptors.final)
        interceptors.final(this.backupConfig);

      if (this.interceptors.final)
        this.interceptors.final(this.backupConfig);
    }
  }

  private useCustomInterceptors(): void {
    const { interceptors: { before, after, error } } = this;

    this.backupConfigInterceptors();

    this.instance.interceptors.request.use(before, error);
    this.instance.interceptors.response.use(after, error);
  }

  private backupConfigInterceptors(): void {
    this.instance.interceptors.response.use((res) => {
      this.backupConfig = res;
      return res;
    }, this.interceptors.error);
  }

  private useCancelableRequest(config: customAxiosRequestConfig): string | null {
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
