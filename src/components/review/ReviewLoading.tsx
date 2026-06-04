'use client';

import { motion } from 'framer-motion';

export function ReviewLoading() {
  return (
    <motion.div
      className="flex flex-col items-center gap-8"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      {/* 盒子呼吸动画 */}
      <div className="w-32 h-32 bg-[#d6ccc2] rounded-lg shadow-md animate-box-breathe" />

      <p className="text-stone-500 text-base animate-pulse">
        The box is reading your giving...
      </p>
    </motion.div>
  );
}
