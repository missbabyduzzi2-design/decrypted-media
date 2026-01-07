
import React from 'react';
import { type Article } from '../../types';
import { LoadingSpinner } from '../shared/LoadingSpinner';

interface ArticleCardProps {
  article: Article;
  onDecode: (article: Article) => void;
  isDecoding: boolean;
}

export const ArticleCard: React.FC<ArticleCardProps> = ({ article, onDecode, isDecoding }) => {
  return (
    <div className="group flex flex-col bg-[#09090b]/90 border border-white/5 rounded-xl overflow-hidden hover:bg-[#09090b] hover:border-emerald-500/20 hover:shadow-[0_10px_40px_-10px_rgba(0,0,0,0.5)] hover:-translate-y-1 transition-all duration-300 ease-[cubic-bezier(0.25,0.1,0.25,1)] h-full relative ring-1 ring-white/5 hover:ring-emerald-500/20">
      
      <div className="p-6 flex-1 flex flex-col relative z-10">
        <div className="flex justify-between items-start mb-4">
            <span className="inline-flex items-center px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider bg-zinc-900/80 text-zinc-400 border border-white/5 group-hover:border-emerald-500/20 group-hover:text-emerald-400 transition-colors">
                {article.category}
            </span>
            <span className="text-[10px] text-zinc-600 font-mono uppercase tracking-wide group-hover:text-zinc-500 transition-colors">{article.date}</span>
        </div>
        
        <h3 className="text-lg font-bold text-zinc-200 mb-3 leading-snug font-heading tracking-wide group-hover:text-white transition-colors">
            {article.title}
        </h3>
        
        <p className="text-zinc-400 text-sm leading-relaxed line-clamp-3 flex-1 group-hover:text-zinc-300 transition-colors">
            {article.description}
        </p>
      </div>
      
      <div className="px-6 pb-6 pt-2 mt-auto relative z-10">
        <button
            onClick={() => onDecode(article)}
            disabled={isDecoding}
            className="w-full py-2.5 px-4 bg-zinc-900 text-zinc-400 border border-zinc-800 text-[10px] font-bold tracking-[0.2em] uppercase rounded hover:bg-emerald-600 hover:text-white hover:border-emerald-500 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-sm group/btn"
        >
            {isDecoding ? (
            <>
                <LoadingSpinner small />
                INITIALIZING...
            </>
            ) : (
            <>
                INITIATE ANALYSIS
                <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5 transform group-hover/btn:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
            </>
            )}
        </button>
      </div>
    </div>
  );
};
