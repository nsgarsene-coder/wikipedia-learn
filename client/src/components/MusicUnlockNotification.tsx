/**
 * MusicUnlockNotification — Wikipedia Learn
 * Notification animée quand une nouvelle musique est débloquée
 */

import { motion, AnimatePresence } from 'framer-motion';
import { Music, X, Play } from 'lucide-react';
import { MusicTrack } from '@/contexts/AppContext';
import { useApp } from '@/contexts/AppContext';

interface Props {
  track: MusicTrack | null;
  onClose: () => void;
}

export default function MusicUnlockNotification({ track, onClose }: Props) {
  const { setCurrentMusic, setMusicPlaying } = useApp();

  return (
    <AnimatePresence>
      {track && (
        <motion.div
          initial={{ opacity: 0, y: 50, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 20, scale: 0.95 }}
          transition={{ type: 'spring', stiffness: 300, damping: 25 }}
          className="fixed bottom-6 right-6 z-[100] w-72"
        >
          <div className="bg-[oklch(0.18_0.02_60)] border border-[oklch(0.72_0.12_75)/50] rounded-xl p-4 shadow-2xl">
            {/* Gold shimmer line */}
            <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[oklch(0.72_0.12_75)] to-transparent rounded-t-xl" />
            
            <div className="flex items-start gap-3">
              <motion.div
                animate={{ rotate: [0, -10, 10, -5, 5, 0] }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="w-9 h-9 rounded-full bg-[oklch(0.72_0.12_75)/15] border border-[oklch(0.72_0.12_75)/40] flex items-center justify-center shrink-0"
              >
                <Music size={16} className="text-[oklch(0.72_0.12_75)]" />
              </motion.div>
              
              <div className="flex-1 min-w-0">
                <div className="font-mono-data text-[9px] tracking-widest text-[oklch(0.72_0.12_75)] uppercase mb-0.5">
                  Musique debloquee
                </div>
                <div className="font-display text-sm text-[oklch(0.96_0.015_80)] leading-tight">
                  {track.name}
                </div>
                <div className="font-body text-[11px] text-[oklch(0.65_0.015_70)] mt-0.5">
                  Atteint {track.unlockXP} XP
                </div>
              </div>

              <button
                onClick={onClose}
                className="shrink-0 text-[oklch(0.52_0.02_65)] hover:text-[oklch(0.96_0.015_80)] transition-colors"
              >
                <X size={14} />
              </button>
            </div>

            <div className="flex gap-2 mt-3">
              <button
                onClick={() => {
                  setCurrentMusic(track.id);
                  setMusicPlaying(true);
                  onClose();
                }}
                className="flex-1 flex items-center justify-center gap-1.5 py-1.5 bg-[oklch(0.72_0.12_75)] text-[oklch(0.18_0.02_60)] rounded-lg font-mono-data text-[10px] tracking-wide hover:bg-[oklch(0.80_0.14_78)] transition-colors"
              >
                <Play size={11} />
                Jouer maintenant
              </button>
              <button
                onClick={onClose}
                className="px-3 py-1.5 border border-[oklch(0.72_0.12_75)/30] text-[oklch(0.65_0.015_70)] rounded-lg font-mono-data text-[10px] tracking-wide hover:border-[oklch(0.72_0.12_75)/60] transition-colors"
              >
                Plus tard
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
