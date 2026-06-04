'use client';

import { useReducer, useCallback, useRef } from 'react';
import type {
  AppState,
  Giving,
  ReviewResult,
  OpenResponse,
  Stats,
} from '@/lib/types';
import { IS_DEMO_MODE } from '@/lib/constants';
import { useLocalStorage } from './useLocalStorage';

// ─── State ───────────────────────────────────────────

interface AppContext {
  state: AppState;
  currentGiving: Giving | null;
  composeText: string;
  aiReview: ReviewResult | null;
  error: string | null;
  stats: Stats;
}

const initialContext: AppContext = {
  state: 'closed_box',
  currentGiving: null,
  composeText: '',
  aiReview: null,
  error: null,
  stats: { boxesOpened: 0, givingsLeft: 0, sharpWordsSoftened: 0 },
};

// ─── Reducer ─────────────────────────────────────────

type Action =
  | { type: 'SET_STATE'; state: AppState }
  | { type: 'SET_GIVING'; giving: Giving }
  | { type: 'SET_REVIEW'; review: ReviewResult }
  | { type: 'SET_ERROR'; error: string }
  | { type: 'SET_COMPOSE_TEXT'; text: string }
  | { type: 'SET_STATS'; stats: Stats };

function appReducer(state: AppContext, action: Action): AppContext {
  switch (action.type) {
    case 'SET_STATE':
      return { ...state, state: action.state, error: null };
    case 'SET_GIVING':
      return { ...state, currentGiving: action.giving };
    case 'SET_REVIEW':
      return { ...state, aiReview: action.review };
    case 'SET_ERROR':
      return { ...state, state: 'error', error: action.error };
    case 'SET_COMPOSE_TEXT':
      return { ...state, composeText: action.text };
    case 'SET_STATS':
      return { ...state, stats: action.stats };
    default:
      return state;
  }
}

// ─── Hook ────────────────────────────────────────────

