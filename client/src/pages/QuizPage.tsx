/**
 * QuizPage — Wikipedia Learn
 * Page de quiz avec timer 15s, XP, feedback visuel, progression
 * Style: Archives Vivantes — interface sobre, feedback coloré, timer SVG
 * Flux: Question → Réponse → Feedback → Continuer (retour mindmap)
 * Effets: sons (correct/wrong/combo/levelup) + confettis + flammes combo + flash fond
 */

import { useEffect, useState, useRef, useCallback } from 'react';
import { useLocation, useParams, useSearch } from 'wouter';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, XCircle, Clock, ChevronRight, SkipForward, Loader2, Star } from 'lucide-react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { useWikipedia, WikiQuestion, WikiNode } from '@/hooks/useWikipedia';
import { useApp, XP_PER_CORRECT, XP_PENALTY_TIMEOUT, MIN_CORRECT_TO_UNLOCK, MUSIC_TRACKS } from '@/contexts/AppContext';
import MusicUnlockNotification from '@/components/MusicUnlockNotification';
import {
  useQuizSounds,
  QuizEffectsOverlay,
  QuizEffectsState,
  initialEffectsState,
} from '@/components/QuizEffects';

const TIMER_SECONDS = 15;
const QUESTIONS_PER_NODE = 3;

