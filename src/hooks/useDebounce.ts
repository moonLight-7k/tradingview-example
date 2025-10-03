'use client';

import { useCallback, useRef } from 'react';

export function useDebounce<T extends (...args: unknown[]) => unknown>(callback: T, delay: number): T {
    const timeoutRef = useRef<NodeJS.Timeout | null>(null);
    const callbackRef = useRef(callback);

    // Update the callback ref whenever callback changes
    callbackRef.current = callback;

    return useCallback((...args: Parameters<T>) => {
        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
        }

        timeoutRef.current = setTimeout(() => {
            callbackRef.current(...args);
        }, delay);
    }, [delay]) as T;
}