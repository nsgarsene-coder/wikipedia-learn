/**
 * useWikipedia — Wikipedia Learn
 * Hook pour interroger l'API Wikipédia (FR)
 * Récupère: résumé, sections, images variées, questions basées sur le contenu
 */

import { useState, useCallback } from 'react';

const WIKI_API = 'https://fr.wikipedia.org/api/rest_v1';
const WIKI_ACTION_API = 'https://fr.wikipedia.org/w/api.php';

export interface WikiSection {
  id: string;
  title: string;
  summary: string;
  imageUrl: string | null;
  wikiUrl: string;
}

export interface WikiSearchResult {
  title: string;
  description: string;
  thumbnail: string | null;
  wikiUrl: string;
  sections: WikiSection[];
  fullSummary: string;
}

export interface WikiNode {
  id: string;
  title: string;
  summary: string;
  imageUrl: string | null;
  questions: WikiQuestion[];
}

export interface WikiQuestion {
  id: string;
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

// Suggestions de recherche depuis l'API Wikpédia
export async function fetchSearchSuggestions(query: string): Promise<string[]> {
  if (query.length < 2) return [];
  try {
    const url = `${WIKI_ACTION_API}?action=opensearch&search=${encodeURIComponent(query)}&limit=6&namespace=0&format=json&origin=*`;
    const res = await fetch(url);
    const data = await res.json();
    return (data[1] as string[]) ?? [];
  } catch {
    return [];
  }
}

// Extraire des faits clés d'un texte pour générer des questions pertinentes
function extractFactsFromText(text: string): Array<{ fact: string; subject: string; value: string }> {
  const facts: Array<{ fact: string; subject: string; value: string }> = [];
  
  // Patterns pour extraire des dates
  const datePattern = /([A-ZÀÂÄÉÈÊËÎÏÔÙÛÜ][^.]*?)\b(en\s+\d{4}|le\s+\d{1,2}\s+\w+\s+\d{4}|\d{4})\b([^.]*?)\./g;
  let match;
  while ((match = datePattern.exec(text)) !== null && facts.length < 3) {
    const sentence = match[0].trim();
    if (sentence.length > 20 && sentence.length < 200) {
      facts.push({ fact: sentence, subject: match[2], value: sentence });
    }
  }
  
  // Patterns pour extraire des noms propres et leurs rôles
  const namePattern = /([A-ZÀÂÄÉÈÊËÎÏÔÙÛÜ][a-zàâäéèêëîïôùûü]+(?:\s+[A-ZÀÂÄÉÈÊËÎÏÔÙÛÜ][a-zàâäéèêëîïôùûü]+)+)\s+(?:est|était|fut|devint|a été)\s+([^.]{10,80})\./g;
  while ((match = namePattern.exec(text)) !== null && facts.length < 5) {
    facts.push({ fact: match[0].trim(), subject: match[1], value: match[2] });
  }
  
  return facts;
}

// Générer des questions pertinentes à partir du contenu Wikipedia réel
function generateQuestionsFromText(title: string, summary: string, nodeTitle: string): WikiQuestion[] {
  const ts = Date.now();
  const questions: WikiQuestion[] = [];
  
  // Nettoyer le texte
  const cleanText = summary.replace(/\([^)]*\)/g, '').replace(/\s+/g, ' ').trim();
  const sentences = cleanText.split(/[.!?]+/).filter(s => s.trim().length > 40).slice(0, 8);
  
  // Extraire des faits clés
  const facts = extractFactsFromText(cleanText);
  
  // --- Question 1: Basée sur une date ou un fait précis si disponible ---
  if (facts.length > 0 && facts[0].subject) {
    const fact = facts[0];
    const wrongDates = ['1756', '1848', '1789', '1945', '1871', '1066', '1492', '1815'];
    const correctYear = fact.subject.match(/\d{4}/)?.[0];
    
    if (correctYear) {
      const wrongs = wrongDates.filter(d => d !== correctYear).slice(0, 3);
      questions.push({
        id: `q_${ts}_1`,
        question: `En quelle année se situe un événement clé lié à "${nodeTitle}" ?`,
        options: [correctYear, ...wrongs].sort(() => Math.random() - 0.5),
        correctIndex: 0,
        explanation: `${fact.fact.slice(0, 150)}`,
      });
      // Réordonner pour que la bonne réponse soit à l'index correct
      const opts = [correctYear, ...wrongs];
      const shuffled = [...opts].sort(() => Math.random() - 0.5);
      const correctIdx = shuffled.indexOf(correctYear);
      questions[questions.length - 1] = {
        ...questions[questions.length - 1],
        options: shuffled,
        correctIndex: correctIdx,
      };
    }
  }
  
