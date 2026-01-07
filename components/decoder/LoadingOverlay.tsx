import React, { useEffect, useRef, useState } from 'react';
import { LoadingSpinner } from '../shared/LoadingSpinner';

const SYSTEM_LOGS = [
  'INITIALIZING SECURE HANDSHAKE...',
  'RESOLVING PROXY CHAINS...',
  'ACCESSING GEMINI NEURAL NET...',
  'ALLOCATING QUANTUM BUFFERS...',
  'BYPASSING COGNITIVE FILTERS...',
  'SCANNING AKASHIC RECORDS...',
  'TRIANGULATING PLANETARY POSITIONS...',
  'CALCULATING GEMATRIA VECTORS...',
  'DECRYPTING HIDDEN NARRATIVES...',
  'SYNCHRONIZING TIMELINES...',
  'DETECTING SYNCHRONICITIES...',
  'PARSING ESOTERIC SYMBOLOGY...',
  'COMPILING INTELLIGENCE DOSSIER...',
  'OPTIMIZING OUTPUT STREAMS...',
  'ESTABLISHING UPLINK...',
  'VERIFYING CHECKSUMS...',
  'RENDERING HOLOGRAPHIC DATA...',
];

interface LoadingOverlayProps {
  progressMessage: string;
}

export const LoadingOverlay: React.FC<LoadingOverlayProps> = ({ progressMessage }) => {
  const [logs, setLogs] = useState<string[]>([]);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Initial logs
    setLogs(['> SYSTEM BOOT_SEQUENCE_INIT']);

    let logIndex = 0;
    const interval = setInterval(() => {
      if (logIndex < SYSTEM_LOGS.length) {
        const timestamp = new Date().toISOString().split('T')[1].slice(0, 8);
        const newLog = `[${timestamp}] ${SYSTEM_LOGS[logIndex]}`;
        
        setLogs(prev => {
           const updated = [...prev, newLog];
           // Keep only last 12 lines to prevent overflow issues visually
           return updated.slice(-12);
        });
        
        logIndex++;
      } else {
         setLogs(prev => [...prev.slice(-11), `> AWAITING SERVER RESPONSE...`]);
      }
    }, 150);

    return () => clearInterval(interval);
  }, []);

  // Auto-scroll to bottom
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [logs]);

  return (
    <div className="fixed inset-0 bg-black/95 backdrop-blur-xl flex flex-col items-center justify-center z-50 font-mono">
      <div className="w-full max-w-lg relative px-4">
        {/* Terminal Window */}
        <div className="bg-[#0c0c0e] border border-emerald-500/30 rounded-lg shadow-[0_0_50px_rgba(16,185,129,0.1)] overflow-hidden relative">
            
            {/* Terminal Header */}
            <div className="px-4 py-2 bg-zinc-900 border-b border-emerald-500/20 flex justify-between items-center">
                <div className="flex gap-2">
                    <div className="w-2.5 h-2.5 rounded-full bg-red-500/50"></div>
                    <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/50"></div>
                    <div className="w-2.5 h-2.5 rounded-full bg-emerald-500/50"></div>
                </div>
                <div className="text-[10px] text-emerald-500/70 tracking-widest uppercase">
                    SECURE_CONNECTION // {progressMessage.split(' ')[0]}...
                </div>
            </div>

            {/* Terminal Body */}
            <div 
                ref={scrollRef}
                className="p-6 h-64 overflow-y-auto font-mono text-xs md:text-sm text-emerald-500/90 space-y-1 relative"
            >
                {/* Scanline Effect */}
                <div className="absolute inset-0 pointer-events-none bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] z-10 bg-[length:100%_2px,3px_100%]"></div>
                
                {logs.map((log, i) => (
                    <div key={i} className="break-all opacity-90 animate-in fade-in slide-in-from-left-2 duration-100">
                        {log}
                    </div>
                ))}
                <div className="animate-pulse text-emerald-400">_</div>
            </div>
            
            {/* Footer */}
            <div className="p-2 border-t border-emerald-500/20 bg-emerald-900/10 flex justify-between items-center">
                 <div className="flex items-center gap-2">
                    <LoadingSpinner small />
                    <span className="text-[10px] text-emerald-400 animate-pulse uppercase tracking-wider">
                        {progressMessage}
                    </span>
                 </div>
                 <div className="text-[9px] text-emerald-600">
                     CPU: {Math.floor(Math.random() * 30 + 40)}%
                 </div>
            </div>
        </div>
      </div>
    </div>
  );
};