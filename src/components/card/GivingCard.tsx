'use client';

import { motion } from 'framer-motion';
import type { Giving } from '@/lib/types';
import { Button } from '../ui/Button';

interface GivingCardProps {
  giving: Giving;
  onHelped: () => void;
  onOpenAnother: () => void;
  onLeaveOne: () => void;
}

export function GivingCard({ giving, onHelped, onOpenAnother, onLeaveOne }: GivingCardProps) {
  return (
    <motion.div
      key={giving.id}
      className="w-full max-w-md mx-auto bg-white rounded-xl shadow-md p-6 sm:p-8"
      initial={{ opacity: 0, y: 30, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
    >
      <p className="text-lg sm:text-xl text-stone-800 leading-relaxed mb-4 font-serif">
        {giving.content}
      </p>

      <p className="text-xs text-stone-400 mb-6">
        {giving.helpedCount} {giving.helpedCount === 1 ? 'person' : 'people'} found this helpful
      </p>

      <div className="flex flex-col sm:flex-row gap-3">
        <Button onClick={onHelped} variant="secondary">
          Helped me
        </Button>
        <Button onClick={onOpenAnother} variant="secondary">
          Open another
        </Button>
        <Button onClick={onLeaveOne}>
          Leave one
        </Button>
      </div>
    </motion.div>
  );
}
