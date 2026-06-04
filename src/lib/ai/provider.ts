/**
 * AI Provider — 统一的 AI 调用入口
 *
 * 支持通过环境变量切换模型提供商。
 * 目前支持: OpenAI, DeepSeek
 */

import { createOpenAI } from '@ai-sdk/openai';
import type { LanguageModelV1 } from 'ai';

export type AIProvider = 'deepseek' | 'openai';

/**
 * 获取当前配置的 AI provider
 */
export function getAIProvider(): AIProvider {
  return (process.env.AI_PROVIDER as AIProvider) || 'deepseek';
}

/**
 * 根据 provider 创建对应的语言模型实例
 */
export function getModel(): LanguageModelV1 {
  const provider = getAIProvider();

  switch (provider) {
    case 'deepseek': {
      const deepseek = createOpenAI({
        baseURL: 'https://api.deepseek.com/v1',
        apiKey: process.env.DEEPSEEK_API_KEY,
      });
      return deepseek('deepseek-v4-flash');
    }

    case 'openai': {
      const openai = createOpenAI({
        apiKey: process.env.OPENAI_API_KEY,
      });
      return openai('gpt-4o-mini');
    }

    default:
      throw new Error(`Unknown AI provider: ${provider}`);
  }
}
