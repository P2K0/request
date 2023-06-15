import type { interceptorsMap } from "../types/types";

export const defaultConfig: interceptorsMap = {
  before: config => config,
  after: res => res
};

export const isBrowser: boolean = typeof window !== "undefined";
