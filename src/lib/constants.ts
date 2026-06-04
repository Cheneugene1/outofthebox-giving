// 常量

/** 用户输入最大字符数 */
export const MAX_CHAR_COUNT = 280;

/** AI 调用超时时间 (ms) */
export const AI_TIMEOUT_MS = 15000;

/** 盒子开启动画时长 (ms) */
export const BOX_OPENING_DURATION_MS = 1500;

/** localStorage key */
export const LS_KEY = 'ootbg_state';

/** 去重保留的最大已打开 ID 数 */
export const MAX_EXCLUDE_IDS = 30;

/** 中文字符占比阈值 (> 此值判定为中文) */
export const ZH_CHAR_THRESHOLD = 0.3;

/** 种子 giving 最低数量 */
export const MIN_SEED_COUNT = 40;

/** 质量分数阈值 (>= 此值允许发布) */
export const QUALITY_THRESHOLD = 60;

/** 默认 DEMO_MODE */
export const IS_DEMO_MODE = process.env.DEMO_MODE === 'true';

/** 默认数据库路径 */
export const DB_PATH = process.env.DATABASE_PATH || './data.db';
