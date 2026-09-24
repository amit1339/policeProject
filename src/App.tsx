import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Brain,
  Hash,
  Grid3X3,
  ArrowRight,
  Sparkles,
  Trophy,
  Shield,
  Moon,
  Sun,
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
  const [theme, setTheme] = useState<'police' | 'dark'>('police');
  const [currentScreen, setCurrentScreen] = useState<'home' | 'quiz'>('home');
  const [quizType, setQuizType] = useState<QuizType | null>(null);
  const [score, setScore] = useState<number>(0);
  const [total, setTotal] = useState<number>(0);
  const [answered, setAnswered] = useState<boolean>(false);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [matrixData, setMatrixData] = useState<MatrixQuestion | null>(null);
  const [seriesData, setSeriesData] = useState<SeriesQuestion | null>(null);

  const isPolice = theme === 'police';

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

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'police' ? 'dark' : 'police'));
  };

  const currentTier = getDifficultyTier(total);
  const tierLabels: Record<DifficultyTier, { label: string; policeColor: string; darkColor: string }> = {
    easy: {
      label: 'קל',
      policeColor: 'bg-emerald-50 text-emerald-800 border-emerald-300',
      darkColor: 'bg-emerald-950/60 text-emerald-400 border-emerald-500/40',
    },
    medium: {
      label: 'בינוני',
      policeColor: 'bg-amber-50 text-amber-800 border-amber-300',
      darkColor: 'bg-amber-950/60 text-amber-400 border-amber-500/40',
    },
    hard: {
      label: 'קשה',
      policeColor: 'bg-rose-50 text-rose-800 border-rose-300',
      darkColor: 'bg-rose-950/60 text-rose-400 border-rose-500/40',
    },
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
    <div
      className={`relative min-h-screen flex flex-col justify-between overflow-x-hidden transition-colors duration-300 ${
        isPolice
          ? 'bg-[#f4f6fa] text-slate-800 selection:bg-blue-200'
          : 'bg-[#06091a] text-[#f1f5f9] selection:bg-blue-500/30'
      }`}
    >
      {isPolice ? <div className="bg-police-pattern" /> : <div className="bg-mesh-glow" />}

      {/* HEADER / NAVIGATION */}
      <header className="relative z-10 w-full max-w-4xl mx-auto px-4 py-3 sm:py-5 flex items-center justify-between gap-4">
        {currentScreen === 'quiz' ? (
          <button
            id="back-home-btn"
            onClick={goHome}
            className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-sm font-semibold transition-all cursor-pointer shadow-sm ${
              isPolice
                ? 'text-[#102a45] bg-white border-2 border-slate-200 hover:border-[#102a45]'
                : 'text-slate-300 bg-slate-900/60 border border-slate-700/50 hover:bg-slate-800/80 hover:border-slate-600 backdrop-blur-md'
            }`}
          >
            <ArrowRight className="w-4 h-4" />
            <span>חזרה</span>
          </button>
        ) : (
          <div className="flex items-center gap-2.5 font-bold tracking-wide">
            {isPolice ? (
              <div className="w-8 h-8 rounded-lg bg-[#102a45] text-white flex items-center justify-center shadow-sm">
                <Shield className="w-4 h-4" />
              </div>
            ) : (
              <Brain className="w-6 h-6 text-blue-400" />
            )}
            <span
              className={`text-lg font-black tracking-tight ${
                isPolice
                  ? 'text-[#102a45]'
                  : 'bg-gradient-to-r from-blue-400 via-indigo-300 to-purple-400 bg-clip-text text-transparent'
              }`}
            >
              CogniPrep
            </span>
          </div>
        )}

        <div className="flex items-center gap-2.5">
          {/* THEME TOGGLE BUTTON */}
          <button
            id="theme-toggle-btn"
            onClick={toggleTheme}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer shadow-sm ${
              isPolice
                ? 'bg-white border-2 border-slate-200 text-[#102a45] hover:border-[#102a45]'
                : 'bg-slate-900/70 border border-slate-700/60 text-slate-300 hover:border-slate-500'
            }`}
            title="החלפת מצב צבע (מבחן משטרה / מצב כהה)"
          >
            {isPolice ? (
              <>
                <Moon className="w-3.5 h-3.5 text-blue-700" />
                <span className="hidden sm:inline">מצב כהה</span>
              </>
            ) : (
              <>
                <Sun className="w-3.5 h-3.5 text-amber-400" />
                <span className="hidden sm:inline">מבחן משטרה</span>
              </>
            )}
          </button>

          {currentScreen === 'quiz' && (
            <div className="flex items-center gap-2">
              <span
                className={`text-xs font-bold px-3 py-1 rounded-full border tracking-wide ${
                  isPolice
                    ? tierLabels[currentTier].policeColor
                    : tierLabels[currentTier].darkColor
                }`}
              >
                רמה: {tierLabels[currentTier].label}
              </span>

              <div
                className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold shadow-sm ${
                  isPolice
                    ? 'text-[#102a45] bg-white border-2 border-slate-200'
                    : 'text-cyan-400 bg-cyan-950/50 border border-cyan-500/30'
                }`}
              >
                <Trophy className="w-3.5 h-3.5 text-amber-500" />
                <span style={{ direction: 'ltr' }}>
                  {score} / {total}
                </span>
              </div>
            </div>
          )}
        </div>
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
              className="flex flex-col items-center text-center gap-7 py-6"
            >
              {/* HERO */}
              <div className="flex flex-col items-center gap-3 max-w-lg">
                <motion.div
                  animate={{ y: [-3, 5, -3] }}
                  transition={{ repeat: Infinity, duration: 4, ease: 'easeInOut' }}
                  className={`w-20 h-20 rounded-3xl p-0.5 flex items-center justify-center mb-1 shadow-lg ${
                    isPolice
                      ? 'bg-gradient-to-tr from-[#102a45] to-[#1e40af] text-white'
                      : 'bg-gradient-to-tr from-blue-600 to-indigo-500 text-blue-400'
                  }`}
                >
                  <div
                    className={`w-full h-full rounded-[22px] flex items-center justify-center ${
                      isPolice ? 'bg-[#102a45] text-white' : 'bg-slate-950/80'
                    }`}
                  >
                    {isPolice ? (
                      <Shield className="w-10 h-10 text-blue-200" />
                    ) : (
                      <Brain className="w-10 h-10 text-blue-400" />
                    )}
                  </div>
                </motion.div>

                <h1
                  className={`text-3xl sm:text-5xl font-black tracking-tight ${
                    isPolice ? 'text-[#102a45]' : 'text-white'
                  }`}
                >
                  הכנה למבחנים{' '}
                  <span
                    className={
                      isPolice
                        ? 'text-blue-700 underline decoration-blue-300'
                        : 'bg-gradient-to-r from-blue-400 via-indigo-400 to-purple-400 bg-clip-text text-transparent'
                    }
                  >
                    קוגניטיביים
                  </span>
                </h1>
                <p
                  className={`text-sm sm:text-base leading-relaxed ${
                    isPolice ? 'text-slate-600' : 'text-slate-400'
                  }`}
                >
                  מערכת תרגול מקיפה לסדרות מספרים ומטריצות צורניות בעיצוב ובמבנה המדויק של מבחני המיון של משטרת ישראל.
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
                  className={`flex flex-col text-right p-6 rounded-2xl transition-all shadow-md group cursor-pointer ${
                    isPolice
                      ? 'bg-white border-2 border-slate-200/90 hover:border-[#102a45] hover:shadow-xl'
                      : 'bg-slate-900/60 border border-slate-700/50 hover:border-blue-500/50 hover:bg-slate-850/80 backdrop-blur-xl'
                  }`}
                >
                  <div
                    className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform ${
                      isPolice
                        ? 'bg-blue-50 border border-blue-200 text-[#102a45]'
                        : 'bg-blue-500/10 border border-blue-500/20 text-blue-400'
                    }`}
                  >
                    <Grid3X3 className="w-6 h-6" />
                  </div>
                  <h2
                    className={`text-lg font-bold mb-1 transition-colors ${
                      isPolice
                        ? 'text-[#102a45] group-hover:text-blue-800'
                        : 'text-white group-hover:text-blue-300'
                    }`}
                  >
                    מבחן מטריצות צורניות
                  </h2>
                  <p
                    className={`text-xs leading-normal ${
                      isPolice ? 'text-slate-600' : 'text-slate-400'
                    }`}
                  >
                    סדרות צורניות, אנלוגיות 3×2, מעגלים קונצנטריים ומתווים בשילוב חלוקה ומילוי.
                  </p>
                </motion.button>

                {/* SERIES TEST */}
                <motion.button
                  id="btn-series"
                  onClick={() => startQuiz('series')}
                  whileHover={{ y: -4, scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className={`flex flex-col text-right p-6 rounded-2xl transition-all shadow-md group cursor-pointer ${
                    isPolice
                      ? 'bg-white border-2 border-slate-200/90 hover:border-indigo-600 hover:shadow-xl'
                      : 'bg-slate-900/60 border border-slate-700/50 hover:border-purple-500/50 hover:bg-slate-850/80 backdrop-blur-xl'
                  }`}
                >
                  <div
                    className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform ${
                      isPolice
                        ? 'bg-indigo-50 border border-indigo-200 text-indigo-900'
                        : 'bg-purple-500/10 border border-purple-500/20 text-purple-400'
                    }`}
                  >
                    <Hash className="w-6 h-6" />
                  </div>
                  <h2
                    className={`text-lg font-bold mb-1 transition-colors ${
                      isPolice
                        ? 'text-[#102a45] group-hover:text-indigo-800'
                        : 'text-white group-hover:text-purple-300'
                    }`}
                  >
                    מבחן סדרות מספרים
                  </h2>
                  <p
                    className={`text-xs leading-normal ${
                      isPolice ? 'text-slate-600' : 'text-slate-400'
                    }`}
                  >
                    סדרות חשבוניות, הפרשים עולים, פעולות משולבות וסדרות שזורות.
                  </p>
                </motion.button>
              </div>

              {/* QUICK BADGES */}
              <div
                className={`flex items-center gap-6 text-xs ${
                  isPolice ? 'text-slate-500' : 'text-slate-500'
                }`}
              >
                <span className="flex items-center gap-1.5">
                  <Sparkles
                    className={`w-4 h-4 ${isPolice ? 'text-blue-600' : 'text-cyan-400'}`}
                  />{' '}
                  מנוע צורות וקטורי חד
                </span>
                <span className="flex items-center gap-1.5">
                  <Trophy
                    className={`w-4 h-4 ${isPolice ? 'text-amber-600' : 'text-amber-400'}`}
                  />{' '}
                  התאמה מלאה למבחן המשטרה
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
              <div
                className={`w-full max-w-2xl rounded-3xl p-5 sm:p-7 flex flex-col items-center transition-all ${
                  isPolice
                    ? 'bg-white border-2 border-slate-200/90 shadow-xl shadow-slate-200/50'
                    : 'bg-slate-900/40 border border-slate-800/80 backdrop-blur-2xl shadow-2xl'
                }`}
              >
                {quizType === 'matrices' && matrixData && (
                  <MatrixGrid
                    grid={matrixData.grid}
                    layout={matrixData.layout}
                    answered={answered}
                    correctAnswer={matrixData.answer}
                    isCorrect={isCurrentCorrect}
                    promptSubtitle={matrixData.promptSubtitle}
                    theme={theme}
                  />
                )}

                {quizType === 'series' && seriesData && (
                  <SeriesDisplay
                    visible={seriesData.visible}
                    answered={answered}
                    answer={seriesData.answer}
                    theme={theme}
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
                theme={theme}
              />

              {/* FEEDBACK & NEXT BUTTON */}
              <FeedbackBanner
                show={answered}
                isCorrect={isCurrentCorrect}
                explanation={currentExplanation}
                onNext={nextQuestion}
                theme={theme}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* FOOTER */}
      <footer
        className={`relative z-10 w-full max-w-4xl mx-auto px-4 py-4 text-center text-xs border-t transition-colors ${
          isPolice
            ? 'border-slate-200 text-slate-500'
            : 'border-slate-800/40 text-slate-500'
        }`}
      >
        CogniPrep © 2026 — מודל הכנה מתקדם למבחני מיון קוגניטיביים של משטרת ישראל
      </footer>
    </div>
  );
};

export default App;
