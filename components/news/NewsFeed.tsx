
import React, { useState, useEffect } from 'react';
import { type Article } from '../../types';
import { ArticleCard } from './ArticleCard';
import { fetchAggregatedNews } from '../../services/newsAggregatorService';
import { processManualInput } from '../../services/geminiService';
import { LoadingSpinner } from '../shared/LoadingSpinner';

interface NewsFeedProps {
  onDecode: (article: Article) => void;
  initialSearchTerm?: string;
}

const NewsFeedSkeleton = () => (
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pb-12 relative">
    {[...Array(6)].map((_, i) => (
      <div key={i} className="relative flex flex-col bg-[#09090b]/40 border border-white/5 rounded-xl h-[340px] overflow-hidden">
        {/* Subtle Scanline */}
        <div className="absolute inset-0 bg-[linear-gradient(to_bottom,transparent_0%,rgba(16,185,129,0.05)_50%,transparent_100%)] h-full w-full animate-[scan-vertical_2s_linear_infinite] pointer-events-none z-0"></div>
        
        <div className="p-6 flex-1 flex flex-col relative z-10">
            <div className="flex justify-between items-start mb-6">
                <div className="h-5 w-24 bg-zinc-800/40 rounded animate-pulse"></div>
                <div className="h-3 w-20 bg-zinc-900/40 rounded animate-pulse delay-75"></div>
            </div>
            <div className="space-y-3 mb-6">
                <div className="h-6 w-full bg-zinc-800/30 rounded animate-pulse delay-100"></div>
                <div className="h-6 w-[85%] bg-zinc-800/30 rounded animate-pulse delay-150"></div>
            </div>
            <div className="space-y-2.5 flex-1">
                <div className="h-3 w-full bg-zinc-900/30 rounded animate-pulse delay-200"></div>
                <div className="h-3 w-full bg-zinc-900/30 rounded animate-pulse delay-300"></div>
                <div className="h-3 w-2/3 bg-zinc-900/30 rounded animate-pulse delay-300"></div>
            </div>
        </div>
        <div className="px-6 pb-6 pt-2 relative z-10">
            <div className="h-9 w-full bg-zinc-800/40 rounded animate-pulse"></div>
        </div>
      </div>
    ))}
    <style>{`
        @keyframes scan-vertical {
            0% { transform: translateY(-100%); }
            100% { transform: translateY(100%); }
        }
    `}</style>
  </div>
);

