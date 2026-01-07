
import React from 'react';
import { DECODER_SECTIONS } from '../../constants';

interface DecoderCommandBarProps {
  activeSection: string;
  onNavigate: (sectionId: string) => void;
}

export const DecoderCommandBar: React.FC<DecoderCommandBarProps> = ({ activeSection, onNavigate }) => {
  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 flex flex-col items-center">
      {/* HUD Decoration Line */}
      <div className="w-[120%] h-px bg-gradient-to-r from-transparent via-emerald-500/20 to-transparent mb-2"></div>
      
      <nav className="flex items-center gap-1 p-1.5 bg-[#050505]/80 backdrop-blur-2xl border border-white/10 rounded-2xl shadow-[0_0_30px_rgba(0,0,0,0.5)] ring-1 ring-white/5 overflow-hidden relative">
        {/* Glass Reflection */}
        <div className="absolute inset-0 bg-gradient-to-b from-white/5 to-transparent pointer-events-none"></div>

        {DECODER_SECTIONS.map((section, index) => {
          const isActive = activeSection === section.id;
          
          // Icons based on section ID
          const getIcon = () => {
             switch(section.id) {
                 case 'full-article': return <path d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />;
                 case 'intelligence-briefing': return <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />;
                 case 'entity-enrichment': return <path d="M13 10V3L4 14h7v7l9-11h-7z" />;
                 case 'etymology-analysis': return <path d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />;
                 case 'symbolic-analysis': return <path d="M15 12a3 3 0 11-6 0 3 3 0 016 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />;
                 case 'qliphoth-analysis': return <path d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z" fillRule="evenodd" clipRule="evenodd" />;
                 case 'numerology-chronology': return <path d="M7 20l4-16m2 16l4-16M6 9h14M4 15h14" />;
                 case 'cosmic-analysis': return <path d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />;
                 case 'ai-interpretation': return <path d="M19.428 15.428a2 2 0 00-1.022-.547l-2.384-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />;
                 default: return <circle cx="12" cy="12" r="10" />;
             }
          };

          return (
            <a
              key={section.id}
              href={`#${section.id}`}
              onClick={(e) => {
                e.preventDefault();
                onNavigate(section.id);
                document.getElementById(section.id)?.scrollIntoView({ behavior: 'smooth', block: 'center' });
              }}
              className={`relative group flex flex-col items-center justify-center w-12 h-12 md:w-16 md:h-16 rounded-xl transition-all duration-300 ${
                  isActive ? 'bg-zinc-800 shadow-[inset_0_1px_1px_rgba(255,255,255,0.1)]' : 'hover:bg-zinc-800/50'
              }`}
            >
              <div className={`transition-all duration-300 ${isActive ? 'scale-110 -translate-y-1' : 'group-hover:-translate-y-0.5'}`}>
                  <svg 
                    xmlns="http://www.w3.org/2000/svg" 
                    className={`h-5 w-5 md:h-6 md:w-6 transition-colors duration-300 ${isActive ? 'text-emerald-400 drop-shadow-[0_0_5px_rgba(16,185,129,0.8)]' : 'text-zinc-500 group-hover:text-zinc-300'}`} 
                    fill="none" 
                    viewBox="0 0 24 24" 
                    stroke="currentColor" 
                    strokeWidth={isActive ? 2 : 1.5}
                    strokeLinecap="round" 
                    strokeLinejoin="round"
                  >
                    {getIcon()}
                  </svg>
              </div>
              
              {/* Active Dot */}
              {isActive && (
                  <span className="absolute bottom-2 w-1 h-1 bg-emerald-500 rounded-full shadow-[0_0_5px_#10b981]"></span>
              )}

              {/* Tooltip */}
              <div className="absolute bottom-full mb-4 opacity-0 group-hover:opacity-100 transition-all duration-200 pointer-events-none transform translate-y-2 group-hover:translate-y-0">
                  <div className="bg-zinc-900 border border-white/10 px-3 py-1.5 rounded-lg shadow-xl backdrop-blur text-center">
                      <p className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest whitespace-nowrap">{section.title}</p>
                  </div>
                  <div className="w-2 h-2 bg-zinc-900 border-b border-r border-white/10 rotate-45 mx-auto -mt-1"></div>
              </div>
            </a>
          );
        })}
      </nav>
    </div>
  );
};
