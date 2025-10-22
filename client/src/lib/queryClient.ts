import { QueryClient, QueryFunction } from "@tanstack/react-query";
import { getTelegramInitData } from "./user";

async function throwIfResNotOk(res: Response) {
  if (!res.ok) {
    const text = (await res.text()) || res.statusText;
    throw new Error(`${res.status}: ${text}`);
  }
}

function getAuthHeaders(): HeadersInit {
  const initData = getTelegramInitData();
  const headers: HeadersInit = {};
  
  if (initData) {
    headers['X-Telegram-Init-Data'] = initData;
  }
  
  return headers;
}

export async function apiRequest(
  method: string,
  url: string,
  data?: unknown | undefined,
): Promise<Response> {
  const headers: HeadersInit = {
    ...getAuthHeaders(),
    ...(data ? { "Content-Type": "application/json" } : {}),
  };

  const res = await fetch(url, {
    method,
    headers,
    body: data ? JSON.stringify(data) : undefined,
    credentials: "include",
  });

  await throwIfResNotOk(res);
  return res;
}

type UnauthorizedBehavior = "returnNull" | "throw";
export const getQueryFn: <T>(options: {
  on401: UnauthorizedBehavior;
}) => QueryFunction<T> =
  ({ on401: unauthorizedBehavior }) =>
  async ({ queryKey }) => {
    const res = await fetch(queryKey.join("/") as string, {
      headers: getAuthHeaders(),
      credentials: "include",
    });

    if (unauthorizedBehavior === "returnNull" && res.status === 401) {
      return null;
    }

    await throwIfResNotOk(res);
    return await res.json();
  };

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      queryFn: getQueryFn({ on401: "throw" }),
      refetchInterval: 60000, // 1 minute for stale data
      refetchOnWindowFocus: 'always', // Important for Telegram mini apps that are often backgrounded
      staleTime: Infinity,
      retry: (failureCount, error: any) => {
        // Don't retry on 401, 403, 404 (auth/permission/not found errors)
        if (error?.message?.includes('401') || 
            error?.message?.includes('403') || 
            error?.message?.includes('404')) {
          return false;
        }
        
        // Always retry network errors (even after 3 attempts)
        if (error?.message?.toLowerCase().includes('network') || 
            error?.message?.toLowerCase().includes('fetch')) {
          return failureCount < 5;
        }
        
        // Retry other errors up to 3 times
        return failureCount < 3;
      },
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000), // 1s, 2s, 4s, ..., max 30s
      retryOnMount: true, // Retry failed queries when component remounts
    },
    mutations: {
      retry: false, // Mutations should not auto-retry
    },
  },
});
