'use client';

import { motion } from 'framer-motion';
import type { ReviewResult } from '@/lib/types';
import { TransformAnimation } from './TransformAnimation';
import { Button } from '../ui/Button';

interface TranslationResultProps {
  review: ReviewResult;
  composeText: string;
  onPublish: () => void;
  onRetry: () => void;
}

export function TranslationResult({
  review,
  composeText,
  onPublish,
  onRetry,
}: TranslationResultProps) {
  const isLow = review.riskLevel === 'low';

  return (
    <motion.div
      className="w-full max-w-lg mx-auto flex flex-col gap-6"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      {/* low risk: 确认原文 */}
      {isLow && (
        <>
          <div className="bg-white rounded-xl shadow-md p-6 border border-stone-200">
            <p className="text-xs text-stone-400 mb-2 uppercase tracking-wider">
              Your Giving
            </p>
            <p className="text-lg text-stone-800 leading-relaxed font-serif">
              {composeText}
            </p>
          </div>
          <p className="text-center text-stone-500 text-sm">
            This looks great. Ready to share with a stranger?
          </p>
        </>
      )}

      {/* medium risk: 变换动画 + 改写 */}
      {!isLow && (
        <>
          <TransformAnimation
            original={composeText}
            unsafeSpans={review.unsafeSpans}
            kindnessTranslation={review.kindnessTranslation}
          />

          <div className="bg-white rounded-xl shadow-md p-6 border border-emerald-200">
            <p className="text-xs text-emerald-600 mb-2 uppercase tracking-wider">
              Rewritten version — safe to share
            </p>
            <p className="text-lg text-emerald-800 leading-relaxed font-serif">
              {review.publishableRewrite}
            </p>
          </div>

          <p className="text-center text-stone-500 text-sm">
            We softened the sharp parts. Here is a version a stranger can actually use.
          </p>
        </>
      )}

      <div className="flex flex-col sm:flex-row gap-3 justify-center">
        <Button onClick={onPublish}>
          {isLow ? 'Publish this giving' : 'Give this version'}
        </Button>
        <Button onClick={onRetry} variant="secondary">
          Try again
        </Button>
      </div>
    </motion.div>
  );
}
