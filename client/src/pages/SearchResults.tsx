/**
 * SearchResults — Wikipedia Learn
 * Page des chapitres d'un sujet recherché
 * Style: Archives Vivantes — cartes éditoriales avec images Wikipédia
 */
import { useEffect, useState } from 'react';
import { useLocation, useSearch } from 'wouter';
import { motion } from 'framer-motion';
import { ExternalLink, Lock, CheckCircle, Loader2, AlertCircle, RefreshCw } from 'lucide-react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { useWikipedia, WikiSearchResult } from '@/hooks/useWikipedia';
import { useApp } from '@/contexts/AppContext';

export default function SearchResults() {
  const [, navigate] = useLocation();
  const search = useSearch(); // retourne le query string sans le "?"
  const { searchTopic, loading, error } = useWikipedia();
  const { isNodeCompleted, state } = useApp();
  const [result, setResult] = useState<WikiSearchResult | null>(null);

  // Parser le query string correctement
  const params = new URLSearchParams(search);
  const query = params.get('q') ?? '';

  useEffect(() => {
    if (!query) return;
    setResult(null);
    searchTopic(query).then(data => {
      if (data) setResult(data);
    });
  }, [query]);

  const topicId = result ? `topic_${encodeURIComponent(result.title)}` : '';

  return (
    <div className="min-h-screen flex flex-col bg-[oklch(0.96_0.015_80)]">
      <Header />

      <main className="flex-1">
        <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 py-10">

          {/* Loading state */}
          {loading && (
            <div className="flex flex-col items-center justify-center py-24 gap-4">
              <Loader2 size={32} className="animate-spin text-[oklch(0.72_0.12_75)]" />
              <p className="font-body text-[oklch(0.52_0.02_65)]">Exploration de Wikipédia en cours...</p>
            </div>
          )}

          {/* Error state */}
          {error && !loading && (
            <div className="flex flex-col items-center justify-center py-24 gap-4">
              <AlertCircle size={32} className="text-[oklch(0.50_0.20_25)]" />
              <p className="font-body text-[oklch(0.52_0.02_65)]">{error}</p>
              <button
                onClick={() => navigate('/')}
                className="font-mono-data text-[11px] tracking-widest text-[oklch(0.72_0.12_75)] hover:underline uppercase"
              >
                Retour à l'accueil
              </button>
            </div>
          )}

          {/* No query */}
          {!query && !loading && (
            <div className="flex flex-col items-center justify-center py-24 gap-4">
              <p className="font-body text-[oklch(0.52_0.02_65)]">Aucun sujet recherché.</p>
              <button
                onClick={() => navigate('/')}
                className="font-mono-data text-[11px] tracking-widest text-[oklch(0.72_0.12_75)] hover:underline uppercase"
              >
                Retour à l'accueil
              </button>
            </div>
          )}

          {/* Results */}
          {result && !loading && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.4 }}
            >
              {/* Header section */}
              <div className="mb-10">
                <div className="font-mono-data text-[10px] tracking-widest text-[oklch(0.72_0.12_75)] uppercase mb-2">
                  Current Domain
                </div>
                <h1 className="font-display text-4xl sm:text-5xl font-bold text-[oklch(0.18_0.02_60)] italic mb-4">
                  {result.title}
                </h1>
                <p className="font-body text-[oklch(0.52_0.02_65)] text-base leading-relaxed max-w-xl mb-5">
                  {result.fullSummary.slice(0, 280)}
                  {result.fullSummary.length > 280 ? '...' : ''}
                </p>

                {/* Buttons row */}
                <div className="flex flex-wrap items-center gap-3">
                  <a
                    href={result.wikiUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-5 py-2.5 border border-[oklch(0.86_0.02_75)] rounded-full font-body text-sm text-[oklch(0.52_0.02_65)] hover:border-[oklch(0.72_0.12_75)] hover:text-[oklch(0.18_0.02_60)] transition-all"
                  >
                    <ExternalLink size={14} />
                    Se documenter sur Wikipédia
                  </a>

                  {/* Revision button — si des questions ratées existent */}
                  {state.topicProgress[topicId]?.failedQuestions?.length > 0 && (
                    <button
                      onClick={() => navigate(`/revision/${encodeURIComponent(result.title)}`)}
                      className="inline-flex items-center gap-2 px-5 py-2.5 bg-[oklch(0.72_0.12_75)/10] border border-[oklch(0.72_0.12_75)/40] rounded-full font-body text-sm text-[oklch(0.72_0.12_75)] hover:bg-[oklch(0.72_0.12_75)/20] transition-all"
                    >
                      <RefreshCw size={14} />
                      Réviser ({state.topicProgress[topicId].failedQuestions.length} questions)
                    </button>
                  )}
                </div>
              </div>

              {/* Gold separator */}
              <div className="gold-line mb-10" />

              {/* Chapters grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {result.sections.map((section, idx) => {
                  const chapterId = `chapter_${idx}`;
                  const completed = isNodeCompleted(topicId, chapterId);
                  const inProgress = state.topicProgress[topicId]?.nodeProgress[chapterId] != null && !completed;

                  return (
                    <motion.div
                      key={section.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.07, duration: 0.4 }}
                      onClick={() => navigate(`/topic/${encodeURIComponent(result.title)}/chapter/${idx}?section=${encodeURIComponent(section.title)}`)}
                      className="cursor-pointer bg-[oklch(0.99_0.008_80)] border border-[oklch(0.86_0.02_75)] rounded-xl overflow-hidden hover:border-[oklch(0.72_0.12_75)/60] hover:shadow-md transition-all group relative"
                    >
                      {/* Image */}
                      <div className="aspect-[16/9] bg-[oklch(0.93_0.012_78)] overflow-hidden relative">
                        {section.imageUrl ? (
                          <img
                            src={section.imageUrl}
                            alt={section.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                            onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }}
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <div className="font-display text-4xl font-bold text-[oklch(0.72_0.12_75)/20]">
                              {String(idx + 1).padStart(2, '0')}
                            </div>
                          </div>
                        )}

                        {/* Lock overlay */}
                        {completed && (
                          <div className="absolute inset-0 bg-[oklch(0.48_0.12_145)/10] flex items-end justify-end p-3">
                            <div className="bg-[oklch(0.48_0.12_145)] text-white font-mono-data text-[9px] tracking-widest px-2 py-1 rounded flex items-center gap-1">
                              <CheckCircle size={10} />
                              Terminé
                            </div>
                          </div>
                        )}
                        {inProgress && !completed && (
                          <div className="absolute top-3 right-3 bg-[oklch(0.72_0.12_75)] text-[oklch(0.18_0.02_60)] font-mono-data text-[9px] tracking-widest px-2 py-1 rounded uppercase">
                            En cours
                          </div>
                        )}
                      </div>

                      {/* Content */}
                      <div className="p-4">
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-mono-data text-[10px] text-[oklch(0.72_0.12_75)]">
                            {String(idx + 1).padStart(2, '0')}
                          </span>
                          {completed ? (
                            <CheckCircle size={14} className="text-[oklch(0.48_0.12_145)]" />
                          ) : (
                            <div className="w-3 h-3 rounded-full border border-[oklch(0.72_0.12_75)/50]" />
                          )}
                        </div>
                        <h3 className="font-display font-semibold text-base text-[oklch(0.18_0.02_60)] mb-1.5 leading-snug group-hover:text-[oklch(0.72_0.12_75)] transition-colors">
                          {section.title}
                        </h3>
                        <p className="font-body text-xs text-[oklch(0.52_0.02_65)] leading-relaxed line-clamp-2">
                          {section.summary}
                        </p>
                      </div>
                    </motion.div>
                  );
                })}
              </div>

              {/* Alternative topics */}
              <div className="mt-12">
                <div className="font-mono-data text-[10px] tracking-widest text-[oklch(0.52_0.02_65)] uppercase mb-4">
                  Sujets connexes
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  {[
                    { category: 'HISTOIRE', title: 'Seconde Guerre Mondiale' },
                    { category: 'SCIENCE', title: 'Révolution Industrielle' },
                    { category: 'CULTURE', title: 'Renaissance Italienne' },
                    { category: 'POLITIQUE', title: 'Révolution Française' },
                  ].map(({ category, title }) => (
                    <div
                      key={title}
                      onClick={() => navigate(`/search?q=${encodeURIComponent(title)}`)}
                      className="cursor-pointer border-b border-[oklch(0.86_0.02_75)] pb-3 hover:border-[oklch(0.72_0.12_75)] transition-colors group"
                    >
                      <div className="font-mono-data text-[9px] tracking-widest text-[oklch(0.72_0.12_75)] mb-1">{category}</div>
                      <div className="font-display text-sm text-[oklch(0.18_0.02_60)] group-hover:text-[oklch(0.72_0.12_75)] transition-colors">{title}</div>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
