"use client";

import {
  useQuery,
  useMutation,
  useQueryClient,
  UseQueryOptions,
  UseMutationOptions,
} from "@tanstack/react-query";
import { getJson, postJson, patchJson, ApiError } from "@/lib/api";
import { useAppStore } from "@/store/useAppStore";

export function useApiQuery<T>(
  path: string | null,
  options?: Omit<UseQueryOptions<T, ApiError>, "queryKey" | "queryFn">
) {
  const authToken = useAppStore((state) => state.authToken);

  return useQuery<T, ApiError>({
    queryKey: [path],
    queryFn: async () => {
      if (!path) throw new Error("No path provided");
      return getJson<T>(path, authToken);
    },
    enabled: !!path && (options?.enabled ?? true),
    ...options,
  });
}

export function useApiMutation<TData, TVariables = unknown>(
  method: "POST" | "PATCH",
  path: string,
  options?: Omit<UseMutationOptions<TData, ApiError, TVariables>, "mutationFn">
) {
  const authToken = useAppStore((state) => state.authToken);
  const queryClient = useQueryClient();

  return useMutation<TData, ApiError, TVariables>({
    mutationFn: async (variables) => {
      if (method === "POST") {
        return postJson<TData>(path, variables, authToken);
      } else {
        return patchJson<TData>(path, variables, authToken);
      }
    },
    ...options,
  });
}
