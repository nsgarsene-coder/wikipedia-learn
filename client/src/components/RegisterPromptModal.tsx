/**
 * RegisterPromptModal — Wikipedia Learn
 * Modal proposant la création d'un compte après le 2ème cercle complété
 */

import { motion, AnimatePresence } from 'framer-motion';
import { BookOpen, X, ChevronRight, Star } from 'lucide-react';
import { useLocation } from 'wouter';
import { useApp } from '@/contexts/AppContext';

export default function RegisterPromptModal() {
  const { state, dismissRegisterPrompt } = useApp();
  const [, navigate] = useLocation();

  return (
    <AnimatePresence>
      {state.showRegisterPrompt && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={dismissRegisterPrompt}
            className="fixed inset-0 bg-[oklch(0.18_0.02_60)/60] backdrop-blur-sm z-[90]"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: 'spring', stiffness: 300, damping: 25 }}
            className="fixed inset-0 z-[91] flex items-center justify-center p-4"
          >
            <div className="w-full max-w-md bg-[oklch(0.99_0.008_80)] rounded-2xl overflow-hidden shadow-2xl">
              {/* Gold top bar */}
              <div className="h-1 bg-gradient-to-r from-[oklch(0.72_0.12_75)] to-[oklch(0.80_0.14_78)]" />

              <div className="p-8">
                {/* Close */}
                <div className="flex justify-end mb-2">
                  <button
                    onClick={dismissRegisterPrompt}
                    className="text-[oklch(0.65_0.015_70)] hover:text-[oklch(0.18_0.02_60)] transition-colors"
                  >
                    <X size={18} />
                  </button>
                </div>

                {/* Icon */}
                <div className="flex justify-center mb-6">
                  <div className="w-16 h-16 rounded-full bg-[oklch(0.88_0.08_80)/40] border border-[oklch(0.72_0.12_75)/30] flex items-center justify-center">
                    <BookOpen size={28} className="text-[oklch(0.72_0.12_75)]" />
                  </div>
                </div>

                {/* Content */}
                <div className="text-center mb-6">
                  <h2 className="font-display text-2xl font-bold text-[oklch(0.18_0.02_60)] mb-3">
                    Sauvegardez votre progression
                  </h2>
                  <p className="font-body text-[oklch(0.52_0.02_65)] text-sm leading-relaxed">
                    Vous avez complété 2 noeuds de connaissance. Créez un compte gratuit pour conserver votre progression, vos XP et vos musiques débloquées.
                  </p>
                </div>

                {/* XP display */}
                <div className="flex items-center justify-center gap-2 mb-6 px-4 py-3 bg-[oklch(0.72_0.12_75)/8] border border-[oklch(0.72_0.12_75)/20] rounded-xl">
                  <Star size={16} className="text-[oklch(0.72_0.12_75)]" />
                  <span className="font-mono-data text-sm text-[oklch(0.72_0.12_75)]">
                    {state.xp} XP à sauvegarder — Niveau {state.level}
                  </span>
                </div>

                {/* Actions */}
                <div className="flex flex-col gap-3">
                  <button
                    onClick={() => {
                      dismissRegisterPrompt();
                      navigate('/register');
                    }}
                    className="flex items-center justify-center gap-2 h-12 rounded-full bg-[oklch(0.72_0.12_75)] text-[oklch(0.18_0.02_60)] font-body font-semibold hover:bg-[oklch(0.80_0.14_78)] transition-colors"
                  >
                    Créer mon compte
                    <ChevronRight size={16} />
                  </button>
                  <button
                    onClick={dismissRegisterPrompt}
                    className="h-10 rounded-full border border-[oklch(0.86_0.02_75)] text-[oklch(0.52_0.02_65)] font-body text-sm hover:border-[oklch(0.72_0.12_75)] transition-colors"
                  >
                    Continuer sans compte
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
