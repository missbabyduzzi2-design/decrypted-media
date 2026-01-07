
import React from 'react';
import { getCipherBreakdown } from '../../../services/gematriaService';
import { useNotebook } from '../../../contexts/NotebookContext';

interface GematriaCardProps {
    text: string;
    cipherName: string;
    totalValue: number;
    themeColor: string; // Tailwind color class prefix e.g. "emerald", "blue", "amber"
}

export const GematriaCard: React.FC<GematriaCardProps> = ({ text, cipherName, totalValue, themeColor }) => {
    const breakdown = getCipherBreakdown(text, cipherName);
    const { addEntry } = useNotebook();

    // Map theme string to actual classes
    const getClasses = (color: string) => {
        const map: Record<string, any> = {
            'emerald': { border: 'border-emerald-500/50', text: 'text-emerald-400', bg: 'bg-emerald-900/10', title: 'text-emerald-500', val: 'text-emerald-300' },
            'blue': { border: 'border-blue-500/50', text: 'text-blue-400', bg: 'bg-blue-900/10', title: 'text-blue-500', val: 'text-blue-300' },
            'amber': { border: 'border-amber-500/50', text: 'text-amber-400', bg: 'bg-amber-900/10', title: 'text-amber-500', val: 'text-amber-300' },
            'orange': { border: 'border-orange-500/50', text: 'text-orange-400', bg: 'bg-orange-900/10', title: 'text-orange-500', val: 'text-orange-300' },
            'cyan': { border: 'border-cyan-500/50', text: 'text-cyan-400', bg: 'bg-cyan-900/10', title: 'text-cyan-500', val: 'text-cyan-300' },
            'purple': { border: 'border-purple-500/50', text: 'text-purple-400', bg: 'bg-purple-900/10', title: 'text-purple-500', val: 'text-purple-300' },
            'pink': { border: 'border-pink-500/50', text: 'text-pink-400', bg: 'bg-pink-900/10', title: 'text-pink-500', val: 'text-pink-300' },
            'rose': { border: 'border-rose-500/50', text: 'text-rose-400', bg: 'bg-rose-900/10', title: 'text-rose-500', val: 'text-rose-300' },
            'sky': { border: 'border-sky-500/50', text: 'text-sky-400', bg: 'bg-sky-900/10', title: 'text-sky-500', val: 'text-sky-300' },
            'lime': { border: 'border-lime-500/50', text: 'text-lime-400', bg: 'bg-lime-900/10', title: 'text-lime-500', val: 'text-lime-300' },
            'indigo': { border: 'border-indigo-500/50', text: 'text-indigo-400', bg: 'bg-indigo-900/10', title: 'text-indigo-500', val: 'text-indigo-300' },
            'violet': { border: 'border-violet-500/50', text: 'text-violet-400', bg: 'bg-violet-900/10', title: 'text-violet-500', val: 'text-violet-300' },
            'fuchsia': { border: 'border-fuchsia-500/50', text: 'text-fuchsia-400', bg: 'bg-fuchsia-900/10', title: 'text-fuchsia-500', val: 'text-fuchsia-300' },
            'zinc': { border: 'border-zinc-500/50', text: 'text-zinc-400', bg: 'bg-zinc-900/10', title: 'text-zinc-500', val: 'text-zinc-300' },
        };
        return map[color] || map['zinc'];
    };

    const styles = getClasses(themeColor);

    const handleCopy = () => {
        navigator.clipboard.writeText(`${cipherName}: ${totalValue} (${text})`);
    };

    const handleSave = () => {
        addEntry({
            type: 'gematria',
            title: text,
            content: { [cipherName]: totalValue },
            tags: ['Gematria Card', cipherName]
        });
    };

    return (
        <div className={`relative border-2 ${styles.border} ${styles.bg} p-4 rounded-lg flex flex-col items-center shadow-lg transition-transform hover:scale-[1.02] group`}>
            {/* Header */}
            <div className={`text-xs font-mono uppercase tracking-widest ${styles.title} mb-3`}>
                {cipherName}
            </div>

            {/* Content Breakdown */}
            <div className="flex flex-wrap justify-center gap-x-1 gap-y-2 mb-2 w-full">
                {breakdown.map((item, idx) => (
                    <div key={idx} className="flex flex-col items-center min-w-[12px]">
                        <span className={`text-lg font-bold ${styles.text} leading-none`}>
                            {item.char}
                        </span>
                        {item.val > 0 && (
                            <span className="text-[9px] text-zinc-500 font-mono mt-0.5">
                                {item.val}
                            </span>
                        )}
                    </div>
                ))}
            </div>

            {/* Total Value */}
            <div className={`text-4xl font-mono font-bold ${styles.val} mt-2 drop-shadow-sm`}>
                {totalValue}
            </div>
            
            {/* Actions (visible on hover) */}
            <div className="absolute bottom-2 right-2 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <button onClick={handleCopy} className="text-zinc-500 hover:text-white" title="Copy">
                     <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" /></svg>
                </button>
                <button onClick={handleSave} className="text-zinc-500 hover:text-white" title="Save">
                     <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" /></svg>
                </button>
            </div>
        </div>
    );
};
