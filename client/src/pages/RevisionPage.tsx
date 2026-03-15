/**
 * RevisionPage — Wikipedia Learn
 * Session de révision des questions ratées
 * Style: Archives Vivantes — interface sobre, questions ratées avec moins de points
 */

import { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useLocation } from 'wouter';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, XCircle, Clock, ChevronRight, RefreshCw, Star, BookOpen } from 'lucide-react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { useApp, XP_PER_CORRECT, XP_PENALTY_TIMEOUT, QuizResult } from '@/contexts/AppContext';

const REVISION_XP = Math.floor(XP_PER_CORRECT / 2); // 5 XP au lieu de 10
const TIMER_SECONDS = 20; // Plus de temps pour la révision

export default function RevisionPage() {
  const params = useParams<{ topic: string }>();
  const [, navigate] = useLocation();
  const { getFailedQuestions, addXP, subtractXP, state } = useApp();

  const topicTitle = decodeURIComponent(params.topic ?? '');
  const topicId = `topic_${encodeURIComponent(topicTitle)}`;

  const failedQuestions = getFailedQuestions(topicId);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [answered, setAnswered] = useState(false);
  const [timedOut, setTimedOut] = useState(false);
  const [timeLeft, setTimeLeft] = useState(TIMER_SECONDS);
  const [results, setResults] = useState<boolean[]>([]);
  const [revisionComplete, setRevisionComplete] = useState(false);
  const [showXpAnimation, setShowXpAnimation] = useState(false);

  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const timerCircumference = 2 * Math.PI * 22;

  const currentQ: QuizResult | undefined = failedQuestions[currentIndex];

  useEffect(() => {
    if (!currentQ || answered || revisionComplete) return;
    setTimeLeft(TIMER_SECONDS);
    timerRef.current = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timerRef.current!);
          handleTimeout();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [currentIndex, answered, revisionComplete]);

  const handleTimeout = useCallback(() => {
    setTimedOut(true);
    setAnswered(true);
    subtractXP(XP_PENALTY_TIMEOUT);
    setResults(prev => [...prev, false]);
  }, [subtractXP]);

  const handleAnswer = useCallback((option: string) => {
    if (answered || !currentQ) return;
    if (timerRef.current) clearInterval(timerRef.current);
    const isCorrect = option === currentQ.correctAnswer;
    setSelectedAnswer(option);
    setAnswered(true);
    setTimedOut(false);
    if (isCorrect) {
      addXP(REVISION_XP);
      setShowXpAnimation(true);
      setTimeout(() => setShowXpAnimation(false), 1500);
    }
    setResults(prev => [...prev, isCorrect]);
  }, [answered, currentQ, addXP]);

  const handleContinue = useCallback(() => {
    if (currentIndex < failedQuestions.length - 1) {
      setCurrentIndex(prev => prev + 1);
      setSelectedAnswer(null);
      setAnswered(false);
      setTimedOut(false);
      setTimeLeft(TIMER_SECONDS);
    } else {
      setRevisionComplete(true);
    }
  }, [currentIndex, failedQuestions.length]);

  const timerProgress = timeLeft / TIMER_SECONDS;
  const timerDashOffset = timerCircumference * (1 - timerProgress);
  const correctCount = results.filter(Boolean).length;

  if (failedQuestions.length === 0) {
    return (
      <div className="min-h-screen flex flex-col bg-[oklch(0.96_0.015_80)]">
        <Header />
        <main className="flex-1 flex flex-col items-center justify-center gap-6 px-4">
          <div className="w-16 h-16 rounded-full bg-[oklch(0.48_0.12_145)/15] border-2 border-[oklch(0.48_0.12_145)] flex items-center justify-center">
            <CheckCircle size={32} className="text-[oklch(0.48_0.12_145)]" />
          </div>
          <div className="text-center">
            <h2 className="font-display text-2xl font-bold text-[oklch(0.18_0.02_60)] mb-2">
              Aucune question à réviser
            </h2>
            <p className="font-body text-[oklch(0.52_0.02_65)]">
              Vous avez répondu correctement à toutes les questions de ce sujet.
            </p>
          </div>
          <button
            onClick={() => navigate(`/search?q=${encodeURIComponent(topicTitle)}`)}
            className="px-6 py-3 bg-[oklch(0.72_0.12_75)] text-[oklch(0.18_0.02_60)] rounded-full font-body font-semibold hover:bg-[oklch(0.80_0.14_78)] transition-colors"
          >
            Retour au sujet
          </button>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-[oklch(0.96_0.015_80)]">
      <Header />

      {/* Breadcrumb */}
      <div className="border-b border-[oklch(0.86_0.02_75)] bg-[oklch(0.99_0.008_80)]">
        <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 py-2 flex items-center gap-2">
          <RefreshCw size={12} className="text-[oklch(0.72_0.12_75)]" />
          <span className="font-mono-data text-[10px] tracking-widest text-[oklch(0.52_0.02_65)]">
            Session de révision — {topicTitle}
          </span>
        </div>
      </div>

      <main className="flex-1 flex flex-col">
        <div className="max-w-3xl mx-auto w-full px-4 sm:px-6 py-8 flex-1 flex flex-col">

          {revisionComplete ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex-1 flex flex-col items-center justify-center text-center gap-6"
            >
              <div className="w-20 h-20 rounded-full bg-[oklch(0.72_0.12_75)/15] border-2 border-[oklch(0.72_0.12_75)] flex items-center justify-center">
                <BookOpen size={36} className="text-[oklch(0.72_0.12_75)]" />
              </div>
              <div>
                <h2 className="font-display text-3xl font-bold text-[oklch(0.18_0.02_60)] mb-2">
                  Révision terminée
                </h2>
                <p className="font-body text-[oklch(0.52_0.02_65)]">
                  {correctCount} / {failedQuestions.length} questions révisées correctement
                </p>
              </div>
              <div className="flex items-center gap-2 px-4 py-2 bg-[oklch(0.72_0.12_75)/10] border border-[oklch(0.72_0.12_75)/30] rounded-full">
                <Star size={14} className="text-[oklch(0.72_0.12_75)]" />
                <span className="font-mono-data text-sm text-[oklch(0.72_0.12_75)]">
                  +{correctCount * REVISION_XP} XP gagnés (révision)
                </span>
              </div>
              <button
                onClick={() => navigate(`/search?q=${encodeURIComponent(topicTitle)}`)}
                className="flex items-center gap-2 px-8 py-3 bg-[oklch(0.72_0.12_75)] text-[oklch(0.18_0.02_60)] rounded-full font-body font-semibold hover:bg-[oklch(0.80_0.14_78)] transition-colors"
              >
                Retour au sujet
                <ChevronRight size={16} />
              </button>
            </motion.div>
          ) : (
            <>
              {/* Info banner */}
              <div className="flex items-center gap-2 px-4 py-2.5 bg-[oklch(0.72_0.12_75)/8] border border-[oklch(0.72_0.12_75)/20] rounded-xl mb-6">
                <RefreshCw size={13} className="text-[oklch(0.72_0.12_75)] shrink-0" />
                <span className="font-body text-xs text-[oklch(0.52_0.02_65)]">
                  Mode révision — {REVISION_XP} XP par bonne réponse (au lieu de {XP_PER_CORRECT} XP)
                </span>
              </div>

              {/* Progress */}
              <div className="mb-8">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-mono-data text-[10px] tracking-widest text-[oklch(0.52_0.02_65)] uppercase">
                    Révision Progress
                  </span>
                  <span className="font-mono-data text-[11px] text-[oklch(0.52_0.02_65)]">
                    {currentIndex + 1} / {failedQuestions.length}
                  </span>
                </div>
                <div className="h-1.5 bg-[oklch(0.86_0.02_75)] rounded-full overflow-hidden">
                  <motion.div
                    className="h-full bg-[oklch(0.72_0.12_75)/60] rounded-full"
                    animate={{ width: `${((currentIndex + 1) / failedQuestions.length) * 100}%` }}
                    transition={{ duration: 0.4 }}
                  />
                </div>
              </div>

              <AnimatePresence mode="wait">
                <motion.div
                  key={currentIndex}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3 }}
                  className="flex-1 flex flex-col"
                >
                  {/* Timer */}
                  <div className="flex items-center justify-center gap-4 mb-6">
                    <div className="font-mono-data text-[10px] tracking-widest text-[oklch(0.52_0.02_65)] uppercase">
                      {currentQ?.chapterTitle?.slice(0, 20)}
                    </div>
                    <div className="relative w-12 h-12">
                      <svg width="48" height="48" className="timer-ring">
                        <circle cx="24" cy="24" r="22" className="timer-ring-track" />
                        <circle
                          cx="24" cy="24" r="22"
                          className="timer-ring-fill"
                          style={{
                            strokeDasharray: timerCircumference,
                            strokeDashoffset: timerDashOffset,
                            stroke: timeLeft <= 5 ? 'oklch(0.50 0.20 25)' : 'oklch(0.72 0.12 75)',
                          }}
                        />
                      </svg>
                      <div className="absolute inset-0 flex items-center justify-center">
                        <span className={`font-mono-data text-xs font-bold ${timeLeft <= 5 ? 'text-[oklch(0.50_0.20_25)]' : 'text-[oklch(0.18_0.02_60)]'}`}>
                          {timeLeft}
                        </span>
                      </div>
                    </div>
                  </div>

                  <h2 className="font-display text-xl sm:text-2xl font-bold text-[oklch(0.18_0.02_60)] text-center mb-8 leading-snug">
                    {currentQ?.question}
                  </h2>

                  {/* Options — reconstruct from correct + wrong answers */}
                  {currentQ && (() => {
                    // Build options: correct answer + 3 generic wrong answers
                    const options = [
                      currentQ.correctAnswer,
                      'Une réponse incorrecte',
                      'Une autre réponse incorrecte',
                      'Aucune de ces réponses',
                    ].sort(() => Math.random() - 0.5);

                    return (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-8">
                        {options.map((option, idx) => {
                          const letter = ['A', 'B', 'C', 'D'][idx];
                          let optionStyle = 'border-[oklch(0.86_0.02_75)] bg-[oklch(0.99_0.008_80)] hover:border-[oklch(0.72_0.12_75)/50]';
                          if (answered) {
                            if (option === currentQ.correctAnswer) {
                              optionStyle = 'border-[oklch(0.48_0.12_145)] bg-[oklch(0.48_0.12_145)/8]';
                            } else if (option === selectedAnswer) {
                              optionStyle = 'border-[oklch(0.50_0.20_25)] bg-[oklch(0.50_0.20_25)/8]';
                            } else {
                              optionStyle = 'border-[oklch(0.86_0.02_75)] bg-[oklch(0.99_0.008_80)] opacity-50';
                            }
                          }
                          return (
                            <button
                              key={idx}
                              onClick={() => handleAnswer(option)}
                              disabled={answered}
                              className={`flex items-center gap-3 p-4 rounded-xl border-2 text-left transition-all ${optionStyle}`}
                            >
                              <div className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 font-mono-data text-xs font-bold ${
                                answered && option === currentQ.correctAnswer
                                  ? 'bg-[oklch(0.48_0.12_145)] text-white'
                                  : answered && option === selectedAnswer && option !== currentQ.correctAnswer
                                    ? 'bg-[oklch(0.50_0.20_25)] text-white'
                                    : 'bg-[oklch(0.93_0.012_78)] text-[oklch(0.52_0.02_65)]'
                              }`}>
                                {answered && option === currentQ.correctAnswer ? <CheckCircle size={14} /> :
                                 answered && option === selectedAnswer && option !== currentQ.correctAnswer ? <XCircle size={14} /> : letter}
                              </div>
                              <span className="font-body text-sm text-[oklch(0.18_0.02_60)]">{option}</span>
                            </button>
                          );
                        })}
                      </div>
                    );
                  })()}

                  {timedOut && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="flex items-center gap-2 p-3 bg-[oklch(0.50_0.20_25)/8] border border-[oklch(0.50_0.20_25)/30] rounded-xl mb-4"
                    >
                      <Clock size={16} className="text-[oklch(0.50_0.20_25)] shrink-0" />
                      <span className="font-body text-sm text-[oklch(0.50_0.20_25)]">
                        Temps écoulé. La bonne réponse était : <strong>{currentQ?.correctAnswer}</strong>
                      </span>
                    </motion.div>
                  )}

                  {answered && (
                    <div className="flex justify-center mt-auto">
                      <motion.button
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        onClick={handleContinue}
                        className="flex items-center gap-2 px-8 py-3 bg-[oklch(0.72_0.12_75)] text-[oklch(0.18_0.02_60)] rounded-full font-mono-data text-[11px] tracking-widest uppercase hover:bg-[oklch(0.80_0.14_78)] transition-colors"
                      >
                        CONTINUER
                        <ChevronRight size={14} />
                      </motion.button>
                    </div>
                  )}
                </motion.div>
              </AnimatePresence>
            </>
          )}
        </div>
      </main>

      {/* XP animation */}
      <AnimatePresence>
        {showXpAnimation && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-20 right-6 z-50 flex items-center gap-1.5 px-3 py-1.5 bg-[oklch(0.72_0.12_75)] text-[oklch(0.18_0.02_60)] rounded-full font-mono-data text-sm shadow-lg"
          >
            <Star size={14} />
            +{REVISION_XP} XP
          </motion.div>
        )}
      </AnimatePresence>

      <Footer />
    </div>
  );
}
