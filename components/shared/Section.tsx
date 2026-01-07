
import React, { useEffect } from 'react';

interface SectionProps {
  id: string;
  title: string;
  children: React.ReactNode;
  refProp: React.RefObject<HTMLDivElement>;
  onStartTour?: () => void;
  onVisible?: (id: string) => void;
}

export const Section: React.FC<SectionProps> = ({ id, title, children, refProp, onStartTour, onVisible }) => {
  useEffect(() => {
    if (!onVisible) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            onVisible(id);
          }
        });
      },
      {
        // Trigger when the element crosses the middle area of the viewport
        rootMargin: '-20% 0px -60% 0px',
        threshold: 0
      }
    );

    const element = refProp.current;
    if (element) {
      observer.observe(element);
    }

    return () => {
      if (element) {
        observer.unobserve(element);
      }
    };
  }, [id, onVisible, refProp]);

  return (
    <section id={id} ref={refProp} className="mb-24 scroll-mt-24">
      {/* Decrypted File Header Style */}
      <div className="flex items-end gap-4 mb-8 relative py-4 z-10 pointer-events-none">
        <div className="flex flex-col gap-1">
             <div className="flex items-center gap-3">
                <h2 className="text-3xl md:text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-emerald-100 to-zinc-500 font-heading uppercase tracking-wide drop-shadow-sm">
                    {title}
                </h2>
                {onStartTour && (
                    <button
                        onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            onStartTour();
                        }}
                        className="pointer-events-auto text-zinc-600 hover:text-emerald-400 transition-all p-1.5 rounded-full hover:bg-emerald-500/10 active:scale-95 group"
                        title="Start Guided Tour"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 group-hover:animate-pulse" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                    </button>
                )}
             </div>
        </div>
        <div className="flex-1 h-px bg-gradient-to-r from-emerald-500/50 via-zinc-800 to-transparent mb-2 relative">
             <div className="absolute right-0 top-1/2 -translate-y-1/2 flex gap-1">
                 <div className="w-1 h-1 bg-zinc-700 rounded-full"></div>
                 <div className="w-1 h-1 bg-zinc-700 rounded-full"></div>
                 <div className="w-1 h-1 bg-zinc-700 rounded-full"></div>
             </div>
        </div>
      </div>
      <div className="px-1 relative">
        {/* Subtle grid line connecting sections */}
        <div className="absolute left-[-20px] top-0 bottom-0 w-px bg-gradient-to-b from-transparent via-emerald-500/10 to-transparent hidden xl:block"></div>
        {children}
      </div>
    </section>
  );
};
