import React from 'react';
import { DECODER_SECTIONS } from '../../constants';

interface DecoderSidebarProps {
  activeSection: string;
}

export const DecoderSidebar: React.FC<DecoderSidebarProps> = ({ activeSection }) => {
  return (
    <nav className="sticky top-24 pr-4 pl-2">
      <div className="mb-6 pl-4 border-l-2 border-transparent">
        <h3 className="text-[9px] font-bold text-zinc-500 uppercase tracking-[0.3em] mb-1">Sequence</h3>
        <p className="text-[10px] font-mono text-emerald-500/80">ANALYSIS FLOW</p>
      </div>
      
      <ul className="space-y-1 relative">
        {/* Continuous Line Background */}
        <div className="absolute left-[19px] top-2 bottom-2 w-px bg-zinc-800/50 -z-10"></div>
        
        {DECODER_SECTIONS.map((section, index) => {
          const isActive = activeSection === section.id;
          return (
            <li key={section.id} className="relative group">
              <a
                href={`#${section.id}`}
                onClick={(e) => {
                  e.preventDefault();
                  document.getElementById(section.id)?.scrollIntoView({ behavior: 'smooth' });
                }}
                className={`flex items-center py-2 px-3 rounded-md transition-all duration-300 group ${
                  isActive
                    ? 'bg-zinc-800/40 translate-x-1'
                    : 'hover:bg-zinc-800/20 hover:translate-x-0.5'
                }`}
              >
                <div className={`w-2 h-2 rounded-full mr-4 border transition-all duration-300 relative z-10 ${
                    isActive 
                    ? 'bg-emerald-500 border-emerald-400 shadow-[0_0_8px_#10b981]' 
                    : 'bg-[#050505] border-zinc-700 group-hover:border-zinc-500'
                }`}></div>
                
                <span className={`text-[10px] tracking-widest uppercase font-medium transition-colors duration-300 ${
                  isActive ? 'text-emerald-400' : 'text-zinc-500 group-hover:text-zinc-300'
                }`}>
                  <span className={`mr-2 font-mono text-[9px] opacity-50 ${isActive ? 'text-emerald-500' : ''}`}>0{index + 1}</span>
                  {section.title}
                </span>
              </a>
            </li>
          );
        })}
      </ul>
      
      <div className="mt-8 ml-3 p-3 rounded bg-zinc-900/30 border border-white/5 backdrop-blur-sm">
        <div className="flex items-center gap-2 text-[9px] text-zinc-500 font-mono mb-1.5">
            <span className="w-1 h-1 rounded-full bg-emerald-500 animate-pulse"></span>
            SYSTEM ACTIVE
        </div>
        <div className="h-0.5 w-full bg-zinc-800 rounded-full overflow-hidden">
            <div className="h-full bg-emerald-500/50 w-2/3 animate-[shimmer_2s_infinite]"></div>
        </div>
      </div>
    </nav>
  );
};