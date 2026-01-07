
import React, { useState, useMemo, useEffect } from 'react';
import { Card } from '../../shared/Card';
import { calculateAllCiphers, getCipherKeys } from '../../../services/gematriaService';
import { loadMatchDatabase, findMatchesInDatabase, hasDatabaseMatches, type MatchResult } from '../../../services/matchService';
import { analyzeNumberMath } from '../../../services/numberLogicService';
import { type GematriaResult, type IntelligenceBriefing } from '../../../types';
import { LoadingSpinner } from '../../shared/LoadingSpinner';
import { Modal } from '../../shared/Modal';
import { useNotebook } from '../../../contexts/NotebookContext';
import { GematriaCard } from './GematriaCard';

interface GematriaMatrixProps {
  briefing: IntelligenceBriefing | null;
}

const cipherAbbreviations: { [key: string]: string } = {
  'Ordinal': 'Ordinal',
  'Reverse Ordinal': 'Rev Ord',
  'Reduction': 'Pyth/Red',
  'Reverse Reduction': 'Rev Red',
  'Satanic': 'Satanic',
  'Chaldean': 'Chaldean',
  'Septenary': 'Sept',
  'Sumerian': 'Sumr',
  'Latin': 'Latin',
  'Fibonacci': 'Fibo',
  'Primes': 'Prime',
  'Pi': 'Pi',
  'Three Six Nine': '3-6-9',
  'Keypad': 'Keypad',
  'English Kabbalah': 'Eng Kab',
  'Trigrammaton': 'Trigram',
  'Trigonal': 'Trigon',
  'Standard': 'Std',
  'Squares': 'Square',
};

const CIPHER_THEMES: { [key: string]: string } = {
  'Chaldean': 'emerald',
  'Septenary': 'blue',
  'Ordinal': 'amber',
  'Reduction': 'orange',
  'Sumerian': 'cyan',
  'Latin': 'amber',
  'Reverse Ordinal': 'purple',
  'Reverse Reduction': 'indigo',
  'Fibonacci': 'lime',
  'Primes': 'sky',
  'Pi': 'fuchsia',
  'Three Six Nine': 'violet',
  'Keypad': 'zinc',
  'Satanic': 'rose',
  'English Kabbalah': 'emerald',
  'Trigrammaton': 'zinc',
  'Trigonal': 'amber',
  'Standard': 'cyan',
  'Squares': 'emerald',
};

const STORAGE_KEY_CIPHERS = 'esoteric-decoder-visible-ciphers';
const DEFAULT_CIPHERS = ['Chaldean', 'Reduction', 'Ordinal', 'Reverse Ordinal'];

interface EditableEntity {
  id: string;
  text: string;
  source: 'extracted' | 'manual';
}

type ViewMode = 'table' | 'cards';

