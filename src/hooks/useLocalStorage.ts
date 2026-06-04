'use client';

import { useCallback, useRef } from 'react';
import { LS_KEY, MAX_EXCLUDE_IDS } from '@/lib/constants';
import type { LocalState } from '@/lib/types';

interface UseLocalStorageReturn {
  getExcludeIds: () => string[];
  addExcludeId: (id: string) => void;
  getLastPublishedId: () => string | null;
  setLastPublishedId: (id: string | null) => void;
}

export function useLocalStorage(): UseLocalStorageReturn {
  const ref = useRef<LocalState | null>(null);

  const load = useCallback((): LocalState => {
    if (typeof window === 'undefined') {
      return { excludeIds: [], lastPublishedId: null };
    }
    try {
      const raw = localStorage.getItem(LS_KEY);
      if (!raw) return { excludeIds: [], lastPublishedId: null };
      return JSON.parse(raw);
    } catch {
      return { excludeIds: [], lastPublishedId: null };
    }
  }, []);

  const save = useCallback(
    (state: LocalState) => {
      if (typeof window === 'undefined') return;
      try {
        localStorage.setItem(LS_KEY, JSON.stringify(state));
        ref.current = state;
      } catch {
        // 静默失败
      }
    },
    []
  );

  const getExcludeIds = useCallback((): string[] => {
    const state = load();
    return state.excludeIds;
  }, [load]);

  const addExcludeId = useCallback(
    (id: string) => {
      const state = load();
      const filtered = state.excludeIds.filter((x) => x !== id);
      filtered.push(id);
      if (filtered.length > MAX_EXCLUDE_IDS) {
        state.excludeIds = filtered.slice(filtered.length - MAX_EXCLUDE_IDS);
      } else {
        state.excludeIds = filtered;
      }
      save(state);
    },
    [load, save]
  );

  const getLastPublishedId = useCallback((): string | null => {
    const state = load();
    return state.lastPublishedId;
  }, [load]);

  const setLastPublishedId = useCallback(
    (id: string | null) => {
      const state = load();
      state.lastPublishedId = id;
      save(state);
    },
    [load, save]
  );

  return {
    getExcludeIds,
    addExcludeId,
    getLastPublishedId,
    setLastPublishedId,
  };
}
