/**
 * QuizEffects — Wikipedia Learn
 * Effets visuels et sonores pour le quiz :
 * - Bonne réponse : confettis dorés + étoiles + particules XP flottantes
 * - Mauvaise réponse : écran rouge flash + particules grises
 * - Combo (3+ bonnes d'affilée) : flammes animées
 * - Level up : explosion d'étoiles + fanfare
 */

import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// URLs des effets sonores CDN
const SFX = {
  correct: 'https://d2xsxph8kpxj0f.cloudfront.net/310519663220604081/4yVN7vCPddVujpJhdqv4a2/correct_77de1dca.wav',
  wrong:   'https://d2xsxph8kpxj0f.cloudfront.net/310519663220604081/4yVN7vCPddVujpJhdqv4a2/wrong_15314742.wav',
  combo:   'https://d2xsxph8kpxj0f.cloudfront.net/310519663220604081/4yVN7vCPddVujpJhdqv4a2/combo_c816db71.wav',
  levelup: 'https://d2xsxph8kpxj0f.cloudfront.net/310519663220604081/4yVN7vCPddVujpJhdqv4a2/levelup_e97b10fc.wav',
};

// Hook pour jouer des sons
export function useQuizSounds() {
  const audioRefs = useRef<Record<string, HTMLAudioElement>>({});

  useEffect(() => {
    // Précharger les sons
    Object.entries(SFX).forEach(([key, url]) => {
      const audio = new Audio(url);
      audio.preload = 'auto';
      audio.volume = 0.7;
      audioRefs.current[key] = audio;
    });
    return () => {
      Object.values(audioRefs.current).forEach(a => { a.pause(); a.src = ''; });
    };
  }, []);

  const play = (key: keyof typeof SFX) => {
    const audio = audioRefs.current[key];
    if (audio) {
      audio.currentTime = 0;
      audio.play().catch(() => {}); // Ignorer les erreurs autoplay
    }
  };

  return { play };
}

// --- Particule confetti ---
interface Particle {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  color: string;
  shape: 'circle' | 'star' | 'rect';
  size: number;
  rotation: number;
  rotationSpeed: number;
}

function generateConfetti(count: number, originX = 50, originY = 50): Particle[] {
  const colors = ['#D4A017', '#F5C842', '#E8B84B', '#FFFFFF', '#FFE066', '#FFA500', '#FF6B6B'];
  return Array.from({ length: count }, (_, i) => ({
    id: i,
    x: originX,
    y: originY,
    vx: (Math.random() - 0.5) * 18,
    vy: -(Math.random() * 12 + 6),
    color: colors[Math.floor(Math.random() * colors.length)],
    shape: (['circle', 'star', 'rect'] as const)[Math.floor(Math.random() * 3)],
    size: Math.random() * 10 + 6,
    rotation: Math.random() * 360,
    rotationSpeed: (Math.random() - 0.5) * 15,
  }));
}

// --- Composant Confetti Canvas ---
interface ConfettiProps {
  active: boolean;
  originX?: number;
  originY?: number;
  count?: number;
}

export function ConfettiEffect({ active, originX = 50, originY = 40, count = 40 }: ConfettiProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particlesRef = useRef<Particle[]>([]);
  const animFrameRef = useRef<number>(0);

  useEffect(() => {
    if (!active) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;

    const ox = (originX / 100) * canvas.width;
    const oy = (originY / 100) * canvas.height;
    particlesRef.current = generateConfetti(count, ox, oy);

    const gravity = 0.5;
    let frame = 0;

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      frame++;

      particlesRef.current = particlesRef.current.filter(p => p.y < canvas.height + 20);

      particlesRef.current.forEach(p => {
        p.vy += gravity;
        p.vx *= 0.99;
        p.x += p.vx;
        p.y += p.vy;
        p.rotation += p.rotationSpeed;

        const alpha = Math.max(0, 1 - frame / 80);
        ctx.save();
        ctx.globalAlpha = alpha;
        ctx.translate(p.x, p.y);
        ctx.rotate((p.rotation * Math.PI) / 180);
        ctx.fillStyle = p.color;

        if (p.shape === 'circle') {
          ctx.beginPath();
          ctx.arc(0, 0, p.size / 2, 0, Math.PI * 2);
          ctx.fill();
        } else if (p.shape === 'rect') {
          ctx.fillRect(-p.size / 2, -p.size / 4, p.size, p.size / 2);
        } else {
          // Étoile
          ctx.beginPath();
          for (let i = 0; i < 5; i++) {
            const angle = (i * 4 * Math.PI) / 5 - Math.PI / 2;
            const r = i % 2 === 0 ? p.size / 2 : p.size / 4;
            if (i === 0) ctx.moveTo(Math.cos(angle) * r, Math.sin(angle) * r);
            else ctx.lineTo(Math.cos(angle) * r, Math.sin(angle) * r);
          }
          ctx.closePath();
          ctx.fill();
        }
        ctx.restore();
      });

      if (frame < 90 && particlesRef.current.length > 0) {
        animFrameRef.current = requestAnimationFrame(animate);
      }
    };

    animFrameRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animFrameRef.current);
  }, [active, originX, originY, count]);

  if (!active) return null;

  return (
    <canvas
      ref={canvasRef}
      className="pointer-events-none absolute inset-0 w-full h-full z-50"
    />
  );
}

// --- Flash de fond (correct = vert, wrong = rouge) ---
interface FlashProps {
  type: 'correct' | 'wrong' | null;
}