export const GematriaMatrix: React.FC<GematriaMatrixProps> = ({ briefing }) => {
  const [entities, setEntities] = useState<EditableEntity[]>([]);
  const [calculations, setCalculations] = useState<{ [id: string]: GematriaResult }>({});
  
  const [isCustomizeModalOpen, setIsCustomizeModalOpen] = useState(false);
  const [visibleCiphers, setVisibleCiphers] = useState<string[]>([]);
  const [viewMode, setViewMode] = useState<ViewMode>('table');

  // Quick Calculator State
  const [quickInput, setQuickInput] = useState('');
  const [quickResults, setQuickResults] = useState<GematriaResult | null>(null);

  // Database Match State
  const [dbStatus, setDbStatus] = useState<{ loaded: boolean; loading: boolean; progress: number; count: number }>({
    loaded: false, loading: false, progress: 0, count: 0
  });
  
  // matchModalData now includes optional 'origin' to know which word generated the number
  const [matchModalData, setMatchModalData] = useState<{ 
      number: number; 
      matches: MatchResult[];
      origin?: { text: string; cipher: string };
  } | null>(null);
  
  const { addEntry } = useNotebook();

  const allCipherKeys = useMemo(() => getCipherKeys(), []);

  // Initialize entities from briefing
  useEffect(() => {
    if (briefing?.entities && entities.length === 0) {
      const initial = briefing.entities.map((e, i) => ({
        id: `extracted-${i}`,
        text: e.name,
        source: 'extracted' as const
      }));
      setEntities(initial);
    }
  }, [briefing]);

  // Calculate on entity change
  useEffect(() => {
    const newCalcs: { [id: string]: GematriaResult } = {};
    entities.forEach(ent => {
      if (ent.text.trim()) {
        newCalcs[ent.id] = calculateAllCiphers(ent.text);
      }
    });
    setCalculations(newCalcs);
  }, [entities]);

  // Calculate Quick Input
  useEffect(() => {
    if (quickInput.trim()) {
        setQuickResults(calculateAllCiphers(quickInput));
    } else {
        setQuickResults(null);
    }
  }, [quickInput]);

  // Load/Save Preferences
  useEffect(() => {
    try {
        const savedCiphersJSON = localStorage.getItem(STORAGE_KEY_CIPHERS);
        if (savedCiphersJSON) {
            const savedCiphers = JSON.parse(savedCiphersJSON);
            const validCiphers = savedCiphers.filter((c: string) => allCipherKeys.includes(c));
            if (validCiphers.length > 0) {
                 setVisibleCiphers(validCiphers);
            } else {
                 setVisibleCiphers(DEFAULT_CIPHERS);
            }
        } else {
            setVisibleCiphers(DEFAULT_CIPHERS);
        }
    } catch (error) {
        console.error("Failed to load cipher preferences:", error);
        setVisibleCiphers(DEFAULT_CIPHERS);
    }
  }, [allCipherKeys]);

  useEffect(() => {
    if (visibleCiphers.length > 0) {
        localStorage.setItem(STORAGE_KEY_CIPHERS, JSON.stringify(visibleCiphers));
    }
  }, [visibleCiphers]);

  // Handlers
  const handleEntityChange = (id: string, newText: string) => {
    setEntities(prev => prev.map(e => e.id === id ? { ...e, text: newText } : e));
  };

  const handleAddEntity = () => {
    const newId = `manual-${Date.now()}`;
    setEntities(prev => [{ id: newId, text: '', source: 'manual' }, ...prev]);
  };

  const handleAddQuickToMatrix = () => {
      if (!quickInput.trim()) return;
      const newId = `manual-${Date.now()}`;
      setEntities(prev => [{ id: newId, text: quickInput, source: 'manual' }, ...prev]);
      setQuickInput('');
  };

  const handleRemoveEntity = (id: string) => {
    setEntities(prev => prev.filter(e => e.id !== id));
  };

  const handleCipherToggle = (cipherKey: string) => {
    setVisibleCiphers(prev => {
        if (prev.includes(cipherKey)) {
            if (prev.length === 1) return prev; 
            return prev.filter(c => c !== cipherKey);
        } else {
            return [...prev, cipherKey];
        }
    });
  };

  const handleLoadDatabase = async () => {
    setDbStatus(prev => ({ ...prev, loading: true, progress: 0 }));
    try {
        const count = await loadMatchDatabase((prog) => {
            setDbStatus(prev => ({ ...prev, progress: Math.round(prog) }));
        });
        setDbStatus({ loaded: true, loading: false, progress: 100, count });
    } catch (e) {
        console.error(e);
        setDbStatus({ loaded: false, loading: false, progress: 0, count: 0 });
        alert("Failed to load database. Check connection or CORS settings.");
    }
  };

  const handleNumberClick = (val: number, origin?: { text: string; cipher: string }) => {
    const matches = findMatchesInDatabase(val);
    setMatchModalData({ number: val, matches, origin });
  };

  const handleSaveNumber = (num: number) => {
      // Logic for saving simple number analysis
      try {
          const mathData = analyzeNumberMath(num);
          addEntry({
              type: 'number_analysis',
              title: `Number: ${num}`,
              content: {
                  number: num.toString(),
                  math: mathData,
                  esoteric: null 
              },
              tags: ['Numerology', num.toString()]
          });
      } catch (e) {
          console.error("Math analysis failed", e);
          addEntry({
              type: 'text',
              title: `Number: ${num}`,
              content: `Number: ${num}`,
              tags: ['Numerology', num.toString()]
          });
      }
  };

  const handleModalSave = () => {
      if (!matchModalData) return;

      if (matchModalData.origin) {
          // If we know the origin word, save it as a Gematria Card
          addEntry({
              type: 'gematria',
              title: matchModalData.origin.text,
              content: { [matchModalData.origin.cipher]: matchModalData.number },
              tags: ['Gematria', matchModalData.origin.cipher]
          });
      } else {
          // Fallback to saving just the number analysis
          handleSaveNumber(matchModalData.number);
      }
  };

  const handleAddToNotebook = (entity: EditableEntity) => {
      if(!calculations[entity.id]) return;
      
      const visibleCalcs = visibleCiphers.reduce((acc, key) => {
          acc[key] = calculations[entity.id][key];
          return acc;
      }, {} as Record<string, number>);

      addEntry({
          type: 'gematria',
          title: entity.text,
          content: visibleCalcs,
          tags: ['Numerology', 'Gematria']
      });
  };

  const handleSaveMatchToNotebook = (match: MatchResult, value: number) => {
      addEntry({
          type: 'gematria',
          title: match.word,
          content: { [match.cipher]: value },
          tags: ['Database Match', 'Gematria']
      });
  };

  const customizeButton = (
    <div className="flex gap-2">
        <div id="matrix-view-toggle" className="flex bg-zinc-900/50 rounded-lg p-1 border border-white/5 mr-2">
            <button 
                onClick={() => setViewMode('table')}
                className={`px-3 py-1 rounded text-xs font-medium transition-colors ${viewMode === 'table' ? 'bg-zinc-700 text-white shadow-sm' : 'text-zinc-500 hover:text-zinc-300'}`}
            >
                Table
            </button>
            <button 
                onClick={() => setViewMode('cards')}
                className={`px-3 py-1 rounded text-xs font-medium transition-colors ${viewMode === 'cards' ? 'bg-emerald-700 text-white shadow-sm' : 'text-zinc-500 hover:text-zinc-300'}`}
            >
                Cards
            </button>
        </div>

        {!dbStatus.loaded ? (
             <button 
                id="matrix-db-toggle"
                onClick={handleLoadDatabase}
                disabled={dbStatus.loading}
                className="flex items-center gap-2 text-xs bg-blue-900/40 text-blue-300 font-medium py-1.5 px-3 rounded-md border border-blue-500/30 hover:bg-blue-900/60 transition-all"
             >
                {dbStatus.loading ? (
                    <><LoadingSpinner small /> Loading DB ({dbStatus.progress}%)</>
                ) : (
                    <>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                       <path d="M3 12v3c0 1.657 3.134 3 7 3s7-1.343 7-3v-3c0 1.657-3.134 3-7 3s-7-1.343-7-3z" />
                       <path d="M3 7v3c0 1.657 3.134 3 7 3s7-1.343 7-3V7c0 1.657-3.134 3-7 3S3 8.657 3 7z" />
                       <path d="M17 5c0 1.657-3.134 3-7 3S3 6.657 3 5s3.134-3 7-3 7 1.343 7 3z" />
                    </svg>
                    DB
                    </>
                )}
             </button>
        ) : (
            <span id="matrix-db-toggle" className="flex items-center gap-2 text-xs bg-emerald-900/40 text-emerald-400 font-medium py-1.5 px-3 rounded-md border border-emerald-500/30" title="Database Active">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </span>
                DB
            </span>
        )}
        <button 
            id="matrix-settings-toggle"
            onClick={() => setIsCustomizeModalOpen(true)} 
            className="flex items-center gap-2 text-xs bg-zinc-800 text-zinc-300 font-medium py-1.5 px-3 rounded-md border border-white/10 hover:bg-emerald-900/30 hover:text-emerald-300 hover:border-emerald-500/30 transition-all"
            title="Config Ciphers"
        >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.532 1.532 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.532 1.532 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" />
            </svg>
        </button>
    </div>
  );

  return (
    <>
      <div id="matrix-calculator" className="w-full">
        <Card title="Gematria Calculator & Matrix" headerContent={customizeButton}>
            
            {/* Quick Calculator Section */}
            <div className="mb-8 bg-zinc-900/30 p-6 rounded-xl border border-white/5 relative overflow-hidden">
                <div className="relative z-10">
                    <div className="flex justify-between items-center mb-2">
                        <label className="text-[10px] font-mono text-emerald-500 uppercase tracking-widest">Quick Decode</label>
                    </div>
                    <div className="relative">
                        <input 
                            id="quick-decode-input"
                            type="text" 
                            value={quickInput}
                            onChange={(e) => setQuickInput(e.target.value)}
                            onKeyDown={(e) => { if (e.key === 'Enter') handleAddQuickToMatrix(); }}
                            placeholder="Type text to calculate values..."
                            className="w-full bg-black/40 border border-zinc-700/70 rounded-lg px-4 py-4 text-xl font-mono text-emerald-400 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/50 outline-none transition-all placeholder-zinc-700 shadow-inner"
                        />
                        {quickInput && (
                            <button 
                                onClick={() => setQuickInput('')}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-600 hover:text-zinc-300 p-2"
                            >
                                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                            </button>
                        )}
                    </div>

                    {/* Quick Results Display */}
                    {quickResults && (
                        <div className="mt-6 animate-in fade-in slide-in-from-top-2">
                            {viewMode === 'cards' ? (
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                                     {visibleCiphers.map(cipher => (
                                         <GematriaCard 
                                            key={cipher}
                                            text={quickInput}
                                            cipherName={cipher}
                                            totalValue={quickResults![cipher]}
                                            themeColor={CIPHER_THEMES[cipher] || 'zinc'}
                                         />
                                     ))}
                                </div>
                            ) : (
                                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-3 mb-6">
                                    {visibleCiphers.map(cipher => (
                                        <div key={cipher} className="bg-zinc-900 border border-white/10 rounded-lg p-3 flex flex-col items-center justify-center relative group cursor-pointer hover:border-emerald-500/30 hover:bg-zinc-800 transition-all shadow-sm"
                                            onClick={() => handleNumberClick(quickResults![cipher], { text: quickInput, cipher: cipher })}
                                        >
                                            <span className="text-[9px] text-zinc-500 uppercase tracking-wider mb-1.5 text-center">{cipherAbbreviations[cipher] || cipher}</span>
                                            <span className="text-2xl font-mono font-bold text-zinc-200 group-hover:text-emerald-400 transition-colors">{quickResults![cipher]}</span>
                                            {dbStatus.loaded && hasDatabaseMatches(quickResults![cipher]) && (
                                                <div className="absolute top-2 right-2 w-1.5 h-1.5 bg-blue-500 rounded-full animate-pulse"></div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            )}
                            <div className="flex justify-center">
                                <button 
                                    onClick={handleAddQuickToMatrix}
                                    className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest bg-zinc-800 hover:bg-zinc-700 text-zinc-300 px-6 py-2.5 rounded-full transition-all border border-white/5 hover:border-white/20 hover:text-white shadow-lg"
                                >
                                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                                    Add to Matrix
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Matrix / Entity List */}
            {!briefing && entities.length === 0 ? (
               <div className="flex justify-center items-center min-h-[100px] border-t border-white/5 pt-8">
                   <div className="flex items-center gap-2 text-zinc-500">
                        <LoadingSpinner small />
                        <span className="text-xs uppercase tracking-wider">Loading Entity Matrix...</span>
                   </div>
               </div>
            ) : (
              <div id="matrix-table">
                {viewMode === 'table' ? (
                    <div className="overflow-x-auto rounded-lg border border-white/5 max-h-[500px] overflow-y-auto">
                        <table className="w-full text-left text-sm border-collapse">
                            <thead className="bg-zinc-900 text-zinc-400">
                                <tr>
                                    <th className="p-3 font-medium min-w-[200px] border-b border-white/10 sticky left-0 bg-zinc-900 z-10 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.5)]">
                                        Entity / Text
                                    </th>
                                    {visibleCiphers.map(key => (
                                        <th key={key} className="p-3 font-medium text-center whitespace-nowrap border-b border-white/10 min-w-[60px]">
                                            <span title={key}>{cipherAbbreviations[key] || key}</span>
                                        </th>
                                    ))}
                                    <th className="p-3 border-b border-white/10 w-10"></th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5 bg-zinc-900/20">
                                {/* Input Row for new entries */}
                                <tr className="bg-emerald-900/5">
                                    <td className="p-2 sticky left-0 bg-zinc-900/90 backdrop-blur z-10 border-r border-white/5">
                                        <button 
                                            onClick={handleAddEntity}
                                            className="w-full py-2 border-2 border-dashed border-emerald-500/30 rounded text-emerald-500/70 hover:text-emerald-400 hover:border-emerald-500/60 text-xs font-bold uppercase tracking-wide transition-colors flex items-center justify-center gap-2"
                                        >
                                            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                                            Add Custom Row
                                        </button>
                                    </td>
                                    <td colSpan={visibleCiphers.length + 1} className="p-2 text-center text-zinc-600 text-xs italic">
                                        Add text row to calculate alongside entities
                                    </td>
                                </tr>

                                {entities.map((entity) => {
                                    const vals = calculations[entity.id];
                                    return (
                                        <tr key={entity.id} className="group hover:bg-white/5 transition-colors">
                                            <td className="p-2 sticky left-0 bg-zinc-950 group-hover:bg-zinc-900 transition-colors z-10 border-r border-white/10 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.5)]">
                                                <div className="flex items-center gap-2">
                                                    <input 
                                                        type="text" 
                                                        value={entity.text}
                                                        onChange={(e) => handleEntityChange(entity.id, e.target.value)}
                                                        className="w-full bg-transparent border-b border-transparent focus:border-emerald-500 focus:outline-none text-zinc-200 font-medium px-1 py-0.5"
                                                        placeholder="Enter text..."
                                                    />
                                                    {vals && (
                                                        <button onClick={() => handleAddToNotebook(entity)} className="text-zinc-600 hover:text-emerald-400 opacity-0 group-hover:opacity-100 transition-opacity">
                                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                                            </svg>
                                                        </button>
                                                    )}
                                                </div>
                                            </td>
                                            {visibleCiphers.map(key => {
                                                const hasDBMatch = dbStatus.loaded && vals && hasDatabaseMatches(vals[key]);
                                                return (
                                                    <td key={key} className="p-2 text-center font-mono text-zinc-300 group-hover:text-white relative">
                                                        {vals ? (
                                                            <button 
                                                                onClick={() => handleNumberClick(vals[key], { text: entity.text, cipher: key })}
                                                                title="View Matches & Options"
                                                                className={`px-2 py-1 rounded transition-colors border ${
                                                                    hasDBMatch 
                                                                        ? 'bg-blue-900/30 text-blue-200 border-blue-500/30 font-bold shadow-[0_0_10px_rgba(59,130,246,0.2)] hover:bg-blue-800/50'
                                                                        : 'border-transparent hover:bg-zinc-800'
                                                                } ${(vals[key] === 33 || vals[key] === 322 || vals[key] === 666 || vals[key] === 201) && !hasDBMatch ? 'text-red-400 font-bold' : ''}`}
                                                            >
                                                                {vals[key]}
                                                            </button>
                                                        ) : '-'}
                                                    </td>
                                                );
                                            })}
                                            <td className="p-2 text-center">
                                                <button 
                                                    onClick={() => handleRemoveEntity(entity.id)}
                                                    className="text-zinc-600 hover:text-red-400 transition-colors opacity-0 group-hover:opacity-100"
                                                    title="Remove row"
                                                >
                                                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                                                </button>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    /* CARD VIEW MODE */
                    <div className="space-y-12 animate-in fade-in">
                        {entities.filter(e => e.text.trim().length > 0).map((entity) => {
                             const vals = calculations[entity.id];
                             if(!vals) return null;
                             
                             return (
                                 <div key={entity.id} className="relative">
                                     <div className="flex items-center justify-center mb-6 sticky top-0 bg-zinc-950/90 backdrop-blur z-20 py-2 border-b border-white/5">
                                         <input 
                                            type="text" 
                                            value={entity.text}
                                            onChange={(e) => handleEntityChange(entity.id, e.target.value)}
                                            className="bg-transparent border-none text-center text-2xl font-bold text-white focus:ring-0 w-full max-w-lg" 
                                         />
                                          <button 
                                            onClick={() => handleRemoveEntity(entity.id)}
                                            className="absolute right-0 top-1/2 -translate-y-1/2 text-zinc-600 hover:text-red-400"
                                            title="Remove"
                                          >
                                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                                          </button>
                                     </div>
                                     <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                                          {visibleCiphers.map(cipher => (
                                              <GematriaCard 
                                                key={cipher}
                                                text={entity.text}
                                                cipherName={cipher}
                                                totalValue={vals[cipher]}
                                                themeColor={CIPHER_THEMES[cipher] || 'zinc'}
                                              />
                                          ))}
                                     </div>
                                 </div>
                             );
                        })}
                        {entities.length === 0 && (
                            <div className="text-center py-10 text-zinc-500 italic">No entities to display. Add one above.</div>
                        )}
                        <div className="flex justify-center pt-8 border-t border-white/5">
                            <button 
                                onClick={handleAddEntity}
                                className="flex items-center gap-2 text-sm font-bold uppercase tracking-widest bg-zinc-800 hover:bg-zinc-700 text-zinc-300 px-8 py-3 rounded-full transition-all border border-white/5 hover:border-white/20 hover:text-white"
                            >
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                                Add New Entry
                            </button>
                        </div>
                    </div>
                )}
              </div>
            )}
        </Card>
      </div>

      <Modal
        isOpen={isCustomizeModalOpen}
        onClose={() => setIsCustomizeModalOpen(false)}
        title="Cipher Configuration"
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 max-h-[60vh] overflow-y-auto p-1">
            {allCipherKeys.map(key => (
                <label key={key} className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-all border ${visibleCiphers.includes(key) ? 'bg-emerald-900/20 border-emerald-500/40' : 'bg-zinc-900 border-transparent hover:bg-zinc-800'}`}>
                    <input
                        type="checkbox"
                        checked={visibleCiphers.includes(key)}
                        onChange={() => handleCipherToggle(key)}
                        className="w-4 h-4 rounded border-zinc-600 text-emerald-500 focus:ring-emerald-500 bg-zinc-950"
                    />
                    <div className="flex flex-col">
                        <span className={`text-xs font-bold ${visibleCiphers.includes(key) ? 'text-emerald-400' : 'text-zinc-400'}`}>{key}</span>
                    </div>
                </label>
            ))}
        </div>
        <div className="flex justify-end pt-4 mt-4 border-t border-white/10">
            <button 
                onClick={() => setIsCustomizeModalOpen(false)}
                className="px-4 py-2 bg-zinc-100 text-zinc-900 font-bold text-sm rounded hover:bg-emerald-400 transition-colors"
            >
                Done
            </button>
        </div>
      </Modal>

      {/* Matches Modal */}
      <Modal
        isOpen={!!matchModalData}
        onClose={() => setMatchModalData(null)}
        title="Database Query Results"
      >
        <div className="max-h-[60vh] overflow-y-auto pr-2">
            {matchModalData && (
                <>
                    <div className="flex items-center justify-between mb-6 bg-zinc-900/50 p-4 rounded-lg border border-white/5">
                        <div className="flex flex-col">
                            <span className="text-[10px] uppercase tracking-widest text-zinc-500">Target Value</span>
                            <span className="text-3xl font-mono font-bold text-emerald-400 drop-shadow-sm">{matchModalData.number}</span>
                            {matchModalData.origin && (
                                <span className="text-[10px] text-zinc-400 mt-1 italic">
                                    Source: <span className="text-white">{matchModalData.origin.text}</span> ({matchModalData.origin.cipher})
                                </span>
                            )}
                        </div>
                        <div className="flex items-center gap-4">
                             <div className="flex flex-col items-end">
                                <span className="text-[10px] uppercase tracking-widest text-zinc-500">Total Matches</span>
                                <span className="text-xl font-bold text-white">{matchModalData.matches.length}</span>
                            </div>
                            <button 
                                onClick={handleModalSave}
                                className="bg-emerald-600 hover:bg-emerald-500 text-white p-2 px-4 rounded-lg transition-colors shadow-lg flex items-center gap-2"
                                title={matchModalData.origin ? `Save Card for "${matchModalData.origin.text}"` : "Save Number to Notebook"}
                            >
                                {matchModalData.origin ? (
                                    <>
                                        <span className="text-xs font-bold uppercase tracking-wide">Save Card</span>
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                                            <path d="M5 4a2 2 0 012-2h6a2 2 0 012 2v14l-5-2.5L5 18V4z" />
                                        </svg>
                                    </>
                                ) : (
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                        <path d="M5 4a2 2 0 012-2h6a2 2 0 012 2v14l-5-2.5L5 18V4z" />
                                    </svg>
                                )}
                            </button>
                        </div>
                    </div>

                    {matchModalData.matches.length > 0 ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            {matchModalData.matches.map((match, i) => (
                                <div key={i} className="group relative bg-[#0c0c0e] border border-white/10 p-3 rounded-md hover:border-emerald-500/30 hover:bg-zinc-900 transition-all duration-300 flex flex-col">
                                    <button 
                                        onClick={() => handleSaveMatchToNotebook(match, matchModalData.number)}
                                        className="absolute top-2 right-2 text-zinc-600 hover:text-emerald-400 opacity-0 group-hover:opacity-100 transition-opacity p-1 z-10"
                                        title="Save to Notebook"
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                                            <path d="M5 4a2 2 0 012-2h6a2 2 0 012 2v14l-5-2.5L5 18V4z" />
                                        </svg>
                                    </button>
                                    
                                    <div className="flex justify-between items-start mb-2 pr-6">
                                        <span className="text-sm font-bold text-zinc-200 group-hover:text-emerald-300 transition-colors break-words leading-tight">{match.word}</span>
                                    </div>
                                    <div className="mt-auto pt-2 border-t border-white/5 flex justify-end">
                                        <span className="text-[9px] font-mono text-zinc-500 uppercase tracking-wider bg-zinc-950 px-1.5 py-0.5 rounded border border-white/5 group-hover:text-zinc-400 group-hover:border-white/10 transition-colors">
                                            {match.cipher}
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="flex flex-col items-center justify-center py-12 text-zinc-500 opacity-60">
                            {!dbStatus.loaded ? (
                                <div className="text-center">
                                    <p className="text-sm italic mb-4">Database not active.</p>
                                    <button 
                                        onClick={() => { handleLoadDatabase(); setMatchModalData(null); }}
                                        className="px-4 py-2 bg-zinc-800 text-zinc-300 rounded text-xs hover:bg-zinc-700 transition-colors"
                                    >
                                        Load Match Database
                                    </button>
                                </div>
                            ) : (
                                <div className="text-center">
                                    <div className="w-16 h-16 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center mb-4 mx-auto">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                        </svg>
                                    </div>
                                    <p className="text-sm italic">No records found in database.</p>
                                </div>
                            )}
                        </div>
                    )}
                </>
            )}
        </div>
      </Modal>
    </>
  );
};
