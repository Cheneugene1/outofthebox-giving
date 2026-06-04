'use client';

import { motion } from 'framer-motion';
import { TextArea } from '../ui/TextArea';
import { Button } from '../ui/Button';
import { MAX_CHAR_COUNT } from '@/lib/constants';

interface ComposeFormProps {
  text: string;
  onTextChange: (text: string) => void;
  onSubmit: () => void;
  submitting?: boolean;
}

export function ComposeForm({ text, onTextChange, onSubmit, submitting }: ComposeFormProps) {
  return (
    <motion.div
      className="w-full max-w-lg mx-auto"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
    >
      <p className="text-center text-stone-500 mb-4 text-sm">
        Leave a small useful tip for a stranger.
        <br />
        Make it specific, actionable, and anonymous.
      </p>
      <TextArea
        value={text}
        onChange={onTextChange}
        maxLength={MAX_CHAR_COUNT}
        placeholder="e.g. Before debugging, write what you expected and what actually happened."
      />
      <div className="mt-4 text-center">
        <Button
          onClick={onSubmit}
          disabled={text.trim().length === 0 || submitting}
        >
          Put it in the box
        </Button>
      </div>
    </motion.div>
  );
}
