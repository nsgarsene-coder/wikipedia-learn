/**
 * AuthPage — Wikipedia Learn
 * Pages de connexion et d'inscription
 * Style: Archives Vivantes — formulaire sobre, centré, typographie encyclopédique
 */

import { useState } from 'react';
import { useLocation } from 'wouter';
import { motion } from 'framer-motion';
import { BookOpen, Eye, EyeOff } from 'lucide-react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { useApp } from '@/contexts/AppContext';

interface AuthPageProps {
  mode?: 'login' | 'register';
}

export default function AuthPage({ mode = 'login' }: AuthPageProps) {
  const [, navigate] = useLocation();
  const { login } = useApp();
  const [isLogin, setIsLogin] = useState(mode === 'login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (!email.trim() || !password.trim()) {
      setError('Veuillez remplir tous les champs.');
      return;
    }
    if (password.length < 6) {
      setError('Le mot de passe doit contenir au moins 6 caractères.');
      return;
    }

    setLoading(true);
    // Simulate auth (static app — no real backend)
    await new Promise(r => setTimeout(r, 800));
    
    const username = email.split('@')[0] || email;
    login(username);
    setLoading(false);
    navigate('/');
  };

  return (
    <div className="min-h-screen flex flex-col bg-[oklch(0.96_0.015_80)]">
      <Header />

      <main className="flex-1 flex flex-col items-center justify-center px-4 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md"
        >
          {/* Logo */}
          <div className="flex flex-col items-center mb-8">
            <div className="w-14 h-14 rounded-full bg-[oklch(0.88_0.08_80)/40] border border-[oklch(0.72_0.12_75)/30] flex items-center justify-center mb-4">
              <BookOpen size={24} className="text-[oklch(0.72_0.12_75)]" />
            </div>
            <h1 className="font-display text-4xl font-bold text-[oklch(0.18_0.02_60)] mb-2">
              Wikipedia Learn
            </h1>
            <p className="font-body text-[oklch(0.72_0.12_75)] text-sm">
              {isLogin
                ? 'Connectez-vous à votre espace d\'apprentissage.'
                : 'Créez votre compte pour accéder à votre espace d\'apprentissage.'}
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="font-body text-sm text-[oklch(0.35_0.02_65)]">
                Email ou Nom d'utilisateur
              </label>
              <input
                type="text"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="votre@email.com"
                className="h-12 px-4 rounded-xl border border-[oklch(0.86_0.02_75)] bg-[oklch(0.99_0.008_80)] font-body text-sm text-[oklch(0.18_0.02_60)] placeholder-[oklch(0.65_0.015_70)] focus:outline-none focus:border-[oklch(0.72_0.12_75)] transition-colors"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="font-body text-sm text-[oklch(0.35_0.02_65)]">
                Mot de passe
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full h-12 px-4 pr-12 rounded-xl border border-[oklch(0.86_0.02_75)] bg-[oklch(0.99_0.008_80)] font-body text-sm text-[oklch(0.18_0.02_60)] placeholder-[oklch(0.65_0.015_70)] focus:outline-none focus:border-[oklch(0.72_0.12_75)] transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(v => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[oklch(0.65_0.015_70)] hover:text-[oklch(0.35_0.02_65)] transition-colors"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {error && (
              <p className="font-body text-sm text-[oklch(0.50_0.20_25)]">{error}</p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="h-12 rounded-full bg-[oklch(0.72_0.12_75)] text-[oklch(0.18_0.02_60)] font-body font-semibold text-base hover:bg-[oklch(0.80_0.14_78)] transition-colors disabled:opacity-60 mt-2"
            >
              {loading ? 'Connexion...' : isLogin ? 'Se connecter' : 'Créer votre compte'}
            </button>

            {/* Google button (placeholder) */}
            <button
              type="button"
              onClick={() => {
                // Placeholder — static app
                login('utilisateur_google');
                navigate('/');
              }}
              className="h-12 rounded-full border border-[oklch(0.86_0.02_75)] bg-[oklch(0.99_0.008_80)] flex items-center justify-center gap-2 font-body text-sm text-[oklch(0.35_0.02_65)] hover:border-[oklch(0.72_0.12_75)] transition-colors"
            >
              <svg width="18" height="18" viewBox="0 0 48 48">
                <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
                <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
                <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
                <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
              </svg>
              Continuer avec Google
            </button>
          </form>

          {/* Toggle */}
          <div className="mt-6 text-center">
            {isLogin ? (
              <>
                <button className="font-body text-sm text-[oklch(0.72_0.12_75)] hover:underline">
                  Mot de passe oublié ?
                </button>
                <div className="mt-4">
                  <p className="font-body text-sm text-[oklch(0.52_0.02_65)] mb-2">Pas encore de compte ?</p>
                  <button
                    onClick={() => setIsLogin(false)}
                    className="px-6 py-2 border border-[oklch(0.86_0.02_75)] rounded-full font-body text-sm text-[oklch(0.35_0.02_65)] hover:border-[oklch(0.72_0.12_75)] transition-colors"
                  >
                    Créer un compte
                  </button>
                </div>
              </>
            ) : (
              <div>
                <p className="font-body text-sm text-[oklch(0.52_0.02_65)] mb-2">Compte déjà créé ?</p>
                <button
                  onClick={() => setIsLogin(true)}
                  className="px-6 py-2 border border-[oklch(0.86_0.02_75)] rounded-full font-body text-sm text-[oklch(0.35_0.02_65)] hover:border-[oklch(0.72_0.12_75)] transition-colors"
                >
                  Login
                </button>
              </div>
            )}
          </div>
        </motion.div>
      </main>

      <Footer />
    </div>
  );
}
