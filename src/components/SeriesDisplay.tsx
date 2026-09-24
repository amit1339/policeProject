import React from 'react';
import { motion } from 'framer-motion';

interface SeriesDisplayProps {
  visible: number[];
  answered: boolean;
  answer: number;
}

export const SeriesDisplay: React.FC<SeriesDisplayProps> = ({
  visible,
  answered,
  answer,
}) => {
  return (
    <div
      className="flex items-center justify-center flex-wrap gap-2 py-6 px-4"
      style={{ direction: 'ltr', unicodeBidi: 'isolate' }}
    >
      {visible.map((num, i) => (
        <React.Fragment key={i}>
          <motion.span
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="text-2xl sm:text-3xl md:text-4xl font-bold text-slate-100 px-1"
          >
            {num}
          </motion.span>
          <span className="text-xl sm:text-2xl text-slate-500 font-light mx-0.5">,</span>
        </React.Fragment>
      ))}

      <motion.span
        initial={{ scale: 0.9 }}
        animate={{
          scale: [0.95, 1.08, 0.95],
          filter: [
            'drop-shadow(0 0 10px rgba(59,130,246,0.3))',
            'drop-shadow(0 0 20px rgba(139,92,246,0.5))',
            'drop-shadow(0 0 10px rgba(59,130,246,0.3))',
          ],
        }}
        transition={{ repeat: Infinity, duration: 2.4, ease: 'easeInOut' }}
        className="text-3xl sm:text-4xl font-black bg-gradient-to-r from-blue-400 via-indigo-400 to-purple-400 bg-clip-text text-transparent px-2"
      >
        {answered ? answer : '?'}
      </motion.span>
    </div>
  );
};
