'use client';

import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface TextSegment {
  text: string;
  isUnsafe: boolean;
  index: number;
}

/**
 * 按 unsafeSpans 将原文切分为 segments
 */
function splitBySpans(text: string, spans: string[]): TextSegment[] {
  if (spans.length === 0) {
    return [{ text, isUnsafe: false, index: -1 }];
  }

  const segments: TextSegment[] = [];
  let remaining = text;
  let spanIdx = 0;

  for (const span of spans) {
    const pos = remaining.indexOf(span);
    if (pos === -1) continue;

    if (pos > 0) {
      segments.push({ text: remaining.slice(0, pos), isUnsafe: false, index: -1 });
    }
    segments.push({ text: span, isUnsafe: true, index: spanIdx });
    remaining = remaining.slice(pos + span.length);
    spanIdx++;
  }

  if (remaining.length > 0) {
    segments.push({ text: remaining, isUnsafe: false, index: -1 });
  }

  return segments;
}

type Phase = 'highlight' | 'dissolve' | 'reveal' | 'done';

interface TransformAnimationProps {
  original: string;
  unsafeSpans: string[];
  kindnessTranslation: string;
}

export function TransformAnimation({
  original,
  unsafeSpans,
  kindnessTranslation,
}: TransformAnimationProps) {
  const [phase, setPhase] = useState<Phase>('highlight');
  const segments = useMemo(
    () => splitBySpans(original, unsafeSpans),
    [original, unsafeSpans]
  );

  useEffect(() => {
    const t1 = setTimeout(() => setPhase('dissolve'), 800);
    const t2 = setTimeout(() => setPhase('reveal'), 1300);
    const t3 = setTimeout(() => setPhase('done'), 1800);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
    };
  }, []);

  return (
    <div className="w-full max-w-lg mx-auto p-6 bg-white rounded-xl shadow-sm border border-stone-200">
      <p className="text-xs text-stone-400 mb-3 uppercase tracking-wider">
        Kindness Transformation
      </p>

      <div className="text-lg leading-relaxed min-h-16">
        <AnimatePresence mode="wait">
          {(phase === 'highlight' || phase === 'dissolve') && (
            <motion.div key="original" className="inline">
              {segments.map((seg, i) => (
                <motion.span
                  key={`orig-${i}`}
                  className={seg.isUnsafe ? 'text-unsafe-highlight' : ''}
                  animate={
                    phase === 'dissolve' && seg.isUnsafe
                      ? { opacity: 0, scale: 0.9, filter: 'blur(2px)' }
                      : { opacity: 1, scale: 1 }
                  }
                  transition={{
                    duration: 0.4,
                    delay: seg.isUnsafe ? seg.index * 0.15 : 0,
                  }}
                >
                  {seg.text}
                </motion.span>
              ))}
            </motion.div>
          )}

          {(phase === 'reveal' || phase === 'done') && (
            <motion.div
              key="kindness"
              initial={{ opacity: 0, scale: 1.05 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
              className="text-kindness"
            >
              {kindnessTranslation}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
