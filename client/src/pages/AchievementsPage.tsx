/**
 * AchievementsPage — Wikipedia Learn
 * Page des récompenses, XP, niveau et musiques débloquées
 */

import { motion } from 'framer-motion';
import { Star, Music, Lock, CheckCircle, Trophy, BookOpen } from 'lucide-react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { useApp, MUSIC_TRACKS } from '@/contexts/AppContext';

export default function AchievementsPage() {
  const { state, setCurrentMusic, setMusicPlaying } = useApp();

  const xpToNextLevel = 100 - (state.xp % 100);
  const xpInLevel = state.xp % 100;

  return (
    <div className="min-h-screen flex flex-col bg-[oklch(0.96_0.015_80)]">
      <Header />

      <main className="flex-1">
        <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 py-10">

          {/* Header */}
          <div className="mb-10">
            <div className="font-mono-data text-[10px] tracking-widest text-[oklch(0.72_0.12_75)] uppercase mb-2">
              Votre progression
            </div>
            <h1 className="font-display text-4xl font-bold text-[oklch(0.18_0.02_60)] italic mb-2">
              Achievements
            </h1>
            <p className="font-body text-[oklch(0.52_0.02_65)]">
              Suivez votre progression et vos récompenses débloquées.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

            {/* XP & Level card */}
            <div className="lg:col-span-1">
              <div className="bg-[oklch(0.99_0.008_80)] border border-[oklch(0.86_0.02_75)] rounded-2xl p-6">
                <div className="flex items-center gap-2 mb-4">
                  <Star size={16} className="text-[oklch(0.72_0.12_75)]" />
                  <span className="font-mono-data text-[10px] tracking-widest text-[oklch(0.52_0.02_65)] uppercase">
                    Niveau & XP
                  </span>
                </div>

                <div className="text-center py-4">
                  <div className="font-display text-6xl font-bold text-[oklch(0.72_0.12_75)] mb-1">
                    {state.level}
                  </div>
                  <div className="font-mono-data text-xs text-[oklch(0.52_0.02_65)] tracking-widest uppercase mb-4">
                    Niveau actuel
                  </div>
                  <div className="font-mono-data text-2xl text-[oklch(0.18_0.02_60)] mb-1">
                    {state.xp} XP
                  </div>
                  <div className="font-body text-xs text-[oklch(0.52_0.02_65)] mb-4">
                    {xpToNextLevel} XP pour le niveau {state.level + 1}
                  </div>
                  <div className="h-2 bg-[oklch(0.86_0.02_75)] rounded-full overflow-hidden">
                    <motion.div
                      className="h-full bg-[oklch(0.72_0.12_75)] rounded-full"
                      animate={{ width: `${xpInLevel}%` }}
                      transition={{ duration: 0.8, ease: 'easeOut' }}
                    />
                  </div>
                  <div className="flex justify-between mt-1">
                    <span className="font-mono-data text-[9px] text-[oklch(0.65_0.015_70)]">0</span>
                    <span className="font-mono-data text-[9px] text-[oklch(0.65_0.015_70)]">100</span>
                  </div>
                </div>

                {/* Stats */}
                <div className="border-t border-[oklch(0.86_0.02_75)] pt-4 mt-2 grid grid-cols-2 gap-4">
                  <div className="text-center">
                    <div className="font-display text-xl font-bold text-[oklch(0.18_0.02_60)]">
                      {state.completedNodesCount}
                    </div>
                    <div className="font-body text-[10px] text-[oklch(0.52_0.02_65)]">Noeuds complétés</div>
                  </div>
                  <div className="text-center">
                    <div className="font-display text-xl font-bold text-[oklch(0.18_0.02_60)]">
                      {Object.keys(state.topicProgress).length}
                    </div>
                    <div className="font-body text-[10px] text-[oklch(0.52_0.02_65)]">Sujets explorés</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Music tracks */}
            <div className="lg:col-span-2">
              <div className="bg-[oklch(0.99_0.008_80)] border border-[oklch(0.86_0.02_75)] rounded-2xl p-6">
                <div className="flex items-center gap-2 mb-6">
                  <Music size={16} className="text-[oklch(0.72_0.12_75)]" />
                  <span className="font-mono-data text-[10px] tracking-widest text-[oklch(0.52_0.02_65)] uppercase">
                    Musiques d'ambiance
                  </span>
                </div>

                <div className="space-y-3">
                  {MUSIC_TRACKS.map((track, idx) => {
                    const isUnlocked = state.unlockedMusicIds.includes(track.id);
                    const isCurrent = state.currentMusicId === track.id;

                    return (
                      <motion.div
                        key={track.id}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: idx * 0.1 }}
                        className={`flex items-center gap-4 p-4 rounded-xl border transition-all ${
                          isCurrent
                            ? 'border-[oklch(0.72_0.12_75)/50] bg-[oklch(0.72_0.12_75)/5]'
                            : isUnlocked
                              ? 'border-[oklch(0.86_0.02_75)] hover:border-[oklch(0.72_0.12_75)/40]'
                              : 'border-[oklch(0.86_0.02_75)] opacity-50'
                        }`}
                      >
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${
                          isUnlocked
                            ? 'bg-[oklch(0.72_0.12_75)/15] border border-[oklch(0.72_0.12_75)/30]'
                            : 'bg-[oklch(0.93_0.012_78)] border border-[oklch(0.86_0.02_75)]'
                        }`}>
                          {isUnlocked ? (
                            <Music size={16} className="text-[oklch(0.72_0.12_75)]" />
                          ) : (
                            <Lock size={16} className="text-[oklch(0.65_0.015_70)]" />
                          )}
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className={`font-display text-sm font-semibold ${isUnlocked ? 'text-[oklch(0.18_0.02_60)]' : 'text-[oklch(0.65_0.015_70)]'}`}>
                              {track.name}
                            </span>
                            {isCurrent && state.musicPlaying && (
                              <span className="font-mono-data text-[9px] tracking-widest text-[oklch(0.72_0.12_75)] bg-[oklch(0.72_0.12_75)/10] px-2 py-0.5 rounded-full uppercase">
                                En cours
                              </span>
                            )}
                          </div>
                          <div className="font-body text-xs text-[oklch(0.52_0.02_65)]">
                            {track.unlockXP === 0 ? 'Disponible dès le départ' : `Débloqué à ${track.unlockXP} XP`}
                          </div>
                        </div>

                        <div className="shrink-0">
                          {isUnlocked ? (
                            <button
                              onClick={() => {
                                setCurrentMusic(track.id);
                                setMusicPlaying(true);
                              }}
                              className={`px-4 py-1.5 rounded-full font-mono-data text-[10px] tracking-wide transition-colors ${
                                isCurrent
                                  ? 'bg-[oklch(0.72_0.12_75)] text-[oklch(0.18_0.02_60)]'
                                  : 'border border-[oklch(0.86_0.02_75)] text-[oklch(0.52_0.02_65)] hover:border-[oklch(0.72_0.12_75)]'
                              }`}
                            >
                              {isCurrent ? 'Sélectionné' : 'Jouer'}
                            </button>
                          ) : (
                            <div className="flex items-center gap-1.5 px-3 py-1.5 bg-[oklch(0.93_0.012_78)] rounded-full">
                              <Lock size={11} className="text-[oklch(0.65_0.015_70)]" />
                              <span className="font-mono-data text-[10px] text-[oklch(0.65_0.015_70)]">
                                {track.unlockXP} XP
                              </span>
                            </div>
                          )}
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Topics explored */}
            {Object.keys(state.topicProgress).length > 0 && (
              <div className="lg:col-span-3">
                <div className="bg-[oklch(0.99_0.008_80)] border border-[oklch(0.86_0.02_75)] rounded-2xl p-6">
                  <div className="flex items-center gap-2 mb-6">
                    <BookOpen size={16} className="text-[oklch(0.72_0.12_75)]" />
                    <span className="font-mono-data text-[10px] tracking-widest text-[oklch(0.52_0.02_65)] uppercase">
                      Sujets explorés
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {Object.values(state.topicProgress).map((topic) => {
                      const completedCount = topic.completedNodes.length;
                      const totalNodes = Object.keys(topic.nodeProgress).length;
                      const xpEarned = Object.values(topic.nodeProgress).reduce((sum, n) => sum + n.xpEarned, 0);

                      return (
                        <div key={topic.topicId} className="p-4 border border-[oklch(0.86_0.02_75)] rounded-xl">
                          <div className="flex items-start justify-between gap-2 mb-2">
                            <h3 className="font-display text-sm font-semibold text-[oklch(0.18_0.02_60)] leading-snug">
                              {topic.topicTitle}
                            </h3>
                            {completedCount > 0 && (
                              <CheckCircle size={14} className="text-[oklch(0.48_0.12_145)] shrink-0 mt-0.5" />
                            )}
                          </div>
                          <div className="flex items-center gap-3 text-xs font-body text-[oklch(0.52_0.02_65)]">
                            <span>{completedCount}/{totalNodes} noeuds</span>
                            <span className="text-[oklch(0.72_0.12_75)]">+{xpEarned} XP</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
