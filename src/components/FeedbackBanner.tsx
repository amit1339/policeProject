import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';
import { CheckCircle2, XCircle, ArrowLeft } from 'lucide-react';

interface FeedbackBannerProps {
  show: boolean;
  isCorrect: boolean | null;
  explanation: string;
  onNext: () => void;
  theme?: 'police' | 'dark';
}

export const FeedbackBanner: React.FC<FeedbackBannerProps> = ({
  show,
  isCorrect,
  explanation,
  onNext,
  theme = 'police',
}) => {
  const isPolice = theme === 'police';

  useEffect(() => {
    if (show && isCorrect) {
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.8 },
        colors: ['#10b981', '#3b82f6', '#8b5cf6', '#06b6d4'],
      });
    }
  }, [show, isCorrect]);

  if (!show || isCorrect === null) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 10 }}
        className={`w-full max-w-2xl mx-auto rounded-2xl p-4 sm:p-5 border flex flex-col gap-3.5 transition-all shadow-xl ${
          isPolice
            ? isCorrect
              ? 'bg-emerald-50/95 border-2 border-emerald-300 text-emerald-900 shadow-lg'
              : 'bg-rose-50/95 border-2 border-rose-300 text-rose-900 shadow-lg'
            : isCorrect
              ? 'bg-emerald-950/40 border-emerald-500/30 text-emerald-300 shadow-[0_0_30px_rgba(16,185,129,0.15)] backdrop-blur-xl'
              : 'bg-rose-950/40 border-rose-500/30 text-rose-300 shadow-[0_0_30px_rgba(239,68,68,0.15)] backdrop-blur-xl'
        }`}
      >
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5 font-bold text-base sm:text-lg">
            {isCorrect ? (
              <>
                <CheckCircle2 className="w-6 h-6 text-emerald-600 shrink-0" />
                <span>נכון מאוד! כל הכבוד.</span>
              </>
            ) : (
              <>
                <XCircle className="w-6 h-6 text-rose-600 shrink-0" />
                <span>לא נכון — התשובה הנכונה סומנה בירוק.</span>
              </>
            )}
          </div>

          <motion.button
            id="next-question-btn"
            onClick={onNext}
            whileHover={{ scale: 1.04, x: -3 }}
            whileTap={{ scale: 0.96 }}
            className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm shadow-md transition-all cursor-pointer ${
              isPolice
                ? 'bg-[#102a45] hover:bg-[#1a3d60] text-white shadow-[#102a45]/20'
                : 'bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-600 text-white shadow-indigo-500/30'
            }`}
          >
            <span>שאלה הבאה</span>
            <ArrowLeft className="w-4 h-4" />
          </motion.button>
        </div>

        {explanation && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className={`text-xs sm:text-sm leading-relaxed p-3.5 rounded-xl border ${
              isPolice
                ? 'text-slate-800 bg-white/90 border-slate-200 shadow-sm'
                : 'text-slate-300/90 bg-black/20 border-white/5'
            }`}
          >
            <span className="font-bold ml-1">הסבר:</span>
            {explanation}
          </motion.div>
        )}
      </motion.div>
    </AnimatePresence>
  );
};
