'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useEffect, useState } from 'react';

export function BoxOpening() {
  const [showGlow, setShowGlow] = useState(false);
  const [showCard, setShowCard] = useState(false);

  useEffect(() => {
    const t1 = setTimeout(() => setShowGlow(true), 300);
    const t2 = setTimeout(() => setShowCard(true), 800);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, []);

  return (
    <div className="flex flex-col items-center gap-6">
      <div className="relative w-48 h-48">
        {/* Box body */}
        <motion.div
          className="absolute inset-0 bg-[#d6ccc2] rounded-lg shadow-md"
          initial={{ scale: 0.95 }}
          animate={{ scale: 1 }}
          transition={{ duration: 0.4 }}
        />

        {/* Lid — 旋转打开 */}
        <motion.div
          className="absolute -top-4 left-0 right-0 h-10 bg-[#b7a997] rounded-t-lg origin-bottom"
          initial={{ rotateX: 0 }}
          animate={{ rotateX: -110 }}
          transition={{ duration: 0.7, ease: 'easeInOut', delay: 0.2 }}
          style={{ transformStyle: 'preserve-3d' }}
        />

        {/* 光效 */}
        <AnimatePresence>
          {showGlow && (
            <motion.div
              className="absolute top-2 left-4 right-4 h-24 rounded-full"
              style={{
                background: 'radial-gradient(ellipse, rgba(255,215,0,0.4) 0%, transparent 70%)',
              }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.5 }}
            />
          )}
        </AnimatePresence>

        {/* 卡片从盒子中弹出 */}
        <AnimatePresence>
          {showCard && (
            <motion.div
              className="absolute -top-20 left-1/2 -translate-x-1/2 w-40 h-16 bg-white rounded shadow-lg flex items-center justify-center text-xs text-stone-400"
              initial={{ opacity: 0, y: 40, scale: 0.5 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0 }}
              transition={{ type: 'spring', stiffness: 200, damping: 15 }}
            >
              ✨
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
