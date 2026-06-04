'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { useAppState } from '@/hooks/useAppState';
import type { Stats } from '@/lib/types';
import { StatsBar } from '@/components/stats/StatsBar';
import { BoxClosed } from '@/components/box/BoxClosed';
import { BoxOpening } from '@/components/box/BoxOpening';
import { GivingCard } from '@/components/card/GivingCard';
import { ComposeForm } from '@/components/compose/ComposeForm';
import { ReviewLoading } from '@/components/review/ReviewLoading';
import { TranslationResult } from '@/components/review/TranslationResult';
import { Published } from '@/components/result/Published';
import { Blocked } from '@/components/result/Blocked';
import { ErrorView } from '@/components/result/ErrorView';
import { Button } from '@/components/ui/Button';

interface Props {
  initialStats: Stats;
}

export function ClientApp({ initialStats }: Props) {
  const app = useAppState(initialStats);

  return (
    <main className="min-h-screen bg-[#fafaf9] flex flex-col">
      <div className="flex-1 flex flex-col items-center justify-center px-4 pb-8">
        <AnimatePresence mode="wait">
          {app.state === 'closed_box' && (
            <motion.div
              key="closed"
              className="flex flex-col items-center gap-8"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <div className="text-center">
                <h1 className="text-3xl sm:text-4xl font-serif text-stone-800 mb-2 tracking-tight">
                  Out of the Box Giving
                </h1>
                <p className="text-stone-400 text-sm sm:text-base">
                  Open a small act of kindness. Leave one for the next stranger.
                </p>
              </div>

              <BoxClosed />

              <Button onClick={() => app.openBox()}>
                Open the box
              </Button>
            </motion.div>
          )}

          {app.state === 'opening' && (
            <motion.div
              key="opening"
              className="flex flex-col items-center gap-6"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <BoxOpening />
              <p className="text-stone-400 text-sm animate-pulse">Opening...</p>
            </motion.div>
          )}

          {app.state === 'giving_card' && app.currentGiving && (
            <motion.div
              key="giving"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <GivingCard
                giving={app.currentGiving}
                onHelped={app.helpedMe}
                onOpenAnother={app.openAnother}
                onLeaveOne={app.startCompose}
              />
            </motion.div>
          )}

          {app.state === 'compose' && (
            <motion.div
              key="compose"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <ComposeForm
                text={app.composeText}
                onTextChange={app.setComposeText}
                onSubmit={() => app.submitGiving(app.composeText)}
              />
            </motion.div>
          )}

          {app.state === 'reviewing' && (
            <motion.div
              key="reviewing"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <ReviewLoading />
            </motion.div>
          )}

          {app.state === 'translation_result' && app.aiReview && (
            <motion.div
              key="translation"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <TranslationResult
                review={app.aiReview}
                composeText={app.composeText}
                onPublish={
                  app.aiReview.riskLevel === 'low'
                    ? app.publishOriginal
                    : app.publishRewrite
                }
                onRetry={app.tryAgain}
              />
            </motion.div>
          )}

          {app.state === 'published' && (
            <motion.div
              key="published"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <Published onOpenAnother={app.openAnother} />
            </motion.div>
          )}

          {app.state === 'blocked' && app.aiReview && (
            <motion.div
              key="blocked"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <Blocked
                suggestion={app.aiReview.suggestionForUser}
                riskLevel={app.aiReview.riskLevel === 'high' ? 'high' : 'low'}
                onRetry={app.tryAgain}
              />
            </motion.div>
          )}

          {app.state === 'error' && (
            <motion.div
              key="error"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <ErrorView
                message={app.error || 'Something went wrong.'}
                onRetry={app.tryAgain}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <StatsBar stats={app.stats} />
    </main>
  );
}
