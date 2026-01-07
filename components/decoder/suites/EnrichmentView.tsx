
import React, { useState, useEffect } from 'react';
import { type EnrichmentData, type IntelligenceBriefing } from '../../../types';
import { Card } from '../../shared/Card';
import { LoadingSpinner } from '../../shared/LoadingSpinner';
import { useNotebook } from '../../../contexts/NotebookContext';
import { Modal } from '../../shared/Modal';
import { GematriaCard } from './GematriaCard';
import { calculateAllCiphers } from '../../../services/gematriaService';

interface EnrichmentViewProps {
  enrichment: EnrichmentData | null;
  briefing: IntelligenceBriefing | null;
  onSearchEntity: (entityName: string) => void;
  onEnhanceEntities: () => void;
  isEnhancing: boolean;
  onLocalSearch: (term: string) => void;
}

export const EnrichmentView: React.FC<EnrichmentViewProps> = ({ 
  enrichment, 
  briefing,
  onSearchEntity, 
  onEnhanceEntities, 
  isEnhancing,
  onLocalSearch 
}) => {
  const [activeSearchMenu, setActiveSearchMenu] = useState<string | null>(null);
  const [gematriaModalTarget, setGematriaModalTarget] = useState<string | null>(null);
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
      id="enrichment-deep-scan"
      onClick={onEnhanceEntities}
      disabled={isEnhancing}
      title="Deep Scan"
      className="text-xs bg-zinc-800 text-zinc-300 font-medium py-1 px-2 rounded border border-white/5 hover:bg-emerald-900/30 hover:text-emerald-300 hover:border-emerald-500/30 transition-all flex items-center gap-2"
    >
      {isEnhancing ? <><LoadingSpinner small /> Scanning...</> : 'Deep Scan'}
    </button>
  );

  const handleAddToNotebook = (type: string, title: string, detail: string) => {
     addEntry({
         type: 'entity',
         title: title,
         content: { name: title, type: type, details: detail },
         tags: [type, 'Enrichment']
     });
  };

  const getGematriaForModal = () => {
      if (!gematriaModalTarget) return null;
      return calculateAllCiphers(gematriaModalTarget);
  };

  const gematriaResults = getGematriaForModal();

  return (
    <div className="w-full">
      <Card title="Enrichment Data" headerContent={enhanceButton}>
        {!enrichment || Object.keys(enrichment).length === 0 ? (
          <div className="flex flex-col justify-center items-center min-h-[200px] text-zinc-500 italic p-6 text-center border border-dashed border-white/5 rounded-lg bg-zinc-900/20">
              {!briefing && !enrichment ? (
                  <LoadingSpinner />
              ) : (
                  <>
                    <p className="mb-4">No enriched entity data returned from initial scan.</p>
                    <button 
                        onClick={onEnhanceEntities}
                        disabled={isEnhancing}
                        className="px-4 py-2 bg-emerald-900/20 text-emerald-400 border border-emerald-500/30 rounded text-xs font-bold uppercase tracking-wider hover:bg-emerald-900/40 transition-colors"
                    >
                        {isEnhancing ? 'Scanning...' : 'Initialize Deep Scan'}
                    </button>
                  </>
              )}
          </div>
        ) : (
          <div className="max-h-[500px] overflow-y-auto pr-2">
            <ul id="enrichment-list" className="space-y-4">
                {Object.entries(enrichment).map(([name, data]) => {
                    const entity = briefing?.entities?.find(e => e.name === name);
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
                                <div className="absolute right-0 top-full mt-2 w-48 bg-zinc-900 border border-zinc-700 rounded-lg shadow-lg z-20 overflow-hidden">
                                  <button onClick={() => { onLocalSearch(name); setActiveSearchMenu(null); }} className="block w-full text-left px-3 py-2 text-xs text-zinc-300 hover:bg-zinc-800 transition-colors">
                                    Locate in Text
                                  </button>
                                  <button onClick={() => { setGematriaModalTarget(name); setActiveSearchMenu(null); }} className="block w-full text-left px-3 py-2 text-xs text-zinc-300 hover:bg-zinc-800 transition-colors">
                                    Gematria Breakdown
                                  </button>
                                  <button onClick={() => { window.open(`https://www.google.com/search?q=${encodeURIComponent(name)}`, '_blank'); setActiveSearchMenu(null); }} className="block w-full text-left px-3 py-2 text-xs text-zinc-500 hover:bg-zinc-800 hover:text-white transition-colors">
                                    Web Uplink (Google)
                                  </button>
                                   <button onClick={() => { handleAddToNotebook("Enrichment", name, typedData.summary); setActiveSearchMenu(null); }} className="block w-full text-left px-3 py-2 text-xs text-emerald-400 hover:bg-emerald-900/30 transition-colors border-t border-white/5">
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
          </div>
        )}
      </Card>

      {/* Gematria Modal */}
      {gematriaModalTarget && gematriaResults && (
          <Modal
            isOpen={!!gematriaModalTarget}
            onClose={() => setGematriaModalTarget(null)}
            title={`Gematria Profile: ${gematriaModalTarget}`}
          >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pb-4">
                  <GematriaCard text={gematriaModalTarget} cipherName="Ordinal" totalValue={gematriaResults['Ordinal']} themeColor="amber" />
                  <GematriaCard text={gematriaModalTarget} cipherName="Reverse Ordinal" totalValue={gematriaResults['Reverse Ordinal']} themeColor="purple" />
                  <GematriaCard text={gematriaModalTarget} cipherName="Reduction" totalValue={gematriaResults['Reduction']} themeColor="orange" />
                  <GematriaCard text={gematriaModalTarget} cipherName="Sumerian" totalValue={gematriaResults['Sumerian']} themeColor="cyan" />
              </div>
          </Modal>
      )}
    </div>
  );
};
