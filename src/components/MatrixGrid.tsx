import React from 'react';
import { motion } from 'framer-motion';
import type { ShapeConfig, MatrixLayout } from '../types';
import { ShapeRenderer } from './ShapeRenderer';

interface MatrixGridProps {
  grid: (ShapeConfig | null)[][];
  layout: MatrixLayout;
  answered: boolean;
  correctAnswer: ShapeConfig;
  isCorrect: boolean | null;
  promptSubtitle?: string;
}

export const MatrixGrid: React.FC<MatrixGridProps> = ({
  grid,
  layout,
  answered,
  correctAnswer,
  isCorrect,
  promptSubtitle,
}) => {
  const is3x2 = layout === '3x2';
  const cols = is3x2 ? 2 : 3;
  const rows = grid.length;

  return (
    <div className="flex flex-col items-center gap-4 w-full">
      {promptSubtitle && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-semibold tracking-wide text-cyan-400 bg-cyan-950/40 border border-cyan-500/30 shadow-[0_0_15px_rgba(6,182,212,0.15)]"
        >
          <span>💡</span>
          <span>{promptSubtitle}</span>
        </motion.div>
      )}

      <div
        className={`grid gap-2 p-2 rounded-2xl bg-slate-900/60 border border-slate-700/40 backdrop-blur-xl shadow-2xl transition-all duration-300 ${
          is3x2
            ? 'grid-cols-2 w-full max-w-[260px] aspect-[2/3]'
            : 'grid-cols-3 w-full max-w-[360px] aspect-square'
        }`}
        style={{ direction: 'ltr' }}
      >
        {Array.from({ length: rows }).map((_, r) =>
          Array.from({ length: cols }).map((_, c) => {
            const cell = grid[r]?.[c] ?? null;
            const isMissing = cell === null;

            if (isMissing) {
              return (
                <motion.div
                  key={`missing-${r}-${c}`}
                  initial={{ scale: 0.95 }}
                  animate={{
                    scale: [0.98, 1.02, 0.98],
                    borderColor: answered
                      ? isCorrect
                        ? 'rgba(16, 185, 129, 0.8)'
                        : 'rgba(239, 68, 68, 0.8)'
                      : 'rgba(59, 130, 246, 0.6)',
                  }}
                  transition={{
                    repeat: answered ? 0 : Infinity,
                    duration: 2.2,
                    ease: 'easeInOut',
                  }}
                  className={`relative flex items-center justify-center aspect-square p-2.5 rounded-xl border-2 transition-all ${
                    answered
                      ? isCorrect
                        ? 'bg-emerald-950/30 border-emerald-500 shadow-[0_0_25px_rgba(16,185,129,0.3)]'
                        : 'bg-rose-950/30 border-rose-500 shadow-[0_0_25px_rgba(239,68,68,0.3)]'
                      : 'border-dashed border-blue-500/50 bg-blue-950/20 shadow-[0_0_20px_rgba(59,130,246,0.15)]'
                  }`}
                >
                  {answered ? (
                    <motion.div
                      initial={{ scale: 0, rotate: -20 }}
                      animate={{ scale: 1, rotate: 0 }}
                      transition={{ type: 'spring', damping: 15 }}
                      className="w-full h-full"
                    >
                      <ShapeRenderer config={correctAnswer} />
                    </motion.div>
                  ) : (
                    <ShapeRenderer config={null} isQuestionMark />
                  )}
                </motion.div>
              );
            }

            return (
              <motion.div
                key={`cell-${r}-${c}`}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: (r * cols + c) * 0.04, duration: 0.3 }}
                className="flex items-center justify-center aspect-square p-2.5 rounded-xl bg-slate-800/40 border border-slate-700/30 hover:border-slate-600/60 transition-colors shadow-inner"
              >
                <ShapeRenderer config={cell} />
              </motion.div>
            );
          })
        )}
      </div>
    </div>
  );
};