export const NewsFeed: React.FC<NewsFeedProps> = ({ onDecode, initialSearchTerm }) => {
  const [activeTab, setActiveTab] = useState<'stream' | 'manual'>('stream');
  
  // Stream State
  const [articles, setArticles] = useState<Article[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [category, setCategory] = useState('All');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [page, setPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [retryTrigger, setRetryTrigger] = useState(0);
  
  // Manual State
  const [manualInput, setManualInput] = useState('');
  const [isProcessingManual, setIsProcessingManual] = useState(false);
  const [manualError, setManualError] = useState<string | null>(null);

  const [decodingId, setDecodingId] = useState<string | null>(null);

  useEffect(() => {
    if (initialSearchTerm) {
      setSearchTerm(initialSearchTerm);
    }
  }, [initialSearchTerm]);

  // Reset page when filters change
  useEffect(() => {
    setPage(1);
  }, [searchTerm, category, fromDate, toDate]);

  useEffect(() => {
    let isMounted = true;
    const loadNews = async () => {
      setIsLoading(true);
      setError(null);

      // Scroll to top marker if changing pages
      if (page > 1) {
          const gridTop = document.getElementById('news-grid-top');
          if (gridTop) gridTop.scrollIntoView({ behavior: 'smooth' });
      }

      try {
        // Use the Aggregator Service instead of direct Guardian service
        const news = await fetchAggregatedNews(searchTerm, category, fromDate, toDate, page);
        
        if (isMounted) {
          // If no news found at all (and it's page 1), trigger error state or empty state
          if (news.length === 0 && page === 1) {
             // We don't necessarily want to error if it's just no results, 
             // but if the API failed, the aggregator handles returning empty arrays.
             // If array is empty, we show "No Reports" in UI.
          }
          setArticles(news);
        }
      } catch (err) {
        if (isMounted) {
          setError("Failed to establish connection to news stream.");
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    const debounce = setTimeout(loadNews, 600);
    return () => {
      isMounted = false;
      clearTimeout(debounce);
    };
  }, [searchTerm, category, fromDate, toDate, retryTrigger, page]);

  const handleDecodeClick = (article: Article) => {
    setDecodingId(article.id);
    setTimeout(() => {
      onDecode(article);
    }, 300);
  };

  const handlePageChange = (newPage: number) => {
      setPage(newPage);
  };
  
  const handleManualSubmit = async () => {
      if (!manualInput.trim()) return;
      setIsProcessingManual(true);
      setManualError(null);
      
      try {
          const article = await processManualInput(manualInput);
          onDecode(article);
      } catch (e) {
          console.error("Manual processing failed", e);
          setManualError("Failed to process input. Verify URL accessibility or text format.");
      } finally {
          setIsProcessingManual(false);
      }
  };

  const categories = ['All', 'World', 'Politics', 'Technology', 'Finance', 'Science', 'Environment', 'Culture', 'Music', 'Film'];

  return (
    <div className="max-w-[1400px] mx-auto px-4 md:px-8">
      <div id="news-grid-top"></div>
      
      <div className="mb-14 flex flex-col items-center gap-6">
        
        {/* Mode Toggle */}
        <div id="mode-toggle" className="flex bg-zinc-950 p-1 rounded-lg border border-white/10 mb-4 shadow-lg">
            <button 
                onClick={() => setActiveTab('stream')}
                className={`px-6 py-2 rounded-md text-[10px] font-bold uppercase tracking-[0.2em] transition-all duration-300 ${activeTab === 'stream' ? 'bg-emerald-600 text-white shadow-[0_0_15px_rgba(16,185,129,0.3)]' : 'text-zinc-500 hover:text-zinc-300'}`}
            >
                Intercept Stream
            </button>
            <button 
                onClick={() => setActiveTab('manual')}
                className={`px-6 py-2 rounded-md text-[10px] font-bold uppercase tracking-[0.2em] transition-all duration-300 ${activeTab === 'manual' ? 'bg-emerald-600 text-white shadow-[0_0_15px_rgba(16,185,129,0.3)]' : 'text-zinc-500 hover:text-zinc-300'}`}
            >
                Manual Uplink
            </button>
        </div>

        {activeTab === 'stream' ? (
            <>
                {/* Modern Central Search - Command style */}
                <div id="search-bar" className="w-full max-w-2xl relative group z-10 animate-in fade-in slide-in-from-top-2 duration-300">
                {/* Glow behind */}
                <div className="absolute -inset-1 bg-gradient-to-r from-emerald-500/20 to-blue-500/20 rounded-xl blur-lg group-focus-within:opacity-100 opacity-50 transition-opacity duration-500"></div>
                
                <div className="relative bg-[#0c0c0e] border border-white/10 rounded-xl flex items-center p-1 focus-within:border-emerald-500/40 focus-within:ring-1 focus-within:ring-emerald-500/20 transition-all shadow-2xl">
                    <div className="pl-4 pr-2 text-zinc-500 group-focus-within:text-emerald-500 transition-colors">
                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                    </div>
                    <input
                    type="text"
                    placeholder="Search Global Intelligence (All Sources)..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full bg-transparent border-none text-zinc-100 text-base placeholder-zinc-600 focus:ring-0 px-2 py-3 tracking-wide"
                    />
                    {searchTerm && (
                        <button onClick={() => setSearchTerm('')} className="p-2 text-zinc-600 hover:text-white transition-colors mr-2 rounded-full hover:bg-zinc-800">
                            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    )}
                </div>
                </div>

                {/* Date Filters */}
                <div className="flex flex-wrap justify-center gap-4 w-full max-w-2xl animate-in fade-in slide-in-from-top-2 duration-500 delay-75">
                    <div className="flex items-center gap-2 bg-zinc-900/50 border border-white/5 rounded-lg px-3 py-1.5 focus-within:border-emerald-500/30 transition-colors">
                        <label className="text-[10px] uppercase text-zinc-500 font-bold tracking-wider">From</label>
                        <input 
                            type="date" 
                            value={fromDate} 
                            onChange={(e) => setFromDate(e.target.value)}
                            className="bg-transparent border-none text-zinc-300 text-xs font-mono focus:ring-0 p-0 [&::-webkit-calendar-picker-indicator]:invert"
                        />
                    </div>
                    <div className="flex items-center gap-2 bg-zinc-900/50 border border-white/5 rounded-lg px-3 py-1.5 focus-within:border-emerald-500/30 transition-colors">
                        <label className="text-[10px] uppercase text-zinc-500 font-bold tracking-wider">To</label>
                        <input 
                            type="date" 
                            value={toDate} 
                            onChange={(e) => setToDate(e.target.value)}
                            className="bg-transparent border-none text-zinc-300 text-xs font-mono focus:ring-0 p-0 [&::-webkit-calendar-picker-indicator]:invert"
                        />
                    </div>
                </div>
                
                {/* Filter Bar */}
                <div id="filter-bar" className="flex flex-wrap justify-center gap-2 animate-in fade-in slide-in-from-top-2 duration-500 delay-100">
                {categories.map(cat => (
                    <button
                        key={cat}
                        onClick={() => setCategory(cat)}
                        className={`px-4 py-1.5 rounded text-[10px] font-bold tracking-widest uppercase transition-all duration-300 border backdrop-blur-sm ${
                            category === cat 
                            ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/50 shadow-[0_0_15px_rgba(16,185,129,0.2)]' 
                            : 'bg-zinc-900/40 text-zinc-500 border-white/5 hover:border-white/10 hover:text-zinc-300 hover:bg-zinc-800/60'
                        }`}
                    >
                        {cat}
                    </button>
                ))}
                </div>
            </>
        ) : (
            <div className="w-full max-w-3xl animate-in fade-in slide-in-from-top-2 duration-300">
                <div className="relative group">
                    {/* Animated Data Transfer FX */}
                    <div className="absolute -inset-1 bg-gradient-to-r from-purple-500/20 to-emerald-500/20 rounded-xl blur-lg opacity-30 group-focus-within:opacity-70 transition-opacity duration-500"></div>
                    
                    <div className="bg-[#0c0c0e] border border-white/10 rounded-xl p-6 relative shadow-2xl flex flex-col gap-4">
                        <div className="flex justify-between items-center border-b border-white/5 pb-2">
                            <span className="text-[10px] font-mono text-emerald-500 uppercase tracking-widest flex items-center gap-2">
                                <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></span>
                                Secure Uplink Terminal
                            </span>
                            <span className="text-[9px] text-zinc-600 font-mono">STATUS: READY</span>
                        </div>

                        <textarea
                            value={manualInput}
                            onChange={(e) => setManualInput(e.target.value)}
                            placeholder="> Paste target URL or raw intelligence data..."
                            className="w-full h-48 bg-zinc-950 border border-zinc-800 rounded-lg p-4 text-emerald-100 font-mono text-xs focus:outline-none focus:border-emerald-500/30 focus:ring-1 focus:ring-emerald-500/20 transition-all placeholder-zinc-700 resize-none leading-relaxed"
                            style={{ backgroundImage: 'linear-gradient(rgba(16, 185, 129, 0.03) 1px, transparent 1px)', backgroundSize: '100% 2em' }}
                        />
                        
                        <div className="flex justify-between items-center mt-2">
                            <div className="flex items-center gap-4">
                                <p className="text-[9px] text-zinc-500 font-mono uppercase tracking-wide">
                                    SUPPORTED PROTOCOLS:
                                </p>
                                <div className="flex gap-2">
                                    <span className="text-[9px] bg-zinc-900 border border-white/5 px-2 py-0.5 rounded text-zinc-400">HTTP/S</span>
                                    <span className="text-[9px] bg-zinc-900 border border-white/5 px-2 py-0.5 rounded text-zinc-400">RAW TEXT</span>
                                </div>
                            </div>

                            <button
                                onClick={handleManualSubmit}
                                disabled={!manualInput.trim() || isProcessingManual}
                                className="px-6 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold uppercase tracking-widest rounded transition-all shadow-[0_0_15px_rgba(16,185,129,0.2)] disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                            >
                                {isProcessingManual ? (
                                    <>
                                        <LoadingSpinner small dark />
                                        ESTABLISHING UPLINK...
                                    </>
                                ) : (
                                    <>
                                        TRANSMIT DATA
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" viewBox="0 0 20 20" fill="currentColor">
                                            <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
                                        </svg>
                                    </>
                                )}
                            </button>
                        </div>
                        {manualError && (
                            <div className="mt-2 p-3 bg-red-900/10 border border-red-500/20 rounded text-red-400 text-xs flex items-center gap-2 animate-in fade-in">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                                </svg>
                                {manualError}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        )}
      </div>

      {activeTab === 'stream' && (
          isLoading ? (
            <div className="relative">
                <NewsFeedSkeleton />
                <div className="absolute inset-0 flex items-center justify-center z-20 pointer-events-none">
                     <div className="bg-black/60 backdrop-blur-md border border-emerald-500/20 px-6 py-3 rounded-full flex items-center gap-3 shadow-2xl animate-in fade-in slide-in-from-bottom-2 duration-500">
                         <LoadingSpinner small />
                         <span className="text-emerald-500 text-xs font-mono uppercase tracking-widest animate-pulse">Scanning Intelligence Feed...</span>
                     </div>
                </div>
            </div>
          ) : error ? (
            <div className="text-center py-20 bg-red-950/10 border border-red-500/20 rounded-2xl max-w-lg mx-auto backdrop-blur-md relative overflow-hidden group">
                <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-10"></div>
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-red-500 to-transparent opacity-50"></div>
                
                <div className="relative z-10 p-8">
                    <div className="w-16 h-16 bg-red-900/20 rounded-full flex items-center justify-center mx-auto mb-6 border border-red-500/30 shadow-[0_0_15px_rgba(239,68,68,0.2)]">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                        </svg>
                    </div>
                    
                    <h3 className="text-red-400 font-bold tracking-[0.2em] mb-2 text-sm uppercase">Signal Interrupted</h3>
                    <p className="text-zinc-400 text-xs font-mono max-w-xs mx-auto mb-8 leading-relaxed border-b border-red-500/10 pb-4">{error}</p>
                    
                    <button 
                        onClick={() => setRetryTrigger(prev => prev + 1)}
                        className="px-6 py-2 bg-red-900/30 hover:bg-red-900/50 text-red-300 text-[10px] font-bold uppercase tracking-widest border border-red-500/30 rounded transition-all hover:shadow-[0_0_15px_rgba(239,68,68,0.2)] hover:border-red-400"
                    >
                        Re-establish Uplink
                    </button>
                </div>
            </div>
          ) : (
            <>
                <div id="news-grid" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pb-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
                    {articles.map(article => (
                    <ArticleCard
                        key={article.id}
                        article={article}
                        onDecode={handleDecodeClick}
                        isDecoding={decodingId === article.id}
                    />
                    ))}
                </div>

                {/* Pagination Controls */}
                {articles.length > 0 && (
                    <div className="flex justify-center items-center gap-8 mb-24 pt-8 border-t border-white/5">
                        <button 
                            onClick={() => handlePageChange(page - 1)}
                            disabled={page === 1}
                            className="group flex items-center gap-2 text-xs font-bold uppercase tracking-widest px-4 py-2 rounded-lg transition-all disabled:opacity-30 disabled:cursor-not-allowed hover:bg-zinc-800 text-zinc-400 hover:text-white"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 group-hover:-translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                            </svg>
                            Previous
                        </button>

                        <div className="flex items-center gap-4 bg-zinc-900/50 px-6 py-2 rounded-full border border-white/5">
                            <span className="text-[10px] text-zinc-500 font-mono">SECTOR</span>
                            <span className="text-xl font-bold text-emerald-500 font-mono">{page.toString().padStart(2, '0')}</span>
                        </div>

                        <button 
                            onClick={() => handlePageChange(page + 1)}
                            // Disable next if we have fewer than 15 results, implying end of list
                            disabled={articles.length < 15}
                            className="group flex items-center gap-2 text-xs font-bold uppercase tracking-widest px-4 py-2 rounded-lg transition-all disabled:opacity-30 disabled:cursor-not-allowed hover:bg-zinc-800 text-zinc-400 hover:text-white"
                        >
                            Next
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                            </svg>
                        </button>
                    </div>
                )}
            </>
          )
      )}
      
      {activeTab === 'stream' && !isLoading && !error && articles.length === 0 && (
        <div className="text-center py-32 opacity-40">
            <h3 className="text-zinc-400 text-lg font-light mb-2">No Reports Found</h3>
            <p className="text-zinc-600 text-xs font-mono uppercase tracking-wide">Adjust parameters to acquire new targets</p>
        </div>
      )}
    </div>
  );
};
