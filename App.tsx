
import React, { useState, useEffect, Suspense, lazy, memo, useMemo } from 'react';
import ReactDOM from 'react-dom/client';
import { type Article } from './types';
import { LoadingSpinner } from './components/shared/LoadingSpinner';
import { UserManual } from './components/shared/UserManual';
import { OnboardingTour, type TourStep } from './components/shared/OnboardingTour';

// Lazy load heavy components
const NewsFeed = lazy(() => import('./components/news/NewsFeed').then(module => ({ default: module.NewsFeed })));
const Decoder = lazy(() => import('./components/decoder/Decoder').then(module => ({ default: module.Decoder })));

// Optimized Background - Uses radial gradients instead of heavy blur filters for FPS boost
const CosmicBackground = memo(() => {
    return (
        <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden bg-[#020203]">
            {/* Deep Space Gradients - CSS Optimized */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_-20%,#1e1b4b_0%,transparent_60%)] opacity-40"></div>
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_100%_100%,#064e3b_0%,transparent_40%)] opacity-30"></div>
            
            {/* Moving Grid Floor */}
            <div 
                className="absolute inset-0 opacity-20"
                style={{
                    backgroundImage: 'linear-gradient(rgba(16, 185, 129, 0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(16, 185, 129, 0.1) 1px, transparent 1px)',
                    backgroundSize: '50px 50px',
                    transform: 'perspective(500px) rotateX(60deg) translateY(100px) scale(2)',
                    transformOrigin: 'bottom',
                    maskImage: 'linear-gradient(to bottom, transparent 40%, black 100%)'
                }}
            ></div>

            {/* Static Noise (CSS only) */}
            <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.03]"></div>
        </div>
    );
});

const DecoderText: React.FC<{ 
    text: string; 
    className?: string; 
    startDelay?: number;
}> = memo(({ text, className, startDelay = 0 }) => {
  const [displayText, setDisplayText] = useState('');
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789@#&[]{}<>/\\|=+*';
  
  useEffect(() => {
    // Initial scramble
    setDisplayText(Array(text.length).fill(0).map(() => chars[Math.floor(Math.random() * chars.length)]).join(''));
    
    let interval: any;
    const startTimeout = setTimeout(() => {
        let iteration = 0;
        interval = setInterval(() => {
            setDisplayText(prev => 
                text.split("").map((letter, index) => {
                    if (index < iteration) {
                        return text[index];
                    }
                    return chars[Math.floor(Math.random() * chars.length)];
                }).join("")
            );
            
            if (iteration >= text.length) { 
                clearInterval(interval);
                setDisplayText(text); 
            }
            
            iteration += 1/3; 
        }, 30);
    }, startDelay);

    return () => {
        clearTimeout(startTimeout);
        if (interval) clearInterval(interval);
    };
  }, [text, startDelay]);

  return <span className={className}>{displayText}</span>;
});

const LogoDisplay: React.FC = () => {
  const [error, setError] = useState(false);
  const [src, setSrc] = useState('https://image2url.com/images/1766030316827-ed61bc35-a2e9-4237-94fb-796e6c4f4148.png');

  const handleError = () => {
      if (src.startsWith('http')) {
          setSrc('/logo.png');
      } else {
          setError(true);
      }
  };

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center w-full h-full text-zinc-500 bg-zinc-950/80 rounded-full p-4 text-center z-20 relative backdrop-blur-md border border-white/5">
        <div className="w-10 h-10 mb-2 border border-cyan-500/30 rounded-full flex items-center justify-center animate-pulse">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-cyan-500/70" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
        </div>
        <p className="text-[8px] font-mono uppercase tracking-[0.1em] text-cyan-400 font-bold">Logo Mising</p>
      </div>
    );
  }

  return (
    <div className="relative w-full h-full flex items-center justify-center animate-[float-y_6s_ease-in-out_infinite]">
        <div className="relative w-full h-full p-6 overflow-hidden rounded-full">
            <img 
                src={src}
                alt="Decrypted Media Logo" 
                className="relative z-10 w-full h-full object-contain filter drop-shadow-[0_0_10px_rgba(6,182,212,0.2)]" 
                onError={handleError}
            />
            <div className="absolute inset-0 z-20 bg-gradient-to-r from-transparent via-white/10 to-transparent skew-x-[-20deg] animate-[shine_4s_ease-in-out_infinite]"></div>
        </div>
    </div>
  );
};

