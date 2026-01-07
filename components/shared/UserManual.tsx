
import React from 'react';

interface UserManualProps {
  isOpen: boolean;
  onToggle: () => void;
  onStartTour?: () => void;
}

export const UserManual: React.FC<UserManualProps> = ({ isOpen, onToggle, onStartTour }) => {
  return (
    <>
      {/* Tab Button */}
      <button
        id="manual-toggle-btn"
        onClick={onToggle}
        className={`fixed right-0 top-[35%] -translate-y-1/2 z-[60] py-8 px-1.5 flex flex-col items-center gap-6 transition-all duration-500 cubic-bezier(0.16, 1, 0.3, 1) rounded-l-lg border-l border-y border-white/10 shadow-xl group ${
            isOpen 
            ? 'translate-x-[-350px] bg-[#0c0c0e] border-emerald-500/20' 
            : 'translate-x-0 bg-zinc-900/90 backdrop-blur-md hover:bg-zinc-800 hover:border-emerald-500/40 hover:shadow-[0_0_20px_rgba(0,0,0,0.4)]'
        }`}
      >
         <span className="text-[9px] font-mono font-bold uppercase tracking-[0.3em] [writing-mode:vertical-rl] rotate-180 text-zinc-500 group-hover:text-emerald-400 transition-colors">
            Analyst Guide
         </span>
         <div className={`w-1 h-1 rounded-full transition-all duration-300 ${isOpen ? 'bg-emerald-500 animate-pulse shadow-[0_0_8px_#10b981]' : 'bg-zinc-700'}`}></div>
         <svg xmlns="http://www.w3.org/2000/svg" className={`h-3 w-3 text-zinc-500 group-hover:text-white transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
         </svg>
      </button>

      {/* Drawer */}
      <div className={`fixed right-0 top-0 bottom-0 w-[350px] bg-[#0c0c0e]/95 border-l border-white/10 shadow-[0_0_50px_rgba(0,0,0,0.8)] z-[55] transform transition-transform duration-500 cubic-bezier(0.16, 1, 0.3, 1) flex flex-col backdrop-blur-md ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}>
         
         <div className="p-5 border-b border-white/5 bg-zinc-900/50">
            <h2 className="text-xs font-bold text-zinc-100 uppercase tracking-[0.2em] flex items-center gap-3">
                <div className="w-6 h-6 rounded bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-500">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                </div>
                Analyst Guide
            </h2>
            <div className="flex justify-between items-center mt-4 px-1">
                <span className="text-[9px] text-zinc-600 font-mono tracking-wider">SYSTEM V2.6</span>
                <span className="text-[9px] text-emerald-500 font-mono tracking-wider flex items-center gap-1.5">
                    <span className="w-1 h-1 bg-emerald-500 rounded-full animate-pulse"></span>
                    READY
                </span>
            </div>
         </div>

         <div className="flex-1 overflow-y-auto p-5 space-y-8 scrollbar-thin scrollbar-thumb-zinc-800 scrollbar-track-transparent">
            
            {/* Quick Start & Interactive Tour */}
            <div className="bg-emerald-900/10 border border-emerald-500/20 p-4 rounded-lg space-y-4">
              <div>
                  <h3 className="text-emerald-400 font-bold text-xs mb-2 uppercase tracking-widest">System Orientation</h3>
                  <p className="text-zinc-400 text-[10px] leading-relaxed">
                    Welcome, Analyst. This interface is designed to decode hidden patterns in news media.
                  </p>
              </div>
              {onStartTour && (
                  <button 
                    onClick={onStartTour}
                    className="w-full py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-[10px] font-bold uppercase tracking-widest rounded transition-all shadow-lg flex items-center justify-center gap-2"
                  >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" viewBox="0 0 20 20" fill="currentColor">
                          <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                          <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
                      </svg>
                      Start Interactive Tour
                  </button>
              )}
            </div>

            {/* Phase 1 */}
            <section>
              <div className="flex items-center gap-2 mb-3 border-b border-white/5 pb-2">
                <span className="bg-zinc-800 text-zinc-400 px-1.5 py-0.5 rounded text-[9px] font-mono">01</span>
                <h4 className="text-zinc-100 font-bold uppercase text-xs tracking-wide">Target Acquisition</h4>
              </div>
              <div className="space-y-4 pl-2 text-xs">
                <div>
                  <h5 className="text-white font-bold mb-1 flex items-center gap-2"><span className="w-1 h-1 bg-emerald-500 rounded-full"></span> Choose Source</h5>
                  <p className="mb-2 text-zinc-500 text-[10px]">You have two ways to begin:</p>
                  <ul className="space-y-2 text-zinc-400 text-[10px]">
                    <li className="flex gap-2">
                        <strong className="text-zinc-300 bg-zinc-800/50 px-1 rounded">Intercept Stream</strong>
                        <span>Browse live news. Use the search bar for topics like "Election" or "Eclipse".</span>
                    </li>
                    <li className="flex gap-2">
                        <strong className="text-zinc-300 bg-zinc-800/50 px-1 rounded">Manual Uplink</strong>
                        <span>Paste a specific URL or raw text if you have a custom story to analyze.</span>
                    </li>
                  </ul>
                </div>
              </div>
            </section>

            {/* Phase 2 */}
            <section>
              <div className="flex items-center gap-2 mb-3 border-b border-white/5 pb-2">
                <span className="bg-zinc-800 text-zinc-400 px-1.5 py-0.5 rounded text-[9px] font-mono">02</span>
                <h4 className="text-zinc-100 font-bold uppercase text-xs tracking-wide">Analysis Tools</h4>
              </div>
              
              <div className="space-y-5 pl-2 text-xs">
                
                <div className="group">
                    <strong className="text-emerald-400 text-[10px] uppercase tracking-wider mb-1 block">A. Source Text</strong>
                    <p className="text-zinc-500 text-[10px] mb-1">Interact directly with the article.</p>
                    <div className="bg-zinc-900/30 p-2 rounded border border-zinc-800">
                        <span className="text-zinc-300 font-bold">Try This:</span> <span className="text-zinc-400">Highlight any text with your mouse. A popup will instantly show its Gematria values. Click "Save to Notebook" to keep it.</span>
                    </div>
                </div>

                <div className="group">
                    <strong className="text-emerald-400 text-[10px] uppercase tracking-wider mb-1 block">B. Intelligence Briefing</strong>
                    <p className="text-zinc-500 text-[10px] mb-1">Visualizes people and connections.</p>
                    <ul className="space-y-1 text-zinc-400 text-[10px]">
                        <li>• Switch between <span className="text-white bg-zinc-800 px-1 rounded">List</span> and <span className="text-white bg-zinc-800 px-1 rounded">Graph</span> views.</li>
                        <li>• Click any node (circle) to open its full dossier.</li>
                        <li>• Use <span className="text-white bg-zinc-800 px-1 rounded">Deep Scan</span> if you need more entities found.</li>
                    </ul>
                </div>

                <div className="group">
                    <strong className="text-emerald-400 text-[10px] uppercase tracking-wider mb-1 block">C. Numerology Matrix</strong>
                    <p className="text-zinc-500 text-[10px] mb-1">The core decoding engine.</p>
                    <ul className="space-y-1 text-zinc-400 text-[10px]">
                        <li>• <span className="text-zinc-300 font-bold">Table / Cards:</span> Toggle between a compact list view and detailed breakdown cards.</li>
                        <li>• <span className="text-zinc-300 font-bold">DB (Database):</span> Connects to the master Gematria database. When active, click any number to see what other words share that value.</li>
                        <li>• <span className="text-zinc-300 font-bold">Settings (Gear):</span> Customize which ciphers (Ordinal, Chaldean, etc.) are displayed in the matrix.</li>
                        <li>• <span className="text-zinc-300 font-bold">Quick Decode:</span> Type words in the top box to calculate them on the fly.</li>
                    </ul>
                </div>

                <div className="group">
                    <strong className="text-emerald-400 text-[10px] uppercase tracking-wider mb-1 block">D. Cosmic Dashboard</strong>
                    <p className="text-zinc-500 text-[10px] mb-1">Astrological correlations.</p>
                    <ul className="space-y-1 text-zinc-400 text-[10px]">
                        <li>• Click a planet on the <span className="text-white bg-zinc-800 px-1 rounded">Astro Wheel</span> to highlight its mention in the analysis.</li>
                        <li>• Check the <span className="text-white bg-zinc-800 px-1 rounded">Predictive Calendar</span> at the bottom for future dates to watch based on +33, +88 day cycles.</li>
                    </ul>
                </div>

              </div>
            </section>

            {/* Phase 3 */}
            <section>
              <div className="flex items-center gap-2 mb-3 border-b border-white/5 pb-2">
                <span className="bg-zinc-800 text-zinc-400 px-1.5 py-0.5 rounded text-[9px] font-mono">03</span>
                <h4 className="text-zinc-100 font-bold uppercase text-xs tracking-wide">Synthesis & Export</h4>
              </div>
              <div className="space-y-4 pl-2 text-xs">
                <div>
                    <h5 className="text-white font-bold mb-1">AI Analyst Chat</h5>
                    <p className="text-zinc-400 text-[10px] leading-relaxed">
                        Found in the bottom-right corner. Ask it questions like: <em className="text-zinc-500">"Is this date a holiday?"</em> or <em className="text-zinc-500">"What is the CEO's background?"</em> It can search the web for you.
                    </p>
                </div>
                <div>
                    <h5 className="text-white font-bold mb-1">The Notebook</h5>
                    <p className="text-zinc-400 text-[10px] leading-relaxed mb-2">
                        Located on the right edge. As you analyze, click the small <svg className="w-3 h-3 inline text-zinc-500" viewBox="0 0 20 20" fill="currentColor"><path d="M5 4a2 2 0 012-2h6a2 2 0 012 2v14l-5-2.5L5 18V4z" /></svg> save icons on any card.
                    </p>
                    <ul className="space-y-1 text-zinc-400 text-[10px]">
                        <li>1. Collect evidence.</li>
                        <li>2. Open Notebook to review.</li>
                        <li>3. Click <span className="text-emerald-400 font-bold">EXPORT DATA</span> (top right) to download your full report.</li>
                    </ul>
                </div>
              </div>
            </section>

         </div>
      </div>
    </>
  );
};
