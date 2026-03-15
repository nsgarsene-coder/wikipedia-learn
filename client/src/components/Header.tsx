/**
 * Header — Wikipedia Learn
 * Style: Archives Vivantes — navigation encyclopédique sobre, barre XP dorée
 * Contient: Logo, navigation, barre XP/niveau, lecteur musical, icône profil
 */

import { useState, useRef, useEffect } from 'react';
import { Link, useLocation } from 'wouter';
import { useApp, MUSIC_TRACKS } from '@/contexts/AppContext';
import { 
  Music, 
  Play, 
  Pause, 
  Volume2, 
  VolumeX,
  User,
  ChevronDown,
  LogOut,
  BookOpen,
  Trophy,
  Compass,
  Lock
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function Header() {
  const { state, setMusicPlaying, setCurrentMusic, setMusicVolume, logout } = useApp();
  const [location] = useLocation();
  const [musicMenuOpen, setMusicMenuOpen] = useState(false);
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const musicMenuRef = useRef<HTMLDivElement>(null);
  const profileMenuRef = useRef<HTMLDivElement>(null);

  // XP progress to next music unlock
  const nextMusicThreshold = MUSIC_TRACKS
    .filter(t => !state.unlockedMusicIds.includes(t.id))
    .sort((a, b) => a.unlockXP - b.unlockXP)[0]?.unlockXP ?? null;

  const xpForDisplay = state.xp;
  const xpBarMax = nextMusicThreshold ?? 200;
  const xpBarPercent = Math.min(100, (xpForDisplay / xpBarMax) * 100);

  const currentTrack = MUSIC_TRACKS.find(t => t.id === state.currentMusicId);

  // Close menus on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (musicMenuRef.current && !musicMenuRef.current.contains(e.target as Node)) {
        setMusicMenuOpen(false);
      }
      if (profileMenuRef.current && !profileMenuRef.current.contains(e.target as Node)) {
        setProfileMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const navLinks = [
    { href: '/explore', label: 'EXPLORE', icon: Compass },
    { href: '/library', label: 'LIBRARY', icon: BookOpen },
    { href: '/achievements', label: 'ACHIEVEMENT', icon: Trophy },
  ];

  return (
    <header className="sticky top-0 z-50 bg-[oklch(0.99_0.008_80)] border-b border-[oklch(0.86_0.02_75)]">
      <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center h-14 gap-6">
          
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5 shrink-0 group">
            <div className="w-8 h-8 rounded-full overflow-hidden border border-[oklch(0.72_0.12_75)/40]">
              <img 
                src="https://upload.wikimedia.org/wikipedia/commons/thumb/8/80/Wikipedia-logo-v2.svg/200px-Wikipedia-logo-v2.svg.png"
                alt="Wikipedia Learn"
                className="w-full h-full object-cover"
              />
            </div>
            <span className="font-display font-semibold text-sm tracking-widest text-[oklch(0.18_0.02_60)] uppercase hidden sm:block group-hover:text-[oklch(0.72_0.12_75)] transition-colors">
              Wikipedia Learn
            </span>
          </Link>

          {/* Navigation */}
          <nav className="hidden md:flex items-center gap-6 flex-1">
            {navLinks.map(({ href, label }) => (
              <Link
                key={href}
                href={href}
                className={`font-mono-data text-[11px] tracking-widest transition-colors ${
                  location === href 
                    ? 'text-[oklch(0.72_0.12_75)]' 
                    : 'text-[oklch(0.52_0.02_65)] hover:text-[oklch(0.18_0.02_60)]'
                }`}
              >
                {label}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-3 ml-auto">
            
            {/* XP / Level display */}
            <div className="hidden sm:flex items-center gap-3 border-l border-[oklch(0.86_0.02_75)] pl-4">
              <div className="flex flex-col items-end gap-0.5">
                <div className="flex items-center gap-2">
                  <span className="font-mono-data text-[10px] text-[oklch(0.52_0.02_65)] tracking-wider">
                    LVL {String(state.level).padStart(2, '0')}
                  </span>
                  <span className="font-mono-data text-[10px] text-[oklch(0.72_0.12_75)] tracking-wider">
                    XP {xpForDisplay} / {xpBarMax}
                  </span>
                </div>
                <div className="w-28 xp-bar">
                  <motion.div 
                    className="xp-bar-fill"
                    animate={{ width: `${xpBarPercent}%` }}
                    transition={{ duration: 0.6, ease: 'easeOut' }}
                  />
                </div>
              </div>
            </div>

            {/* Music player */}
            <div className="relative" ref={musicMenuRef}>
              <button
                onClick={() => setMusicMenuOpen(o => !o)}
                className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded text-[11px] font-mono-data tracking-wide transition-all ${
                  state.musicPlaying 
                    ? 'bg-[oklch(0.72_0.12_75)/10] text-[oklch(0.72_0.12_75)] border border-[oklch(0.72_0.12_75)/30]'
                    : 'text-[oklch(0.52_0.02_65)] hover:text-[oklch(0.18_0.02_60)] border border-transparent'
                }`}
              >
                {state.musicPlaying ? (
                  <motion.div
                    animate={{ scale: [1, 1.1, 1] }}
                    transition={{ repeat: Infinity, duration: 1.5 }}
                  >
                    <Music size={13} />
                  </motion.div>
                ) : (
                  <Music size={13} />
                )}
                <span className="hidden sm:block truncate max-w-[80px]">
                  {state.musicPlaying ? currentTrack?.name.split(' ')[0] : 'MUSIQUE'}
                </span>
                <ChevronDown size={10} className={`transition-transform ${musicMenuOpen ? 'rotate-180' : ''}`} />
              </button>

              <AnimatePresence>
                {musicMenuOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: -8, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -8, scale: 0.95 }}
                    transition={{ duration: 0.15 }}
                    className="absolute right-0 top-full mt-2 w-64 bg-[oklch(0.99_0.008_80)] border border-[oklch(0.86_0.02_75)] rounded-lg shadow-lg overflow-hidden"
                  >
                    {/* Volume control */}
                    <div className="px-3 py-2.5 border-b border-[oklch(0.86_0.02_75)] flex items-center gap-2">
                      <button
                        onClick={() => setMusicVolume(state.musicVolume === 0 ? 0.6 : 0)}
                        className="text-[oklch(0.52_0.02_65)] hover:text-[oklch(0.18_0.02_60)]"
                      >
                        {state.musicVolume === 0 ? <VolumeX size={13} /> : <Volume2 size={13} />}
                      </button>
                      <input
                        type="range"
                        min="0"
                        max="1"
                        step="0.05"
                        value={state.musicVolume}
                        onChange={e => setMusicVolume(parseFloat(e.target.value))}
                        className="flex-1 h-1 accent-[oklch(0.72_0.12_75)]"
                      />
                      <span className="font-mono-data text-[10px] text-[oklch(0.52_0.02_65)] w-6 text-right">
                        {Math.round(state.musicVolume * 100)}
                      </span>
                    </div>

                    {/* Track list */}
                    <div className="py-1">
                      {MUSIC_TRACKS.map(track => {
                        const isUnlocked = state.unlockedMusicIds.includes(track.id);
                        const isCurrent = state.currentMusicId === track.id;
                        return (
                          <button
                            key={track.id}
                            onClick={() => {
                              if (!isUnlocked) return;
                              setCurrentMusic(track.id);
                              if (!state.musicPlaying) setMusicPlaying(true);
                            }}
                            disabled={!isUnlocked}
                            className={`w-full flex items-center gap-2.5 px-3 py-2 text-left transition-colors ${
                              !isUnlocked 
                                ? 'opacity-40 cursor-not-allowed' 
                                : isCurrent 
                                  ? 'bg-[oklch(0.72_0.12_75)/8] text-[oklch(0.72_0.12_75)]'
                                  : 'hover:bg-[oklch(0.93_0.012_78)] text-[oklch(0.35_0.02_65)]'
                            }`}
                          >
                            {!isUnlocked ? (
                              <Lock size={11} className="shrink-0" />
                            ) : isCurrent && state.musicPlaying ? (
                              <Pause size={11} className="shrink-0" />
                            ) : (
                              <Play size={11} className="shrink-0" />
                            )}
                            <div className="flex-1 min-w-0">
                              <div className="font-body text-xs truncate">{track.name}</div>
                              {!isUnlocked && (
                                <div className="font-mono-data text-[9px] text-[oklch(0.72_0.12_75)]">
                                  Débloque à {track.unlockXP} XP
                                </div>
                              )}
                            </div>
                            {isCurrent && (
                              <button
                                onClick={e => { e.stopPropagation(); setMusicPlaying(!state.musicPlaying); }}
                                className="shrink-0 p-1 rounded hover:bg-[oklch(0.72_0.12_75)/20]"
                              >
                                {state.musicPlaying ? <Pause size={11} /> : <Play size={11} />}
                              </button>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Profile */}
            <div className="relative" ref={profileMenuRef}>
              <button
                onClick={() => {
                  if (!state.isAuthenticated) {
                    window.location.href = '/login';
                  } else {
                    setProfileMenuOpen(o => !o);
                  }
                }}
                className="w-8 h-8 rounded-full border border-[oklch(0.86_0.02_75)] flex items-center justify-center hover:border-[oklch(0.72_0.12_75)] transition-colors bg-[oklch(0.93_0.012_78)]"
              >
                <User size={14} className="text-[oklch(0.52_0.02_65)]" />
              </button>

              <AnimatePresence>
                {profileMenuOpen && state.isAuthenticated && (
                  <motion.div
                    initial={{ opacity: 0, y: -8, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -8, scale: 0.95 }}
                    transition={{ duration: 0.15 }}
                    className="absolute right-0 top-full mt-2 w-48 bg-[oklch(0.99_0.008_80)] border border-[oklch(0.86_0.02_75)] rounded-lg shadow-lg overflow-hidden"
                  >
                    <div className="px-3 py-2.5 border-b border-[oklch(0.86_0.02_75)]">
                      <div className="font-display text-sm text-[oklch(0.18_0.02_60)]">{state.username}</div>
                      <div className="font-mono-data text-[10px] text-[oklch(0.52_0.02_65)]">Niveau {state.level} — {state.xp} XP</div>
                    </div>
                    <button
                      onClick={() => { logout(); setProfileMenuOpen(false); }}
                      className="w-full flex items-center gap-2 px-3 py-2 text-[oklch(0.50_0.20_25)] hover:bg-[oklch(0.93_0.012_78)] text-sm font-body"
                    >
                      <LogOut size={13} />
                      Se déconnecter
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
