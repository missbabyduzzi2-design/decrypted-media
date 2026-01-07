
import React, { useState, useEffect, useRef } from 'react';
import ReactDOM from 'react-dom';

interface NotesProps {
  storageKey: string;
  title?: string;
}

export const Notes: React.FC<NotesProps> = ({ storageKey, title = "Field Notes" }) => {
  const [notes, setNotes] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    try {
      const savedNotes = localStorage.getItem(storageKey);
      if (savedNotes) {
        setNotes(savedNotes);
      }
    } catch (error) {
      console.error("Failed to read from localStorage", error);
    }
  }, [storageKey]);

  useEffect(() => {
    const handler = setTimeout(() => {
      try {
        if (notes) {
          localStorage.setItem(storageKey, notes);
        } else {
          localStorage.removeItem(storageKey);
        }
      } catch (error) {
        console.error("Failed to write to localStorage", error);
      }
    }, 500);

    return () => {
      clearTimeout(handler);
    };
  }, [notes, storageKey]);

  useEffect(() => {
    if (isOpen && textareaRef.current) {
        textareaRef.current.focus();
    }
  }, [isOpen]);

  // Handle escape key to close
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
        if (e.key === 'Escape') setIsOpen(false);
    };
    if (isOpen) window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [isOpen]);

  return (
    <>
      <div className="mt-6 pt-4 border-t border-white/5 flex justify-end">
        <button 
            onClick={() => setIsOpen(true)}
            className="group flex items-center gap-2 text-xs font-bold text-zinc-500 hover:text-emerald-400 transition-colors bg-zinc-900/50 px-3 py-2 rounded border border-white/5 hover:border-emerald-500/30 hover:bg-zinc-900"
        >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
            <span>OPEN FIELD NOTES</span>
            {notes.length > 0 && (
                <span className="flex h-2 w-2 rounded-full bg-emerald-500 ml-1"></span>
            )}
        </button>
      </div>

      {isOpen && ReactDOM.createPortal(
        <div className="fixed inset-0 z-[100] flex justify-end pointer-events-none">
            {/* Backdrop */}
            <div 
                className="absolute inset-0 bg-black/60 backdrop-blur-sm pointer-events-auto animate-in fade-in duration-300"
                onClick={() => setIsOpen(false)}
            ></div>

            {/* Drawer */}
            <div className="relative w-full max-w-md h-full bg-zinc-950 border-l border-white/10 shadow-2xl pointer-events-auto animate-in slide-in-from-right duration-300 flex flex-col">
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 bg-zinc-900/50">
                    <div>
                        <h3 className="text-sm font-bold text-emerald-500 uppercase tracking-wider font-mono flex items-center gap-2">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" clipRule="evenodd" />
                            </svg>
                            {title}
                        </h3>
                        <p className="text-[10px] text-zinc-500 mt-0.5 uppercase tracking-wide">Confidential Analyst Log</p>
                    </div>
                    <button 
                        onClick={() => setIsOpen(false)}
                        className="p-2 text-zinc-500 hover:text-white hover:bg-white/5 rounded transition-colors"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                {/* Editor Area */}
                <div className="flex-1 relative bg-zinc-950">
                    {/* Lined paper effect background */}
                    <div className="absolute inset-0 pointer-events-none opacity-5" 
                        style={{
                            backgroundImage: 'linear-gradient(transparent 95%, #3f3f46 95%)',
                            backgroundSize: '100% 2rem'
                        }}
                    ></div>
                    
                    <textarea
                        ref={textareaRef}
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        placeholder="Record observations, synchronicities, and anomalies..."
                        className="w-full h-full bg-transparent p-6 text-zinc-300 font-mono text-sm leading-[2rem] focus:outline-none resize-none scrollbar-thin scrollbar-thumb-zinc-800 scrollbar-track-transparent"
                        spellCheck={false}
                    />
                </div>

                {/* Footer */}
                <div className="px-6 py-3 bg-zinc-900/80 border-t border-white/10 flex justify-between items-center text-[10px] text-zinc-500 font-mono uppercase">
                    <span>STATUS: {notes ? 'Active' : 'Empty'}</span>
                    <span>Length: {notes.length} chars</span>
                </div>
            </div>
        </div>,
        document.body
      )}
    </>
  );
};