  // --- Question 2: Basée sur une phrase du résumé ---
  if (sentences.length > 1) {
    const sentence = sentences[Math.floor(Math.random() * Math.min(sentences.length, 3))].trim();
    
    // Trouver un mot clé dans la phrase
    const words = sentence.split(' ').filter(w => w.length > 5 && /^[A-ZÀÂÄÉÈÊËÎÏÔÙÛÜ]/.test(w));
    
    if (words.length > 0) {
      const keyword = words[0];
      const wrongKeywords = ['Napoléon Bonaparte', 'Jules César', 'Alexandre le Grand', 'Charlemagne', 'Louis XIV', 'Henri IV', 'Richelieu', 'Bismarck'];
      const wrongs = wrongKeywords.filter(w => w !== keyword && !sentence.includes(w)).slice(0, 3);
      
      if (wrongs.length >= 3) {
        const opts = [keyword, ...wrongs];
        const shuffled = [...opts].sort(() => Math.random() - 0.5);
        const correctIdx = shuffled.indexOf(keyword);
        questions.push({
          id: `q_${ts}_2`,
          question: `Dans le contexte de "${nodeTitle}", quel personnage ou élément est mentionné comme particulièrement important ?`,
          options: shuffled,
          correctIndex: correctIdx,
          explanation: `D'après les sources : "${sentence.slice(0, 150)}..."`,
        });
      }
    }
  }
  
  // --- Question 3: Compréhension du contexte ---
  if (sentences.length > 0) {
    const contextSentence = sentences[0].trim();
    
    // Créer une question de compréhension basée sur la première phrase
    const correctAnswer = `${nodeTitle} est directement lié à ${title}`;
    const wrongAnswers = [
      `${nodeTitle} est un concept sans rapport avec ${title}`,
      `${nodeTitle} est postérieur au XXIème siècle`,
      `${nodeTitle} contredit les théories sur ${title}`,
    ];
    const opts = [correctAnswer, ...wrongAnswers].sort(() => Math.random() - 0.5);
    const correctIdx = opts.indexOf(correctAnswer);
    
    questions.push({
      id: `q_${ts}_3`,
      question: `Quelle affirmation sur "${nodeTitle}" est correcte selon les sources encyclopédiques ?`,
      options: opts,
      correctIndex: correctIdx,
      explanation: `${contextSentence.slice(0, 150)}...`,
    });
  }
  
  // Compléter jusqu'à 3 questions si nécessaire
  while (questions.length < 3) {
    const idx = questions.length;
    const q: WikiQuestion = {
      id: `q_${ts}_${idx + 1}`,
      question: idx === 0
        ? `Quel est le rôle principal de "${nodeTitle}" dans le contexte de ${title} ?`
        : idx === 1
        ? `Comment "${nodeTitle}" s'inscrit-il dans l'histoire de ${title} ?`
        : `Quelle est l'importance de "${nodeTitle}" pour comprendre ${title} ?`,
      options: [
        idx === 0
          ? `C'est un élément central et déterminant de ${title}`
          : idx === 1
          ? `Il constitue une étape clé dans l'évolution de ${title}`
          : `Il permet de saisir les mécanismes essentiels de ${title}`,
        `C'est un événement mineur sans conséquences notables`,
        `C'est un concept purement théorique sans application historique`,
        `Il n'a aucun lien direct avec ${title}`,
      ],
      correctIndex: 0,
      explanation: `"${nodeTitle}" est effectivement un élément fondamental dans le contexte de ${title}.`,
    };
    questions.push(q);
  }
  
  return questions.slice(0, 3);
}

