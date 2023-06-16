import type { AnyMap, AxiosError, InterceptorsMap } from "../types/types";

export const tipKey = Symbol("tips");

export const defaultConfig: InterceptorsMap = {
  before: [before => before],
  after: [after => after],
  error: [],
  finally: []
};

export function isBrowser(): boolean {
  return typeof window !== "undefined" && typeof window.document !== "undefined";
}

export function runQueue<T>(queue: Function[], config: any): T | undefined | null {
  return queue.reduce((result, fn) => fn(result), config);
}

export function createTipsMap(str: string): AnyMap {
  return { [tipKey]: str };
}

export function errorFn(error: AxiosError): Promise<never> {
  return Promise.reject(error);
}
