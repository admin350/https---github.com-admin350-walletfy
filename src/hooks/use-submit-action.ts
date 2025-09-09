
'use client';

import { useState, useCallback } from 'react';

interface UseSubmitActionOptions<T, R> {
  action: (args: T) => Promise<R>;
  onSuccess?: (result: R, args: T) => void;
  onError?: (error: Error) => void;
}

export function useSubmitAction<T, R>({
  action,
  onSuccess,
  onError,
}: UseSubmitActionOptions<T, R>) {
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const performAction = useCallback(async (args: T) => {
    setIsLoading(true);
    setIsSuccess(false);
    setError(null);
    try {
      const result = await action(args);
      setIsSuccess(true);
      if (onSuccess) {
        onSuccess(result, args);
      }
    } catch (e) {
      const err = e instanceof Error ? e : new Error('An unknown error occurred');
      setError(err);
      if (onError) {
        onError(err);
      }
    } finally {
      setIsLoading(false);
    }
  }, [action, onSuccess, onError]);

  return { performAction, isLoading, isSuccess, error };
}
