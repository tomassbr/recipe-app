"use client";

import { useEffect, useState, type Dispatch, type SetStateAction } from "react";

/**
 * Generic JSON `localStorage` state. Hydrates after mount (SSR-safe).
 */
export function useLocalStorage<T>(
  key: string,
  initialValue: T
): readonly [T, Dispatch<SetStateAction<T>>, boolean] {
  const [state, setState] = useState<T>(initialValue);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(key);
      if (raw != null) {
        setState(JSON.parse(raw) as T);
      }
    } catch {
      /* ignore */
    }
    setHydrated(true);
  }, [key]);

  useEffect(() => {
    if (!hydrated) return;
    try {
      localStorage.setItem(key, JSON.stringify(state));
    } catch {
      /* quota */
    }
  }, [key, state, hydrated]);

  return [state, setState, hydrated] as const;
}
