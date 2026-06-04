'use client';

import { motion } from 'framer-motion';
import { Button } from '../ui/Button';

interface ErrorViewProps {
  message: string;
  onRetry: () => void;
}

export function ErrorView({ message, onRetry }: ErrorViewProps) {
  return (
    <motion.div
      className="flex flex-col items-center gap-6 max-w-md mx-auto text-center"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center">
        <svg
          className="w-8 h-8 text-red-500"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M6 18L18 6M6 6l12 12"
          />
        </svg>
      </div>

      <p className="text-stone-500 text-sm">{message || 'Something went wrong.'}</p>

      <Button onClick={onRetry}>Try again</Button>
    </motion.div>
  );
}