// Récupérer les images d'une page Wikipedia (toutes les images de la page)
async function fetchPageImages(pageTitle: string): Promise<string[]> {
  try {
    const url = `${WIKI_ACTION_API}?action=query&titles=${encodeURIComponent(pageTitle)}&prop=images&format=json&origin=*&imlimit=20`;
    const res = await fetch(url);
    const data = await res.json();
    const pages = data.query?.pages ?? {};
    const page = Object.values(pages)[0] as any;
    const imageNames: string[] = (page?.images ?? [])
      .map((img: any) => img.title as string)
      .filter((t: string) => /\.(jpg|jpeg|png|gif|svg)$/i.test(t) && !t.toLowerCase().includes('icon') && !t.toLowerCase().includes('logo') && !t.toLowerCase().includes('flag'));
    
    if (imageNames.length === 0) return [];
    
    // Récupérer les URLs des images
    const imgTitles = imageNames.slice(0, 10).join('|');
    const imgUrl = `${WIKI_ACTION_API}?action=query&titles=${encodeURIComponent(imgTitles)}&prop=imageinfo&iiprop=url|thumburl&iiurlwidth=400&format=json&origin=*`;
    const imgRes = await fetch(imgUrl);
    const imgData = await imgRes.json();
    const imgPages = imgData.query?.pages ?? {};
    
    const urls: string[] = Object.values(imgPages)
      .map((p: any) => p?.imageinfo?.[0]?.thumburl ?? p?.imageinfo?.[0]?.url)
      .filter(Boolean) as string[];
    
    return urls;
  } catch {
    return [];
  }
}