export function BackgroundFlash({ type }: FlashProps) {
  return (
    <AnimatePresence>
      {type && (
        <motion.div
          key={type + Date.now()}
          initial={{ opacity: 0.5 }}
          animate={{ opacity: 0 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5 }}
          className="pointer-events-none fixed inset-0 z-40"
          style={{
            background: type === 'correct'
              ? 'radial-gradient(ellipse at center, oklch(0.48 0.12 145 / 30%) 0%, transparent 70%)'
              : 'radial-gradient(ellipse at center, oklch(0.50 0.20 25 / 35%) 0%, transparent 70%)',
          }}
        />
      )}
    </AnimatePresence>
  );
}

// --- Particules XP flottantes (+10 XP) ---
interface XPParticle {
  id: number;
  x: number;
  y: number;
}

interface XPFloatProps {
  show: boolean;
  xp: number;
  x?: number;
  y?: number;
}

export function XPFloatEffect({ show, xp, x = 50, y = 50 }: XPFloatProps) {
  return (
    <AnimatePresence>
      {show && (
        <motion.div
          key={Date.now()}
          initial={{ opacity: 1, y: 0, scale: 1 }}
          animate={{ opacity: 0, y: -80, scale: 1.4 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1.0, ease: 'easeOut' }}
          className="pointer-events-none fixed z-50 font-mono-data font-bold text-2xl"
          style={{
            left: `${x}%`,
            top: `${y}%`,
            transform: 'translateX(-50%)',
            color: '#D4A017',
            textShadow: '0 0 20px rgba(212,160,23,0.8), 0 2px 4px rgba(0,0,0,0.3)',
          }}
        >
          +{xp} XP
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// --- Flammes de combo ---
interface FlameProps {
  combo: number; // nombre de bonnes réponses consécutives
}

export function ComboFlames({ combo }: FlameProps) {
  if (combo < 2) return null;

  const flameCount = Math.min(combo, 5);

  return (
    <div className="pointer-events-none fixed bottom-0 left-0 right-0 z-40 flex justify-center gap-2 pb-2">
      {Array.from({ length: flameCount }).map((_, i) => (
        <motion.div
          key={i}
          initial={{ scale: 0, opacity: 0 }}
          animate={{
            scale: [0.8, 1.2, 0.9, 1.1, 1.0],
            opacity: [0.7, 1, 0.8, 1, 0.9],
            y: [0, -8, 0, -5, 0],
          }}
          transition={{
            duration: 0.8,
            repeat: Infinity,
            delay: i * 0.1,
            ease: 'easeInOut',
          }}
          className="text-3xl select-none"
          style={{ filter: 'drop-shadow(0 0 8px rgba(255,140,0,0.8))' }}
        >
          🔥
        </motion.div>
      ))}
      {combo >= 2 && (
        <motion.div
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          className="absolute -top-8 font-mono-data text-xs font-bold tracking-widest uppercase"
          style={{ color: '#FF6B00', textShadow: '0 0 10px rgba(255,107,0,0.6)' }}
        >
          {combo >= 5 ? 'LÉGENDAIRE' : combo >= 4 ? 'INFERNAL' : combo >= 3 ? 'EN FEU' : 'COMBO'} x{combo}
        </motion.div>
      )}
    </div>
  );
}

// --- Étoiles de level up ---
export function LevelUpEffect({ show }: { show: boolean }) {
  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 1.5 }}
          transition={{ duration: 0.4 }}
          className="pointer-events-none fixed inset-0 z-50 flex items-center justify-center"
        >
          <div className="relative">
            {/* Cercle lumineux */}
            <motion.div
              animate={{ scale: [1, 1.5, 1], opacity: [0.8, 0, 0.8] }}
              transition={{ duration: 1.5, repeat: 2 }}
              className="absolute inset-0 rounded-full"
              style={{
                background: 'radial-gradient(circle, oklch(0.72 0.12 75 / 60%) 0%, transparent 70%)',
                width: '300px',
                height: '300px',
                left: '-100px',
                top: '-100px',
              }}
            />
            {/* Texte NIVEAU UP */}
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.1 }}
              className="relative text-center"
            >
              <div
                className="font-mono-data text-[10px] tracking-[0.4em] uppercase mb-2"
                style={{ color: 'oklch(0.72 0.12 75)' }}
              >
                Niveau supérieur
              </div>
              <div
                className="font-display text-5xl font-bold"
                style={{
                  color: '#D4A017',
                  textShadow: '0 0 30px rgba(212,160,23,0.9), 0 0 60px rgba(212,160,23,0.5)',
                }}
              >
                NIVEAU UP !
              </div>
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 2, ease: 'linear', repeat: Infinity }}
                className="text-4xl mt-3"
              >
                ⭐
              </motion.div>
            </motion.div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// --- Composant principal qui orchestre tous les effets ---
export interface QuizEffectsState {
  flash: 'correct' | 'wrong' | null;
  showConfetti: boolean;
  showXP: boolean;
  xpAmount: number;
  combo: number;
  showLevelUp: boolean;
}

export const initialEffectsState: QuizEffectsState = {
  flash: null,
  showConfetti: false,
  showXP: false,
  xpAmount: 0,
  combo: 0,
  showLevelUp: false,
};

export function QuizEffectsOverlay({ state }: { state: QuizEffectsState }) {
  return (
    <>
      <BackgroundFlash type={state.flash} />
      <ConfettiEffect active={state.showConfetti} originX={50} originY={45} count={50} />
      <XPFloatEffect show={state.showXP} xp={state.xpAmount} x={50} y={35} />
      <ComboFlames combo={state.combo} />
      <LevelUpEffect show={state.showLevelUp} />
    </>
  );
}