export default function QuizPage() {
  const params = useParams<{ topic: string; chapter: string; node: string }>();
  const [, navigate] = useLocation();
  const search = useSearch();
  const { getSectionNodes, loading } = useWikipedia();
  const { addXP, subtractXP, markNodeCompleted, state } = useApp();
  const { play } = useQuizSounds();

  const urlParams = new URLSearchParams(search);
  const sectionTitle = urlParams.get('section') ?? '';
  const nodeTitle = urlParams.get('nodeTitle') ?? '';

  const topicTitle = decodeURIComponent(params.topic ?? '');
  const chapterIndex = parseInt(params.chapter ?? '0', 10);
  const nodeIndex = parseInt(params.node ?? '0', 10);
  const topicId = `topic_${encodeURIComponent(topicTitle)}`;

  const [questions, setQuestions] = useState<WikiQuestion[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [answered, setAnswered] = useState(false);
  const [timeLeft, setTimeLeft] = useState(TIMER_SECONDS);
  const [timedOut, setTimedOut] = useState(false);
  const [results, setResults] = useState<Array<{ correct: boolean; timedOut: boolean; answer: number | null }>>([]);
  const [xpGained, setXpGained] = useState(0);
  const [quizComplete, setQuizComplete] = useState(false);
  const [newlyUnlockedMusic, setNewlyUnlockedMusic] = useState<typeof MUSIC_TRACKS[0] | null>(null);

  // Effets visuels
  const [effects, setEffects] = useState<QuizEffectsState>(initialEffectsState);
  const [consecutiveCorrect, setConsecutiveCorrect] = useState(0);

  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const timerCircumference = 2 * Math.PI * 22; // radius=22

  // Déclencher un effet visuel + sonore
  const triggerEffect = useCallback((type: 'correct' | 'wrong' | 'combo' | 'levelup', xp = 0, combo = 0) => {
    if (type === 'correct') {
      play(combo >= 2 ? 'combo' : 'correct');
      setEffects({
        flash: 'correct',
        showConfetti: true,
        showXP: true,
        xpAmount: xp,
        combo,
        showLevelUp: false,
      });
      setTimeout(() => setEffects(prev => ({ ...prev, flash: null, showConfetti: false, showXP: false })), 1800);
    } else if (type === 'wrong') {
      play('wrong');
      setEffects({
        flash: 'wrong',
        showConfetti: false,
        showXP: false,
        xpAmount: 0,
        combo: 0,
        showLevelUp: false,
      });
      setTimeout(() => setEffects(prev => ({ ...prev, flash: null })), 600);
    } else if (type === 'levelup') {
      play('levelup');
      setEffects(prev => ({ ...prev, showLevelUp: true }));
      setTimeout(() => setEffects(prev => ({ ...prev, showLevelUp: false })), 2500);
    }
  }, [play]);

  // Load node data and questions
  useEffect(() => {
    if (!topicTitle || !sectionTitle) return;
    getSectionNodes(topicTitle, sectionTitle, '').then(nodes => {
      const node = nodes[nodeIndex];
      if (node) {
        setQuestions(node.questions.slice(0, QUESTIONS_PER_NODE));
      }
    });
  }, [topicTitle, sectionTitle, nodeIndex]);

  // Timer
  useEffect(() => {
    if (!questions.length || answered || quizComplete) return;
    
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

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [currentQuestionIndex, questions.length, quizComplete]);

  const handleTimeout = useCallback(() => {
    setTimedOut(true);
    setAnswered(true);
    subtractXP(XP_PENALTY_TIMEOUT);
    setConsecutiveCorrect(0);
    setResults(prev => [...prev, { correct: false, timedOut: true, answer: null }]);
    triggerEffect('wrong');
  }, [subtractXP, triggerEffect]);

  const handleAnswer = useCallback((optionIndex: number) => {
    if (answered) return;
    if (timerRef.current) clearInterval(timerRef.current);
    
    const question = questions[currentQuestionIndex];
    const isCorrect = optionIndex === question.correctIndex;
    
    setSelectedAnswer(optionIndex);
    setAnswered(true);
    setTimedOut(false);

    if (isCorrect) {
      const prevXP = state.xp;
      const { newlyUnlocked } = addXP(XP_PER_CORRECT);
      const newConsecutive = consecutiveCorrect + 1;
      setConsecutiveCorrect(newConsecutive);
      setXpGained(XP_PER_CORRECT);

      // Vérifier level up
      const prevLevel = Math.floor(prevXP / 100) + 1;
      const newLevel = Math.floor((prevXP + XP_PER_CORRECT) / 100) + 1;
      if (newLevel > prevLevel) {
        triggerEffect('levelup', XP_PER_CORRECT, newConsecutive);
      } else {
        triggerEffect('correct', XP_PER_CORRECT, newConsecutive);
      }

      if (newlyUnlocked.length > 0) {
        setNewlyUnlockedMusic(newlyUnlocked[0]);
      }
    } else {
      setConsecutiveCorrect(0);
      triggerEffect('wrong');
    }

    setResults(prev => [...prev, { correct: isCorrect, timedOut: false, answer: optionIndex }]);
  }, [answered, questions, currentQuestionIndex, addXP, consecutiveCorrect, state.xp, triggerEffect]);

  const handleContinue = useCallback(() => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
      setSelectedAnswer(null);
      setAnswered(false);
      setTimedOut(false);
      setTimeLeft(TIMER_SECONDS);
    } else {
      setQuizComplete(true);
      
      const quizResults = results.map((r, i) => ({
        nodeId: `node_${nodeIndex}`,
        topicTitle,
        chapterTitle: sectionTitle,
        questionId: questions[i]?.id ?? `q_${i}`,
        question: questions[i]?.question ?? '',
        correctAnswer: questions[i]?.options[questions[i]?.correctIndex] ?? '',
        userAnswer: r.answer !== null ? questions[i]?.options[r.answer] ?? null : null,
        isCorrect: r.correct,
        timestamp: Date.now(),
      }));
      
      markNodeCompleted(topicId, topicTitle, `node_${nodeIndex}`, sectionTitle, quizResults);
    }
  }, [currentQuestionIndex, questions, results, nodeIndex, topicId, topicTitle, sectionTitle, markNodeCompleted]);

  const handleSkip = useCallback(() => {
    if (answered) return;
    if (timerRef.current) clearInterval(timerRef.current);
    setConsecutiveCorrect(0);
    setResults(prev => [...prev, { correct: false, timedOut: false, answer: null }]);
    
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
      setSelectedAnswer(null);
      setAnswered(false);
      setTimedOut(false);
      setTimeLeft(TIMER_SECONDS);
    } else {
      setQuizComplete(true);
      const quizResults = [...results, { correct: false, timedOut: false, answer: null }].map((r, i) => ({
        nodeId: `node_${nodeIndex}`,
        topicTitle,
        chapterTitle: sectionTitle,
        questionId: questions[i]?.id ?? `q_${i}`,
        question: questions[i]?.question ?? '',
        correctAnswer: questions[i]?.options[questions[i]?.correctIndex] ?? '',
        userAnswer: r.answer !== null ? questions[i]?.options[r.answer] ?? null : null,
        isCorrect: r.correct,
        timestamp: Date.now(),
      }));
      markNodeCompleted(topicId, topicTitle, `node_${nodeIndex}`, sectionTitle, quizResults);
    }
  }, [answered, currentQuestionIndex, questions, results, nodeIndex, topicId, topicTitle, sectionTitle, markNodeCompleted]);

  const correctCount = results.filter(r => r.correct).length;
  const nodeUnlocked = correctCount >= MIN_CORRECT_TO_UNLOCK;
  const timerProgress = timeLeft / TIMER_SECONDS;
  const timerDashOffset = timerCircumference * (1 - timerProgress);

  const currentQuestion = questions[currentQuestionIndex];

  if (loading || !questions.length) {
    return (
      <div className="min-h-screen flex flex-col bg-[oklch(0.96_0.015_80)]">
        <Header />
        <div className="flex-1 flex items-center justify-center gap-3">
          <Loader2 size={24} className="animate-spin text-[oklch(0.72_0.12_75)]" />
          <span className="font-body text-[oklch(0.52_0.02_65)]">Préparation du quiz...</span>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-[oklch(0.96_0.015_80)] relative overflow-hidden">
      <Header />

      {/* Effets visuels globaux */}
      <QuizEffectsOverlay state={effects} />

      {/* Breadcrumb */}
      <div className="border-b border-[oklch(0.86_0.02_75)] bg-[oklch(0.99_0.008_80)]">
        <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 py-2">
          <span className="font-mono-data text-[10px] tracking-widest text-[oklch(0.52_0.02_65)]">
            Module {chapterIndex + 1}.{nodeIndex + 1} : Quiz — {nodeTitle || sectionTitle}
          </span>
        </div>
      </div>

      <main className="flex-1 flex flex-col">
        <div className="max-w-3xl mx-auto w-full px-4 sm:px-6 py-8 flex-1 flex flex-col">

          {/* Quiz complete screen */}
          {quizComplete ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex-1 flex flex-col items-center justify-center text-center gap-6"
            >
              {/* Icône résultat */}
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                className={`w-20 h-20 rounded-full flex items-center justify-center ${nodeUnlocked ? 'bg-[oklch(0.48_0.12_145)/15] border-2 border-[oklch(0.48_0.12_145)]' : 'bg-[oklch(0.50_0.20_25)/10] border-2 border-[oklch(0.50_0.20_25)]'}`}
              >
                {nodeUnlocked ? (
                  <CheckCircle size={36} className="text-[oklch(0.48_0.12_145)]" />
                ) : (
                  <XCircle size={36} className="text-[oklch(0.50_0.20_25)]" />
                )}
              </motion.div>

              <div>
                <h2 className="font-display text-3xl font-bold text-[oklch(0.18_0.02_60)] mb-2">
                  {nodeUnlocked ? 'Noeud débloqué !' : 'Continuez vos efforts'}
                </h2>
                <p className="font-body text-[oklch(0.52_0.02_65)]">
                  {correctCount} / {questions.length} bonnes réponses
                  {nodeUnlocked ? ' — Le noeud suivant est maintenant accessible.' : ` — Il faut au moins ${MIN_CORRECT_TO_UNLOCK} bonnes réponses pour débloquer la suite.`}
                </p>
              </div>

              {/* Score breakdown */}
              <div className="flex gap-3">
                {results.map((r, i) => (
                  <motion.div
                    key={i}
                    initial={{ scale: 0, rotate: -180 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ delay: i * 0.15, type: 'spring' }}
                    className={`w-10 h-10 rounded-full flex items-center justify-center border-2 ${
                      r.correct 
                        ? 'bg-[oklch(0.48_0.12_145)/10] border-[oklch(0.48_0.12_145)]'
                        : r.timedOut
                          ? 'bg-[oklch(0.52_0.02_65)/10] border-[oklch(0.52_0.02_65)]'
                          : 'bg-[oklch(0.50_0.20_25)/10] border-[oklch(0.50_0.20_25)]'
                    }`}
                  >
                    {r.correct ? (
                      <CheckCircle size={16} className="text-[oklch(0.48_0.12_145)]" />
                    ) : r.timedOut ? (
                      <Clock size={16} className="text-[oklch(0.52_0.02_65)]" />
                    ) : (
                      <XCircle size={16} className="text-[oklch(0.50_0.20_25)]" />
                    )}
                  </motion.div>
                ))}
              </div>

              {/* XP earned */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="flex items-center gap-2 px-4 py-2 bg-[oklch(0.72_0.12_75)/10] border border-[oklch(0.72_0.12_75)/30] rounded-full"
              >
                <Star size={14} className="text-[oklch(0.72_0.12_75)]" />
                <span className="font-mono-data text-sm text-[oklch(0.72_0.12_75)]">
                  +{correctCount * XP_PER_CORRECT} XP gagnés
                </span>
              </motion.div>

              <motion.button
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7 }}
                onClick={() => navigate(`/topic/${encodeURIComponent(topicTitle)}/chapter/${chapterIndex}?section=${encodeURIComponent(sectionTitle)}`)}
                className="flex items-center gap-2 px-8 py-3 bg-[oklch(0.72_0.12_75)] text-[oklch(0.18_0.02_60)] rounded-full font-body font-semibold hover:bg-[oklch(0.80_0.14_78)] transition-colors shadow-sm"
              >
                Retour au parcours
                <ChevronRight size={16} />
              </motion.button>
            </motion.div>
          ) : (
            <>
              {/* Progress bar */}
              <div className="mb-8">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-mono-data text-[10px] tracking-widest text-[oklch(0.52_0.02_65)] uppercase">
                    Quiz Progress
                  </span>
                  <span className="font-mono-data text-[11px] text-[oklch(0.52_0.02_65)]">
                    {currentQuestionIndex + 1} / {questions.length} Questions ({Math.round(((currentQuestionIndex + 1) / questions.length) * 100)}%)
                  </span>
                </div>
                <div className="h-1.5 bg-[oklch(0.86_0.02_75)] rounded-full overflow-hidden">
                  <motion.div
                    className="h-full bg-[oklch(0.72_0.12_75)] rounded-full"
                    animate={{ width: `${((currentQuestionIndex + 1) / questions.length) * 100}%` }}
                    transition={{ duration: 0.4 }}
                  />
                </div>
              </div>

              {/* Question area */}
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentQuestionIndex}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3 }}
                  className="flex-1 flex flex-col relative"
                >
                  {/* Timer + category */}
                  <div className="flex items-center justify-center gap-4 mb-6">
                    <div className="font-mono-data text-[10px] tracking-widest text-[oklch(0.72_0.12_75)] uppercase">
                      {sectionTitle.slice(0, 20).toUpperCase()}
                    </div>
                    
                    {/* SVG Timer — avec animation de pulsation quand < 5s */}
                    <motion.div
                      className="relative w-12 h-12"
                      animate={timeLeft <= 5 ? { scale: [1, 1.15, 1] } : { scale: 1 }}
                      transition={timeLeft <= 5 ? { duration: 0.5, repeat: Infinity } : {}}
                    >
                      <svg width="48" height="48" className="timer-ring">
                        <circle cx="24" cy="24" r="22" className="timer-ring-track" />
                        <motion.circle
                          cx="24"
                          cy="24"
                          r="22"
                          className="timer-ring-fill"
                          style={{
                            strokeDasharray: timerCircumference,
                            strokeDashoffset: timerDashOffset,
                            stroke: timeLeft <= 5 ? 'oklch(0.50 0.20 25)' : timeLeft <= 10 ? 'oklch(0.72 0.12 75)' : 'oklch(0.48 0.12 145)',
                          }}
                        />
                      </svg>
                      <div className="absolute inset-0 flex items-center justify-center">
                        <span className={`font-mono-data text-xs font-bold ${timeLeft <= 5 ? 'text-[oklch(0.50_0.20_25)]' : 'text-[oklch(0.18_0.02_60)]'}`}>
                          {timeLeft}
                        </span>
                      </div>
                    </motion.div>

                    {/* Indicateur de combo */}
                    <AnimatePresence>
                      {consecutiveCorrect >= 2 && (
                        <motion.div
                          initial={{ opacity: 0, scale: 0.5, x: 10 }}
                          animate={{ opacity: 1, scale: 1, x: 0 }}
                          exit={{ opacity: 0, scale: 0.5 }}
                          className="font-mono-data text-[10px] font-bold tracking-widest"
                          style={{ color: '#FF6B00', textShadow: '0 0 8px rgba(255,107,0,0.5)' }}
                        >
                          {consecutiveCorrect >= 5 ? 'LÉGENDAIRE' : consecutiveCorrect >= 4 ? 'INFERNAL' : consecutiveCorrect >= 3 ? 'EN FEU' : 'COMBO'} x{consecutiveCorrect}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>

                  {/* Question */}
                  <h2 className="font-display text-xl sm:text-2xl font-bold text-[oklch(0.18_0.02_60)] text-center mb-8 leading-snug">
                    {currentQuestion?.question}
                  </h2>

                  {/* Options */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-8">
                    {currentQuestion?.options.map((option, idx) => {
                      const letter = ['A', 'B', 'C', 'D'][idx];
                      let optionStyle = 'border-[oklch(0.86_0.02_75)] bg-[oklch(0.99_0.008_80)] hover:border-[oklch(0.72_0.12_75)/50] hover:bg-[oklch(0.93_0.012_78)]';
                      
                      if (answered) {
                        if (idx === currentQuestion.correctIndex) {
                          optionStyle = 'border-[oklch(0.48_0.12_145)] bg-[oklch(0.48_0.12_145)/8]';
                        } else if (idx === selectedAnswer && idx !== currentQuestion.correctIndex) {
                          optionStyle = 'border-[oklch(0.50_0.20_25)] bg-[oklch(0.50_0.20_25)/8]';
                        } else {
                          optionStyle = 'border-[oklch(0.86_0.02_75)] bg-[oklch(0.99_0.008_80)] opacity-50';
                        }
                      }

                      return (
                        <motion.button
                          key={idx}
                          whileHover={!answered ? { scale: 1.02, y: -1 } : {}}
                          whileTap={!answered ? { scale: 0.98 } : {}}
                          onClick={() => handleAnswer(idx)}
                          disabled={answered}
                          className={`flex items-center gap-3 p-4 rounded-xl border-2 text-left transition-all ${optionStyle}`}
                        >
                          <div className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 font-mono-data text-xs font-bold ${
                            answered && idx === currentQuestion.correctIndex
                              ? 'bg-[oklch(0.48_0.12_145)] text-white'
                              : answered && idx === selectedAnswer && idx !== currentQuestion.correctIndex
                                ? 'bg-[oklch(0.50_0.20_25)] text-white'
                                : 'bg-[oklch(0.93_0.012_78)] text-[oklch(0.52_0.02_65)]'
                          }`}>
                            {answered && idx === currentQuestion.correctIndex ? (
                              <CheckCircle size={14} />
                            ) : answered && idx === selectedAnswer && idx !== currentQuestion.correctIndex ? (
                              <XCircle size={14} />
                            ) : letter}
                          </div>
                          <span className="font-body text-sm text-[oklch(0.18_0.02_60)] leading-snug">{option}</span>
                        </motion.button>
                      );
                    })}
                  </div>

                  {/* Timeout message */}
                  {timedOut && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="flex items-center gap-2 p-3 bg-[oklch(0.50_0.20_25)/8] border border-[oklch(0.50_0.20_25)/30] rounded-xl mb-4"
                    >
                      <Clock size={16} className="text-[oklch(0.50_0.20_25)] shrink-0" />
                      <span className="font-body text-sm text-[oklch(0.50_0.20_25)]">
                        Temps écoulé — {XP_PENALTY_TIMEOUT} XP déduits. La bonne réponse était : <strong>{currentQuestion?.options[currentQuestion.correctIndex]}</strong>
                      </span>
                    </motion.div>
                  )}

                  {/* Correct answer explanation */}
                  {answered && !timedOut && selectedAnswer !== null && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={`flex items-start gap-2 p-3 rounded-xl mb-4 ${
                        selectedAnswer === currentQuestion?.correctIndex
                          ? 'bg-[oklch(0.48_0.12_145)/8] border border-[oklch(0.48_0.12_145)/30]'
                          : 'bg-[oklch(0.50_0.20_25)/8] border border-[oklch(0.50_0.20_25)/30]'
                      }`}
                    >
                      {selectedAnswer === currentQuestion?.correctIndex ? (
                        <CheckCircle size={16} className="text-[oklch(0.48_0.12_145)] shrink-0 mt-0.5" />
                      ) : (
                        <XCircle size={16} className="text-[oklch(0.50_0.20_25)] shrink-0 mt-0.5" />
                      )}
                      <span className="font-body text-sm text-[oklch(0.35_0.02_65)]">
                        {selectedAnswer === currentQuestion?.correctIndex
                          ? currentQuestion?.explanation
                          : `Incorrect. La bonne réponse était : ${currentQuestion?.options[currentQuestion?.correctIndex]}`
                        }
                      </span>
                    </motion.div>
                  )}

                  {/* Actions */}
                  <div className="flex items-center justify-center gap-3 mt-auto">
                    {!answered && (
                      <button
                        onClick={handleSkip}
                        className="flex items-center gap-1.5 px-5 py-2.5 border border-[oklch(0.86_0.02_75)] text-[oklch(0.52_0.02_65)] rounded-full font-mono-data text-[11px] tracking-wide hover:border-[oklch(0.72_0.12_75)] transition-colors"
                      >
                        <SkipForward size={13} />
                        SKIP
                      </button>
                    )}
                    {answered && (
                      <motion.button
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        whileHover={{ scale: 1.03 }}
                        whileTap={{ scale: 0.97 }}
                        onClick={handleContinue}
                        className="flex items-center gap-2 px-8 py-3 bg-[oklch(0.72_0.12_75)] text-[oklch(0.18_0.02_60)] rounded-full font-mono-data text-[11px] tracking-widest uppercase hover:bg-[oklch(0.80_0.14_78)] transition-colors shadow-sm"
                      >
                        CONTINUER
                        <ChevronRight size={14} />
                      </motion.button>
                    )}
                  </div>
                </motion.div>
              </AnimatePresence>
            </>
          )}
        </div>
      </main>

      {/* Music unlock notification */}
      <MusicUnlockNotification
        track={newlyUnlockedMusic}
        onClose={() => setNewlyUnlockedMusic(null)}
      />

      <Footer />
    </div>
  );
}
