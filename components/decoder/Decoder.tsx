
import React, { useState, useEffect, useMemo, Suspense, lazy, useCallback } from 'react';
import { type Article, type IntelligenceBriefing, type EnrichmentData, type EsotericMappings, type CosmicData, type Synthesis, type CosmicWeather, type EtymologyData } from '../../types';
import { DECODER_SECTIONS } from '../../constants';
import { getIntelligenceBriefing, getEnrichment, getEsotericMappings, getUnifiedCosmicAnalysis, getEnhancedEntities, getEtymology } from '../../services/geminiService';
import { type TourStep } from '../shared/OnboardingTour';

import { DecoderCommandBar } from './DecoderCommandBar'; 
import { Section } from '../shared/Section';
import { NotebookProvider, useNotebook } from '../../contexts/NotebookContext';
import { LoadingSpinner } from '../shared/LoadingSpinner';

// Lazy Load Suites
const FullArticleView = lazy(() => import('./suites/FullArticleView').then(m => ({ default: m.FullArticleView })));
const IntelligenceBriefingSuite = lazy(() => import('./suites/IntelligenceBriefing').then(m => ({ default: m.IntelligenceBriefing })));
const EnrichmentView = lazy(() => import('./suites/EnrichmentView').then(m => ({ default: m.EnrichmentView })));
const GematriaMatrix = lazy(() => import('./suites/GematriaMatrix').then(m => ({ default: m.GematriaMatrix })));
const SymbolicAnalysis = lazy(() => import('./suites/SymbolicAnalysis').then(m => ({ default: m.SymbolicAnalysis })));
const QliphothAnalysis = lazy(() => import('./suites/QliphothAnalysis').then(m => ({ default: m.QliphothAnalysis })));
const EtymologyAnalysis = lazy(() => import('./suites/EtymologyAnalysis').then(m => ({ default: m.EtymologyAnalysis })));
const NumerologyChronology = lazy(() => import('./suites/NumerologyChronology').then(m => ({ default: m.NumerologyChronology })));
const CosmicDashboard = lazy(() => import('./suites/CosmicDashboard').then(m => ({ default: m.CosmicDashboard })));
const SynthesisAnalysis = lazy(() => import('./suites/SynthesisAnalysis').then(m => ({ default: m.SynthesisAnalysis })));
const AnalystChat = lazy(() => import('./AnalystChat').then(m => ({ default: m.AnalystChat })));
const AnalystNotebook = lazy(() => import('./AnalystNotebook').then(m => ({ default: m.AnalystNotebook })));

interface DecoderProps {
  article: Article;
  onBack: () => void;
  onSearchEntity: (term: string) => void;
  onStartTour: (steps: TourStep[]) => void;
}

const SECTION_TOUR_STEPS: Record<string, TourStep[]> = {
  // (Tour steps remain identical)
  'full-article': [{ targetId: 'full-article', title: 'Source Transmission Analysis', content: '...', position: 'bottom' }],
  'intelligence-briefing': [{ targetId: 'intelligence-briefing', title: 'Entity Extraction Engine', content: '...', position: 'top' }]
};

