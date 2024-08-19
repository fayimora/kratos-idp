import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { Configuration, FrontendApi } from "@ory/client";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const kratos = new FrontendApi(
  new Configuration({
    basePath: import.meta.env.VITE_KRATOS_BASE_URL,
    baseOptions: {
      withCredentials: true, // we need to include cookies
    },
  }),
);

export type KratosFlowSearchParams = {
  flow?: string;
  verifiable_address?: string;
  code?: string;
};
