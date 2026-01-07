
import React, { useState, useEffect } from 'react';
import { type EnrichmentData, type EsotericMappings, type IntelligenceBriefing } from '../../../types';
import { Card } from '../../shared/Card';
import { LoadingSpinner } from '../../shared/LoadingSpinner';
import { useNotebook } from '../../../contexts/NotebookContext';

interface EnrichmentSymbolismProps {
  enrichment: EnrichmentData | null;
  esotericMappings: EsotericMappings | null;
  onSearchEntity: (entityName: string) => void;
  articleId: string;
  briefing: IntelligenceBriefing | null;
  onEnhanceEntities: () => void;
  isEnhancing: boolean;
  onLocalSearch: (term: string) => void;
}

export const EnrichmentSymbolism: React.FC<EnrichmentSymbolismProps> = ({ 
  enrichment, 
  esotericMappings, 
  onSearchEntity, 
  articleId, 
  briefing, 
  onEnhanceEntities, 
  isEnhancing,
  onLocalSearch 
}) => {
  const [activeSearchMenu, setActiveSearchMenu] = useState<string | null>(null);
  const { addEntry } = useNotebook();

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (activeSearchMenu && !(event.target as HTMLElement).closest('.search-menu-container')) {
        setActiveSearchMenu(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [activeSearchMenu]);

  const enhanceButton = (
    <button
      onClick={onEnhanceEntities}
      disabled={isEnhancing}
      title="Deep Scan"
      className="text-xs bg-zinc-800 text-zinc-300 font-medium py-1 px-2 rounded border border-white/5 hover:bg-emerald-900/30 hover:text-emerald-300 hover:border-emerald-500/30 transition-all"
    >
      {isEnhancing ? <LoadingSpinner small /> : 'Deep Scan'}
    </button>
  );

  const handleAddToNotebook = (type: string, title: string, detail: string) => {
     addEntry({
         type: 'entity',
         title: title,
         content: { name: title, type: type, details: detail },
         tags: [type, 'Symbolism']
     });
  };

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2">
          <Card title="Enrichment Data" headerContent={enhanceButton} className="h-full">
            {!enrichment || !briefing ? (
              <div className="flex justify-center items-center min-h-[200px]"><LoadingSpinner /></div>
            ) : (
              <ul className="space-y-4">
                {Object.entries(enrichment).map(([name, data]) => {
                    const entity = briefing.entities.find(e => e.name === name);
                    const typedData = data as EnrichmentData[string];
                    return (
                    <li key={name} className="pb-4 border-b border-white/5 last:border-0">
                        <div className="flex justify-between items-start gap-4">
                          <div className="flex-1">
                              <div className="flex items-baseline gap-2 mb-1">
                                  <h4 className="font-bold text-zinc-200 text-sm">{name}</h4>
                                  {entity && <span className="text-[10px] uppercase tracking-wider text-zinc-500">{entity.type}</span>}
                              </div>
                              <p className="text-sm text-zinc-400 leading-relaxed">{typedData.summary}</p>
                              <div className="flex gap-3 mt-2">
                                  {typedData.url && (
                                      <a href={typedData.url} target="_blank" rel="noopener noreferrer" className="text-xs text-emerald-400 hover:underline">
                                      Reference Link
                                      </a>
                                  )}
                              </div>
                          </div>
                          <div className="relative search-menu-container">
                              <button 
                                onClick={() => setActiveSearchMenu(name === activeSearchMenu ? null : name)} 
                                className="text-zinc-500 hover:text-zinc-200 transition-colors"
                              >
                                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                                      <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
                                  </svg>
                              </button>
                              {activeSearchMenu === name && (
                                <div className="absolute right-0 top-full mt-2 w-40 bg-zinc-900 border border-zinc-700 rounded-lg shadow-lg z-20">
                                  <button onClick={() => { onLocalSearch(name); setActiveSearchMenu(null); }} className="block w-full text-left px-3 py-2 text-xs text-zinc-300 hover:bg-zinc-800 transition-colors first:rounded-t-lg">
                                    Locate in Text
                                  </button>
                                  <button onClick={() => { onSearchEntity(name); setActiveSearchMenu(null); }} className="block w-full text-left px-3 py-2 text-xs text-zinc-300 hover:bg-zinc-800 transition-colors">
                                    Global Search
                                  </button>
                                   <button onClick={() => { handleAddToNotebook("Enrichment", name, typedData.summary); setActiveSearchMenu(null); }} className="block w-full text-left px-3 py-2 text-xs text-emerald-400 hover:bg-emerald-900/30 transition-colors last:rounded-b-lg">
                                    Add to Notebook
                                  </button>
                                </div>
                              )}
                          </div>
                        </div>
                    </li>
                    );
                })}
              </ul>
            )}
          </Card>
        </div>
        
        <div className="space-y-6">
            <Card title="Symbolic Meaning System">
              {!esotericMappings ? (
                 <div className="flex justify-center items-center min-h-[100px]"><LoadingSpinner /></div>
              ) : (
                 esotericMappings.symbolic && esotericMappings.symbolic.length > 0 ? (
                    <div className="space-y-3">
                       {esotericMappings.symbolic.map((item, i) => (
                          <div key={i} className="bg-emerald-900/10 p-3 rounded-lg border border-emerald-500/20 group relative">
                             <button onClick={() => handleAddToNotebook("Symbol", item.symbol, item.meaning)} className="absolute top-2 right-2 text-zinc-600 hover:text-emerald-400 opacity-0 group-hover:opacity-100">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" viewBox="0 0 20 20" fill="currentColor"><path d="M5 4a2 2 0 012-2h6a2 2 0 012 2v14l-5-2.5L5 18V4z" /></svg>
                             </button>
                             <div className="flex items-center gap-2 mb-1">
                                <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full"></span>
                                <h4 className="font-bold text-emerald-400 text-sm uppercase tracking-wide">{item.symbol}</h4>
                             </div>
                             <p className="text-xs text-zinc-200 font-medium mb-1">{item.meaning}</p>
                             <p className="text-xs text-zinc-500 italic">"{item.context}"</p>
                          </div>
                       ))}
                    </div>
                 ) : (
                    <p className="text-xs text-zinc-500 text-center italic py-4">No major system symbols detected in this text.</p>
                 )
              )}
            </Card>

            <Card title="Tarot Archetypes">
              {!esotericMappings ? (
                <div className="flex justify-center items-center min-h-[100px]"><LoadingSpinner /></div>
              ) : (
                <div className="space-y-4">
                    {esotericMappings.tarot.map(item => (
                        <div key={item.name} className="bg-zinc-800/20 p-3 rounded-lg border border-white/5 group relative">
                             <button onClick={() => handleAddToNotebook("Tarot", item.name, item.meaning)} className="absolute top-2 right-2 text-zinc-600 hover:text-emerald-400 opacity-0 group-hover:opacity-100">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" viewBox="0 0 20 20" fill="currentColor"><path d="M5 4a2 2 0 012-2h6a2 2 0 012 2v14l-5-2.5L5 18V4z" /></svg>
                             </button>
                            <div className="flex justify-between items-center mb-2">
                                <h4 className="font-bold text-zinc-200 text-sm">{item.name}</h4>
                                <span className="text-xs font-mono text-emerald-500 bg-emerald-500/10 px-2 py-0.5 rounded">{item.number}</span>
                            </div>
                            <p className="text-xs text-zinc-400 mb-2">{item.meaning}</p>
                            <p className="text-xs text-zinc-500 italic border-t border-white/5 pt-2 mt-2">
                                Connection: {item.correspondence}
                            </p>
                        </div>
                    ))}
                </div>
              )}
            </Card>
            <Card title="Elemental Correlates">
              {!esotericMappings ? (
                <div className="flex justify-center items-center min-h-[100px]"><LoadingSpinner /></div>
              ) : (
                <div className="space-y-4">
                    {esotericMappings.periodic.map(item => (
                        <div key={item.name} className="bg-zinc-800/20 p-3 rounded-lg border border-white/5 group relative">
                             <button onClick={() => handleAddToNotebook("Element", item.name, item.meaning)} className="absolute top-2 right-2 text-zinc-600 hover:text-emerald-400 opacity-0 group-hover:opacity-100">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" viewBox="0 0 20 20" fill="currentColor"><path d="M5 4a2 2 0 012-2h6a2 2 0 012 2v14l-5-2.5L5 18V4z" /></svg>
                             </button>
                            <div className="flex justify-between items-center mb-2">
                                <h4 className="font-bold text-zinc-200 text-sm">{item.name} ({item.symbol})</h4>
                                <span className="text-xs font-mono text-emerald-500 bg-emerald-500/10 px-2 py-0.5 rounded">No. {item.number}</span>
                            </div>
                            <p className="text-xs text-zinc-400 mb-2">{item.meaning}</p>
                            <p className="text-xs text-zinc-500 italic border-t border-white/5 pt-2 mt-2">
                                Connection: {item.correspondence}
                            </p>
                        </div>
                    ))}
                </div>
              )}
            </Card>
        </div>
      </div>
    </>
  );
};
