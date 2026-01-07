import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  title?: string;
  headerContent?: React.ReactNode;
}

export const Card: React.FC<CardProps> = ({ children, className = '', title, headerContent }) => {
  const hasHeader = title || headerContent;

  return (
    <div className={`relative group ${className}`}>
      {/* Holographic Border Structure */}
      <div className="absolute inset-0 bg-[#050505]/80 backdrop-blur-xl border border-white/5 shadow-2xl transition-all duration-500 group-hover:border-emerald-500/30 group-hover:bg-[#08080a]/90 clip-path-polygon"></div>
      
      {/* Scanner Line Effect */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none rounded-sm">
        <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-emerald-500/20 to-transparent -translate-x-full animate-[scan_4s_linear_infinite]"></div>
      </div>

      {/* Tech Corners (SVG Overlay) */}
      <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-40 group-hover:opacity-100 transition-opacity duration-500 text-emerald-500" width="100%" height="100%">
        <path d="M1 10V1H10" fill="none" stroke="currentColor" strokeWidth="1" />
        <path d="M100% 10V1Hcalc(100% - 10px)" fill="none" stroke="currentColor" strokeWidth="1" transform="translate(0, 0) scale(-1, 1)" style={{ transformOrigin: 'top right' }} />
        <path d="M1 100%Vcalc(100% - 10px)H10" fill="none" stroke="currentColor" strokeWidth="1" transform="translate(0, 0) scale(1, -1)" style={{ transformOrigin: 'bottom left' }} />
        <path d="M100% 100%Vcalc(100% - 10px)Hcalc(100% - 10px)" fill="none" stroke="currentColor" strokeWidth="1" transform="translate(0, 0) scale(-1, -1)" style={{ transformOrigin: 'bottom right' }} />
      </svg>

      <div className="relative z-10 flex flex-col h-auto min-h-full">
        {hasHeader && (
          <div className="flex justify-between items-center px-6 py-4 border-b border-white/5 bg-gradient-to-r from-white/[0.02] to-transparent">
            {title && (
              <div className="flex items-center gap-3">
                 {/* Animated Data Square */}
                <div className="w-2 h-2 bg-emerald-500/20 border border-emerald-500/50 flex items-center justify-center">
                    <div className="w-1 h-1 bg-emerald-400 rounded-full animate-pulse"></div>
                </div>
                <h3 className="text-xs font-bold text-emerald-100 uppercase tracking-[0.2em] font-heading drop-shadow-[0_0_5px_rgba(16,185,129,0.3)]">
                    {title}
                </h3>
              </div>
            )}
            {headerContent && <div>{headerContent}</div>}
          </div>
        )}
        <div className="p-6 flex-1">
          {children}
        </div>
      </div>
    </div>
  );
};