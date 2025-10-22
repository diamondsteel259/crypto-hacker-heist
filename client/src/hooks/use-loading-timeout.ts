import { useState, useEffect } from 'react';

interface UseLoadingTimeoutOptions {
  isLoading: boolean;
  timeoutMs?: number;
}

/**
 * Hook to detect when loading takes too long and show helpful UI
 * @param isLoading - Whether the query/operation is loading
 * @param timeoutMs - Time in ms before showing "still loading" message (default: 5000)
 * @returns isTimedOut - Whether the loading has exceeded the timeout
 */
export function useLoadingTimeout({ isLoading, timeoutMs = 5000 }: UseLoadingTimeoutOptions) {
  const [isTimedOut, setIsTimedOut] = useState(false);

  useEffect(() => {
    if (!isLoading) {
      setIsTimedOut(false);
      return;
    }

    const timer = setTimeout(() => {
      setIsTimedOut(true);
    }, timeoutMs);

    return () => clearTimeout(timer);
  }, [isLoading, timeoutMs]);

  return isTimedOut;
}
