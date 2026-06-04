'use client';

import { motion } from 'framer-motion';

export function BoxClosed() {
  return (
    <div className="flex flex-col items-center gap-6">
      <motion.div
        className="relative"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        {/* Box body */}
        <div className="w-48 h-48 bg-[#d6ccc2] rounded-lg shadow-md relative">
          {/* Lid */}
          <div className="absolute -top-4 left-0 right-0 h-8 bg-[#b7a997] rounded-t-lg origin-bottom"
               style={{ transformStyle: 'preserve-3d' }} />
        </div>
      </motion.div>
    </div>
  );
}
