
import React, { useState, useEffect, useRef, useCallback } from 'react';
import ReactDOM from 'react-dom';

export interface TourStep {
  targetId: string;
  title: string;
  content: string;
  position?: 'top' | 'bottom' | 'left' | 'right';
}

interface OnboardingTourProps {
  isActive: boolean;
  onClose: () => void;
  steps: TourStep[];
}

export const OnboardingTour: React.FC<OnboardingTourProps> = ({ isActive, onClose, steps }) => {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [spotlightStyle, setSpotlightStyle] = useState<React.CSSProperties>({});
  const [tooltipStyle, setTooltipStyle] = useState<React.CSSProperties>({});
  const [showOverlay, setShowOverlay] = useState(false);
  const rafRef = useRef<number | null>(null);

  // Helper to calculate positions
  const calculatePosition = useCallback(() => {
    const step = steps[currentStepIndex];
    if (!step) return;

    const element = document.getElementById(step.targetId);
    
    // Fallback if element not found (e.g. loading)
    if (!element) {
        // Position generic modal in center if target missing
        const viewportWidth = window.innerWidth;
        const viewportHeight = window.innerHeight;
        
        setSpotlightStyle({ 
            opacity: 0,
            top: viewportHeight / 2,
            left: viewportWidth / 2,
            width: 0,
            height: 0
        });
        
        setTooltipStyle({ 
            top: viewportHeight / 2 - 100, 
            left: viewportWidth / 2 - 160, 
            width: 320,
            opacity: 1 
        });
        setShowOverlay(true);
        return;
    }

    const rect = element.getBoundingClientRect();
    const padding = 10;
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;

    // Spotlight Box (Fixed Position)
    const spotTop = rect.top - padding;
    const spotLeft = rect.left - padding;
    const spotWidth = rect.width + (padding * 2);
    const spotHeight = rect.height + (padding * 2);

    setSpotlightStyle({
        top: spotTop,
        left: spotLeft,
        width: spotWidth,
        height: spotHeight,
        opacity: 1
    });

    // Tooltip Box
    const tooltipWidth = 320;
    const tooltipHeightGuess = 200; // Approx
    const gap = 20;

    let toolTop = 0;
    let toolLeft = 0;

    // Helper: Horizontal Center
    const centerH = rect.left + (rect.width / 2) - (tooltipWidth / 2);
    
    // Basic Positioning Logic
    switch (step.position) {
        case 'top':
            toolTop = rect.top - gap - tooltipHeightGuess; // This might need adjustment after render
            toolLeft = centerH;
            break;
        case 'left':
            toolTop = rect.top;
            toolLeft = rect.left - tooltipWidth - gap;
            break;
        case 'right':
            toolTop = rect.top;
            toolLeft = rect.right + gap;
            break;
        case 'bottom':
        default:
            toolTop = rect.bottom + gap;
            toolLeft = centerH;
            break;
    }

    // Boundary Constraints (Keep on screen)
    if (toolLeft < 10) toolLeft = 10;
    if (toolLeft + tooltipWidth > viewportWidth - 10) toolLeft = viewportWidth - tooltipWidth - 10;
    
    // Vertical Clamp - prioritize visibility
    if (toolTop < 10) toolTop = 10;
    if (toolTop > viewportHeight - 150) toolTop = viewportHeight - 200; 

    // Dynamic Flip if too close to bottom for 'bottom' position
    if (step.position === 'bottom' && toolTop + 200 > viewportHeight) {
        toolTop = rect.top - gap - 200;
    }

    setTooltipStyle({
        top: toolTop,
        left: toolLeft,
        width: tooltipWidth,
        opacity: 1,
        transform: 'translateY(0)'
    });
    
    setShowOverlay(true);

  }, [currentStepIndex, steps]);

  // Initial Scroll & Setup
  useEffect(() => {
    if (!isActive) {
        setShowOverlay(false);
        return;
    }

    const step = steps[currentStepIndex];
    if (!step) return;

    // Hide initially to allow scroll without seeing jump
    setShowOverlay(false);

    // Give time for modal/dom to settle
    const timer = setTimeout(() => {
        const element = document.getElementById(step.targetId);
        if (element) {
            const rect = element.getBoundingClientRect();
            // Intelligent Scroll
            element.scrollIntoView({ 
                behavior: 'smooth', 
                block: rect.height > window.innerHeight * 0.8 ? 'start' : 'center',
                inline: 'nearest'
            });
            
            // Allow scroll to finish approx before showing
            setTimeout(calculatePosition, 500); 
        } else {
            console.warn("Tour target missing:", step.targetId);
            calculatePosition(); 
        }
    }, 100);

    return () => clearTimeout(timer);
  }, [currentStepIndex, isActive, steps, calculatePosition]);

  // Sync on Scroll/Resize
  useEffect(() => {
      if (!isActive) return;

      const handleUpdate = () => {
          if (rafRef.current) cancelAnimationFrame(rafRef.current);
          rafRef.current = requestAnimationFrame(calculatePosition);
      };

      window.addEventListener('scroll', handleUpdate, true);
      window.addEventListener('resize', handleUpdate);

      return () => {
          window.removeEventListener('scroll', handleUpdate, true);
          window.removeEventListener('resize', handleUpdate);
          if (rafRef.current) cancelAnimationFrame(rafRef.current);
      };
  }, [isActive, calculatePosition]);

  const handleNext = () => {
    if (currentStepIndex < steps.length - 1) {
      setCurrentStepIndex(prev => prev + 1);
    } else {
      onClose();
    }
  };

  const handlePrev = () => {
    if (currentStepIndex > 0) {
      setCurrentStepIndex(prev => prev - 1);
    }
  };

  // Reset index on open
  useEffect(() => {
      if (isActive) setCurrentStepIndex(0);
  }, [isActive]);

  if (!isActive) return null;

  const currentStep = steps[currentStepIndex];
  const progress = ((currentStepIndex + 1) / steps.length) * 100;

  return ReactDOM.createPortal(
    <div className="fixed inset-0 z-[200] pointer-events-none">
      {/* 1. Backdrop using massive border width trick to create "hole" */}
      {/* We use fixed positioning to match viewport logic */}
      <div 
        className="fixed transition-all duration-500 ease-in-out"
        style={{
            ...spotlightStyle,
            boxShadow: '0 0 0 9999px rgba(0, 0, 0, 0.75)', // The Overlay
            borderRadius: '8px',
            pointerEvents: 'auto', // Capture clicks on the overlay part
            opacity: showOverlay ? 1 : 0
        }}
      >
          {/* Animated Border */}
          <div className="absolute inset-0 border-2 border-emerald-500 rounded-lg animate-pulse"></div>
          
          {/* Label */}
          <div className="absolute -top-7 left-0 bg-emerald-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-t font-mono tracking-widest whitespace-nowrap">
              STEP {currentStepIndex + 1}/{steps.length}
          </div>
      </div>

      {/* 2. Tooltip Card */}
      <div 
        className="fixed transition-all duration-500 ease-out pointer-events-auto"
        style={{
            ...tooltipStyle,
            opacity: showOverlay ? 1 : 0,
            transform: showOverlay ? 'translateY(0)' : 'translateY(10px)'
        }}
      >
        <div className="bg-[#09090b] border border-zinc-700 rounded-xl shadow-[0_10px_40px_rgba(0,0,0,0.8)] overflow-hidden flex flex-col relative ring-1 ring-white/10">
            
            {/* Progress Bar */}
            <div className="h-1 w-full bg-zinc-800">
                <div 
                    className="h-full bg-emerald-500 transition-all duration-300"
                    style={{ width: `${progress}%` }}
                ></div>
            </div>

            <div className="p-6">
                <div className="flex justify-between items-start mb-3">
                    <h3 className="text-base font-bold text-white font-heading tracking-wide">
                        {currentStep?.title}
                    </h3>
                    <button 
                        onClick={onClose} 
                        className="text-zinc-500 hover:text-white transition-colors"
                        title="End Tour"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>
                </div>
                
                <p className="text-xs text-zinc-300 leading-relaxed mb-6 border-l-2 border-emerald-500/20 pl-3">
                    {currentStep?.content}
                </p>
                
                <div className="flex justify-between items-center">
                    <div className="flex gap-2">
                        <button 
                            onClick={handlePrev} 
                            disabled={currentStepIndex === 0}
                            className="text-[10px] font-bold text-zinc-500 hover:text-zinc-300 px-3 py-2 rounded border border-zinc-800 hover:border-zinc-600 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                        >
                            PREV
                        </button>
                    </div>
                    
                    <button 
                        onClick={handleNext}
                        className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-[10px] font-bold rounded transition-all shadow-lg flex items-center gap-2"
                    >
                        {currentStepIndex === steps.length - 1 ? 'FINISH' : 'NEXT'}
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                    </button>
                </div>
            </div>
        </div>
      </div>
    </div>,
    document.body
  );
};