const DecoderContent: React.FC<DecoderProps> = ({ article, onBack, onSearchEntity, onStartTour }) => {
  const [briefing, setBriefing] = useState<IntelligenceBriefing | null>(null);
  const [enrichment, setEnrichment] = useState<EnrichmentData | null>(null);
  const [esotericMappings, setEsotericMappings] = useState<EsotericMappings | null>(null);
  const [etymology, setEtymology] = useState<EtymologyData | null>(null);
  const [cosmicData, setCosmicData] = useState<CosmicData | null>(null);
  const [cosmicWeather, setCosmicWeather] = useState<CosmicWeather | null>(null);
  const [synthesis, setSynthesis] = useState<Synthesis | null>(null);
  const [error, setError] = useState<Error | null>(null);
  const [isEnhancingEntities, setIsEnhancingEntities] = useState<boolean>(false);
  const [localSearchTerm, setLocalSearchTerm] = useState<string | null>(null);
  const [activeSection, setActiveSection] = useState<string>(DECODER_SECTIONS[0].id);
  const { isOpen: isNotebookOpen } = useNotebook();

  const handleSectionVisible = useCallback((sectionId: string) => {
    setActiveSection(prev => prev === sectionId ? prev : sectionId);
  }, []);

  const sectionRefs = useMemo(() =>
    DECODER_SECTIONS.reduce((acc, section) => {
      acc[section.id] = React.createRef<HTMLDivElement>();
      return acc;
    }, {} as Record<string, React.RefObject<HTMLDivElement>>),
  []);
  
  useEffect(() => {
    let isMounted = true;
    
    // Non-blocking analysis orchestration
    const analyzeArticle = () => {
      setError(null);
      setBriefing(null);
      setEnrichment(null);
      setEsotericMappings(null);
      setEtymology(null);
      setCosmicData(null);
      setCosmicWeather(null);
      setSynthesis(null);

      // Fire each analytical track independently for "as-they-load" rendering
      
      // 1. Intelligence Briefing & Enrichment Chain
      getIntelligenceBriefing(article.content)
        .then(data => {
            if (!isMounted) return;
            setBriefing(data);
            // Once briefing exists, if initial enrichment failed, we can use these entities
            if (data.entities.length > 0) {
                 getEnrichment(data.entities).then(e => {
                     if (isMounted) setEnrichment(prev => ({ ...prev, ...e }));
                 });
            }
        })
        .catch(err => console.warn("Briefing failed:", err));

      // 2. Direct Enrichment (Parallel)
      getEnrichment(article.content)
        .then(data => {
            if (isMounted) setEnrichment(prev => ({ ...prev, ...data }));
        })
        .catch(err => console.warn("Initial enrichment failed:", err));

      // 3. Esoteric & Symbolic
      getEsotericMappings(article.content, article.date)
        .then(data => {
            if (isMounted) setEsotericMappings(data);
        })
        .catch(err => console.warn("Esoteric failed:", err));

      // 4. Linguistics
      getEtymology(article.content)
        .then(data => {
            if (isMounted) setEtymology(data);
        })
        .catch(err => console.warn("Etymology failed:", err));

      // 5. Cosmic & Narrative Synthesis
      getUnifiedCosmicAnalysis(article.date, article.location, article.content)
        .then(data => {
            if (isMounted) {
                setCosmicData(data.cosmicData);
                setSynthesis(data.synthesis);
                setCosmicWeather(data.cosmicWeather);
            }
        })
        .catch(err => console.warn("Cosmic failed:", err));
    };

    analyzeArticle();
    return () => { isMounted = false; };
  }, [article]);

  const handleEnhanceEntities = async () => {
    if (!article) return;
    setIsEnhancingEntities(true);
    try {
      const enhancedEntities = await getEnhancedEntities(article.content);
      const newEnrichment = await getEnrichment(enhancedEntities);
      setBriefing(prev => prev ? { ...prev, entities: enhancedEntities } : { entities: enhancedEntities, sentiment: { tone: 'Neutral', confidence: 0, justification: '', keyPhrases: [] } });
      setEnrichment(newEnrichment);
    } catch (err) {
      console.error("Enhancement failed:", err);
    } finally {
      setIsEnhancingEntities(false);
    }
  };
  
  const handleLocalSearch = (term: string) => {
    setLocalSearchTerm(term);
    sectionRefs['full-article'].current?.scrollIntoView({ behavior: 'smooth' });
  };

  const clearLocalSearch = () => setLocalSearchTerm(null);

  if (error) {
    return (
      <div className="text-center max-w-lg mx-auto mt-20 p-8 bg-red-900/10 border border-red-500/20 rounded-xl">
        <h2 className="text-xl text-red-400 font-bold mb-2 uppercase">Signal Lost</h2>
        <p className="text-zinc-400 mb-6 font-mono text-xs">{error.message}</p>
        <button onClick={onBack} className="px-6 py-2 bg-zinc-800 text-zinc-200 border border-white/10 rounded hover:bg-zinc-700 font-mono text-xs uppercase tracking-wider">
          Re-establish Link
        </button>
      </div>
    );
  }

  return (
    <>
      <div className={`relative pb-32 transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] ${isNotebookOpen ? 'mr-[350px]' : ''}`}>
        <div className="flex justify-between items-center mb-12 sticky top-4 z-30 px-4 md:px-8 pointer-events-none max-w-[1800px] mx-auto w-full">
          <button onClick={onBack} className="pointer-events-auto group flex items-center gap-3 px-4 py-2 bg-zinc-950/80 backdrop-blur-md border border-white/5 rounded-full hover:border-emerald-500/30 transition-all shadow-lg">
              <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest group-hover:text-white">Abort Analysis</span>
          </button>
        </div>

        <div className="w-full max-w-[1800px] mx-auto px-4 md:px-6 lg:px-8">
              <Section id="full-article" title="Source Material" refProp={sectionRefs['full-article']} onVisible={handleSectionVisible}>
                <Suspense fallback={<LoadingSpinner />}><FullArticleView article={article} briefing={briefing} localSearchTerm={localSearchTerm} onClearSearch={clearLocalSearch} /></Suspense>
              </Section>

              <Section id="intelligence-briefing" title="Intelligence Briefing" refProp={sectionRefs['intelligence-briefing']} onVisible={handleSectionVisible}>
                <Suspense fallback={<LoadingSpinner />}><IntelligenceBriefingSuite briefing={briefing} enrichment={enrichment} articleId={article.id} onSearchEntity={onSearchEntity} onEnhanceEntities={handleEnhanceEntities} isEnhancing={isEnhancingEntities} onLocalSearch={handleLocalSearch} /></Suspense>
              </Section>

              <Section id="entity-enrichment" title="Entity Enrichment" refProp={sectionRefs['entity-enrichment']} onVisible={handleSectionVisible}>
                <Suspense fallback={<LoadingSpinner />}><EnrichmentView briefing={briefing} enrichment={enrichment} onSearchEntity={onSearchEntity} onEnhanceEntities={handleEnhanceEntities} isEnhancing={isEnhancingEntities} onLocalSearch={handleLocalSearch} /></Suspense>
              </Section>

              <Section id="gematria-matrix" title="Gematria Matrix" refProp={sectionRefs['gematria-matrix']} onVisible={handleSectionVisible}>
                <Suspense fallback={<LoadingSpinner />}><GematriaMatrix briefing={briefing} /></Suspense>
              </Section>
              
              <Section id="etymology-analysis" title="Linguistic Forensics" refProp={sectionRefs['etymology-analysis']} onVisible={handleSectionVisible}>
                <Suspense fallback={<LoadingSpinner />}><EtymologyAnalysis etymology={etymology} /></Suspense>
              </Section>

              <Section id="symbolic-analysis" title="Symbolic Analysis" refProp={sectionRefs['symbolic-analysis']} onVisible={handleSectionVisible}>
                <Suspense fallback={<LoadingSpinner />}><SymbolicAnalysis esotericMappings={esotericMappings} /></Suspense>
              </Section>

              <Section id="qliphoth-analysis" title="Qliphoth Analysis" refProp={sectionRefs['qliphoth-analysis']} onVisible={handleSectionVisible}>
                <Suspense fallback={<LoadingSpinner />}><QliphothAnalysis esotericMappings={esotericMappings} /></Suspense>
              </Section>

              <Section id="numerology-chronology" title="Numerology & Chronology" refProp={sectionRefs['numerology-chronology']} onVisible={handleSectionVisible}>
                <Suspense fallback={<LoadingSpinner />}><NumerologyChronology articleId={article.id} briefing={briefing} esotericMappings={esotericMappings} /></Suspense>
              </Section>
              
              <Section id="cosmic-analysis" title="Cosmic Analysis" refProp={sectionRefs['cosmic-analysis']} onVisible={handleSectionVisible}>
                <Suspense fallback={<LoadingSpinner />}><CosmicDashboard cosmicData={cosmicData} cosmicWeather={cosmicWeather} esotericMappings={esotericMappings} articleId={article.id} articleDate={article.date} /></Suspense>
              </Section>

              <Section id="ai-interpretation" title="AI Interpretation" refProp={sectionRefs['ai-interpretation']} onVisible={handleSectionVisible}>
                <Suspense fallback={<LoadingSpinner />}><SynthesisAnalysis synthesis={synthesis} articleId={article.id} /></Suspense>
              </Section>
        </div>
        
        <DecoderCommandBar activeSection={activeSection} onNavigate={(id) => setActiveSection(id)} />
      </div>

      <Suspense fallback={null}>
          <AnalystChat articleContent={article.content} isSidebarOpen={isNotebookOpen} />
          <AnalystNotebook />
      </Suspense>
    </>
  );
};

export const Decoder: React.FC<DecoderProps> = (props) => {
  return (
    <NotebookProvider articleId={props.article.id}>
      <DecoderContent {...props} />
    </NotebookProvider>
  );
};