const App: React.FC = () => {
  const [selectedArticle, setSelectedArticle] = useState<Article | null>(null);
  const [initialSearchTerm, setInitialSearchTerm] = useState<string>('');
  const [isManualOpen, setIsManualOpen] = useState(false);
  
  const [isTourActive, setIsTourActive] = useState(false);
  const [currentTourSteps, setCurrentTourSteps] = useState<TourStep[]>([]);

  // Define Default Tour Steps (Global View)
  const defaultTourSteps: TourStep[] = useMemo(() => {
      return selectedArticle ? [
        { targetId: 'full-article', title: 'Source Transmission', content: 'This is the raw article text you are analyzing. Highlight ANY text with your mouse to instantly see its Gematria values and save it to your notebook.', position: 'right' },
        { targetId: 'intelligence-briefing', title: 'Intelligence Briefing', content: 'An automated entity map. The AI extracts key people, places, and organizations. Click on any node or list item to open a detailed dossier containing research links and profiles.', position: 'bottom' },
        { targetId: 'gematria-matrix', title: 'The Gematria Matrix', content: 'The core decoding engine. Enter custom words, view cipher breakdowns, and connect to the database to find synchronistic matches.', position: 'top' },
        { targetId: 'cosmic-analysis', title: 'Cosmic Dashboard', content: 'Astrological data for the exact time of the event. Discover planetary alignments and predictive dates.', position: 'top' },
        { targetId: 'notebook-toggle', title: 'Analyst Notebook', content: 'Your evidence locker. Every entity, number, or observation you save is stored here. You can edit entries and export a full report when finished.', position: 'left' },
      ] : [
        { targetId: 'mode-toggle', title: 'Select Input Mode', content: 'Choose "Intercept Stream" to browse live global news, or "Manual Uplink" to paste a URL or raw text from an external source for analysis.', position: 'bottom' },
        { targetId: 'search-bar', title: 'Command Search', content: 'Filter the global news database by specific keywords like "Eclipse", "Election", or names of politicians to find relevant intelligence.', position: 'bottom' },
        { targetId: 'filter-bar', title: 'Sector Filters', content: 'Refine the incoming stream by category (Politics, Finance, etc.) or specific date ranges.', position: 'top' },
        { targetId: 'news-grid', title: 'Intelligence Feed', content: 'The live stream of reports. Click "Initiate Analysis" on any card to begin the deep decoding process on that specific event.', position: 'top' },
        { targetId: 'manual-toggle-btn', title: 'Guide & Help', content: 'Access the full Analyst Manual or restart this interactive tour at any time from here.', position: 'left' },
      ];
  }, [selectedArticle]);

  // PRELOAD DECODER: Import it in background after initial render
  useEffect(() => {
    const preloadTimer = setTimeout(() => {
        import('./components/decoder/Decoder');
    }, 1500); 
    return () => clearTimeout(preloadTimer);
  }, []);

  const handleDecodeArticle = (article: Article) => {
    setInitialSearchTerm(''); 
    setSelectedArticle(article);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleBackToFeed = () => {
    setSelectedArticle(null);
    setInitialSearchTerm(''); 
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };
  
  const handleSearchEntity = (term: string) => {
    setInitialSearchTerm(term);
    setSelectedArticle(null); 
  };

  // Trigger a specific tour sequence
  const handleStartTour = (steps?: TourStep[]) => {
      if (steps) {
          setCurrentTourSteps(steps);
      } else {
          setCurrentTourSteps(defaultTourSteps);
      }
      setIsManualOpen(false);
      setIsTourActive(true);
  };

  return (
    <div className="relative min-h-screen text-zinc-200 selection:bg-emerald-500/30 selection:text-emerald-200 font-sans antialiased overflow-x-hidden">
      <CosmicBackground />

      <UserManual 
        isOpen={isManualOpen} 
        onToggle={() => setIsManualOpen(!isManualOpen)} 
        onStartTour={() => handleStartTour()}
      />

      <OnboardingTour 
        isActive={isTourActive} 
        onClose={() => setIsTourActive(false)} 
        steps={currentTourSteps}
      />

      <style>{`
        @keyframes shimmer {
          0% { background-position: 200% center; }
          100% { background-position: -200% center; }
        }
        @keyframes compass-spin {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
        }
        @keyframes compass-spin-reverse {
            from { transform: rotate(360deg); }
            to { transform: rotate(0deg); }
        }
        @keyframes float-y {
            0%, 100% { transform: translateY(0px); }
            50% { transform: translateY(-8px); }
        }
        @keyframes shine {
            0% { transform: translateX(-150%) skewX(-20deg); }
            100% { transform: translateX(150%) skewX(-20deg); }
        }
      `}</style>

      <div className={`relative z-10 p-4 md:p-6 lg:p-8 transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] ${isManualOpen ? 'mr-[350px]' : ''}`}>
        
        {!selectedArticle && (
            <header className="mb-20 flex flex-col items-center gap-10 pt-12 animate-in fade-in slide-in-from-top-4 duration-1000">
            
            <div className="relative group">
                {/* CSS Optimized Glow */}
                <div className="absolute -inset-20 bg-[radial-gradient(circle,rgba(16,185,129,0.2)_0%,transparent_70%)] opacity-40"></div>
                
                <div className="relative w-64 h-64 flex items-center justify-center">
                    <div className="absolute inset-0 rounded-full border border-zinc-800 shadow-[0_0_20px_rgba(0,0,0,0.5)] bg-black/20 backdrop-blur-sm"></div>
                    <div className="absolute top-1 left-1/2 -translate-x-1/2 text-[8px] font-mono text-zinc-600">N</div>
                    <div className="absolute bottom-1 left-1/2 -translate-x-1/2 text-[8px] font-mono text-zinc-600">S</div>
                    <div className="absolute left-1 top-1/2 -translate-y-1/2 text-[8px] font-mono text-zinc-600">W</div>
                    <div className="absolute right-1 top-1/2 -translate-y-1/2 text-[8px] font-mono text-zinc-600">E</div>

                    <svg className="absolute inset-0 w-full h-full animate-[compass-spin_60s_linear_infinite] opacity-60 text-emerald-900/50" viewBox="0 0 100 100">
                        <circle cx="50" cy="50" r="48" fill="none" stroke="currentColor" strokeWidth="0.5" strokeDasharray="2,4" />
                        <path d="M5 2 V5 M50 95 V98 M2 50 H5 M95 50 H98" stroke="currentColor" strokeWidth="1" />
                    </svg>

                    <div className="absolute inset-4 rounded-full border-2 border-emerald-500/10 border-t-emerald-500/40 border-l-transparent border-r-transparent animate-[compass-spin_20s_linear_infinite_reverse]"></div>
                    
                    <div className="absolute inset-8 rounded-full bg-zinc-950/80 border border-white/5 flex items-center justify-center shadow-inner">
                        <LogoDisplay />
                    </div>
                </div>
            </div>

            <div className="relative group cursor-default text-center">
                <h1 className="relative z-10 flex flex-col items-center justify-center">
                    <div className="flex flex-col md:flex-row items-center justify-center gap-2 md:gap-5">
                        <DecoderText 
                            text="DECRYPTED"
                            className="text-4xl md:text-6xl font-black tracking-[0.15em] text-transparent bg-clip-text bg-gradient-to-b from-white via-zinc-200 to-zinc-500 drop-shadow-[0_2px_10px_rgba(255,255,255,0.15)]"
                            startDelay={200}
                        />
                        <div className="hidden md:block w-px h-10 bg-zinc-800 rotate-12 mx-2"></div>
                        <DecoderText 
                            text="MEDIA"
                            className="text-4xl md:text-6xl font-black tracking-[0.15em] text-transparent bg-clip-text bg-gradient-to-b from-white via-zinc-200 to-zinc-500 drop-shadow-[0_2px_10px_rgba(255,255,255,0.15)]"
                            startDelay={800}
                        />
                    </div>

                    <div className="mt-6 relative">
                        <div className="flex items-center gap-4">
                            <div className="h-px w-8 md:w-16 bg-gradient-to-r from-transparent to-emerald-500/50"></div>
                            <DecoderText 
                                text="Discovery of Hidden Reality"
                                className="text-xs md:text-sm font-mono text-emerald-100/90 tracking-[0.3em] uppercase drop-shadow-md"
                                startDelay={1500}
                            />
                            <div className="h-px w-8 md:w-16 bg-gradient-to-l from-transparent to-emerald-500/50"></div>
                        </div>
                    </div>
                </h1>
            </div>
            
            </header>
        )}

        <main className="animate-in fade-in duration-700 min-h-[70vh]">
          <Suspense fallback={
            <div className="flex flex-col items-center justify-center min-h-[50vh]">
                <div className="relative">
                    <LoadingSpinner />
                    <div className="absolute inset-0 animate-ping opacity-20 bg-emerald-500 rounded-full blur-xl"></div>
                </div>
                <p className="mt-6 text-emerald-500/50 text-[10px] uppercase tracking-[0.3em] font-mono animate-pulse">Initializing Neural Interface...</p>
            </div>
          }>
            {selectedArticle ? (
                <Decoder 
                article={selectedArticle} 
                onBack={handleBackToFeed} 
                onSearchEntity={handleSearchEntity}
                onStartTour={handleStartTour} 
                />
            ) : (
                <NewsFeed 
                onDecode={handleDecodeArticle} 
                initialSearchTerm={initialSearchTerm}
                />
            )}
          </Suspense>
        </main>
        
        {!selectedArticle && (
            <footer className="mt-32 text-center py-12 relative pointer-events-none">
                <div className="w-px h-12 bg-gradient-to-b from-zinc-800 to-transparent mx-auto mb-4"></div>
                <p className="text-zinc-700 text-[10px] font-mono">
                    CLASSIFIED INTELLIGENCE SYSTEM // AUTHORIZED EYES ONLY
                </p>
            </footer>
        )}
      </div>
    </div>
  );
};

export default App;
