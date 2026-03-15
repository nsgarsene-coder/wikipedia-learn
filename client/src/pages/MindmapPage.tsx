/**
 * MindmapPage — Wikipedia Learn
 * Page du mindmap interactif avec cercles verrouillables
 * Style: Archives Vivantes — cercles dorés sur fond gris clair, texte contextuel en bas
 * Flux: Clic sur cercle → texte affiché → bouton "Tester ma compréhension" → Quiz
 */

import { useEffect, useState, useRef } from 'react';
import { useLocation, useParams, useSearch } from 'wouter';
import { motion, AnimatePresence } from 'framer-motion';
import { Lock, CheckCircle, ChevronRight, ExternalLink, Loader2, RefreshCw } from 'lucide-react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { useWikipedia, WikiNode } from '@/hooks/useWikipedia';
import { useApp } from '@/contexts/AppContext';

export default function MindmapPage() {
  const params = useParams<{ topic: string; chapter: string }>();
  const [, navigate] = useLocation();
  const search = useSearch();
  const { getSectionNodes, loading, error } = useWikipedia();
  const { isNodeUnlocked, isNodeCompleted, getNodeProgress, state } = useApp();

  const urlParams = new URLSearchParams(search);
  const sectionTitle = urlParams.get('section') ?? '';

  const topicTitle = decodeURIComponent(params.topic ?? '');
  const chapterIndex = parseInt(params.chapter ?? '0', 10);
  const topicId = `topic_${encodeURIComponent(topicTitle)}`;

  const [nodes, setNodes] = useState<WikiNode[]>([]);
  const [selectedNode, setSelectedNode] = useState<WikiNode | null>(null);
  const [selectedNodeIndex, setSelectedNodeIndex] = useState<number>(-1);
  const textPanelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!topicTitle || !sectionTitle) return;
    getSectionNodes(topicTitle, sectionTitle, '').then(data => {
      if (data.length > 0) setNodes(data);
    });
  }, [topicTitle, sectionTitle]);

  const handleNodeClick = (node: WikiNode, index: number) => {
    const unlocked = isNodeUnlocked(topicId, node.id, index);
    if (!unlocked) return;
    setSelectedNode(node);
    setSelectedNodeIndex(index);
    setTimeout(() => {
      textPanelRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }, 100);
  };

  const handleStartQuiz = () => {
    if (!selectedNode) return;
    navigate(
      `/topic/${encodeURIComponent(topicTitle)}/chapter/${chapterIndex}/node/${selectedNodeIndex}/quiz?section=${encodeURIComponent(sectionTitle)}&nodeTitle=${encodeURIComponent(selectedNode.title)}`
    );
  };

  // Layout positions for circles (organic, not grid)
  const getCirclePosition = (index: number, total: number) => {
    const positions = [
      { x: 15, y: 20 },
      { x: 38, y: 10 },
      { x: 62, y: 15 },
      { x: 82, y: 22 },
      { x: 8, y: 55 },
      { x: 30, y: 60 },
      { x: 55, y: 58 },
      { x: 75, y: 62 },
    ];
    return positions[index % positions.length];
  };

  return (
    <div className="min-h-screen flex flex-col bg-[oklch(0.96_0.015_80)]">
      <Header />

      <main className="flex-1">
        <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 py-8">

          {/* Page header */}
          <div className="mb-8">
            <div className="font-mono-data text-[10px] tracking-widest text-[oklch(0.72_0.12_75)] uppercase mb-1.5">
              Chapitre {String(chapterIndex + 1).padStart(2, '0')} — {topicTitle}
            </div>
            <h1 className="font-display text-3xl sm:text-4xl font-bold text-[oklch(0.18_0.02_60)] mb-2">
              {sectionTitle}
            </h1>
            <p className="font-body text-sm text-[oklch(0.52_0.02_65)]">
              Explorez les moments et concepts essentiels de ce chapitre.
            </p>
          </div>

          {/* Loading */}
          {loading && (
            <div className="flex items-center justify-center py-20 gap-3">
              <Loader2 size={24} className="animate-spin text-[oklch(0.72_0.12_75)]" />
              <span className="font-body text-[oklch(0.52_0.02_65)]">Chargement du parcours...</span>
            </div>
          )}

          {/* Mindmap container */}
          {nodes.length > 0 && !loading && (
            <>
              <div className="bg-[oklch(0.93_0.012_78)] rounded-2xl p-6 sm:p-8 mb-6">
                <div className="text-center mb-6">
                  <div className="font-mono-data text-[9px] tracking-widest text-[oklch(0.52_0.02_65)] uppercase mb-1">
                    Interactive Syllabus
                  </div>
                  <h2 className="font-display text-xl font-bold text-[oklch(0.18_0.02_60)]">
                    Parcours de connaissances
                  </h2>
                </div>

                {/* Mindmap — responsive layout */}
                <div className="relative min-h-[320px] sm:min-h-[400px]">
                  {/* SVG connections */}
                  <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ zIndex: 0 }}>
                    {nodes.map((node, idx) => {
                      if (idx === 0) return null;
                      const from = getCirclePosition(idx - 1, nodes.length);
                      const to = getCirclePosition(idx, nodes.length);
                      const unlocked = isNodeUnlocked(topicId, node.id, idx);
                      return (
                        <line
                          key={`line_${idx}`}
                          x1={`${from.x + 8}%`}
                          y1={`${from.y + 8}%`}
                          x2={`${to.x + 8}%`}
                          y2={`${to.y + 8}%`}
                          stroke={unlocked ? 'oklch(0.72 0.12 75 / 0.3)' : 'oklch(0.75 0.01 65 / 0.2)'}
                          strokeWidth="1.5"
                          strokeDasharray={unlocked ? 'none' : '4 4'}
                        />
                      );
                    })}
                  </svg>

                  {/* Nodes */}
                  {nodes.map((node, idx) => {
                    const pos = getCirclePosition(idx, nodes.length);
                    const unlocked = isNodeUnlocked(topicId, node.id, idx);
                    const completed = isNodeCompleted(topicId, node.id);
                    const isSelected = selectedNodeIndex === idx;
                    const progress = getNodeProgress(topicId, node.id);

                    return (
                      <motion.div
                        key={node.id}
                        initial={{ opacity: 0, scale: 0.5 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.4, delay: idx * 0.08, type: 'spring', stiffness: 200 }}
                        style={{
                          position: 'absolute',
                          left: `${pos.x}%`,
                          top: `${pos.y}%`,
                          zIndex: 1,
                        }}
                        onClick={() => handleNodeClick(node, idx)}
                        className={`
                          w-24 h-24 sm:w-28 sm:h-28 rounded-full flex flex-col items-center justify-center text-center p-2
                          ${unlocked ? 'cursor-pointer' : 'cursor-not-allowed'}
                          ${isSelected ? 'ring-4 ring-[oklch(0.72_0.12_75)/60]' : ''}
                          mindmap-node
                          ${!unlocked ? 'locked' : ''}
                          ${completed ? 'border-[oklch(0.48_0.12_145)]' : ''}
                          bg-white
                        `}
                      >
                        {!unlocked ? (
                          <Lock size={18} className="text-[oklch(0.65_0.015_70)] mb-1" />
                        ) : completed ? (
                          <CheckCircle size={16} className="text-[oklch(0.48_0.12_145)] mb-1" />
                        ) : null}
                        <span className={`font-display text-[10px] sm:text-xs font-semibold leading-tight ${!unlocked ? 'text-[oklch(0.65_0.015_70)]' : 'text-[oklch(0.18_0.02_60)]'}`}>
                          {node.title.length > 30 ? node.title.slice(0, 28) + '...' : node.title}
                        </span>
                        {progress && !completed && (
                          <div className="mt-1 w-10 h-1 bg-[oklch(0.86_0.02_75)] rounded-full overflow-hidden">
                            <div
                              className="h-full bg-[oklch(0.72_0.12_75)] rounded-full"
                              style={{ width: `${(progress.correctAnswers / progress.totalAnswers) * 100}%` }}
                            />
                          </div>
                        )}
                      </motion.div>
                    );
                  })}
                </div>
              </div>

              {/* Text panel — shown when a node is selected */}
              <AnimatePresence>
                {selectedNode && (
                  <motion.div
                    ref={textPanelRef}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    transition={{ duration: 0.3 }}
                    className="bg-[oklch(0.99_0.008_80)] border border-[oklch(0.86_0.02_75)] rounded-2xl p-6 sm:p-8"
                  >
                    <div className="flex items-start justify-between gap-4 mb-4">
                      <div>
                        <div className="font-mono-data text-[10px] tracking-widest text-[oklch(0.72_0.12_75)] uppercase mb-1">
                          Noeud {String(selectedNodeIndex + 1).padStart(2, '0')}
                        </div>
                        <h3 className="font-display text-2xl font-bold text-[oklch(0.18_0.02_60)]">
                          {selectedNode.title}
                        </h3>
                      </div>
                      {isNodeCompleted(topicId, selectedNode.id) && (
                        <div className="flex items-center gap-1.5 px-3 py-1.5 bg-[oklch(0.48_0.12_145)/10] border border-[oklch(0.48_0.12_145)/30] rounded-full shrink-0">
                          <CheckCircle size={13} className="text-[oklch(0.48_0.12_145)]" />
                          <span className="font-mono-data text-[10px] text-[oklch(0.48_0.12_145)] tracking-wide">Complété</span>
                        </div>
                      )}
                    </div>

                    <div className="gold-line mb-4" />

                    <p className="font-body text-[oklch(0.35_0.02_65)] leading-relaxed text-base mb-6">
                      {selectedNode.summary || `Explorez les aspects essentiels de "${selectedNode.title}" dans le contexte de ${topicTitle}.`}
                    </p>

                    <div className="flex flex-wrap gap-3">
                      {!isNodeCompleted(topicId, selectedNode.id) && (
                        <button
                          onClick={handleStartQuiz}
                          className="flex items-center gap-2 px-6 py-3 bg-[oklch(0.72_0.12_75)] text-[oklch(0.18_0.02_60)] rounded-full font-body font-semibold text-sm hover:bg-[oklch(0.80_0.14_78)] transition-colors shadow-sm"
                        >
                          Tester ma compréhension
                          <ChevronRight size={16} />
                        </button>
                      )}
                      {isNodeCompleted(topicId, selectedNode.id) && (
                        <button
                          onClick={handleStartQuiz}
                          className="flex items-center gap-2 px-5 py-2.5 border border-[oklch(0.86_0.02_75)] text-[oklch(0.52_0.02_65)] rounded-full font-body text-sm hover:border-[oklch(0.72_0.12_75)] transition-colors"
                        >
                          <RefreshCw size={14} />
                          Repasser le quiz
                        </button>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* No node selected hint */}
              {!selectedNode && (
                <div className="text-center py-6">
                  <p className="font-body text-sm text-[oklch(0.65_0.015_70)]">
                    Cliquez sur un cercle pour explorer son contenu
                  </p>
                </div>
              )}
            </>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