export function useAppState(initialStats: Stats) {
  const [ctx, dispatch] = useReducer(appReducer, {
    ...initialContext,
    stats: initialStats,
  });
  const { getExcludeIds, addExcludeId, getLastPublishedId, setLastPublishedId } =
    useLocalStorage();
  const actionLockRef = useRef(false);

  // 刷新 stats
  const refreshStats = useCallback(async () => {
    try {
      const res = await fetch('/api/stats');
      if (res.ok) {
        const stats: Stats = await res.json();
        dispatch({ type: 'SET_STATS', stats });
      }
    } catch {
      // 静默失败，保持旧 stats
    }
  }, []);

  // openBox — 打开盒子
  const openBox = useCallback(
    async (featured?: string) => {
      if (actionLockRef.current) return;
      actionLockRef.current = true;
      dispatch({ type: 'SET_STATE', state: 'opening' });

      try {
        const excludeIds = getExcludeIds();
        const params = new URLSearchParams();
        if (excludeIds.length > 0) {
          params.set('exclude_ids', excludeIds.join(','));
        }
        if (IS_DEMO_MODE && featured) {
          params.set('featured', featured);
        }

        const res = await fetch(`/api/open?${params.toString()}`);
        if (!res.ok) {
          throw new Error('Failed to open box');
        }

        const data: OpenResponse = await res.json();
        const giving: Giving = {
          id: data.id,
          content: data.content,
          language: data.language,
          sourceType: 'seed',
          helpedCount: data.helpedCount,
          createdAt: '',
          hidden: false,
        };

        addExcludeId(data.id);
        dispatch({ type: 'SET_GIVING', giving });

        // 等盒子开启动画播完
        setTimeout(() => {
          dispatch({ type: 'SET_STATE', state: 'giving_card' });
          actionLockRef.current = false;
        }, 1500);
      } catch {
        dispatch({ type: 'SET_ERROR', error: 'Failed to open the box. Please try again.' });
        actionLockRef.current = false;
      }
    },
    [getExcludeIds, addExcludeId]
  );

  // openAnother — 打开下一条
  const openAnother = useCallback(async () => {
    const featured = IS_DEMO_MODE ? getLastPublishedId() ?? undefined : undefined;
    await openBox(featured);
    await refreshStats();
  }, [openBox, getLastPublishedId, refreshStats]);

  // helpedMe — 原地点赞
  const helpedMe = useCallback(async () => {
    if (!ctx.currentGiving) return;
    try {
      const res = await fetch('/api/helped', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ givingId: ctx.currentGiving.id }),
      });
      if (res.ok) {
        const data = await res.json();
        dispatch({
          type: 'SET_GIVING',
          giving: { ...ctx.currentGiving, helpedCount: data.helpedCount },
        });
      }
    } catch {
      // 静默
    }
  }, [ctx.currentGiving]);

  // startCompose — 进入输入态
  const startCompose = useCallback(() => {
    dispatch({ type: 'SET_COMPOSE_TEXT', text: '' });
    dispatch({ type: 'SET_REVIEW', review: null as unknown as ReviewResult });
    dispatch({ type: 'SET_STATE', state: 'compose' });
  }, []);

  // setComposeText
  const setComposeText = useCallback((text: string) => {
    dispatch({ type: 'SET_COMPOSE_TEXT', text });
  }, []);

  // submitGiving — 提交审核
  const submitGiving = useCallback(
    async (text: string) => {
      dispatch({ type: 'SET_STATE', state: 'reviewing' });

      try {
        const res = await fetch('/api/submit', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ text }),
        });

        if (!res.ok) {
          const err = await res.json().catch(() => ({ error: 'Request failed' }));
          throw new Error(err.error || 'Request failed');
        }

        const review: ReviewResult = await res.json();
        dispatch({ type: 'SET_REVIEW', review });

        // 路由判断
        if (review.riskLevel === 'high' || review.qualityScore < 60) {
          dispatch({ type: 'SET_STATE', state: 'blocked' });
        } else {
          dispatch({ type: 'SET_STATE', state: 'translation_result' });
        }
      } catch (err) {
        const msg = err instanceof Error ? err.message : 'Something went wrong.';
        dispatch({ type: 'SET_ERROR', error: msg });
      }
    },
    []
  );

  // publishOriginal — low risk 发布原文
  const publishOriginal = useCallback(async () => {
    if (!ctx.aiReview) return;
    try {
      const res = await fetch('/api/publish', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content: ctx.composeText,  // 原文 — low risk 不需要改写
          language: ctx.aiReview.language,
          sourceType: 'user_original',
          softenedWordCount: 0,
        }),
      });

      if (!res.ok) {
        throw new Error('Publish failed');
      }

      const data = await res.json();
      setLastPublishedId(data.givingId);
      dispatch({ type: 'SET_STATE', state: 'published' });
      await refreshStats();
    } catch {
      dispatch({ type: 'SET_ERROR', error: 'Failed to publish. Please try again.' });
    }
  }, [ctx.aiReview, ctx.composeText, setLastPublishedId, refreshStats]);

  // publishRewrite — medium risk 发布改写
  const publishRewrite = useCallback(async () => {
    if (!ctx.aiReview) return;
    try {
      const res = await fetch('/api/publish', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content: ctx.aiReview.publishableRewrite,
          language: ctx.aiReview.language,
          sourceType: 'user_rewrite',
          softenedWordCount: ctx.aiReview.softenedWordCount,
        }),
      });

      if (!res.ok) {
        throw new Error('Publish failed');
      }

      const data = await res.json();
      setLastPublishedId(data.givingId);
      dispatch({ type: 'SET_STATE', state: 'published' });
      await refreshStats();
    } catch {
      dispatch({ type: 'SET_ERROR', error: 'Failed to publish. Please try again.' });
    }
  }, [ctx.aiReview, setLastPublishedId, refreshStats]);

  // tryAgain — 回到 compose
  const tryAgain = useCallback(() => {
    dispatch({ type: 'SET_STATE', state: 'compose' });
  }, []);

  return {
    // 状态（只读）
    state: ctx.state,
    currentGiving: ctx.currentGiving,
    composeText: ctx.composeText,
    aiReview: ctx.aiReview,
    error: ctx.error,
    stats: ctx.stats,
    // actions
    openBox: () => openBox(),
    openAnother,
    helpedMe,
    startCompose,
    setComposeText,
    submitGiving,
    publishOriginal,
    publishRewrite,
    tryAgain,
  };
}
