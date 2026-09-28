import React from 'react';
import { motion } from 'framer-motion';

interface SeriesDisplayProps {
  visible: number[];
  items?: (number | null)[];
  missingIndex?: number;
  answered: boolean;
  answer: number;
  theme?: 'police' | 'dark';
}

export const SeriesDisplay: React.FC<SeriesDisplayProps> = ({
  visible,
  items,
  missingIndex,
  answered,
  answer,
  theme = 'police',
}) => {
  const isPolice = theme === 'police';

  // If items array is provided, use it; otherwise construct [ ...visible, null ]
  const displayItems: (number | null)[] =
    items && items.length > 0 ? items : [...visible, null];

  return (
    <div
      className={`flex items-center justify-center flex-wrap gap-2 py-6 px-6 rounded-2xl transition-all ${
        isPolice
          ? 'bg-white border-2 border-slate-200/90 shadow-xl shadow-slate-200/60 max-w-2xl mx-auto'
          : 'bg-slate-900/60 border border-slate-700/40 backdrop-blur-xl shadow-2xl max-w-2xl mx-auto'
      }`}
      style={{ direction: 'ltr', unicodeBidi: 'isolate' }}
    >
      {displayItems.map((val, i) => {
        const isMissingSlot =
          val === null || (missingIndex !== undefined && i === missingIndex);
        const isLast = i === displayItems.length - 1;

        if (isMissingSlot) {
          return (
            <React.Fragment key={`slot-${i}`}>
              <motion.span
                id="missing-slot"
                initial={{ scale: 0.9 }}
                animate={
                  answered
                    ? { scale: [1, 1.08, 1] }
                    : { scale: [0.97, 1.05, 0.97] }
                }
                transition={
                  answered
                    ? { duration: 0.3 }
                    : { repeat: Infinity, duration: 2.2, ease: 'easeInOut' }
                }
                className={`text-2xl sm:text-3xl md:text-4xl font-black px-3 py-0.5 rounded-xl border-2 transition-all ${
                  answered
                    ? 'border-emerald-500 bg-emerald-50 text-emerald-800 shadow-md ring-2 ring-emerald-500/20'
                    : isPolice
                    ? 'border-blue-600 bg-blue-50/70 text-blue-800 shadow-sm'
                    : 'border-cyan-500 bg-cyan-950/40 text-cyan-300 shadow-[0_0_15px_rgba(6,182,212,0.3)]'
                }`}
              >
                {answered ? answer : '___'}
              </motion.span>
              {!isLast && (
                <span
                  className={`text-xl sm:text-2xl font-light mx-0.5 ${
                    isPolice ? 'text-slate-400' : 'text-slate-500'
                  }`}
                >
                  ,
                </span>
              )}
            </React.Fragment>
          );
        }

        return (
          <React.Fragment key={i}>
            <motion.span
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.04 }}
              className={`text-2xl sm:text-3xl md:text-4xl font-bold px-1 ${
                isPolice ? 'text-[#102a45]' : 'text-slate-100'
              }`}
            >
              {val}
            </motion.span>
            {!isLast && (
              <span
                className={`text-xl sm:text-2xl font-light mx-0.5 ${
                  isPolice ? 'text-slate-400' : 'text-slate-500'
                }`}
              >
                ,
              </span>
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
};
