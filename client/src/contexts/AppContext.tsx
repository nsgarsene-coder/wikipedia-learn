/**
 * AppContext — Wikipedia Learn
 * Gestion globale : XP, niveau, musique, progression, authentification
 * Style: Archives Vivantes — données encyclopédiques, gamification sobre
 */

import React, { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface MusicTrack {
  id: string;
  name: string;
  url: string;
  unlockXP: number; // 0 = disponible dès le départ
}

export interface QuizResult {
  nodeId: string;
  topicTitle: string;
  chapterTitle: string;
  questionId: string;
  question: string;
  correctAnswer: string;
  userAnswer: string | null;
  isCorrect: boolean;
  timestamp: number;
}

export interface NodeProgress {
  nodeId: string;
  completed: boolean;
  correctAnswers: number;
  totalAnswers: number;
  xpEarned: number;
}

export interface TopicProgress {
  topicId: string;
  topicTitle: string;
  completedNodes: string[];
  nodeProgress: Record<string, NodeProgress>;
  failedQuestions: QuizResult[];
}

export interface AppState {
  xp: number;
  level: number;
  currentMusicId: string | null;
  musicPlaying: boolean;
  musicVolume: number;
  unlockedMusicIds: string[];
  topicProgress: Record<string, TopicProgress>;
  isAuthenticated: boolean;
  username: string | null;
  showRegisterPrompt: boolean;
  completedNodesCount: number; // pour déclencher le prompt à 2
}

// ─── Constants ────────────────────────────────────────────────────────────────

export const MUSIC_TRACKS: MusicTrack[] = [
  {
    id: 'default',
    name: 'Ambiance Encyclopédique',
    url: 'https://d2xsxph8kpxj0f.cloudfront.net/310519663220604081/4yVN7vCPddVujpJhdqv4a2/music_default_b36520a0.mp3',
    unlockXP: 0,
  },
  {
    id: 'track_60',
    name: 'Perspectives',
    url: 'https://d2xsxph8kpxj0f.cloudfront.net/310519663220604081/4yVN7vCPddVujpJhdqv4a2/music_60xp_9cb74f7f.mp3',
    unlockXP: 60,
  },
  {
    id: 'track_120',
    name: 'Méditation Impromptu',
    url: 'https://d2xsxph8kpxj0f.cloudfront.net/310519663220604081/4yVN7vCPddVujpJhdqv4a2/music_120xp_9891ae62.mp3',
    unlockXP: 120,
  },
  {
    id: 'track_180',
    name: 'Sneaky Scholar',
    url: 'https://d2xsxph8kpxj0f.cloudfront.net/310519663220604081/4yVN7vCPddVujpJhdqv4a2/music_180xp_d6c65e80.mp3',
    unlockXP: 180,
  },
];

export const XP_PER_CORRECT = 10;
export const XP_PENALTY_TIMEOUT = 5;
export const XP_PER_NODE = 30; // 3 questions * 10 XP
export const MIN_CORRECT_TO_UNLOCK = 2; // sur 3 questions

const STORAGE_KEY = 'wikipedia_learn_state';

const DEFAULT_STATE: AppState = {
  xp: 0,
  level: 1,
  currentMusicId: 'default',
  musicPlaying: false,
  musicVolume: 0.6,
  unlockedMusicIds: ['default'],
  topicProgress: {},
  isAuthenticated: false,
  username: null,
  showRegisterPrompt: false,
  completedNodesCount: 0,
};

// ─── Context ──────────────────────────────────────────────────────────────────

interface AppContextType {
  state: AppState;
  addXP: (amount: number) => { newlyUnlocked: MusicTrack[] };
  subtractXP: (amount: number) => void;
  setMusicPlaying: (playing: boolean) => void;
  setCurrentMusic: (id: string) => void;
  setMusicVolume: (vol: number) => void;
  markNodeCompleted: (topicId: string, topicTitle: string, nodeId: string, chapterTitle: string, results: QuizResult[]) => void;
  isNodeUnlocked: (topicId: string, nodeId: string, nodeIndex: number) => boolean;
  isNodeCompleted: (topicId: string, nodeId: string) => boolean;
  getNodeProgress: (topicId: string, nodeId: string) => NodeProgress | null;
  getFailedQuestions: (topicId: string) => QuizResult[];
  login: (username: string) => void;
  logout: () => void;
  dismissRegisterPrompt: () => void;
  resetProgress: () => void;
}

const AppContext = createContext<AppContextType | null>(null);

// ─── Provider ─────────────────────────────────────────────────────────────────

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AppState>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        return { ...DEFAULT_STATE, ...parsed };
      }
    } catch {
      // ignore
    }
    return DEFAULT_STATE;
  });

  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Persist state
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }, [state]);

  // Audio management
  useEffect(() => {
    const track = MUSIC_TRACKS.find(t => t.id === state.currentMusicId);
    if (!track) return;

    if (!audioRef.current) {
      audioRef.current = new Audio(track.url);
      audioRef.current.loop = true;
    } else if (audioRef.current.src !== track.url) {
      audioRef.current.pause();
      audioRef.current = new Audio(track.url);
      audioRef.current.loop = true;
    }

    audioRef.current.volume = state.musicVolume;

    if (state.musicPlaying) {
      audioRef.current.play().catch(() => {});
    } else {
      audioRef.current.pause();
    }

    return () => {
      // cleanup handled by next effect run
    };
  }, [state.currentMusicId, state.musicPlaying, state.musicVolume]);

  const addXP = useCallback((amount: number): { newlyUnlocked: MusicTrack[] } => {
    let newlyUnlocked: MusicTrack[] = [];
    setState(prev => {
      const newXP = prev.xp + amount;
      const newLevel = Math.floor(newXP / 100) + 1;
      
      // Check newly unlocked music
      const newUnlocked = MUSIC_TRACKS.filter(
        t => t.unlockXP > 0 && t.unlockXP <= newXP && !prev.unlockedMusicIds.includes(t.id)
      );
      newlyUnlocked = newUnlocked;
      
      return {
        ...prev,
        xp: newXP,
        level: newLevel,
        unlockedMusicIds: [...prev.unlockedMusicIds, ...newUnlocked.map(t => t.id)],
      };
    });
    return { newlyUnlocked };
  }, []);

  const subtractXP = useCallback((amount: number) => {
    setState(prev => ({
      ...prev,
      xp: Math.max(0, prev.xp - amount),
    }));
  }, []);

  const setMusicPlaying = useCallback((playing: boolean) => {
    setState(prev => ({ ...prev, musicPlaying: playing }));
  }, []);

  const setCurrentMusic = useCallback((id: string) => {
    setState(prev => ({ ...prev, currentMusicId: id }));
  }, []);

  const setMusicVolume = useCallback((vol: number) => {
    setState(prev => ({ ...prev, musicVolume: vol }));
  }, []);

  const markNodeCompleted = useCallback((
    topicId: string,
    topicTitle: string,
    nodeId: string,
    chapterTitle: string,
    results: QuizResult[]
  ) => {
    setState(prev => {
      const topicProg = prev.topicProgress[topicId] || {
        topicId,
        topicTitle,
        completedNodes: [],
        nodeProgress: {},
        failedQuestions: [],
      };

      const correctCount = results.filter(r => r.isCorrect).length;
      const xpEarned = results.reduce((sum, r) => sum + (r.isCorrect ? XP_PER_CORRECT : 0), 0);
      const failed = results.filter(r => !r.isCorrect);

      const nodeProgress: NodeProgress = {
        nodeId,
        completed: correctCount >= MIN_CORRECT_TO_UNLOCK,
        correctAnswers: correctCount,
        totalAnswers: results.length,
        xpEarned,
      };

      const completedNodes = nodeProgress.completed && !topicProg.completedNodes.includes(nodeId)
        ? [...topicProg.completedNodes, nodeId]
        : topicProg.completedNodes;

      const newCompletedCount = prev.completedNodesCount + (nodeProgress.completed && !topicProg.completedNodes.includes(nodeId) ? 1 : 0);
      const shouldShowPrompt = !prev.isAuthenticated && newCompletedCount === 2 && !prev.showRegisterPrompt;

      return {
        ...prev,
        completedNodesCount: newCompletedCount,
        showRegisterPrompt: shouldShowPrompt ? true : prev.showRegisterPrompt,
        topicProgress: {
          ...prev.topicProgress,
          [topicId]: {
            ...topicProg,
            completedNodes,
            nodeProgress: {
              ...topicProg.nodeProgress,
              [nodeId]: nodeProgress,
            },
            failedQuestions: [
              ...topicProg.failedQuestions.filter(q => q.nodeId !== nodeId),
              ...failed,
            ],
          },
        },
      };
    });
  }, []);

  const isNodeUnlocked = useCallback((topicId: string, nodeId: string, nodeIndex: number): boolean => {
    if (nodeIndex === 0) return true;
    const topicProg = state.topicProgress[topicId];
    if (!topicProg) return false;
    // The node at index N is unlocked if node at index N-1 is completed
    // We rely on the caller passing the correct previous nodeId
    return topicProg.completedNodes.length >= nodeIndex;
  }, [state.topicProgress]);

  const isNodeCompleted = useCallback((topicId: string, nodeId: string): boolean => {
    return state.topicProgress[topicId]?.completedNodes.includes(nodeId) ?? false;
  }, [state.topicProgress]);

  const getNodeProgress = useCallback((topicId: string, nodeId: string): NodeProgress | null => {
    return state.topicProgress[topicId]?.nodeProgress[nodeId] ?? null;
  }, [state.topicProgress]);

  const getFailedQuestions = useCallback((topicId: string): QuizResult[] => {
    return state.topicProgress[topicId]?.failedQuestions ?? [];
  }, [state.topicProgress]);

  const login = useCallback((username: string) => {
    setState(prev => ({
      ...prev,
      isAuthenticated: true,
      username,
      showRegisterPrompt: false,
    }));
  }, []);

  const logout = useCallback(() => {
    setState(prev => ({
      ...prev,
      isAuthenticated: false,
      username: null,
    }));
  }, []);

  const dismissRegisterPrompt = useCallback(() => {
    setState(prev => ({ ...prev, showRegisterPrompt: false }));
  }, []);

  const resetProgress = useCallback(() => {
    setState(DEFAULT_STATE);
  }, []);

  return (
    <AppContext.Provider value={{
      state,
      addXP,
      subtractXP,
      setMusicPlaying,
      setCurrentMusic,
      setMusicVolume,
      markNodeCompleted,
      isNodeUnlocked,
      isNodeCompleted,
      getNodeProgress,
      getFailedQuestions,
      login,
      logout,
      dismissRegisterPrompt,
      resetProgress,
    }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}
