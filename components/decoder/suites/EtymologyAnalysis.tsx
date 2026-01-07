
import React from 'react';
import { type EtymologyData } from '../../../types';
import { Card } from '../../shared/Card';
import { LoadingSpinner } from '../../shared/LoadingSpinner';
import { useNotebook } from '../../../contexts/NotebookContext';

interface EtymologyAnalysisProps {
  etymology: EtymologyData | null;
}

export const EtymologyAnalysis: React.FC<EtymologyAnalysisProps> = ({ etymology }) => {
  const { addEntry } = useNotebook();

  const handleAddToNotebook = (word: string, root: string, meaning: string, connection: string) => {
    addEntry({
      type: 'etymology',
      title: word,
      content: { root, meaning, connection },
      tags: ['Etymology', 'Linguistics']
    });
  };

  return (
    <div className="w-full">
        <div id="etymology-intro" className="bg-zinc-900/50 border border-white/5 rounded-lg p-4 mb-6">
            <h4 className="text-sm font-bold text-zinc-300 uppercase tracking-widest mb-2">Linguistic Forensics</h4>
            <p className="text-xs text-zinc-500 leading-relaxed">
                Words are spells. This module deconstructs key terms into their etymological roots (Latin, Greek, etc.) to reveal their original, literal meanings and how they are used to shape perception and encode hidden intent.
            </p>
        </div>

        <div id="etymology-grid">
            {!etymology ? (
                <div className="flex justify-center items-center min-h-[200px] border border-dashed border-white/5 rounded-xl">
                    <LoadingSpinner />
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {etymology.items.map((item, i) => (
                        <div key={i} className="group relative bg-[#0e0e10] border border-white/5 rounded-xl p-5 hover:border-amber-500/30 hover:shadow-[0_0_20px_rgba(245,158,11,0.1)] transition-all duration-300 flex flex-col h-full">
                            {/* Header */}
                            <div className="flex justify-between items-start mb-4 border-b border-white/5 pb-3">
                                <div>
                                    <h3 className="text-lg font-bold text-amber-500 font-heading tracking-wide mb-1">{item.word}</h3>
                                    <span className="text-[10px] text-zinc-500 font-mono uppercase tracking-wider">{item.language}</span>
                                </div>
                                <div className="bg-amber-900/10 px-2 py-1 rounded border border-amber-500/10">
                                    <span className="text-xs font-serif italic text-amber-200/80">{item.root}</span>
                                </div>
                            </div>
                            
                            {/* Content */}
                            <div className="flex-1 space-y-4">
                                <div>
                                    <span className="text-[9px] text-zinc-600 uppercase tracking-widest font-bold block mb-1">Literal Meaning</span>
                                    <p className="text-sm text-zinc-300 leading-snug font-serif italic">"{item.originalMeaning}"</p>
                                </div>
                                
                                <div>
                                    <span className="text-[9px] text-zinc-600 uppercase tracking-widest font-bold block mb-1">Analysis</span>
                                    <p className="text-xs text-zinc-400 leading-relaxed border-l-2 border-amber-500/20 pl-3">
                                        {item.modernConnection}
                                    </p>
                                </div>
                            </div>

                            {/* Footer / Action */}
                            <div className="mt-5 pt-3 border-t border-white/5 flex justify-end">
                                <button 
                                    onClick={() => handleAddToNotebook(item.word, item.root, item.originalMeaning, item.modernConnection)}
                                    className="text-zinc-600 hover:text-amber-400 transition-colors flex items-center gap-1.5 text-[10px] uppercase font-bold tracking-wider"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" viewBox="0 0 20 20" fill="currentColor">
                                        <path d="M5 4a2 2 0 012-2h6a2 2 0 012 2v14l-5-2.5L5 18V4z" />
                                    </svg>
                                    Add to Notebook
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    </div>
  );
};
