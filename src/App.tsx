import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Brain,
  Hash,
  Grid3X3,
  ArrowRight,
  Sparkles,
  Trophy,
} from 'lucide-react';
import type {
  QuizType,
  DifficultyTier,
  MatrixQuestion,
  SeriesQuestion,
} from './types';
import { MatricesEngine } from './engines/matricesEngine';
import { SeriesEngine } from './engines/seriesEngine';
import { MatrixGrid } from './components/MatrixGrid';
import { SeriesDisplay } from './components/SeriesDisplay';
import { AnswersGrid } from './components/AnswersGrid';
import { FeedbackBanner } from './components/FeedbackBanner';

export const App: React.FC = () => {
  const [currentScreen, setCurrentScreen] = useState<'home' | 'quiz'>('home');
  const [quizType, setQuizType] = useState<QuizType | null>(null);
  const [score, setScore] = useState<number>(0);
  const [total, setTotal] = useState<number>(0);
  const [answered, setAnswered] = useState<boolean>(false);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [matrixData, setMatrixData] = useState<MatrixQuestion | null>(null);
  const [seriesData, setSeriesData] = useState<SeriesQuestion | null>(null);

  const getDifficultyTier = (totalCount: number): DifficultyTier => {
    if (totalCount < 5) return 'easy';
    if (totalCount < 10) return 'medium';
    return 'hard';
  };

  const startQuiz = (type: QuizType) => {
    setQuizType(type);
    setScore(0);
    setTotal(0);
    setAnswered(false);
    setSelectedIndex(null);

    const tier = getDifficultyTier(0);
    if (type === 'matrices') {
      setMatrixData(MatricesEngine.generate(tier));
      setSeriesData(null);
    } else {
      setSeriesData(SeriesEngine.generate(tier));
      setMatrixData(null);
    }

    setCurrentScreen('quiz');
  };

  const goHome = () => {
    setCurrentScreen('home');
    setQuizType(null);
  };

  const nextQuestion = () => {
    setAnswered(false);
    setSelectedIndex(null);

    const nextTotal = total;
    const tier = getDifficultyTier(nextTotal);

    if (quizType === 'matrices') {
      setMatrixData(MatricesEngine.generate(tier));
    } else if (quizType === 'series') {
      setSeriesData(SeriesEngine.generate(tier));
    }
  };

  const handleSelectAnswer = (index: number) => {
    if (answered) return;
    setSelectedIndex(index);
    setAnswered(true);

    const currentCorrectIndex =
      quizType === 'matrices'
        ? matrixData?.correctIndex
        : seriesData?.correctIndex;

    const isCorrect = index === currentCorrectIndex;
    setTotal((prev) => prev + 1);
    if (isCorrect) {
      setScore((prev) => prev + 1);
    }
  };

  const currentTier = getDifficultyTier(total);
  const tierLabels: Record<DifficultyTier, { label: string; color: string }> = {
    easy: { label: 'קל', color: 'bg-emerald-950/60 text-emerald-400 border-emerald-500/40' },
    medium: { label: 'בינוני', color: 'bg-amber-950/60 text-amber-400 border-amber-500/40' },
    hard: { label: 'קשה', color: 'bg-rose-950/60 text-rose-400 border-rose-500/40' },
  };

  const isCurrentCorrect =
    selectedIndex !== null
      ? selectedIndex ===
        (quizType === 'matrices'
          ? matrixData?.correctIndex
          : seriesData?.correctIndex)
      : null;

  const currentExplanation =
    quizType === 'matrices'
      ? matrixData?.explanation || ''
      : seriesData?.explanation || '';

  return (
    <div className="relative min-h-screen flex flex-col justify-between overflow-x-hidden selection:bg-blue-500/30">
      <div className="bg-mesh-glow" />

      {/* HEADER / NAVIGATION */}
      <header className="relative z-10 w-full max-w-4xl mx-auto px-4 py-4 sm:py-6 flex items-center justify-between gap-4">
        {currentScreen === 'quiz' ? (
          <button
            id="back-home-btn"
            onClick={goHome}
            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-sm font-semibold text-slate-300 bg-slate-900/60 border border-slate-700/50 hover:bg-slate-800/80 hover:border-slate-600 transition-all cursor-pointer backdrop-blur-md"
          >
            <ArrowRight className="w-4 h-4" />
            <span>חזרה</span>
          </button>
        ) : (
          <div className="flex items-center gap-2 text-blue-400 font-bold tracking-wide">
            <Brain className="w-6 h-6 text-blue-400" />
            <span className="text-lg bg-gradient-to-r from-blue-400 via-indigo-300 to-purple-400 bg-clip-text text-transparent">
              CogniPrep
            </span>
          </div>
        )}

        {currentScreen === 'quiz' && (
          <div className="flex items-center gap-3">
            <span
              className={`text-xs font-bold px-3 py-1 rounded-full border tracking-wide ${tierLabels[currentTier].color}`}
            >
              רמה: {tierLabels[currentTier].label}
            </span>

            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold text-cyan-400 bg-cyan-950/50 border border-cyan-500/30">
              <Trophy className="w-3.5 h-3.5" />
              <span style={{ direction: 'ltr' }}>
                {score} / {total}
              </span>
            </div>
          </div>
        )}
      </header>

      {/* MAIN VIEW */}
      <main className="relative z-10 w-full max-w-3xl mx-auto px-4 py-4 flex-1 flex flex-col justify-center">
        <AnimatePresence mode="wait">
          {currentScreen === 'home' ? (
            <motion.div
              key="home"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="flex flex-col items-center text-center gap-8 py-8"
            >
              {/* HERO */}
              <div className="flex flex-col items-center gap-3 max-w-lg">
                <motion.div
                  animate={{ y: [-4, 6, -4] }}
                  transition={{ repeat: Infinity, duration: 4, ease: 'easeInOut' }}
                  className="w-20 h-20 rounded-3xl bg-gradient-to-tr from-blue-600 to-indigo-500 p-0.5 shadow-[0_0_40px_rgba(59,130,246,0.35)] flex items-center justify-center mb-2"
                >
                  <div className="w-full h-full bg-slate-950/80 rounded-[22px] flex items-center justify-center">
                    <Brain className="w-10 h-10 text-blue-400" />
                  </div>
                </motion.div>

                <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-white">
                  הכנה למבחנים{' '}
                  <span className="bg-gradient-to-r from-blue-400 via-indigo-400 to-purple-400 bg-clip-text text-transparent">
                    קוגניטיביים
                  </span>
                </h1>
                <p className="text-slate-400 text-sm sm:text-base leading-relaxed">
                  מערכת תרגול מקיפה לסדרות מספרים ומטריצות צורניות המבוססות על מבחני המיון של משטרת ישראל וגופי הגיוס.
                </p>
              </div>

              {/* TEST CHOICES */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full max-w-xl">
                {/* MATRICES TEST */}
                <motion.button
                  id="btn-matrices"
                  onClick={() => startQuiz('matrices')}
                  whileHover={{ y: -4, scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="flex flex-col text-right p-6 rounded-2xl bg-slate-900/60 border border-slate-700/50 hover:border-blue-500/50 hover:bg-slate-850/80 backdrop-blur-xl transition-all shadow-xl group cursor-pointer"
                >
                  <div className="w-12 h-12 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-400 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                    <Grid3X3 className="w-6 h-6" />
                  </div>
                  <h2 className="text-lg font-bold text-white mb-1 group-hover:text-blue-300 transition-colors">
                    מבחן מטריצות
                  </h2>
                  <p className="text-xs text-slate-400 leading-normal">
                    סדרות צורניות, אנלוגיות 3×2, מעגלים קונצנטריים וחוקיות דו-ממדית.
                  </p>
                </motion.button>

                {/* SERIES TEST */}
                <motion.button
                  id="btn-series"
                  onClick={() => startQuiz('series')}
                  whileHover={{ y: -4, scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="flex flex-col text-right p-6 rounded-2xl bg-slate-900/60 border border-slate-700/50 hover:border-purple-500/50 hover:bg-slate-850/80 backdrop-blur-xl transition-all shadow-xl group cursor-pointer"
                >
                  <div className="w-12 h-12 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-400 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                    <Hash className="w-6 h-6" />
                  </div>
                  <h2 className="text-lg font-bold text-white mb-1 group-hover:text-purple-300 transition-colors">
                    מבחן סדרות
                  </h2>
                  <p className="text-xs text-slate-400 leading-normal">
                    סדרות חשבוניות, הפרשים עולים, פעולות משולבות וסדרות שזורות.
                  </p>
                </motion.button>
              </div>

              {/* QUICK BADGES */}
              <div className="flex items-center gap-6 text-xs text-slate-500">
                <span className="flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-cyan-400" /> מנוע צורות וקטורי חד
                </span>
                <span className="flex items-center gap-1.5">
                  <Trophy className="w-4 h-4 text-amber-400" /> רמות קושי עולות
                </span>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="quiz"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              className="flex flex-col items-center gap-6 py-2"
            >
              {/* QUESTION CARD */}
              <div className="w-full max-w-2xl bg-slate-900/40 border border-slate-800/80 backdrop-blur-2xl rounded-3xl p-5 sm:p-8 shadow-2xl flex flex-col items-center">
                {quizType === 'matrices' && matrixData && (
                  <MatrixGrid
                    grid={matrixData.grid}
                    layout={matrixData.layout}
                    answered={answered}
                    correctAnswer={matrixData.answer}
                    isCorrect={isCurrentCorrect}
                    promptSubtitle={matrixData.promptSubtitle}
                  />
                )}

                {quizType === 'series' && seriesData && (
                  <SeriesDisplay
                    visible={seriesData.visible}
                    answered={answered}
                    answer={seriesData.answer}
                  />
                )}
              </div>

              {/* ANSWERS SELECTION */}
              <AnswersGrid
                type={quizType!}
                options={
                  quizType === 'matrices'
                    ? matrixData?.options || []
                    : seriesData?.options || []
                }
                selectedIndex={selectedIndex}
                correctIndex={
                  quizType === 'matrices'
                    ? matrixData?.correctIndex ?? 0
                    : seriesData?.correctIndex ?? 0
                }
                answered={answered}
                onSelect={handleSelectAnswer}
              />

              {/* FEEDBACK & NEXT BUTTON */}
              <FeedbackBanner
                show={answered}
                isCorrect={isCurrentCorrect}
                explanation={currentExplanation}
                onNext={nextQuestion}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* FOOTER */}
      <footer className="relative z-10 w-full max-w-4xl mx-auto px-4 py-4 text-center text-xs text-slate-500 border-t border-slate-800/40">
        CogniPrep © 2026 — מודל הכנה מתקדם למבחני מיון קוגניטיביים
      </footer>
    </div>
  );
};

export default App;
