
import React, { useState } from 'react';
import { Card } from '../../shared/Card';
import { generateDayCountTable } from '../../../services/dateNumerologyService';
import { getEntityChronology } from '../../../services/geminiService';
import { type IntelligenceBriefing, type EsotericMappings, type EntityChronology, type DayCountRow } from '../../../types';
import { LoadingSpinner } from '../../shared/LoadingSpinner';
import { useNotebook } from '../../../contexts/NotebookContext';
import { DateDiffCalculator } from './DateDiffCalculator';
import { NumberAnalyzer } from './NumberAnalyzer';

interface NumerologyChronologyProps {
  articleId: string;
  briefing: IntelligenceBriefing | null;
  esotericMappings: EsotericMappings | null;
  articleDate?: string; 
}

export const NumerologyChronology: React.FC<NumerologyChronologyProps> = ({ articleId, briefing, esotericMappings, articleDate = new Date().toISOString().split('T')[0] }) => {
  // Chronology State
  const [chronologyData, setChronologyData] = useState<EntityChronology[]>([]);
  const [dayCountAnalysis, setDayCountAnalysis] = useState<DayCountRow[]>([]);
  const [isChronologyLoading, setIsChronologyLoading] = useState(false);
  const [showAllChronology, setShowAllChronology] = useState(false);

  const { addEntry } = useNotebook();

  const handleRunChronologyScan = async () => {
      if (!briefing) return;
      setIsChronologyLoading(true);
      setDayCountAnalysis([]);
      try {
          const targets: { name: string; type: string }[] = briefing.entities.map(e => ({ name: e.name, type: e.type }));
          targets.push({ name: "Next Solar Eclipse", type: "Astronomical" });
          
          const results = await getEntityChronology(targets);
          setChronologyData(results);

          const analysis = generateDayCountTable(results, articleDate);
          setDayCountAnalysis(analysis);
      } catch (e) {
          console.error("Chronology scan failed", e);
      } finally {
          setIsChronologyLoading(false);
      }
  };

  const handleAddControlNumberToNotebook = (item: { number: string; meaning: string; context: string }) => {
      addEntry({
          type: 'text',
          title: `Ritual Number: ${item.number}`,
          content: `${item.meaning}\n\nContext: ${item.context}`,
          tags: ['Numerology', 'Ritual Number', item.number]
      });
  };

  const handleAddChronologyRowToNotebook = (row: DayCountRow) => {
      addEntry({
          type: 'text',
          title: row.comparison,
          content: `Day Count: ${row.dayCount.toLocaleString()} days\nStart: ${row.startDate}\nEnd: ${row.endDate}\n\nSum: ${row.digitSum} | Zero Reduced: ${row.zeroDropped}\n${row.isControlMatch ? 'Match Found: ' + row.controlMatchValue : ''}`,
          tags: ['Chronology', 'Date Sync']
      });
  };

  return (
    <div className="grid grid-cols-1 gap-6">
      
      {/* Number Analyzer */}
      <div id="number-analyzer-panel" className="w-full">
         <NumberAnalyzer />
      </div>

      {/* Ritual Numbers Section */}
      <div id="ritual-numbers-card" className="w-full">
        <Card title="Detected Ritual & Control Numbers">
            {!esotericMappings ? (
                 <div className="flex justify-center items-center min-h-[100px]"><LoadingSpinner /></div>
            ) : (
                esotericMappings.numerologyMatches && esotericMappings.numerologyMatches.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-h-[400px] overflow-y-auto pr-2">
                        {esotericMappings.numerologyMatches.map((item, idx) => (
                            <div key={idx} className="bg-zinc-900/50 border border-red-500/20 rounded-lg p-4 flex flex-col relative overflow-hidden group hover:bg-zinc-900 transition-colors h-full">
                                <button onClick={() => handleAddControlNumberToNotebook(item)} className="absolute top-2 right-2 text-zinc-600 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" viewBox="0 0 20 20" fill="currentColor"><path d="M5 4a2 2 0 012-2h6a2 2 0 012 2v14l-5-2.5L5 18V4z" /></svg>
                                </button>
                                <div className="absolute top-0 right-0 p-2 opacity-10 group-hover:opacity-20 pointer-events-none">
                                     <span className="text-4xl font-mono font-bold text-red-500">{item.number}</span>
                                </div>
                                <div className="flex items-center gap-3 mb-2">
                                    <span className="text-2xl font-mono font-bold text-red-400 drop-shadow-sm">{item.number}</span>
                                    <span className="text-[10px] uppercase tracking-wider bg-red-500/10 text-red-400 px-2 py-0.5 rounded border border-red-500/20">
                                        {item.category}
                                    </span>
                                </div>
                                <p className="text-sm text-zinc-200 font-medium mb-2 leading-snug">{item.meaning}</p>
                                <div className="mt-auto pt-3 border-t border-white/5">
                                    <p className="text-xs text-zinc-500">
                                        <span className="text-zinc-600 uppercase text-[10px] mr-2">Context:</span>
                                        {item.context}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-8 border border-dashed border-white/5 rounded-lg bg-zinc-900/20">
                        <p className="text-zinc-500 text-sm italic">No major control numbers (e.g. 33, 911, 322) detected in this text.</p>
                    </div>
                )
            )}
        </Card>
      </div>

      {/* Day Counts Table Section */}
      <div id="chronology-section" className="w-full">
          <Card title="Date Calculator & Chronology" headerContent={
               <div className="flex gap-4 items-center">
                   <button
                    onClick={handleRunChronologyScan}
                    disabled={isChronologyLoading || !briefing}
                    className="text-xs bg-purple-900/40 text-purple-300 font-medium py-1.5 px-3 rounded-md border border-purple-500/30 hover:bg-purple-900/60 transition-all flex items-center gap-2"
                   >
                     {isChronologyLoading ? <><LoadingSpinner small /> Scanning...</> : (
                        <>
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                            </svg>
                            Run Auto-Scan
                        </>
                     )}
                   </button>
               </div>
          }>
              {/* Manual Date Calculator Inserted Here */}
              <div id="date-diff-calculator" className="mb-8">
                <DateDiffCalculator />
              </div>

              {!dayCountAnalysis.length ? (
                  <div className="text-center py-10 text-zinc-500 text-sm italic border border-dashed border-white/5 rounded-lg bg-zinc-900/20">
                      <p>Initiate an Auto-Scan to find birth dates, founding dates, and calculate day counts against Jesuit feasts and eclipse cycles.</p>
                  </div>
              ) : (
                <div className="space-y-4">
                    <div className="flex justify-between items-center px-2">
                        <div className="text-xs text-zinc-400">
                            Scanning relative to article date: <span className="text-zinc-200 font-mono">{articleDate}</span>
                        </div>
                        <label className="flex items-center gap-2 text-xs text-zinc-400 cursor-pointer">
                            <input type="checkbox" checked={showAllChronology} onChange={() => setShowAllChronology(!showAllChronology)} className="rounded bg-zinc-800 border-zinc-600 text-emerald-500 focus:ring-0" />
                            Show all (including non-matches)
                        </label>
                    </div>
                    
                    <div className="overflow-x-auto rounded-lg border border-white/5 max-h-[500px] overflow-y-auto">
                        <table className="w-full text-left text-sm border-collapse relative">
                            <thead className="bg-zinc-900 text-zinc-400 sticky top-0 z-20 shadow-md">
                                <tr>
                                    <th className="p-3 font-medium border-b border-white/10">Comparison</th>
                                    <th className="p-3 font-medium border-b border-white/10 whitespace-nowrap">Start Date</th>
                                    <th className="p-3 font-medium border-b border-white/10 whitespace-nowrap">End Date</th>
                                    <th className="p-3 font-medium border-b border-white/10 text-center">Days</th>
                                    <th className="p-3 font-medium border-b border-white/10 text-center">Inclusive?</th>
                                    <th className="p-3 font-medium border-b border-white/10 text-center">Control Hit?</th>
                                    <th className="p-3 font-medium border-b border-white/10">Notes</th>
                                    <th className="p-3 font-medium border-b border-white/10"></th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5 bg-zinc-900/20">
                                {dayCountAnalysis
                                    .filter(row => showAllChronology || row.isControlMatch)
                                    .map((row, idx) => (
                                    <tr key={idx} className={`hover:bg-white/5 transition-colors group ${row.isControlMatch ? 'bg-red-900/10' : ''}`}>
                                        <td className="p-3 text-zinc-300 font-medium text-xs">{row.comparison}</td>
                                        <td className="p-3 font-mono text-zinc-400 text-xs whitespace-nowrap">{row.startDate}</td>
                                        <td className="p-3 font-mono text-zinc-400 text-xs whitespace-nowrap">{row.endDate}</td>
                                        <td className="p-3 text-center font-mono font-bold text-zinc-200">{row.dayCount.toLocaleString()}</td>
                                        <td className="p-3 text-center text-xs text-zinc-500">{row.isInclusive ? 'Yes (+1)' : 'No'}</td>
                                        <td className="p-3 text-center">
                                            {row.isControlMatch ? (
                                                <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-red-500/20 text-red-400 border border-red-500/30 whitespace-nowrap">
                                                    {row.controlMatchValue}
                                                </span>
                                            ) : (
                                                <span className="text-zinc-600">-</span>
                                            )}
                                        </td>
                                        <td className="p-3 text-xs text-zinc-400 italic">
                                            <div className="flex flex-col gap-0.5">
                                                {row.notes && <span className="text-red-400/80">{row.notes}</span>}
                                                <span className="text-[10px] text-zinc-600">
                                                    Sum: {row.digitSum} | Zero: {row.zeroDropped}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="p-3 text-center">
                                            <button 
                                                onClick={() => handleAddChronologyRowToNotebook(row)}
                                                className="text-zinc-600 hover:text-emerald-400 opacity-0 group-hover:opacity-100 transition-opacity"
                                                title="Save calculation"
                                            >
                                                 <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor"><path d="M5 4a2 2 0 012-2h6a2 2 0 012 2v14l-5-2.5L5 18V4z" /></svg>
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                                {dayCountAnalysis.filter(row => showAllChronology || row.isControlMatch).length === 0 && (
                                    <tr>
                                        <td colSpan={8} className="p-8 text-center text-zinc-500 italic">
                                            No direct control number matches found. Check "Show all" to see raw counts.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
              )}
          </Card>
      </div>
    </div>
  );
};
