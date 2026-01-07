
import React from 'react';
import { type EsotericMappings } from '../../../types';
import { Card } from '../../shared/Card';
import { LoadingSpinner } from '../../shared/LoadingSpinner';
import { useNotebook } from '../../../contexts/NotebookContext';

interface QliphothAnalysisProps {
  esotericMappings: EsotericMappings | null;
}

export const QliphothAnalysis: React.FC<QliphothAnalysisProps> = ({ esotericMappings }) => {
  const { addEntry } = useNotebook();

  const handleAddToNotebook = (name: string, title: string, lesson: string) => {
    addEntry({
      type: 'qliphoth',
      title: `${name}: ${title}`,
      content: { name, title, lesson },
      tags: ['Qliphoth', 'Shadow Work']
    });
  };

  return (
    <div className="w-full">
        <div id="qliphoth-header" className="bg-gradient-to-br from-zinc-950 to-red-950/20 border border-red-900/20 rounded-lg p-5 mb-8 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-red-900/5 rounded-full blur-3xl -mr-32 -mt-32 pointer-events-none"></div>
            <h4 className="text-sm font-bold text-red-500 uppercase tracking-widest mb-3 flex items-center gap-2">
                <span className="w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse"></span>
                The Tree of Shadows
            </h4>
            <p className="text-xs text-zinc-400 leading-relaxed max-w-2xl font-serif italic opacity-80">
                "The Qliphoth reveals the hollow shells, the inverted forces moving beneath the surface. These are not demons, but shadow currents—distortions of power, hunger, and concealment that shape the event from the unseen."
            </p>
        </div>

        <div id="qliphoth-grid">
            {!esotericMappings ? (
                <div className="text-center py-20 border border-dashed border-red-900/20 rounded-xl bg-zinc-950">
                    <LoadingSpinner />
                </div>
            ) : (
                <div className="grid grid-cols-1 gap-6">
                    {esotericMappings.qliphoth && esotericMappings.qliphoth.length > 0 ? (
                        esotericMappings.qliphoth.map((item, i) => (
                        <div key={i} className="group relative bg-[#0a0a0c] border border-red-900/10 rounded-xl p-6 hover:border-red-500/30 hover:shadow-[0_0_30px_rgba(220,38,38,0.05)] transition-all duration-500">
                            <div className="flex flex-col md:flex-row gap-6">
                                {/* Left: Identity */}
                                <div className="md:w-1/3 flex flex-col justify-center border-b md:border-b-0 md:border-r border-white/5 pb-4 md:pb-0 md:pr-6">
                                    <span className="text-[10px] text-zinc-600 uppercase tracking-[0.2em] mb-2">Active Sphere</span>
                                    <h3 className="text-2xl font-bold text-zinc-200 font-heading tracking-wide mb-1">{item.name}</h3>
                                    <div className="h-px w-12 bg-red-500/50 mb-2"></div>
                                    <p className="text-sm text-red-400 font-serif italic">{item.title}</p>
                                </div>
                                
                                {/* Right: Analysis */}
                                <div className="md:w-2/3 space-y-5">
                                    <div>
                                        <span className="text-[9px] text-zinc-600 uppercase tracking-widest font-bold block mb-2">Manifestation Pattern</span>
                                        <p className="text-sm text-zinc-300 leading-relaxed">
                                            {item.description}
                                        </p>
                                    </div>
                                    
                                    <div className="pt-4 border-t border-white/5">
                                        <span className="text-[9px] text-zinc-600 uppercase tracking-widest font-bold block mb-2">The Warning / Lesson</span>
                                        <div className="flex items-start gap-3">
                                            <div className="mt-1 text-red-500">
                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                                                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                                                </svg>
                                            </div>
                                            <p className="text-xs text-zinc-400 font-medium italic leading-relaxed">
                                                "{item.lesson}"
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Action */}
                            <button 
                                onClick={() => handleAddToNotebook(item.name, item.title, item.lesson)}
                                className="absolute top-4 right-4 text-zinc-700 hover:text-red-400 transition-colors opacity-0 group-hover:opacity-100"
                                title="Add Shadow Note"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                    <path d="M5 4a2 2 0 012-2h6a2 2 0 012 2v14l-5-2.5L5 18V4z" />
                                </svg>
                            </button>
                        </div>
                    ))) : (
                        <div className="text-center py-12 border border-dashed border-zinc-800 rounded-xl bg-zinc-900/20">
                            <p className="text-zinc-500 text-sm italic">No specific Qliphothic currents detected in this analysis.</p>
                        </div>
                    )}
                </div>
            )}
        </div>
    </div>
  );
};
