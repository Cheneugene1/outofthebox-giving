// 共享类型定义

// === Giving ===
export interface Giving {
  id: string;
  content: string;
  language: 'en' | 'zh';
  sourceType: 'seed' | 'user_original' | 'user_rewrite';
  helpedCount: number;
  createdAt: string;
  hidden: boolean;
}

// === Event ===
export type EventType = 'open_box' | 'helped' | 'submitted' | 'published' | 'softened';

export interface Event {
  id: string;
  type: EventType;
  count: number;
  createdAt: string;
}

// === AI Review Result ===
export type RiskLevel = 'low' | 'medium' | 'high';
export type Language = 'en' | 'zh';

export interface ReviewResult {
  language: Language;
  riskLevel: RiskLevel;
  flags: string[];
  unsafeSpans: string[];
  kindnessTranslation: string;
  publishableRewrite: string;
  qualityScore: number;
  shouldPublishOriginal: boolean;
  shouldOfferRewrite: boolean;
  softenedWordCount: number;
  suggestionForUser: string;
  reason: string;
}

// === API 请求/响应 ===
export interface OpenResponse {
  id: string;
  content: string;
  language: Language;
  helpedCount: number;
}

export interface SubmitRequest {
  text: string;
}

export interface PublishRequest {
  content: string;
  language: Language;
  sourceType: 'user_original' | 'user_rewrite';
  softenedWordCount: number;
}

export interface PublishResponse {
  ok: boolean;
  givingId: string;
}

export interface HelpedRequest {
  givingId: string;
}

export interface HelpedResponse {
  ok: boolean;
  helpedCount: number;
}

// === 统计 ===
export interface Stats {
  boxesOpened: number;
  givingsLeft: number;
  sharpWordsSoftened: number;
}

// === App 状态 ===
export type AppState =
  | 'closed_box'
  | 'opening'
  | 'giving_card'
  | 'compose'
  | 'reviewing'
  | 'translation_result'
  | 'published'
  | 'blocked'
  | 'error';

// === LocalStorage 结构 ===
export interface LocalState {
  excludeIds: string[];
  lastPublishedId: string | null;
}
