import React from 'react';
import { motion } from 'framer-motion';
import type { ShapeConfig } from '../types';
import { ShapeRenderer } from './ShapeRenderer';

interface AnswersGridProps {
  type: 'matrices' | 'series';
  options: (ShapeConfig | number)[];
  selectedIndex: number | null;
  correctIndex: number;
  answered: boolean;
  onSelect: (index: number) => void;
}

export const AnswersGrid: React.FC<AnswersGridProps> = ({
  type,
  options,
  selectedIndex,
  correctIndex,
  answered,
  onSelect,
}) => {
  return (
    <div className="w-full max-w-2xl mx-auto flex flex-col gap-3">
      <div className="text-sm font-semibold text-slate-400 text-right pr-1">
        בחרו את התשובה הנכונה:
      </div>

      <div className="grid grid-cols-5 gap-2 sm:gap-3">
        {options.map((opt, i) => {
          const isSelected = selectedIndex === i;
          const isCorrect = i === correctIndex;
          const isWrong = isSelected && !isCorrect;

          let btnStyle = 'border-slate-800/80 bg-slate-900/50 hover:bg-slate-800/60 hover:border-slate-700/80 text-slate-200';
          if (answered) {
            if (isCorrect) {
              btnStyle = 'border-emerald-500 bg-emerald-950/40 text-emerald-400 shadow-[0_0_25px_rgba(16,185,129,0.3)] ring-2 ring-emerald-500/50';
            } else if (isWrong) {
              btnStyle = 'border-rose-500 bg-rose-950/40 text-rose-400 shadow-[0_0_20px_rgba(239,68,68,0.3)] ring-2 ring-rose-500/50';
            } else {
              btnStyle = 'opacity-40 border-slate-850 bg-slate-900/20 text-slate-500 pointer-events-none';
            }
          }

          return (
            <motion.button
              key={i}
              id={`answer-btn-${i}`}
              onClick={() => onSelect(i)}
              disabled={answered}
              whileHover={!answered ? { y: -3, scale: 1.02 } : undefined}
              whileTap={!answered ? { scale: 0.97 } : undefined}
              animate={
                isWrong
                  ? { x: [-5, 5, -4, 4, 0] }
                  : isCorrect && answered
                  ? { scale: [1, 1.05, 1] }
                  : {}
              }
              transition={{ duration: 0.3 }}
              className={`relative flex flex-col items-center justify-between p-2.5 sm:p-3.5 rounded-2xl border backdrop-blur-xl transition-colors cursor-pointer select-none ${btnStyle}`}
            >
              {/* Option Number Tag */}
              <span
                className={`text-[11px] font-bold px-2 py-0.5 rounded-full mb-2 ${
                  isCorrect && answered
                    ? 'bg-emerald-500/20 text-emerald-300'
                    : isWrong
                    ? 'bg-rose-500/20 text-rose-300'
                    : 'bg-slate-800/60 text-slate-400'
                }`}
              >
                {i + 1}
              </span>

              {/* Option Content: Shape or Number */}
              <div className="flex items-center justify-center w-full aspect-square max-w-[64px] max-h-[64px]">
                {type === 'matrices' ? (
                  <ShapeRenderer config={opt as ShapeConfig} />
                ) : (
                  <span
                    className="text-lg sm:text-2xl font-bold tracking-tight"
                    style={{ direction: 'ltr', unicodeBidi: 'isolate' }}
                  >
                    {opt as number}
                  </span>
                )}
              </div>
            </motion.button>
          );
        })}
      </div>
    </div>
  );
};
