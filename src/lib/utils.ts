import { ZH_CHAR_THRESHOLD, MAX_EXCLUDE_IDS } from './constants';
import type { Language, LocalState } from './types';

/**
 * 自动检测文本语言
 * 中文字符占比 > ZH_CHAR_THRESHOLD → 'zh'，否则 'en'
 */
export function detectLanguage(text: string): Language {
  let chineseCount = 0;
  const len = text.length;
  if (len === 0) return 'en';

  for (const char of text) {
    const code = char.codePointAt(0);
    if (code && code >= 0x4e00 && code <= 0x9fff) {
      chineseCount++;
    }
  }

  return chineseCount / len > ZH_CHAR_THRESHOLD ? 'zh' : 'en';
}

/**
 * 读取 localStorage 状态
 */
export function loadLocalState(): LocalState {
  if (typeof window === 'undefined') {
    return { excludeIds: [], lastPublishedId: null };
  }
  try {
    const raw = localStorage.getItem('ootbg_state');
    if (!raw) return { excludeIds: [], lastPublishedId: null };
    return JSON.parse(raw);
  } catch {
    return { excludeIds: [], lastPublishedId: null };
  }
}

/**
 * 保存 localStorage 状态
 */
export function saveLocalState(state: LocalState): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem('ootbg_state', JSON.stringify(state));
  } catch {
    // localStorage 满了或不可用，静默失败
  }
}

/**
 * 添加 opened ID，保持最多 MAX_EXCLUDE_IDS 个
 */
export function addExcludeId(currentIds: string[], newId: string): string[] {
  const filtered = currentIds.filter((id) => id !== newId);
  filtered.push(newId);
  if (filtered.length > MAX_EXCLUDE_IDS) {
    return filtered.slice(filtered.length - MAX_EXCLUDE_IDS);
  }
  return filtered;
}

/**
 * 创建 ISO 8601 时间戳（不使用 Date.now()，方便测试时传入时间）
 */
export function nowISO(): string {
  return new Date().toISOString();
}
