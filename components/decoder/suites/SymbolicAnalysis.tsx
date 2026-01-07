
import React from 'react';
import { type EsotericMappings } from '../../../types';
import { Card } from '../../shared/Card';
import { LoadingSpinner } from '../../shared/LoadingSpinner';
import { useNotebook } from '../../../contexts/NotebookContext';

interface SymbolicAnalysisProps {
  esotericMappings: EsotericMappings | null;
}

export const SymbolicAnalysis: React.FC<SymbolicAnalysisProps> = ({ esotericMappings }) => {
  const { addEntry } = useNotebook();

  const handleAddToNotebook = (type: string, title: string, detail: string) => {
     addEntry({
         type: 'entity',
         title: title,
         content: { name: title, type: type, details: detail },
         tags: [type, 'Symbolism']
     });
  };

  return (
    <div className="space-y-8">
        {/* Intro */}
        <div id="symbolic-intro" className="bg-zinc-900/50 border border-white/5 rounded-lg p-4 mb-6">
            <h4 className="text-sm font-bold text-zinc-300 uppercase tracking-widest mb-2">Esoteric Framework Mapping</h4>
            <p className="text-xs text-zinc-500 leading-relaxed">
                This module cross-references extracted entities and themes against three primary symbolic databases: The Universal Symbol Dictionary, The Major Arcana Tarot Archetypes, and Elemental/Alchemical properties. This reveals the hidden metaphysical substrate of the narrative.
            </p>
        </div>

        {/* 1. Universal Symbols */}
        <div id="universal-symbols-card">
            <Card title="Universal Symbols">
                {!esotericMappings ? (
                    <div className="flex justify-center items-center min-h-[150px]"><LoadingSpinner /></div>
                ) : (
                    esotericMappings.symbolic && esotericMappings.symbolic.length > 0 ? (
                        <div className="flex flex-col gap-3">
                            {esotericMappings.symbolic.map((item, i) => (
                                <div key={i} className="flex flex-col md:flex-row gap-4 p-4 bg-zinc-900/40 border border-white/5 rounded-lg hover:border-emerald-500/30 transition-colors group">
                                    {/* Icon/Name */}
                                    <div className="md:w-1/4 flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-full bg-emerald-900/20 border border-emerald-500/20 flex items-center justify-center text-emerald-500 shrink-0">
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                                <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                                                <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
                                            </svg>
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-zinc-200 text-sm">{item.symbol}</h4>
                                            <span className="text-[10px] text-zinc-500 uppercase tracking-wider">Universal</span>
                                        </div>
                                    </div>
                                    
                                    {/* Meaning */}
                                    <div className="md:w-2/4 border-l border-white/5 md:pl-4 flex flex-col justify-center">
                                        <span className="text-[9px] text-zinc-600 uppercase tracking-wider mb-1">Archetypal Meaning</span>
                                        <p className="text-sm text-zinc-300 leading-relaxed">{item.meaning}</p>
                                    </div>

                                    {/* Context */}
                                    <div className="md:w-1/4 border-l border-white/5 md:pl-4 flex flex-col justify-center relative">
                                        <span className="text-[9px] text-zinc-600 uppercase tracking-wider mb-1">Context</span>
                                        <p className="text-xs text-zinc-400 italic">"{item.context}"</p>
                                        
                                        <button 
                                            onClick={() => handleAddToNotebook("Symbol", item.symbol, `${item.meaning} (Context: ${item.context})`)} 
                                            className="absolute top-0 right-0 p-1 text-zinc-600 hover:text-emerald-400 opacity-0 group-hover:opacity-100 transition-opacity"
                                            title="Save to Notebook"
                                        >
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor"><path d="M5 4a2 2 0 012-2h6a2 2 0 012 2v14l-5-2.5L5 18V4z" /></svg>
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-8 text-zinc-500 text-sm italic">No specific universal symbols identified.</div>
                    )
                )}
            </Card>
        </div>

        {/* 2. Tarot Archetypes */}
        <div id="tarot-card">
            <Card title="Tarot Archetypes">
                {!esotericMappings ? (
                    <div className="flex justify-center items-center min-h-[150px]"><LoadingSpinner /></div>
                ) : (
                    esotericMappings.tarot && esotericMappings.tarot.length > 0 ? (
                        <div className="flex flex-col gap-3">
                            {esotericMappings.tarot.map((item, i) => (
                                <div key={i} className="flex flex-col md:flex-row gap-4 p-4 bg-zinc-900/40 border border-white/5 rounded-lg hover:border-purple-500/30 transition-colors group">
                                    <div className="md:w-1/4 flex items-center gap-3">
                                        <div className="w-10 h-10 rounded bg-purple-900/20 border border-purple-500/20 flex items-center justify-center text-purple-400 shrink-0 font-mono font-bold">
                                            {item.number}
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-zinc-200 text-sm">{item.name}</h4>
                                            <span className="text-[10px] text-zinc-500 uppercase tracking-wider">Major Arcana</span>
                                        </div>
                                    </div>
                                    <div className="md:w-2/4 border-l border-white/5 md:pl-4 flex flex-col justify-center">
                                        <span className="text-[9px] text-zinc-600 uppercase tracking-wider mb-1">Esoteric Significance</span>
                                        <p className="text-sm text-zinc-300 leading-relaxed">{item.meaning}</p>
                                    </div>
                                    <div className="md:w-1/4 border-l border-white/5 md:pl-4 flex flex-col justify-center relative">
                                        <span className="text-[9px] text-zinc-600 uppercase tracking-wider mb-1">Correspondence</span>
                                        <p className="text-xs text-zinc-400 italic">{item.correspondence}</p>
                                        <button 
                                            onClick={() => handleAddToNotebook("Tarot", item.name, `${item.meaning} (Corr: ${item.correspondence})`)} 
                                            className="absolute top-0 right-0 p-1 text-zinc-600 hover:text-emerald-400 opacity-0 group-hover:opacity-100 transition-opacity"
                                        >
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor"><path d="M5 4a2 2 0 012-2h6a2 2 0 012 2v14l-5-2.5L5 18V4z" /></svg>
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-8 text-zinc-500 text-sm italic">No major arcana patterns detected.</div>
                    )
                )}
            </Card>
        </div>

        {/* 3. Elemental */}
        <div id="elemental-card">
            <Card title="Elemental Correlates">
                {!esotericMappings ? (
                    <div className="flex justify-center items-center min-h-[150px]"><LoadingSpinner /></div>
                ) : (
                    esotericMappings.periodic && esotericMappings.periodic.length > 0 ? (
                        <div className="flex flex-col gap-3">
                            {esotericMappings.periodic.map((item, i) => (
                                <div key={i} className="flex flex-col md:flex-row gap-4 p-4 bg-zinc-900/40 border border-white/5 rounded-lg hover:border-blue-500/30 transition-colors group">
                                    <div className="md:w-1/4 flex items-center gap-3">
                                        <div className="w-10 h-10 rounded bg-blue-900/20 border border-blue-500/20 flex items-center justify-center text-blue-400 shrink-0 font-bold">
                                            {item.symbol}
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-zinc-200 text-sm">{item.name}</h4>
                                            <span className="text-[10px] text-zinc-500 uppercase tracking-wider">No. {item.number}</span>
                                        </div>
                                    </div>
                                    <div className="md:w-2/4 border-l border-white/5 md:pl-4 flex flex-col justify-center">
                                        <span className="text-[9px] text-zinc-600 uppercase tracking-wider mb-1">Properties</span>
                                        <p className="text-sm text-zinc-300 leading-relaxed">{item.meaning}</p>
                                    </div>
                                    <div className="md:w-1/4 border-l border-white/5 md:pl-4 flex flex-col justify-center relative">
                                        <span className="text-[9px] text-zinc-600 uppercase tracking-wider mb-1">Connection</span>
                                        <p className="text-xs text-zinc-400 italic">{item.correspondence}</p>
                                        <button 
                                            onClick={() => handleAddToNotebook("Element", item.name, `${item.meaning} (Corr: ${item.correspondence})`)} 
                                            className="absolute top-0 right-0 p-1 text-zinc-600 hover:text-emerald-400 opacity-0 group-hover:opacity-100 transition-opacity"
                                        >
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor"><path d="M5 4a2 2 0 012-2h6a2 2 0 012 2v14l-5-2.5L5 18V4z" /></svg>
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-8 text-zinc-500 text-sm italic">No strong elemental or alchemical correlations found.</div>
                    )
                )}
            </Card>
        </div>
    </div>
  );
};
