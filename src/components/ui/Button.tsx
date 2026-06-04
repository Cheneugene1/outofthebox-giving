'use client';

import { motion } from 'framer-motion';

interface ButtonProps {
  children: React.ReactNode;
  onClick: () => void;
  variant?: 'primary' | 'secondary';
  disabled?: boolean;
  className?: string;
}

export function Button({
  children,
  onClick,
  variant = 'primary',
  disabled = false,
  className = '',
}: ButtonProps) {
  const base = 'px-6 py-3 rounded-full font-medium text-base transition-colors disabled:opacity-50';
  const variants = variant === 'primary'
    ? 'bg-stone-800 text-stone-50 hover:bg-stone-700'
    : 'bg-white text-stone-700 border border-stone-300 hover:bg-stone-100';

  return (
    <motion.button
      onClick={onClick}
      disabled={disabled}
      className={`${base} ${variants} ${className}`}
      whileHover={disabled ? {} : { scale: 1.02 }}
      whileTap={disabled ? {} : { scale: 0.98 }}
    >
      {children}
    </motion.button>
  );
}
