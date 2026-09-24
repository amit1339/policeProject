import React from 'react';
import { motion } from 'framer-motion';

interface SeriesDisplayProps {
  visible: number[];
  answered: boolean;
  answer: number;
  theme?: 'police' | 'dark';
}

export const SeriesDisplay: React.FC<SeriesDisplayProps> = ({
  visible,
  answered,
  answer,
  theme = 'police',
}) => {
  const isPolice = theme === 'police';

  return (
    <div
      className={`flex items-center justify-center flex-wrap gap-2 py-6 px-6 rounded-2xl transition-all ${
        isPolice
          ? 'bg-white border-2 border-slate-200/90 shadow-xl shadow-slate-200/60 max-w-xl mx-auto'
          : 'bg-slate-900/60 border border-slate-700/40 backdrop-blur-xl shadow-2xl max-w-xl mx-auto'
      }`}
      style={{ direction: 'ltr', unicodeBidi: 'isolate' }}
    >
      {visible.map((num, i) => (
        <React.Fragment key={i}>
          <motion.span
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className={`text-2xl sm:text-3xl md:text-4xl font-bold px-1 ${
              isPolice ? 'text-[#102a45]' : 'text-slate-100'
            }`}
          >
            {num}
          </motion.span>
          <span className={`text-xl sm:text-2xl font-light mx-0.5 ${
            isPolice ? 'text-slate-400' : 'text-slate-500'
          }`}>,</span>
        </React.Fragment>
      ))}

      <motion.span
        initial={{ scale: 0.9 }}
        animate={{
          scale: [0.95, 1.08, 0.95],
        }}
        transition={{ repeat: Infinity, duration: 2.4, ease: 'easeInOut' }}
        className={`text-3xl sm:text-4xl font-black px-2 ${
          isPolice
            ? 'text-blue-700'
            : 'bg-gradient-to-r from-blue-400 via-indigo-400 to-purple-400 bg-clip-text text-transparent'
        }`}
      >
        {answered ? answer : '?'}
      </motion.span>
    </div>
  );
};
