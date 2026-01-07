
import React, { useState } from 'react';
import { analyzeNumberMath, type NumberMathData } from '../../../services/numberLogicService';
import { getNumberSymbolism } from '../../../services/geminiService';
import { type NumberSymbolism } from '../../../types';
import { LoadingSpinner } from '../../shared/LoadingSpinner';
import { useNotebook } from '../../../contexts/NotebookContext';

export const NumberAnalyzer: React.FC = () => {
  const [inputNum, setInputNum] = useState('');
  const [mathData, setMathData] = useState<NumberMathData | null>(null);
  const [esotericData, setEsotericData] = useState<NumberSymbolism | null>(null);
  const [isLoadingEsoteric, setIsLoadingEsoteric] = useState(false);
  
  const { addEntry } = useNotebook();

  const handleAnalyze = () => {
    const n = parseInt(inputNum, 10);
    if (isNaN(n) || n === 0) return;

    // 1. Client-Side Math (Instant)
    try {
        const data = analyzeNumberMath(n);
        setMathData(data);
    } catch (e) {
        console.error(e);
    }

    // 2. AI Esoteric (Async)
    setEsotericData(null);
    setIsLoadingEsoteric(true);
    getNumberSymbolism(n)
        .then(data => setEsotericData(data))
        .catch(err => console.error(err))
        .finally(() => setIsLoadingEsoteric(false));
  };

  const handleAddToNotebook = () => {
      if (!inputNum) return;
      addEntry({
          type: 'number_analysis',
          title: `Number Analysis: ${inputNum}`,
          content: {
              number: inputNum,
              math: mathData,
              esoteric: esotericData
          },
          tags: ['Number Analysis', inputNum]
      });
  };

  return (
    <div className="bg-[#0c0c0e] border border-white/5 rounded-xl p-6 relative overflow-hidden">
        {/* Background FX */}
        <div className="absolute top-[-50%] left-[-10%] w-[120%] h-[200%] bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-5 pointer-events-none"></div>

        <div className="relative z-10">
            <h3 className="text-sm font-bold text-zinc-400 uppercase tracking-[0.2em] mb-6 flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-emerald-500" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M2 11a1 1 0 011-1h2a1 1 0 011 1v5a1 1 0 01-1 1H3a1 1 0 01-1-1v-5zM8 7a1 1 0 011-1h2a1 1 0 011 1v9a1 1 0 01-1 1H9a1 1 0 01-1-1V7zM14 4a1 1 0 011-1h2a1 1 0 011 1v12a1 1 0 01-1 1h-2a1 1 0 01-1-1V4z" />
                </svg>
                Deep Number Analysis
            </h3>

            {/* Input */}
            <div className="flex gap-2 mb-8 max-w-md mx-auto">
                <input 
                    type="number" 
                    value={inputNum}
                    onChange={(e) => setInputNum(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleAnalyze()}
                    placeholder="Enter Number (e.g. 33, 144, 2024)"
                    className="flex-1 bg-zinc-900 border border-zinc-700 rounded-lg px-4 py-2 text-white font-mono focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/50 outline-none"
                />
                <button 
                    onClick={handleAnalyze}
                    className="bg-emerald-700 hover:bg-emerald-600 text-white font-bold px-6 py-2 rounded-lg transition-colors shadow-lg shadow-emerald-900/20"
                >
                    ANALYZE
                </button>
            </div>

            {mathData && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                    
                    {/* Group 1: Basic Structure */}
                    <div className="bg-zinc-900/50 border border-white/5 rounded-lg p-5">
                        <h4 className="text-xs font-bold text-emerald-500 uppercase tracking-wider mb-4 border-b border-white/5 pb-2">Basic Structure</h4>
                        <div className="space-y-3 text-sm font-mono text-zinc-400">
                            <div className="flex justify-between">
                                <span>Prime Status</span>
                                <span className={mathData.basic.isPrime ? "text-emerald-400 font-bold" : "text-zinc-500"}>{mathData.basic.isPrime ? "PRIME" : "Composite"}</span>
                            </div>
                            <div className="flex justify-between">
                                <span>Divisors</span>
                                <span className="text-zinc-200 text-xs max-w-[50%] text-right overflow-hidden text-ellipsis whitespace-nowrap" title={mathData.basic.divisors.join(', ')}>
                                    {mathData.basic.divisors.length > 10 ? `${mathData.basic.divisors.length} divisors` : mathData.basic.divisors.join(', ')}
                                </span>
                            </div>
                            <div className="flex justify-between">
                                <span>Sum of Divisors</span>
                                <span className="text-zinc-200">{mathData.basic.sumDivisors}</span>
                            </div>
                             <div className="flex justify-between">
                                <span>Prime Neighbor (Prev)</span>
                                <span className="text-zinc-200">{mathData.basic.prevPrime ?? '-'}</span>
                            </div>
                            <div className="flex justify-between">
                                <span>Prime Neighbor (Next)</span>
                                <span className="text-zinc-200">{mathData.basic.nextPrime}</span>
                            </div>
                             <div className="flex justify-between">
                                <span>Fibonacci Neighbor (Next)</span>
                                <span className="text-zinc-200">{mathData.basic.nextFibonacci}</span>
                            </div>
                        </div>
                    </div>

                    {/* Group 2: Core Identity */}
                    <div className="bg-zinc-900/50 border border-white/5 rounded-lg p-5">
                        <h4 className="text-xs font-bold text-blue-400 uppercase tracking-wider mb-4 border-b border-white/5 pb-2">Core Identity</h4>
                        <div className="space-y-3 text-sm font-mono text-zinc-400">
                            <div className="flex justify-between items-center">
                                <span>Digital Root</span>
                                <div className="w-8 h-8 rounded-full bg-blue-900/20 border border-blue-500/30 flex items-center justify-center text-blue-400 font-bold">
                                    {mathData.identity.digitalRoot}
                                </div>
                            </div>
                            <div className="flex justify-between pt-2">
                                <span>Binary</span>
                                <span className="text-zinc-500 text-xs">{mathData.identity.binary}</span>
                            </div>
                            <div className="flex justify-between">
                                <span>Octal</span>
                                <span className="text-zinc-500 text-xs">{mathData.identity.octal}</span>
                            </div>
                            <div className="flex justify-between">
                                <span>Hexadecimal</span>
                                <span className="text-emerald-500/70 text-xs">{mathData.identity.hex}</span>
                            </div>
                            <div className="flex justify-between">
                                <span>Duodecimal</span>
                                <span className="text-purple-500/70 text-xs">{mathData.identity.duodecimal}</span>
                            </div>
                             <div className="flex justify-between">
                                <span>Magic Constant?</span>
                                <span className={mathData.identity.isMagicConstant ? "text-emerald-400" : "text-zinc-600"}>{mathData.identity.isMagicConstant ? "Yes" : "No"}</span>
                            </div>
                        </div>
                    </div>

                    {/* Group 3: Classification */}
                    <div className="lg:col-span-2 bg-zinc-900/50 border border-white/5 rounded-lg p-5">
                        <h4 className="text-xs font-bold text-amber-500 uppercase tracking-wider mb-4 border-b border-white/5 pb-2">Numerical Classification</h4>
                        <div className="flex flex-wrap gap-2">
                            {mathData.classification.primeIndex && (
                                <span className="px-3 py-1 rounded bg-zinc-800 border border-white/10 text-xs text-zinc-300">
                                    <span className="text-emerald-500 mr-2">●</span>{mathData.classification.primeIndex}th Prime
                                </span>
                            )}
                            {mathData.classification.isTriangular && (
                                <span className="px-3 py-1 rounded bg-zinc-800 border border-white/10 text-xs text-zinc-300">
                                    <span className="text-blue-500 mr-2">▲</span>Triangular
                                </span>
                            )}
                            {mathData.classification.isSquare && (
                                <span className="px-3 py-1 rounded bg-zinc-800 border border-white/10 text-xs text-zinc-300">
                                    <span className="text-amber-500 mr-2">■</span>Square
                                </span>
                            )}
                            {mathData.classification.isCube && (
                                <span className="px-3 py-1 rounded bg-zinc-800 border border-white/10 text-xs text-zinc-300">
                                    <span className="text-purple-500 mr-2">🧊</span>Cube
                                </span>
                            )}
                            {mathData.classification.isFibonacci && (
                                <span className="px-3 py-1 rounded bg-zinc-800 border border-white/10 text-xs text-zinc-300">
                                    <span className="text-rose-500 mr-2">φ</span>Fibonacci
                                </span>
                            )}
                            {mathData.classification.isPentagonal && (
                                <span className="px-3 py-1 rounded bg-zinc-800 border border-white/10 text-xs text-zinc-300">
                                    <span className="text-cyan-500 mr-2">⬠</span>Pentagonal
                                </span>
                            )}
                            {mathData.classification.isTetrahedral && (
                                <span className="px-3 py-1 rounded bg-zinc-800 border border-white/10 text-xs text-zinc-300">
                                    <span className="text-lime-500 mr-2">△</span>Tetrahedral
                                </span>
                            )}
                            {mathData.classification.isHarshad && (
                                <span className="px-3 py-1 rounded bg-zinc-800 border border-white/10 text-xs text-zinc-300">
                                    Harshad Number
                                </span>
                            )}
                            {mathData.classification.isHappy && (
                                <span className="px-3 py-1 rounded bg-zinc-800 border border-white/10 text-xs text-zinc-300">
                                    Happy Number
                                </span>
                            )}
                        </div>
                        {/* Fallback if no sequence */}
                        {!Object.values(mathData.classification).some(v => v === true || (typeof v === 'number')) && (
                            <p className="text-zinc-500 text-xs italic">This number does not belong to standard elementary sequences (Prime, Fibonacci, Polygonal, etc.).</p>
                        )}
                    </div>

                    {/* Group 4: Esoteric Layer */}
                    <div className="lg:col-span-2 bg-gradient-to-br from-purple-950/20 to-zinc-900 border border-purple-500/20 rounded-lg p-5 relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-purple-600/10 rounded-full blur-2xl -mr-16 -mt-16 pointer-events-none"></div>
                        <h4 className="text-xs font-bold text-purple-400 uppercase tracking-wider mb-4 border-b border-purple-500/20 pb-2 flex justify-between">
                            <span>Esoteric Layer</span>
                            {isLoadingEsoteric && <LoadingSpinner small />}
                        </h4>

                        {isLoadingEsoteric ? (
                             <div className="text-purple-400/50 text-xs font-mono animate-pulse">Consulting the archives...</div>
                        ) : esotericData ? (
                            <div className="space-y-4">
                                <div>
                                    <span className="text-[10px] text-zinc-500 uppercase tracking-widest font-bold block mb-1">Archetype</span>
                                    <p className="text-zinc-200 font-heading text-sm font-bold">{esotericData.archetype}</p>
                                </div>
                                <div>
                                    <span className="text-[10px] text-zinc-500 uppercase tracking-widest font-bold block mb-1">Interpretation</span>
                                    <p className="text-zinc-300 text-sm leading-relaxed">{esotericData.meaning}</p>
                                </div>
                                <div>
                                    <span className="text-[10px] text-zinc-500 uppercase tracking-widest font-bold block mb-1">Qualities & Cycles</span>
                                    <p className="text-zinc-400 text-xs italic border-l-2 border-purple-500/30 pl-3">{esotericData.qualities}</p>
                                </div>
                            </div>
                        ) : (
                            <div className="text-zinc-500 text-xs italic">Awaiting analysis...</div>
                        )}
                        
                        <button 
                            onClick={handleAddToNotebook}
                            className="absolute bottom-4 right-4 p-2 text-zinc-600 hover:text-purple-400 transition-colors"
                            title="Save to Notebook"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                <path d="M5 4a2 2 0 012-2h6a2 2 0 012 2v14l-5-2.5L5 18V4z" />
                            </svg>
                        </button>
                    </div>

                </div>
            )}
        </div>
    </div>
  );
};
