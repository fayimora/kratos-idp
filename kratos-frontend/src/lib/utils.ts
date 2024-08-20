import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import {
  Configuration,
  FrontendApi,
  UiNode,
  UiNodeInputAttributes,
} from "@ory/client";

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
  redirect?: string;
};

export function getInputAttributeValue(
  nodes: UiNode[] | undefined,
  name: string,
) {
  if (!nodes) return "";
  const inputNodes = nodes.filter((n) => n.type === "input");
  const nodeAttributes = inputNodes?.find(
    (n) => (n.attributes as UiNodeInputAttributes).name === name,
  )?.attributes as UiNodeInputAttributes;
  return nodeAttributes.value as string;
}
