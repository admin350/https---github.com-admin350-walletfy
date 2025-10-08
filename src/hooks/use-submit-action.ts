
'use client';
import { useState, useCallback } from 'react';

interface UseSubmitActionProps<T> {
  action: (values: T) => Promise<void>;
  onSuccess?: () => void;
  onError?: (error: Error) => void;
}

export function useSubmitAction<T>({ action, onSuccess, onError }: UseSubmitActionProps<T>) {
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const performAction = useCallback(async (values: T) => {
    setIsLoading(true);
    setIsSuccess(false);
    try {
      await action(values);
      setIsSuccess(true);
      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      const err = error instanceof Error ? error : new Error('An unknown error occurred');
      if (onError) {
        onError(err);
      }
    } finally {
      setIsLoading(false);
    }
  }, [action, onSuccess, onError]);

  return { performAction, isLoading, isSuccess };
}
