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
  theme?: 'police' | 'dark';
}

export const MatrixGrid: React.FC<MatrixGridProps> = ({
  grid,
  layout,
  answered,
  correctAnswer,
  isCorrect,
  promptSubtitle,
  theme = 'police',
}) => {
  const is3x2 = layout === '3x2';
  const cols = is3x2 ? 2 : 3;
  const rows = grid.length;
  const isPolice = theme === 'police';

  return (
    <div className="flex flex-col items-center gap-4 w-full">
      {promptSubtitle && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-semibold tracking-wide ${
            isPolice
              ? 'text-blue-900 bg-blue-50 border border-blue-200 shadow-sm'
              : 'text-cyan-400 bg-cyan-950/40 border border-cyan-500/30 shadow-[0_0_15px_rgba(6,182,212,0.15)]'
          }`}
        >
          <span>💡</span>
          <span>{promptSubtitle}</span>
        </motion.div>
      )}

      <div
        className={`grid gap-2.5 p-3 rounded-2xl transition-all duration-300 ${
          isPolice
            ? 'bg-white border-2 border-slate-200/90 shadow-xl shadow-slate-200/60'
            : 'bg-slate-900/60 border border-slate-700/40 backdrop-blur-xl shadow-2xl'
        } ${
          is3x2
            ? 'grid-cols-2 w-full max-w-[270px] aspect-[2/3]'
            : 'grid-cols-3 w-full max-w-[370px] aspect-square'
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
                        ? isPolice ? '#059669' : 'rgba(16, 185, 129, 0.8)'
                        : isPolice ? '#e11d48' : 'rgba(239, 68, 68, 0.8)'
                      : isPolice ? '#102a45' : 'rgba(59, 130, 246, 0.6)',
                  }}
                  transition={{
                    repeat: answered ? 0 : Infinity,
                    duration: 2.2,
                    ease: 'easeInOut',
                  }}
                  className={`relative flex items-center justify-center aspect-square p-2 rounded-xl border-2 transition-all ${
                    answered
                      ? isCorrect
                        ? isPolice
                          ? 'bg-emerald-50 border-emerald-600 shadow-[0_0_20px_rgba(16,185,129,0.25)]'
                          : 'bg-emerald-950/30 border-emerald-500 shadow-[0_0_25px_rgba(16,185,129,0.3)]'
                        : isPolice
                          ? 'bg-rose-50 border-rose-600 shadow-[0_0_20px_rgba(239,68,68,0.25)]'
                          : 'bg-rose-950/30 border-rose-500 shadow-[0_0_25px_rgba(239,68,68,0.3)]'
                      : isPolice
                        ? 'border-dashed border-[#102a45]/80 bg-slate-50 shadow-inner'
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
                      <ShapeRenderer config={correctAnswer} theme={theme} />
                    </motion.div>
                  ) : (
                    <ShapeRenderer config={null} isQuestionMark theme={theme} />
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
                className={`flex items-center justify-center aspect-square p-2 rounded-xl transition-all ${
                  isPolice
                    ? 'bg-white border-2 border-[#102a45] shadow-sm hover:border-blue-700'
                    : 'bg-slate-800/40 border border-slate-700/30 hover:border-slate-600/60 shadow-inner'
                }`}
              >
                <ShapeRenderer config={cell} theme={theme} />
              </motion.div>
            );
          })
        )}
      </div>
    </div>
  );
};
