
import React, { useEffect } from 'react';
import ReactDOM from 'react-dom';
import { Card } from './Card';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}

export const Modal: React.FC<ModalProps> = ({ isOpen, onClose, title, children }) => {
  useEffect(() => {
    const handleEsc = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleEsc);
    return () => {
      window.removeEventListener('keydown', handleEsc);
    };
  }, [onClose]);

  if (!isOpen) return null;

  return ReactDOM.createPortal(
    <div
      className="fixed inset-0 bg-zinc-950/80 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
    >
      <div className="w-full max-w-2xl animate-in zoom-in-95 duration-200 max-h-[90vh] flex flex-col" onClick={e => e.stopPropagation()}>
        <Card
          className="border-white/10 shadow-2xl ring-1 ring-white/5 flex flex-col overflow-hidden bg-[#09090b]"
          headerContent={
            <div className="flex justify-between items-center w-full">
              <h2 id="modal-title" className="text-lg font-bold text-zinc-100">{title}</h2>
              <button
                onClick={onClose}
                className="text-zinc-500 hover:text-zinc-200 transition-colors"
                aria-label="Close modal"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          }
        >
          <div className="overflow-y-auto max-h-[calc(85vh-100px)] pr-2 scrollbar-thin scrollbar-thumb-zinc-800 scrollbar-track-transparent">
            {children}
          </div>
        </Card>
      </div>
    </div>,
    document.body
  );
};
