'use client';

import { motion } from 'framer-motion';
import { Button } from '../ui/Button';

interface BlockedProps {
  suggestion: string;
  riskLevel: 'high' | 'low'; // high = 安全风险, low = 低质量
  onRetry: () => void;
}

export function Blocked({ suggestion, riskLevel, onRetry }: BlockedProps) {
  return (
    <motion.div
      className="flex flex-col items-center gap-6 max-w-md mx-auto text-center"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <div className="w-16 h-16 rounded-full bg-amber-100 flex items-center justify-center">
        <svg
          className="w-8 h-8 text-amber-600"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M12 9v2m0 4h.01M12 3l9.66 16.5H2.34L12 3z"
          />
        </svg>
      </div>

      <div>
        {riskLevel === 'high' ? (
          <p className="text-lg text-stone-700 font-serif">
            This one is too sensitive to put in a public box.
          </p>
        ) : (
          <p className="text-lg text-stone-700 font-serif">
            This is a bit too vague to be useful to a stranger.
          </p>
        )}
        <p className="text-stone-400 text-sm mt-2">{suggestion}</p>
      </div>

      <Button onClick={onRetry}>Try again</Button>
    </motion.div>
  );
}
