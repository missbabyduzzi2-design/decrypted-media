
import React, { useState, useMemo, useEffect, useRef } from 'react';
import { Card } from '../../shared/Card';
import { type Article, type IntelligenceBriefing } from '../../../types';
import { calculateAllCiphers } from '../../../services/gematriaService';
import { useNotebook } from '../../../contexts/NotebookContext';

interface FullArticleViewProps {
  article: Article;
  briefing: IntelligenceBriefing | null;
  localSearchTerm: string | null;
  onClearSearch: () => void;
}

export const FullArticleView: React.FC<FullArticleViewProps> = ({ article, briefing, localSearchTerm, onClearSearch }) => {
  const [fontSize, setFontSize] = useState(14);
  const [isExpanded, setIsExpanded] = useState(false);
  const [selectionMenu, setSelectionMenu] = useState<{ x: number, y: number, text: string } | null>(null);
  const [decodedValues, setDecodedValues] = useState<Record<string, number> | null>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const { addEntry } = useNotebook();

  useEffect(() => {
    const handleSelection = () => {
      const selection = window.getSelection();
      if (!selection || selection.isCollapsed || !contentRef.current?.contains(selection.anchorNode)) {
        setSelectionMenu(null);
        setDecodedValues(null);
        return;
      }

      const text = selection.toString().trim();
      if (text.length > 0 && text.length < 50) {
         const range = selection.getRangeAt(0);
         const rect = range.getBoundingClientRect();
         // Calculate position relative to viewport
         setSelectionMenu({
             x: rect.left + (rect.width / 2),
             y: rect.top - 10,
             text: text
         });
         setDecodedValues(calculateAllCiphers(text));
      } else {
         setSelectionMenu(null);
         setDecodedValues(null);
      }
    };

    document.addEventListener('selectionchange', handleSelection);
    return () => document.removeEventListener('selectionchange', handleSelection);
  }, []);

  // Auto-expand if searching locally
  useEffect(() => {
      if (localSearchTerm) {
          setIsExpanded(true);
      }
  }, [localSearchTerm]);

  const handleAddToNotebook = () => {
      if (selectionMenu && decodedValues) {
          addEntry({
              type: 'gematria',
              title: selectionMenu.text,
              content: decodedValues,
              tags: ['Manual Selection']
          });
          setSelectionMenu(null);
      }
  };

  const handleAddArticleToNotebook = () => {
      addEntry({
          type: 'article_header',
          title: article.title,
          content: {
              date: article.date,
              category: article.category,
              summary: article.description,
              url: article.url
          },
          tags: ['Source', article.category]
      });
  };

  // Search highlighting logic
  const highlightedContent = useMemo(() => {
    if (!localSearchTerm) return article.content;
    
    const parts = article.content.split(new RegExp(`(${localSearchTerm})`, 'gi'));
    return (
        <span>
            {parts.map((part, i) => 
                part.toLowerCase() === localSearchTerm.toLowerCase() ? (
                    <span key={i} className="bg-emerald-500/30 text-emerald-200 border-b-2 border-emerald-500 font-bold px-0.5 rounded-sm animate-pulse">
                        {part}
                    </span>
                ) : (
                    part
                )
            )}
        </span>
    );
  }, [article.content, localSearchTerm]);

  return (
    <Card title="Decrypted Source Material" headerContent={
        <div className="flex items-center gap-3">
             <button
                onClick={handleAddArticleToNotebook}
                className="flex items-center gap-1.5 text-xs bg-emerald-900/30 text-emerald-400 border border-emerald-500/30 px-3 py-1.5 rounded hover:bg-emerald-900/50 hover:border-emerald-500/50 transition-all font-bold uppercase tracking-wider"
             >
                 <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M5 4a2 2 0 012-2h6a2 2 0 012 2v14l-5-2.5L5 18V4z" />
                 </svg>
                 Save Article
             </button>

             {localSearchTerm && (
                 <button 
                    onClick={onClearSearch}
                    className="text-xs bg-zinc-800 text-zinc-400 border border-zinc-700 px-2 py-1.5 rounded flex items-center gap-1 hover:bg-zinc-700"
                 >
                     <span>Found: "{localSearchTerm}"</span>
                     <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" /></svg>
                 </button>
             )}
             <div id="font-controls" className="flex items-center gap-2 bg-zinc-900/50 p-1 rounded border border-white/5">
                 <button onClick={() => setFontSize(Math.max(10, fontSize - 1))} className="p-1 hover:text-white text-zinc-500"><svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M3 10a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" /></svg></button>
                 <span className="text-xs font-mono w-4 text-center">{fontSize}</span>
                 <button onClick={() => setFontSize(Math.min(24, fontSize + 1))} className="p-1 hover:text-white text-zinc-500"><svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" /></svg></button>
             </div>
        </div>
    }>
        <div className="mb-6 pb-6 border-b border-white/5 relative">
            <div className="flex justify-between items-start mb-2">
                <span className="text-[10px] text-zinc-500 font-mono uppercase tracking-widest">{article.date} • {article.category}</span>
                {article.url && (
                    <a 
                        href={article.url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="flex items-center gap-1 text-[10px] text-emerald-500 font-bold uppercase tracking-wider hover:text-emerald-400 transition-colors bg-emerald-900/10 px-2 py-1 rounded border border-emerald-500/20"
                    >
                        Source Transmission
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" viewBox="0 0 20 20" fill="currentColor"><path d="M11 3a1 1 0 100 2h2.586l-6.293 6.293a1 1 0 101.414 1.414L15 6.414V9a1 1 0 102 0V4a1 1 0 00-1-1h-5z" /><path d="M5 5a2 2 0 00-2 2v8a2 2 0 002 2h8a2 2 0 002-2v-3a1 1 0 10-2 0v3H5V7h3a1 1 0 000-2H5z" /></svg>
                    </a>
                )}
            </div>
            <h1 className="text-3xl font-heading font-bold text-zinc-100 leading-tight mb-4">{article.title}</h1>
            <p className="text-zinc-400 text-sm font-medium italic border-l-2 border-emerald-500/30 pl-4">{article.description}</p>
        </div>

        <div className="relative">
            <div 
                id="article-text-container"
                ref={contentRef}
                className={`font-sans text-zinc-300 leading-relaxed transition-all tracking-wide ${!isExpanded ? 'max-h-[300px] overflow-hidden' : ''}`}
                style={{ fontSize: `${fontSize}px` }}
            >
                {highlightedContent}
                
                {/* Fade Overlay when collapsed */}
                {!isExpanded && (
                    <div className="absolute bottom-0 left-0 w-full h-32 bg-gradient-to-t from-[#050505] to-transparent pointer-events-none"></div>
                )}
            </div>

            {/* Toggle Button */}
            <div className="mt-4 flex justify-center">
                <button
                    id="expand-article-btn"
                    onClick={() => setIsExpanded(!isExpanded)}
                    className="flex items-center gap-2 px-6 py-2 bg-zinc-900 border border-white/10 rounded-full text-xs font-bold text-zinc-400 hover:text-white hover:border-emerald-500/30 transition-all group z-10"
                >
                    {isExpanded ? (
                        <>
                            COLLAPSE TRANSMISSION
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 group-hover:-translate-y-0.5 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                            </svg>
                        </>
                    ) : (
                        <>
                            READ FULL SOURCE
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 group-hover:translate-y-0.5 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                            </svg>
                        </>
                    )}
                </button>
            </div>
        </div>

        {/* Floating Selection Menu */}
        {selectionMenu && decodedValues && (
            <div 
                className="fixed z-50 bg-zinc-950/90 backdrop-blur border border-emerald-500/30 rounded-lg shadow-[0_0_20px_rgba(16,185,129,0.2)] p-3 -translate-x-1/2 -translate-y-full animate-in fade-in zoom-in-95 duration-100"
                style={{ left: selectionMenu.x, top: selectionMenu.y }}
            >
                <div className="text-[10px] text-zinc-500 uppercase tracking-wider mb-2 border-b border-white/10 pb-1">Decode: <span className="text-zinc-200">{selectionMenu.text}</span></div>
                <div className="grid grid-cols-2 gap-x-4 gap-y-1 mb-2">
                    <div className="flex justify-between gap-3 text-xs font-mono"><span className="text-zinc-500">Ordinal</span> <span className="text-emerald-400 font-bold">{decodedValues['Ordinal']}</span></div>
                    <div className="flex justify-between gap-3 text-xs font-mono"><span className="text-zinc-500">Reverse</span> <span className="text-emerald-400 font-bold">{decodedValues['Reverse Ordinal']}</span></div>
                    <div className="flex justify-between gap-3 text-xs font-mono"><span className="text-zinc-500">Reduction</span> <span className="text-emerald-400 font-bold">{decodedValues['Reduction']}</span></div>
                    <div className="flex justify-between gap-3 text-xs font-mono"><span className="text-zinc-500">Sumerian</span> <span className="text-emerald-400 font-bold">{decodedValues['Sumerian']}</span></div>
                </div>
                <button 
                    onClick={handleAddToNotebook}
                    className="w-full mt-1 bg-zinc-800 hover:bg-emerald-600 text-zinc-300 hover:text-white text-[10px] py-1 rounded transition-colors uppercase font-bold"
                >
                    Save to Notebook
                </button>
                {/* Arrow */}
                <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 w-3 h-3 bg-zinc-950 border-r border-b border-emerald-500/30 rotate-45"></div>
            </div>
        )}
    </Card>
  );
};
