
import React, { useState, useRef, useEffect } from 'react';
import { type CosmicData, type CosmicWeather, type EsotericMappings } from '../../../types';
import { Card } from '../../shared/Card';
import { LoadingSpinner } from '../../shared/LoadingSpinner';
import { AstroWheel } from './AstroWheel';
import { Modal } from '../../shared/Modal';
import { useNotebook } from '../../../contexts/NotebookContext';

interface CosmicDashboardProps {
  cosmicData: CosmicData | null;
  cosmicWeather: CosmicWeather | null;
  esotericMappings?: EsotericMappings | null;
  articleId: string;
  articleDate: string;
}

// Helper to add days to a date
const addDays = (date: Date, days: number): Date => {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
};

// Helper to format date
const formatDate = (date: Date): string => {
  return date.toISOString().split('T')[0];
};

export const CosmicDashboard: React.FC<CosmicDashboardProps> = ({ cosmicData, cosmicWeather, esotericMappings, articleId, articleDate }) => {
  const [highlightedPlanet, setHighlightedPlanet] = useState<string | null>(null);
  const vedicAnalysisRef = useRef<HTMLDivElement>(null);
  const highlightTimeoutRef = useRef<number | null>(null);
  const [selectedStarInfo, setSelectedStarInfo] = useState<{ star: string; significance: string; } | null>(null);
  const { addEntry } = useNotebook();

  // Predictive State
  const [predictiveDates, setPredictiveDates] = useState<{ label: string; date: string; meaning: string; type: 'number' | 'astro' }[]>([]);

  useEffect(() => {
    return () => {
      if (highlightTimeoutRef.current) {
        clearTimeout(highlightTimeoutRef.current);
      }
    };
  }, []);

  // Calculate predictive dates on mount
  useEffect(() => {
    // Use article date if available, otherwise fallback to today (though articleDate should always be present)
    const baseDate = articleDate ? new Date(articleDate) : new Date();
    
    // Ensure date is valid, if invalid date string, default to now
    const validBaseDate = isNaN(baseDate.getTime()) ? new Date() : baseDate;
    
    const timeline = [
      { days: 33, label: "+33 Days", meaning: "Master Initiation Completion / Masonic Echo", type: 'number' as const },
      { days: 40, label: "+40 Days", meaning: "Biblical Period of Testing / Quarantine", type: 'number' as const },
      { days: 88, label: "+88 Days", meaning: "Mercurial Cycle / Economic Loop", type: 'number' as const },
      { days: 201, label: "+201 Days", meaning: "Jesuit Order Order of Magnitude", type: 'number' as const },
      { days: 322, label: "+322 Days", meaning: "Skull & Bones Cycle Resolution", type: 'number' as const },
    ];

    const projections = timeline.map(t => ({
        ...t,
        date: formatDate(addDays(validBaseDate, t.days))
    }));

    setPredictiveDates(projections);
  }, [articleDate]);

  const handleAddToNotebook = (type: string, content: any) => {
      addEntry({
          type: 'cosmic',
          title: type,
          content: content,
          tags: ['Astrology', 'Cosmic Weather']
      });
  };

  const handlePlanetClick = (planetName: string) => {
    if (highlightTimeoutRef.current) {
      clearTimeout(highlightTimeoutRef.current);
    }
    
    setHighlightedPlanet(planetName);
    vedicAnalysisRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });

    const cardElement = vedicAnalysisRef.current;
    if (cardElement) {
        cardElement.classList.add('ring-2', 'ring-emerald-500', 'shadow-lg', 'shadow-emerald-500/20');
        window.setTimeout(() => {
          cardElement.classList.remove('ring-2', 'ring-emerald-500', 'shadow-lg', 'shadow-emerald-500/20');
        }, 3000);
    }

    highlightTimeoutRef.current = window.setTimeout(() => {
      setHighlightedPlanet(null);
    }, 3000);
  };

  const renderVedicAnalysis = () => {
    if (!cosmicData || !highlightedPlanet) {
      return cosmicData?.vedicAnalysis;
    }
    const parts = cosmicData.vedicAnalysis.split(new RegExp(`(${highlightedPlanet})`, 'gi'));
    return (
      <span>
        {parts.map((part, i) =>
          part.toLowerCase() === highlightedPlanet.toLowerCase() ? (
            <span key={i} className="bg-emerald-500/20 text-emerald-200 rounded px-1 font-medium">
              {part}
            </span>
          ) : (
            part
          )
        )}
      </span>
    );
  };

  return (
    <>
      <div className="flex flex-col gap-8">
        
        {/* Main Celestial Snapshot */}
        <div id="astro-wheel-card">
            <Card title="Celestial Snapshot">
                <div className="aspect-square max-h-[500px] mx-auto py-4">
                    {!cosmicData ? (
                        <div className="flex justify-center items-center h-full"><LoadingSpinner /></div>
                    ) : (
                        <AstroWheel planetaryPositions={cosmicData.planetaryPositions} onPlanetClick={handlePlanetClick} />
                    )}
                </div>
            </Card>
        </div>

        {/* Vertical Stack of Sections */}
        <div id="planetary-data-list">
            <Card title="Planetary Data" className="max-h-[600px] overflow-y-auto">
                {!cosmicData ? (
                    <div className="flex justify-center items-center min-h-[100px]"><LoadingSpinner /></div>
                ) : (
                    <div className="space-y-1">
                        {cosmicData.planetaryPositions.map(p => (
                            <div key={p.planet} className="group p-2 rounded hover:bg-zinc-800/50 transition-colors flex items-center justify-between">
                            <span className="font-medium text-zinc-300 text-sm">{p.planet}</span>
                            <div className="flex items-center gap-2">
                                <span className="text-xs font-mono text-zinc-500">
                                    {p.degrees.toFixed(2)}° {p.sign.substring(0,3)}
                                </span>
                                <button onClick={() => handleAddToNotebook(`${p.planet} Position`, { headline: `${p.planet} in ${p.sign}`, detail: `${p.degrees.toFixed(2)} degrees` })} className="text-zinc-600 hover:text-emerald-400 opacity-0 group-hover:opacity-100">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" viewBox="0 0 20 20" fill="currentColor">
                                        <path d="M5 4a2 2 0 012-2h6a2 2 0 012 2v14l-5-2.5L5 18V4z" />
                                    </svg>
                                </button>
                            </div>
                            </div>
                        ))}
                    </div>
                )}
            </Card>
        </div>

        <Card title="Aspects" className="max-h-[600px] overflow-y-auto">
            {!cosmicData ? (
                <div className="flex justify-center items-center min-h-[100px]"><LoadingSpinner /></div>
            ) : (
                <div className="space-y-4">
                    <div className="p-3 rounded bg-zinc-800/30 border border-white/5">
                        <p className="text-[10px] uppercase tracking-wider text-zinc-500 mb-1">Lunar Phase</p>
                        <p className="font-medium text-zinc-200">{cosmicData.lunarPhase}</p>
                    </div>
                    
                    {cosmicData.majorAspects && cosmicData.majorAspects.length > 0 && (
                        <div>
                        <h4 className="text-xs font-bold text-zinc-500 uppercase tracking-wider mb-2 mt-2">Key Transits</h4>
                        <div className="space-y-2">
                            {cosmicData.majorAspects.map((a, i) => (
                            <div key={i} className="p-2 rounded border border-white/5 bg-zinc-900/30 group">
                                <div className="flex justify-between items-center mb-1">
                                <p className="font-medium text-emerald-400 text-xs">{a.aspect}</p>
                                <div className="flex items-center gap-2">
                                    <p className="text-[10px] text-zinc-600">{a.orb.toFixed(1)}°</p>
                                    <button onClick={() => handleAddToNotebook(`${a.aspect}`, { headline: `${a.planets.join(' - ')}`, detail: `Orb: ${a.orb}` })} className="text-zinc-600 hover:text-emerald-400 opacity-0 group-hover:opacity-100">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" viewBox="0 0 20 20" fill="currentColor">
                                            <path d="M5 4a2 2 0 012-2h6a2 2 0 012 2v14l-5-2.5L5 18V4z" />
                                        </svg>
                                    </button>
                                </div>
                                </div>
                                <p className="text-xs text-zinc-400">{a.planets.join(' • ')}</p>
                            </div>
                            ))}
                        </div>
                        </div>
                    )}

                    {cosmicData.fixedStars && cosmicData.fixedStars.length > 0 && (
                        <div>
                        <h4 className="text-xs font-bold text-zinc-500 uppercase tracking-wider mb-2 mt-4">Star Alignments</h4>
                        <div className="space-y-2">
                            {cosmicData.fixedStars.map((fs, i) => (
                            <div key={i} className="p-2 rounded border border-white/5 bg-zinc-900/30">
                                <div className="flex justify-between items-center mb-1">
                                    <p className="font-medium text-purple-400 text-xs">{fs.conjunction}</p>
                                    {fs.significance && (
                                        <button
                                            onClick={() => setSelectedStarInfo({ star: fs.star, significance: fs.significance })}
                                            className="text-zinc-500 hover:text-zinc-200 transition-colors"
                                        >
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" viewBox="0 0 20 20" fill="currentColor">
                                                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                                            </svg>
                                        </button>
                                    )}
                                </div>
                                <p className="text-xs text-zinc-400">conjunct {fs.star}</p>
                            </div>
                            ))}
                        </div>
                        </div>
                    )}
                </div>
            )}
        </Card>

        <div id="vedic-analysis-card" ref={vedicAnalysisRef} className="transition-all duration-500 rounded-xl">
            <Card title="Vedic Analysis" headerContent={
                cosmicData && <button onClick={() => handleAddToNotebook("Vedic Analysis", { headline: "Vedic Chart", detail: cosmicData.vedicAnalysis })} className="text-zinc-500 hover:text-emerald-400">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor"><path d="M5 4a2 2 0 012-2h6a2 2 0 012 2v14l-5-2.5L5 18V4z" /></svg>
                </button>
            }>
                {!cosmicData ? (
                    <div className="flex justify-center items-center min-h-[100px]"><LoadingSpinner /></div>
                ) : (
                    <p className="text-zinc-300 text-sm leading-loose">{renderVedicAnalysis()}</p>
                )}
            </Card>
        </div>
             
        <Card title="Ritual Cycles & Timing">
            {esotericMappings?.ritualTiming && esotericMappings.ritualTiming.length > 0 ? (
                <div className="space-y-3">
                    {esotericMappings.ritualTiming.map((item, i) => (
                    <div key={i} className="bg-purple-900/10 p-3 rounded-lg border border-purple-500/20 group relative">
                        <button onClick={() => handleAddToNotebook(item.event, { headline: item.significance, detail: item.connection })} className="absolute top-2 right-2 text-zinc-600 hover:text-purple-400 opacity-0 group-hover:opacity-100">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" viewBox="0 0 20 20" fill="currentColor"><path d="M5 4a2 2 0 012-2h6a2 2 0 012 2v14l-5-2.5L5 18V4z" /></svg>
                        </button>
                        <div className="flex items-center gap-2 mb-1">
                            <span className="w-1.5 h-1.5 bg-purple-500 rounded-full animate-pulse"></span>
                            <h4 className="font-bold text-purple-400 text-sm uppercase tracking-wide">{item.event}</h4>
                        </div>
                        <p className="text-xs text-zinc-200 font-medium mb-1">{item.significance}</p>
                        <p className="text-xs text-zinc-500 italic leading-snug">"{item.connection}"</p>
                    </div>
                    ))}
                </div>
            ) : (
                <div className="text-center py-8 text-zinc-600 text-xs italic">
                {!esotericMappings ? <LoadingSpinner small /> : "No significant ritual timing windows detected for this date."}
                </div>
            )}
        </Card>

        <div id="cosmic-weather-card">
            <Card title="Cosmic Weather Report" className="" headerContent={
                    cosmicWeather && <button onClick={() => handleAddToNotebook("Cosmic Weather", { headline: cosmicWeather.outlook, detail: cosmicWeather.metaphor })} className="text-zinc-500 hover:text-emerald-400">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor"><path d="M5 4a2 2 0 012-2h6a2 2 0 012 2v14l-5-2.5L5 18V4z" /></svg>
                    </button>
                }>
                {!cosmicWeather ? (
                <div className="flex justify-center items-center h-full min-h-[100px]"><LoadingSpinner /></div>
                ) : (
                <div className="bg-gradient-to-br from-zinc-900 to-zinc-800/50 p-6 rounded-lg border border-white/5 h-full">
                    <h4 className="text-2xl font-light text-white mb-4 tracking-wide">{cosmicWeather.outlook}</h4>
                    <p className="text-zinc-400 text-sm leading-relaxed">{cosmicWeather.metaphor}</p>
                </div>
                )}
            </Card>
        </div>

        <div id="predictive-calendar">
            <Card title="Predictive Ritual Calendar" className="">
                <div className="space-y-3">
                    <div className="flex justify-between items-center mb-2 px-1">
                        <p className="text-xs text-zinc-500 italic">Projected dates based on Event Origin</p>
                        <span className="text-[10px] text-zinc-600 font-mono">BASE: {articleDate}</span>
                    </div>
                    {predictiveDates.map((pred, idx) => (
                        <div key={idx} className="flex items-center justify-between p-3 bg-zinc-900/40 border border-white/5 rounded hover:bg-zinc-800/40 transition-colors group">
                                <div className="flex items-center gap-3">
                                <span className="text-xs font-mono text-emerald-500 font-bold bg-emerald-900/20 px-2 py-1 rounded border border-emerald-500/20 w-20 text-center">
                                    {pred.label}
                                </span>
                                <div>
                                    <div className="text-xs font-bold text-zinc-200">{pred.meaning}</div>
                                    <div className="text-[10px] text-zinc-500 font-mono">{pred.date}</div>
                                </div>
                                </div>
                                <button onClick={() => handleAddToNotebook(pred.label, { headline: `Projected: ${pred.date}`, detail: pred.meaning })} className="text-zinc-600 hover:text-emerald-400 opacity-0 group-hover:opacity-100 transition-opacity">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" viewBox="0 0 20 20" fill="currentColor"><path d="M5 4a2 2 0 012-2h6a2 2 0 012 2v14l-5-2.5L5 18V4z" /></svg>
                                </button>
                        </div>
                    ))}
                </div>
            </Card>
        </div>
      </div>
        
      {selectedStarInfo && (
        <Modal
            isOpen={!!selectedStarInfo}
            onClose={() => setSelectedStarInfo(null)}
            title={`${selectedStarInfo.star} Significance`}
        >
            <p className="text-zinc-300 text-sm leading-relaxed">
                {selectedStarInfo.significance}
            </p>
        </Modal>
      )}
    </>
  );
};
