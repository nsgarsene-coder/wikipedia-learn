/**
 * Home — Wikipedia Learn
 * Page d'accueil avec barre de recherche intelligente
 * - Suggestions en temps réel via l'API Wikipédia (opensearch)
 * - Validation par Entrée ou clic sur le bouton
 * - Section "En savoir plus" dépliable
 * Style: Archives Vivantes — crème encyclopédique, or doré, typographie Playfair
 */

import { useState, useRef, useEffect, useCallback } from 'react';
import { useLocation } from 'wouter';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, BookOpen, Trophy, Globe, ChevronDown, X, Clock } from 'lucide-react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

interface WikiSuggestion {
  title: string;
  description: string;
}

export default function Home() {
  const [, navigate] = useLocation();
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState<WikiSuggestion[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [loadingSuggestions, setLoadingSuggestions] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [showLearnMore, setShowLearnMore] = useState(false);
  const learnMoreRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Récupérer les suggestions depuis l'API Wikipédia opensearch
  const fetchSuggestions = useCallback(async (q: string) => {
    if (q.trim().length < 2) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }
    setLoadingSuggestions(true);
    try {
      // API opensearch de Wikipédia — retourne [query, [titles], [descriptions], [urls]]
      const lang = q.match(/[a-zA-Z]/) && !q.match(/[àâäéèêëîïôöùûüçœæ]/i) ? 'en' : 'fr';
      const url = `https://${lang}.wikipedia.org/w/api.php?action=opensearch&search=${encodeURIComponent(q)}&limit=6&namespace=0&format=json&origin=*`;
      const res = await fetch(url);
      const data = await res.json();
      // data = [query, titles[], descriptions[], urls[]]
      const titles: string[] = data[1] ?? [];
      const descs: string[] = data[2] ?? [];
      const mapped: WikiSuggestion[] = titles.map((title, i) => ({
        title,
        description: descs[i] ?? '',
      }));
      setSuggestions(mapped);
      setShowSuggestions(mapped.length > 0);
    } catch {
      setSuggestions([]);
    } finally {
      setLoadingSuggestions(false);
    }
  }, []);

  // Debounce la saisie
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setQuery(val);
    setSelectedIndex(-1);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      fetchSuggestions(val);
    }, 250);
  };

  // Naviguer vers la page de résultats
  const doSearch = (q: string) => {
    if (!q.trim()) return;
    setShowSuggestions(false);
    setSuggestions([]);
    navigate(`/search?q=${encodeURIComponent(q.trim())}`);
  };

  // Gestion du clavier dans l'input
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (selectedIndex >= 0 && suggestions[selectedIndex]) {
        doSearch(suggestions[selectedIndex].title);
      } else {
        doSearch(query);
      }
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex(i => Math.min(i + 1, suggestions.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex(i => Math.max(i - 1, -1));
    } else if (e.key === 'Escape') {
      setShowSuggestions(false);
      setSelectedIndex(-1);
    }
  };

  // Fermer les suggestions au clic extérieur
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (
        suggestionsRef.current && !suggestionsRef.current.contains(e.target as Node) &&
        inputRef.current && !inputRef.current.contains(e.target as Node)
      ) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleLearnMore = () => {
    setShowLearnMore(true);
    setTimeout(() => {
      learnMoreRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 100);
  };

  // Sujets populaires pour les suggestions rapides
  const popularTopics = [
    'Première Guerre Mondiale',
    'Intelligence Artificielle',
    'Révolution Française',
    'Système Solaire',
    'Renaissance',
  ];

  return (
    <div className="min-h-screen flex flex-col bg-[oklch(0.96_0.015_80)]">
      <Header />

      <main className="flex-1 flex flex-col">
        {/* Hero Section */}
        <section className="flex-1 flex flex-col items-center justify-center px-4 py-16 sm:py-24">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
            className="flex flex-col items-center text-center max-w-2xl mx-auto w-full"
          >
            {/* Icon */}
            <div className="w-16 h-16 rounded-full bg-[oklch(0.88_0.08_80)/40] border border-[oklch(0.72_0.12_75)/30] flex items-center justify-center mb-8">
              <BookOpen size={28} className="text-[oklch(0.72_0.12_75)]" />
            </div>

            {/* Title */}
            <h1 className="font-display text-5xl sm:text-6xl font-bold text-[oklch(0.18_0.02_60)] mb-4 leading-tight">
              Wikipedia Learn
            </h1>

            {/* Subtitle */}
            <p className="font-body text-[oklch(0.52_0.02_65)] text-lg leading-relaxed mb-10">
              Explorez la connaissance encyclopédique à travers<br className="hidden sm:block" />
              des parcours interactifs et gamifiés.
            </p>

            {/* Search with suggestions */}
            <div className="w-full max-w-xl mb-6 relative">
              <div className="relative">
                <input
                  ref={inputRef}
                  type="text"
                  value={query}
                  onChange={handleInputChange}
                  onKeyDown={handleKeyDown}
                  onFocus={() => { if (suggestions.length > 0) setShowSuggestions(true); }}
                  placeholder="Faites votre recherche..."
                  className="w-full h-14 pl-5 pr-14 rounded-full bg-[oklch(0.72_0.12_75)] text-[oklch(0.18_0.02_60)] placeholder-[oklch(0.35_0.06_72)] font-body text-base shadow-lg focus:outline-none focus:ring-2 focus:ring-[oklch(0.55_0.14_72)] transition-all"
                  autoComplete="off"
                />
                <button
                  type="button"
                  onClick={() => doSearch(selectedIndex >= 0 && suggestions[selectedIndex] ? suggestions[selectedIndex].title : query)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-[oklch(0.18_0.02_60)] flex items-center justify-center hover:bg-[oklch(0.25_0.03_65)] transition-colors"
                >
                  <Search size={16} className="text-[oklch(0.96_0.015_80)]" />
                </button>
              </div>

              {/* Dropdown suggestions */}
              <AnimatePresence>
                {showSuggestions && suggestions.length > 0 && (
                  <motion.div
                    ref={suggestionsRef}
                    initial={{ opacity: 0, y: -8, scale: 0.98 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -8, scale: 0.98 }}
                    transition={{ duration: 0.15 }}
                    className="absolute top-full left-0 right-0 mt-2 bg-[oklch(0.99_0.008_80)] border border-[oklch(0.86_0.02_75)] rounded-2xl shadow-xl overflow-hidden z-50"
                  >
                    {suggestions.map((s, idx) => (
                      <button
                        key={s.title}
                        onMouseDown={e => { e.preventDefault(); doSearch(s.title); }}
                        onMouseEnter={() => setSelectedIndex(idx)}
                        className={`w-full flex items-start gap-3 px-4 py-3 text-left transition-colors ${
                          selectedIndex === idx
                            ? 'bg-[oklch(0.72_0.12_75)/8]'
                            : 'hover:bg-[oklch(0.93_0.012_78)]'
                        }`}
                      >
                        <Search size={13} className="text-[oklch(0.72_0.12_75)] shrink-0 mt-0.5" />
                        <div className="flex-1 min-w-0">
                          <div className="font-display text-sm text-[oklch(0.18_0.02_60)] truncate">
                            {s.title}
                          </div>
                          {s.description && (
                            <div className="font-body text-xs text-[oklch(0.52_0.02_65)] truncate mt-0.5">
                              {s.description}
                            </div>
                          )}
                        </div>
                      </button>
                    ))}
                    <div className="px-4 py-2 border-t border-[oklch(0.86_0.02_75)] flex items-center gap-1.5">
                      <span className="font-mono-data text-[9px] text-[oklch(0.65_0.015_70)] tracking-wide">
                        Appuyez sur Entrée pour confirmer
                      </span>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Popular topics */}
            <div className="flex flex-wrap items-center justify-center gap-2 mb-8">
              {popularTopics.map(topic => (
                <button
                  key={topic}
                  onClick={() => doSearch(topic)}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-[oklch(0.99_0.008_80)] border border-[oklch(0.86_0.02_75)] rounded-full font-body text-xs text-[oklch(0.52_0.02_65)] hover:border-[oklch(0.72_0.12_75)] hover:text-[oklch(0.18_0.02_60)] transition-all"
                >
                  <Clock size={10} className="text-[oklch(0.72_0.12_75)]" />
                  {topic}
                </button>
              ))}
            </div>

            {/* En savoir plus */}
            <button
              onClick={handleLearnMore}
              className="flex items-center gap-2 px-6 py-2.5 border border-[oklch(0.75_0.01_65)] rounded-full font-body text-sm text-[oklch(0.52_0.02_65)] hover:border-[oklch(0.72_0.12_75)] hover:text-[oklch(0.18_0.02_60)] transition-all"
            >
              En savoir plus
              <ChevronDown size={14} className={`transition-transform ${showLearnMore ? 'rotate-180' : ''}`} />
            </button>
          </motion.div>

          {/* Features row */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3, ease: 'easeOut' }}
            className="grid grid-cols-3 gap-8 max-w-2xl mx-auto mt-16 px-4"
          >
            {[
              {
                icon: Globe,
                title: 'Parcours',
                desc: 'Des itinéraires thématiques pour approfondir chaque sujet.',
              },
              {
                icon: Trophy,
                title: 'Gamification',
                desc: 'Gagnez des XP et débloquez des musiques en progressant.',
              },
              {
                icon: BookOpen,
                title: 'Découverte',
                desc: "L'immensité de Wikipédia, structurée pour l'apprentissage.",
              },
            ].map(({ icon: Icon, title, desc }) => (
              <div key={title} className="flex flex-col items-center text-center gap-2">
                <div className="w-10 h-10 rounded-full bg-[oklch(0.88_0.08_80)/40] flex items-center justify-center">
                  <Icon size={18} className="text-[oklch(0.72_0.12_75)]" />
                </div>
                <div className="font-display font-semibold text-sm text-[oklch(0.18_0.02_60)]">{title}</div>
                <p className="font-body text-xs text-[oklch(0.52_0.02_65)] leading-relaxed">{desc}</p>
              </div>
            ))}
          </motion.div>
        </section>

        {/* Learn More Section */}
        <AnimatePresence>
          {showLearnMore && (
            <motion.section
              ref={learnMoreRef}
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.4, ease: 'easeInOut' }}
              className="overflow-hidden border-t border-[oklch(0.86_0.02_75)]"
            >
              <div className="max-w-3xl mx-auto px-4 sm:px-6 py-12">
                <div className="flex items-start justify-between mb-8">
                  <div>
                    <div className="font-mono-data text-[10px] tracking-widest text-[oklch(0.72_0.12_75)] uppercase mb-2">
                      Comment ça fonctionne
                    </div>
                    <h2 className="font-display text-3xl font-bold text-[oklch(0.18_0.02_60)]">
                      Votre parcours d'apprentissage
                    </h2>
                  </div>
                  <button
                    onClick={() => setShowLearnMore(false)}
                    className="text-[oklch(0.52_0.02_65)] hover:text-[oklch(0.18_0.02_60)] transition-colors mt-1"
                  >
                    <X size={18} />
                  </button>
                </div>

                <div className="grid sm:grid-cols-2 gap-6">
                  {[
                    {
                      step: '01',
                      title: 'Recherchez un sujet',
                      desc: "Tapez n'importe quel sujet dans la barre de recherche. Des suggestions apparaissent en temps réel. Appuyez sur Entrée ou cliquez pour lancer.",
                    },
                    {
                      step: '02',
                      title: 'Explorez les chapitres',
                      desc: "Chaque sujet est découpé en grands chapitres illustrés. Choisissez celui qui vous intéresse pour commencer votre parcours.",
                    },
                    {
                      step: '03',
                      title: 'Naviguez le mindmap',
                      desc: "Au sein d'un chapitre, un mindmap interactif vous présente les moments essentiels. Chaque cercle est un noeud de savoir à explorer.",
                    },
                    {
                      step: '04',
                      title: 'Testez vos connaissances',
                      desc: "Après chaque noeud, un quiz de 3 questions vous attend. Répondez en moins de 15 secondes pour gagner des XP.",
                    },
                    {
                      step: '05',
                      title: 'Gagnez des récompenses',
                      desc: "Accumulez des XP pour débloquer des musiques d'ambiance. À 60, 120 et 180 XP, de nouvelles pistes musicales se déverrouillent.",
                    },
                    {
                      step: '06',
                      title: 'Révisez vos erreurs',
                      desc: "Après un sujet, une session de révision vous permet de repasser les questions ratées pour consolider vos connaissances.",
                    },
                  ].map(({ step, title, desc }) => (
                    <div key={step} className="flex gap-4">
                      <div className="font-mono-data text-2xl font-bold text-[oklch(0.72_0.12_75)/40] shrink-0 leading-none mt-0.5">
                        {step}
                      </div>
                      <div>
                        <h3 className="font-display font-semibold text-base text-[oklch(0.18_0.02_60)] mb-1">{title}</h3>
                        <p className="font-body text-sm text-[oklch(0.52_0.02_65)] leading-relaxed">{desc}</p>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-8 p-4 bg-[oklch(0.88_0.08_80)/20] border border-[oklch(0.72_0.12_75)/30] rounded-xl">
                  <p className="font-body text-sm text-[oklch(0.35_0.02_65)] text-center">
                    <strong className="font-display">Aucun compte requis</strong> pour commencer. Créez un compte après votre premier parcours pour sauvegarder votre progression à long terme.
                  </p>
                </div>
              </div>
            </motion.section>
          )}
        </AnimatePresence>
      </main>

      <Footer />
    </div>
  );
}