export function useWikipedia() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Recherche principale — retourne le résumé et les sections
  const searchTopic = useCallback(async (query: string): Promise<WikiSearchResult | null> => {
    setLoading(true);
    setError(null);
    try {
      // 1. Chercher le titre exact via l'API de recherche
      const searchUrl = `${WIKI_ACTION_API}?action=query&list=search&srsearch=${encodeURIComponent(query)}&format=json&origin=*&srlimit=1`;
      const searchRes = await fetch(searchUrl);
      const searchData = await searchRes.json();
      
      if (!searchData.query?.search?.length) {
        setError('Aucun résultat trouvé pour cette recherche.');
        return null;
      }

      const pageTitle = searchData.query.search[0].title;

      // 2. Récupérer le résumé et l'image principale
      const summaryUrl = `${WIKI_API}/page/summary/${encodeURIComponent(pageTitle)}`;
      const summaryRes = await fetch(summaryUrl);
      const summaryData = await summaryRes.json();

      // 3. Récupérer les sections de la page
      const sectionsUrl = `${WIKI_ACTION_API}?action=parse&page=${encodeURIComponent(pageTitle)}&prop=sections&format=json&origin=*`;
      const sectionsRes = await fetch(sectionsUrl);
      const sectionsData = await sectionsRes.json();

      const rawSections = sectionsData.parse?.sections ?? [];
      
      // Filtrer les sections de niveau 1 et 2 (les plus importantes)
      const topSections = rawSections
        .filter((s: any) => s.toclevel <= 2 && s.line && !s.line.match(/^(Notes|Références|Voir aussi|Bibliographie|Liens externes|Annexes|Galerie)/i))
        .slice(0, 8);

      // 4. Récupérer les images de la page pour les distribuer entre sections
      const pageImages = await fetchPageImages(pageTitle);
      const mainThumb = summaryData.thumbnail?.source ?? null;
      
      // Construire un pool d'images varié
      const imagePool: string[] = [];
      if (mainThumb) imagePool.push(mainThumb);
      imagePool.push(...pageImages);
      
      // Dédupliquer
      const uniqueImages = Array.from(new Set(imagePool));

      // 5. Construire les sections avec images variées
      const sections: WikiSection[] = await Promise.all(
        topSections.map(async (section: any, idx: number) => {
          const sectionTitle = section.line.replace(/<[^>]+>/g, '');
          
          // Essayer d'abord de récupérer une image spécifique à la section
          let imageUrl: string | null = null;
          try {
            const imgSearchUrl = `${WIKI_API}/page/summary/${encodeURIComponent(sectionTitle)}`;
            const imgRes = await fetch(imgSearchUrl);
            if (imgRes.ok) {
              const imgData = await imgRes.json();
              const sectionThumb = imgData.thumbnail?.source;
              // N'utiliser que si c'est une image différente de la principale
              if (sectionThumb && sectionThumb !== mainThumb) {
                imageUrl = sectionThumb;
              }
            }
          } catch {
            // Ignorer
          }
          
          // Si pas d'image spécifique, utiliser une image du pool (en rotation)
          if (!imageUrl) {
            imageUrl = uniqueImages[idx % uniqueImages.length] ?? null;
          }

          // Récupérer un vrai résumé de la section si possible
          let sectionSummary = `Exploration de "${sectionTitle}" dans le contexte de ${pageTitle}.`;
          try {
            const secSummaryUrl = `${WIKI_API}/page/summary/${encodeURIComponent(sectionTitle)}`;
            const secRes = await fetch(secSummaryUrl);
            if (secRes.ok) {
              const secData = await secRes.json();
              if (secData.extract && secData.extract.length > 50) {
                sectionSummary = secData.extract.slice(0, 200);
              }
            }
          } catch {
            // Ignorer
          }

          return {
            id: `section_${idx}`,
            title: sectionTitle,
            summary: sectionSummary,
            imageUrl,
            wikiUrl: `https://fr.wikipedia.org/wiki/${encodeURIComponent(pageTitle)}#${section.anchor}`,
          };
        })
      );

      // Si pas assez de sections, créer des sections génériques
      const finalSections = sections.length >= 3 ? sections : [
        {
          id: 'section_0',
          title: `Introduction à ${pageTitle}`,
          summary: summaryData.extract?.slice(0, 200) ?? '',
          imageUrl: summaryData.thumbnail?.source ?? null,
          wikiUrl: `https://fr.wikipedia.org/wiki/${encodeURIComponent(pageTitle)}`,
        },
        ...sections,
      ];

      return {
        title: summaryData.title ?? pageTitle,
        description: summaryData.description ?? '',
        thumbnail: summaryData.thumbnail?.source ?? null,
        wikiUrl: `https://fr.wikipedia.org/wiki/${encodeURIComponent(pageTitle)}`,
        sections: finalSections.slice(0, 8),
        fullSummary: summaryData.extract ?? '',
      };
    } catch (err) {
      setError('Erreur lors de la connexion à Wikipédia. Vérifiez votre connexion.');
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  // Récupérer les noeuds (moments clés) d'une section
  const getSectionNodes = useCallback(async (
    topicTitle: string,
    sectionTitle: string,
    _sectionWikiUrl: string
  ): Promise<WikiNode[]> => {
    setLoading(true);
    setError(null);
    try {
      // Rechercher des sous-sujets liés à la section
      const searchUrl = `${WIKI_ACTION_API}?action=query&list=search&srsearch=${encodeURIComponent(sectionTitle + ' ' + topicTitle)}&format=json&origin=*&srlimit=8`;
      const searchRes = await fetch(searchUrl);
      const searchData = await searchRes.json();

      const results = searchData.query?.search ?? [];
      
      // Prendre les 5-7 premiers résultats comme noeuds
      const nodeCount = Math.min(Math.max(results.length, 5), 7);
      
      const nodes: WikiNode[] = await Promise.all(
        results.slice(0, nodeCount).map(async (result: any, idx: number) => {
          let imageUrl: string | null = null;
          let nodeSummary = result.snippet?.replace(/<[^>]+>/g, '') ?? '';
          try {
            const summaryUrl = `${WIKI_API}/page/summary/${encodeURIComponent(result.title)}`;
            const summaryRes = await fetch(summaryUrl);
            const summaryData = await summaryRes.json();
            imageUrl = summaryData.thumbnail?.source ?? null;
            
            if (summaryData.extract && summaryData.extract.length > 50) {
              nodeSummary = summaryData.extract
            }
            
            const questions = generateQuestionsFromText(topicTitle, summaryData.extract ?? nodeSummary, result.title);
            
            return {
              id: `node_${idx}`,
              title: result.title,
              summary: nodeSummary,
              imageUrl,
              questions,
            };
          } catch {
            return {
              id: `node_${idx}`,
              title: result.title,
              summary: nodeSummary,
              imageUrl: null,
              questions: generateQuestionsFromText(topicTitle, nodeSummary, result.title),
            };
          }
        })
      );

      return nodes;
    } catch (err) {
      setError('Erreur lors de la récupération des données.');
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  // Récupérer les questions spécifiques pour un noeud (quiz)
  const getNodeQuestions = useCallback(async (
    topicTitle: string,
    nodeTitle: string,
    nodeSummary: string
  ): Promise<WikiQuestion[]> => {
    return generateQuestionsFromText(topicTitle, nodeSummary, nodeTitle);
  }, []);

  return {
    loading,
    error,
    searchTopic,
    getSectionNodes,
    getNodeQuestions,
  };
}
