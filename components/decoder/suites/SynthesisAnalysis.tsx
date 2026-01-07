
import React, { useState, useEffect, useRef } from 'react';
import { Card } from '../../shared/Card';
import { type Synthesis } from '../../../types';
import { LoadingSpinner } from '../../shared/LoadingSpinner';
import { useNotebook } from '../../../contexts/NotebookContext';

interface SynthesisAnalysisProps {
  synthesis: Synthesis | null;
  articleId: string;
}

const NARRATIVE_STAGES = [
  'Signal',
  'Trigger',
  'Amplification',
  'Ritual Window',
  'Sacrifice / Exchange',
  'Rebirth / Reset'
];

export const SynthesisAnalysis: React.FC<SynthesisAnalysisProps> = ({ synthesis, articleId }) => {
  const { addEntry } = useNotebook();
  const [isPlaying, setIsPlaying] = useState(false);
  const [speechRate, setSpeechRate] = useState(1);
  const synthRef = useRef<SpeechSynthesis | null>(null);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);
  
  // Visualizer Refs
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationFrameRef = useRef<number | null>(null);

  useEffect(() => {
    synthRef.current = window.speechSynthesis;
    return () => {
      if (synthRef.current) {
        synthRef.current.cancel();
      }
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, []);

  // Visualizer Loop
  const startVisualizer = () => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      // Ensure canvas size matches display size for sharpness
      const dpr = window.devicePixelRatio || 1;
      const rect = canvas.getBoundingClientRect();
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      ctx.scale(dpr, dpr);

      const bars = 50;
      const barWidth = rect.width / bars;
      
      const animate = () => {
          ctx.clearRect(0, 0, rect.width, rect.height);
          
          // Create gradient
          const gradient = ctx.createLinearGradient(0, rect.height, 0, 0);
          gradient.addColorStop(0, 'rgba(16, 185, 129, 0.9)'); // Emerald 500
          gradient.addColorStop(0.5, 'rgba(52, 211, 153, 0.6)'); // Emerald 400
          gradient.addColorStop(1, 'rgba(110, 231, 183, 0.1)'); // Emerald 300
          
          ctx.fillStyle = gradient;

          for (let i = 0; i < bars; i++) {
              // Simulate frequency data since SpeechSynthesis doesn't provide real-time frequency data easily
              // Use random noise smoothed slightly or just random for "hacker" effect
              // Mirror from center for cool look
              const distanceFromCenter = Math.abs((i - bars / 2) / (bars / 2));
              const baseHeight = Math.random() * (rect.height * 0.8);
              const height = baseHeight * (1 - distanceFromCenter * 0.5); // Taper at edges
              
              const x = i * barWidth;
              
              // Draw rounded rects roughly
              const y = rect.height - height;
              ctx.fillRect(x, y, barWidth - 2, height);
          }
          
          animationFrameRef.current = requestAnimationFrame(animate);
      };
      
      animate();
  };

  const stopVisualizer = () => {
      if (animationFrameRef.current) {
          cancelAnimationFrame(animationFrameRef.current);
          animationFrameRef.current = null;
      }
      // Clear canvas
      const canvas = canvasRef.current;
      if (canvas) {
          const ctx = canvas.getContext('2d');
          ctx?.clearRect(0, 0, canvas.width, canvas.height);
      }
  };

  const handlePlaySummary = () => {
    if (!synthesis || !synthRef.current) return;

    if (isPlaying) {
      synthRef.current.cancel();
      setIsPlaying(false);
      stopVisualizer();
      return;
    }

    const textToRead = `Intelligence Briefing Synthesis. Current Narrative Stage: ${synthesis.hiddenNarrative.stage}. Analysis follows. ${synthesis.narrative}`;
    
    const utterance = new SpeechSynthesisUtterance(textToRead);
    utterance.rate = speechRate;
    utterance.pitch = 0.9; 
    
    const voices = synthRef.current.getVoices();
    const preferredVoice = voices.find(v => v.name.includes('Google US English') || v.name.includes('Samantha')) || voices[0];
    if (preferredVoice) utterance.voice = preferredVoice;

    utterance.onstart = () => {
        setIsPlaying(true);
        startVisualizer();
    };

    utterance.onend = () => {
        setIsPlaying(false);
        stopVisualizer();
    };
    
    utterance.onerror = () => {
        setIsPlaying(false);
        stopVisualizer();
    };

    utteranceRef.current = utterance;
    synthRef.current.speak(utterance);
  };

  const getCurrentStageIndex = (currentStageName: string | undefined) => {
    if (!currentStageName) return -1;
    const normalizedCurrent = currentStageName.toLowerCase();
    return NARRATIVE_STAGES.findIndex(stage => {
        if (stage.includes('/')) {
            const parts = stage.toLowerCase().split('/').map(s => s.trim());
            return parts.some(p => normalizedCurrent.includes(p));
        }
        return normalizedCurrent.includes(stage.toLowerCase());
    });
  };

  const activeStageIndex = synthesis?.hiddenNarrative ? getCurrentStageIndex(synthesis.hiddenNarrative.stage) : -1;
  const nextStageIndex = activeStageIndex !== -1 && activeStageIndex < NARRATIVE_STAGES.length - 1 ? activeStageIndex + 1 : -1;

  const handleAddToNotebook = (type: string, content: any) => {
     addEntry({
         type: 'narrative',
         title: type,
         content: content,
         tags: ['Narrative', 'Synthesis']
     });
  };

  return (
    <div className="space-y-6">
      <Card title="Hidden Narrative Cycle" headerContent={
          <div id="audio-briefing-controls" className="flex gap-2">
             {synthesis && (
                 <button 
                    onClick={handlePlaySummary}
                    className={`flex items-center gap-2 px-3 py-1.5 rounded text-xs font-bold transition-all ${
                        isPlaying 
                        ? 'bg-emerald-500 text-zinc-900 animate-pulse' 
                        : 'bg-zinc-800 text-emerald-500 border border-emerald-500/20 hover:bg-emerald-900/20'
                    }`}
                 >
                    {isPlaying ? (
                        <>
                            <span className="flex gap-0.5 h-3 items-end">
                                <span className="w-0.5 h-full bg-zinc-900 animate-[pulse_0.5s_ease-in-out_infinite]"></span>
                                <span className="w-0.5 h-2/3 bg-zinc-900 animate-[pulse_0.7s_ease-in-out_infinite]"></span>
                                <span className="w-0.5 h-1/2 bg-zinc-900 animate-[pulse_0.4s_ease-in-out_infinite]"></span>
                            </span>
                            STOP BRIEFING
                        </>
                    ) : (
                        <>
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M9.383 3.076A1 1 0 0110 4v12a1 1 0 01-1.707.707L4.586 13H2a1 1 0 01-1-1V8a1 1 0 011-1h2.586l3.707-3.707a1 1 0 011.09-.217zM14.657 2.929a1 1 0 011.414 0A9.972 9.972 0 0119 10a9.972 9.972 0 01-2.929 7.071 1 1 0 01-1.414-1.414A7.971 7.971 0 0017 10c0-2.21-.894-4.208-2.343-5.657a1 1 0 010-1.414zm-2.829 2.828a1 1 0 011.415 0A5.983 5.983 0 0115 10a5.984 5.984 0 01-1.757 4.243 1 1 0 01-1.415-1.415A3.984 3.984 0 0013 10a3.983 3.983 0 00-1.172-2.828 1 1 0 010-1.414z" clipRule="evenodd" />
                            </svg>
                            PLAY AUDIO BRIEFING
                        </>
                    )}
                 </button>
             )}
             {synthesis && (
                <button onClick={() => handleAddToNotebook("Full Narrative Synthesis", { headline: "Deep Analysis", detail: synthesis.narrative.substring(0, 150) + "..." })} className="text-zinc-500 hover:text-emerald-400 px-2">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor"><path d="M5 4a2 2 0 012-2h6a2 2 0 012 2v14l-5-2.5L5 18V4z" /></svg>
                </button>
             )}
             {synthesis?.hiddenNarrative && <button onClick={() => handleAddToNotebook(`Stage: ${synthesis.hiddenNarrative.stage}`, { headline: "Narrative Stage", detail: synthesis.hiddenNarrative.analysis })} className="text-zinc-500 hover:text-emerald-400 ml-2">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor"><path d="M5 4a2 2 0 012-2h6a2 2 0 012 2v14l-5-2.5L5 18V4z" /></svg>
              </button>
             }
          </div>
      }>
        {/* ID placed on wrapper so it exists during loading */}
        <div id="narrative-cycle-visual">
            {!synthesis ? (
            <div className="flex justify-center items-center min-h-[150px]">
                <LoadingSpinner />
            </div>
            ) : (
            <div className="space-y-10 max-h-[600px] overflow-y-auto pr-2">
                {/* Visual Stepper */}
                <div className="relative py-8 px-4 mt-2 mb-6">
                    <div className="absolute top-1/2 left-0 w-full h-0.5 bg-zinc-800 -translate-y-1/2 z-0 rounded-full"></div>
                    
                    <div 
                        className="absolute top-1/2 left-0 h-0.5 bg-emerald-500 -translate-y-1/2 z-0 transition-all duration-1000 shadow-[0_0_10px_rgba(16,185,129,0.5)]" 
                        style={{ width: `${(activeStageIndex / (NARRATIVE_STAGES.length - 1)) * 100}%` }}
                    ></div>

                    {nextStageIndex !== -1 && (
                        <div 
                            className="absolute top-1/2 h-0.5 border-t-2 border-dashed border-zinc-600 -translate-y-1/2 z-0" 
                            style={{ 
                                left: `${(activeStageIndex / (NARRATIVE_STAGES.length - 1)) * 100}%`,
                                width: `${(1 / (NARRATIVE_STAGES.length - 1)) * 100}%` 
                            }}
                        ></div>
                    )}
                    
                    <div className="relative z-10 flex justify-between w-full">
                        {NARRATIVE_STAGES.map((stage, index) => {
                            const isActive = index === activeStageIndex;
                            const isPast = index < activeStageIndex;
                            const isNext = index === nextStageIndex;
                            
                            return (
                                <div key={stage} className="flex flex-col items-center group relative">
                                    {isActive && (
                                        <span className="absolute -top-10 bg-emerald-500 text-zinc-900 text-[10px] font-bold px-2 py-0.5 rounded shadow-[0_0_10px_rgba(16,185,129,0.4)] animate-bounce">
                                            ACTIVE
                                        </span>
                                    )}
                                    {isNext && (
                                        <span className="absolute -top-10 bg-zinc-800 text-zinc-400 text-[10px] font-medium px-2 py-0.5 rounded border border-white/10">
                                            NEXT
                                        </span>
                                    )}

                                    <div 
                                        className={`rounded-full flex items-center justify-center transition-all duration-500 z-10 ${
                                            isActive 
                                                ? 'w-8 h-8 bg-zinc-950 border-2 border-emerald-400 shadow-[0_0_20px_rgba(16,185,129,0.6)] ring-4 ring-emerald-900/20 scale-110' 
                                                : isPast 
                                                    ? 'w-4 h-4 bg-emerald-900 border-2 border-emerald-700' 
                                                    : isNext
                                                        ? 'w-6 h-6 bg-zinc-900 border-2 border-dashed border-zinc-500 hover:border-zinc-400'
                                                        : 'w-3 h-3 bg-zinc-950 border border-zinc-800'
                                        }`}
                                    >
                                        {isActive && <div className="w-2.5 h-2.5 bg-emerald-400 rounded-full animate-pulse shadow-[0_0_8px_#10b981]" />}
                                        {isPast && <svg className="w-2.5 h-2.5 text-emerald-500/70" fill="currentColor" viewBox="0 0 20 20"><path d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"/></svg>}
                                        {isNext && <div className="w-1.5 h-1.5 bg-zinc-600 rounded-full" />}
                                    </div>

                                    <span className={`text-[10px] uppercase tracking-widest text-center max-w-[80px] leading-tight transition-colors absolute top-10 ${
                                        isActive 
                                            ? 'text-emerald-400 font-bold scale-110 mt-1' 
                                            : isNext 
                                                ? 'text-zinc-300 font-medium mt-1' 
                                                : isPast 
                                                    ? 'text-emerald-800/60 font-medium' 
                                                    : 'text-zinc-700'
                                    }`}>
                                        {stage.split(' / ')[0]}
                                    </span>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {synthesis.hiddenNarrative ? (
                    <div className="space-y-6">
                        <div className="bg-zinc-900/40 border border-emerald-500/30 rounded-xl p-6 relative overflow-hidden shadow-lg shadow-emerald-900/10 group">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 rounded-full -mr-16 -mt-16 blur-2xl group-hover:bg-emerald-500/10 transition-colors duration-500"></div>
                            <div className="relative z-10">
                                <div className="flex items-center gap-3 mb-4">
                                    <span className="relative flex h-3 w-3">
                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                                    <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
                                    </span>
                                    <h4 className="text-sm font-bold text-emerald-400 uppercase tracking-widest">
                                        Current Phase: {synthesis.hiddenNarrative.stage}
                                    </h4>
                                </div>
                                <p className="text-zinc-200 text-sm leading-loose border-l-2 border-emerald-500/30 pl-4">
                                    {synthesis.hiddenNarrative.analysis}
                                </p>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="text-center py-4 text-zinc-500 text-sm italic">
                        Unable to determine current narrative stage.
                    </div>
                )}
            </div>
            )}
        </div>
      </Card>

      <Card title="Next Prediction" className="overflow-hidden">
        <div id="prediction-card">
            {!synthesis ? (
                <div className="flex justify-center items-center min-h-[150px]">
                    <LoadingSpinner />
                </div>
            ) : (
                <div className="relative">
                    {/* Decor */}
                    <div className="absolute top-0 right-0 w-full h-full bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-5 pointer-events-none"></div>
                    
                    <div className="flex flex-col md:flex-row gap-6">
                        {/* Stage Indicator */}
                        <div className="md:w-1/3 bg-zinc-900/50 rounded-xl p-6 border border-white/5 flex flex-col justify-center items-center text-center relative overflow-hidden group">
                            <div className="absolute inset-0 bg-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                            
                            <span className="text-[9px] text-zinc-500 uppercase tracking-[0.2em] mb-3">Target Phase</span>
                            
                            <div className="w-16 h-16 rounded-full bg-zinc-950 border border-purple-500/30 flex items-center justify-center mb-3 shadow-[0_0_15px_rgba(168,85,247,0.15)] relative z-10">
                                <span className="text-2xl font-bold text-purple-400">{nextStageIndex !== -1 ? nextStageIndex + 1 : 'X'}</span>
                            </div>
                            
                            <h3 className="text-lg font-bold text-zinc-200 uppercase tracking-wider font-heading relative z-10">
                                {nextStageIndex !== -1 ? NARRATIVE_STAGES[nextStageIndex].split('/')[0] : 'Endgame'}
                            </h3>
                        </div>

                        {/* Prediction Content */}
                        <div className="md:w-2/3 bg-zinc-900/30 rounded-xl p-6 border border-purple-500/20 relative">
                            <div className="flex items-center gap-2 mb-3">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-purple-500 animate-pulse" viewBox="0 0 20 20" fill="currentColor">
                                    <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                                    <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
                                </svg>
                                <span className="text-xs font-bold text-purple-400 uppercase tracking-widest">Forecasted Indicators</span>
                            </div>
                            <p className="text-sm text-zinc-300 leading-relaxed font-mono whitespace-pre-wrap">
                                {synthesis.hiddenNarrative?.prediction || "No prediction data available."}
                            </p>
                            
                            <div className="mt-4 pt-4 border-t border-white/5 flex justify-end">
                                <button 
                                    onClick={() => handleAddToNotebook("Prediction", { headline: `Forecast: ${nextStageIndex !== -1 ? NARRATIVE_STAGES[nextStageIndex] : 'Future'}`, detail: synthesis.hiddenNarrative?.prediction })}
                                    className="text-[10px] text-zinc-500 hover:text-purple-400 flex items-center gap-1 uppercase tracking-wider transition-colors"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" viewBox="0 0 20 20" fill="currentColor"><path d="M5 4a2 2 0 012-2h6a2 2 0 012 2v14l-5-2.5L5 18V4z" /></svg>
                                    Save to Notebook
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
      </Card>

      <Card title="Archetypal Narrative Patterns">
        <div id="archetypes-grid">
            {!synthesis ? (
            <div className="flex justify-center items-center min-h-[150px]">
                <LoadingSpinner />
            </div>
            ) : (
            <div className="max-h-[500px] overflow-y-auto pr-2">
            {synthesis.archetypes && synthesis.archetypes.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {synthesis.archetypes.map((arch, index) => (
                    <div key={index} className="bg-amber-900/10 border border-amber-500/20 rounded-lg p-4 flex flex-col relative overflow-hidden group">
                        <button onClick={() => handleAddToNotebook(arch.name, { headline: arch.role, detail: arch.activation })} className="absolute top-2 right-2 text-zinc-600 hover:text-amber-400 opacity-0 group-hover:opacity-100 z-20">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" viewBox="0 0 20 20" fill="currentColor"><path d="M5 4a2 2 0 012-2h6a2 2 0 012 2v14l-5-2.5L5 18V4z" /></svg>
                        </button>
                        <div className="absolute top-0 right-0 w-16 h-16 bg-amber-500/5 rounded-bl-full -mr-4 -mt-4"></div>
                        
                        <div className="flex items-center gap-2 mb-3 relative z-10 border-b border-amber-500/10 pb-2">
                            <span className="text-amber-400">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-6-3a2 2 0 11-4 0 2 2 0 014 0zm-2 4a5 5 0 00-4.546 2.916A5.986 5.986 0 0010 16a5.986 5.986 0 004.546-2.084A5 5 0 0010 11z" clipRule="evenodd" />
                            </svg>
                            </span>
                            <h4 className="font-bold text-amber-400 text-sm uppercase tracking-widest">{arch.name}</h4>
                        </div>

                        <div className="pl-7 relative z-10 mb-2">
                            <span className="text-[10px] text-zinc-500 uppercase tracking-wider block mb-0.5">Manifesting Entity/Role</span>
                            <p className="text-zinc-200 text-sm font-semibold">{arch.role}</p>
                        </div>
                        
                        <div className="pl-7 relative z-10 mt-2 pt-2 border-t border-white/5">
                            <span className="text-[10px] text-zinc-500 uppercase tracking-wider block mb-0.5">Pattern Activation</span>
                            <p className="text-zinc-400 text-xs italic leading-relaxed">
                                "{arch.activation}"
                            </p>
                        </div>
                    </div>
                    ))}
                </div>
            ) : (
                <div className="text-center py-8 text-zinc-500 italic">
                No strong archetypal patterns detected in this narrative.
                </div>
            )}
            </div>
            )}
        </div>
      </Card>

      <Card 
        title="Pattern Synthesis" 
        headerContent={
          <div className="flex gap-2">
             {synthesis && (
                <button onClick={() => handleAddToNotebook("Full Narrative Synthesis", { headline: "Deep Analysis", detail: synthesis.narrative.substring(0, 150) + "..." })} className="text-zinc-500 hover:text-emerald-400 px-2">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor"><path d="M5 4a2 2 0 012-2h6a2 2 0 012 2v14l-5-2.5L5 18V4z" /></svg>
                </button>
             )}
          </div>
      }>
        {!synthesis ? (
          <div className="flex justify-center items-center min-h-[200px]">
            <LoadingSpinner />
          </div>
        ) : (
          <div>
            <div className="prose prose-invert max-w-none max-h-[300px] overflow-y-auto pr-2 mb-4">
                <p className="text-zinc-300 leading-loose text-lg font-light">
                {synthesis.narrative}
                </p>
            </div>
            
            {/* Audio Visualizer Canvas Container */}
            <div className={`relative h-24 w-full rounded border border-emerald-500/20 bg-black/40 overflow-hidden transition-all duration-500 ${isPlaying ? 'opacity-100 shadow-[0_0_15px_rgba(16,185,129,0.1)]' : 'opacity-30 grayscale'}`}>
                <canvas 
                    ref={canvasRef} 
                    className="w-full h-full"
                />
                {!isPlaying && (
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                        <div className="flex flex-col items-center">
                            <span className="text-[10px] text-zinc-600 font-mono tracking-widest uppercase mb-1">Visualizer Offline</span>
                            <div className="h-px w-24 bg-zinc-800"></div>
                        </div>
                    </div>
                )}
                <div className="absolute bottom-1 right-2 text-[8px] font-mono text-emerald-500/50">FREQ.MOD.V2</div>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
};
