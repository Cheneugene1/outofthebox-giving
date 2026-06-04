'use client';

import { motion } from 'framer-motion';
import { Button } from '../ui/Button';

interface PublishedProps {
  onOpenAnother: () => void;
}

export function Published({ onOpenAnother }: PublishedProps) {
  return (
    <motion.div
      className="flex flex-col items-center gap-6"
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
    >
      {/* Check icon */}
      <motion.div
        className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center"
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 0.2, type: 'spring', stiffness: 300 }}
      >
        <svg
          className="w-8 h-8 text-emerald-600"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
        </svg>
      </motion.div>

      <div className="text-center">
        <p className="text-xl text-stone-700 font-serif">
          Your giving is in the box.
        </p>
        <p className="text-stone-400 text-sm mt-1">
          Someone may open it next.
        </p>
      </div>

      <Button onClick={onOpenAnother}>Open another</Button>
    </motion.div>
  );
}
