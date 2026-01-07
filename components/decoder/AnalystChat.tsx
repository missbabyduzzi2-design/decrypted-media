
import React, { useState, useRef, useEffect } from 'react';
import { getChatResponse } from '../../services/geminiService';
import { LoadingSpinner } from '../shared/LoadingSpinner';
import { type ChatMessage } from '../../types';

interface AnalystChatProps {
  articleContent: string;
  isSidebarOpen?: boolean;
}

export const AnalystChat: React.FC<AnalystChatProps> = ({ articleContent, isSidebarOpen }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen]);

  const handleSend = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    try {
      const history = messages.map(m => ({
        role: m.role,
        parts: [{ text: m.content }] as [{text: string}]
      }));

      const responseText = await getChatResponse(history, userMsg.content, articleContent);

      const botMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'model',
        content: responseText,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, botMsg]);
    } catch (error) {
      console.error(error);
      const errorMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'model',
        content: "Connection interrupted. Unable to reach the analysis core.",
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const renderMessageContent = (content: string) => {
      // Basic markdown parser for links and bold text
      return content.split('\n').map((line, i) => {
          // Split by links: [text](url)
          const parts = line.split(/(\[[^\]]+\]\([^)]+\))/g);
          
          return (
              <div key={i} className="min-h-[1.2em]">
                  {parts.map((part, j) => {
                      // Check for Link
                      const linkMatch = part.match(/^\[([^\]]+)\]\(([^)]+)\)$/);
                      if (linkMatch) {
                          return (
                              <a 
                                  key={j} 
                                  href={linkMatch[2]} 
                                  target="_blank" 
                                  rel="noopener noreferrer" 
                                  className="text-emerald-400 hover:text-emerald-300 underline decoration-emerald-500/30 underline-offset-2 transition-colors break-all"
                              >
                                  {linkMatch[1]}
                              </a>
                          );
                      }
                      
                      // Check for Bold **text** within the non-link part
                      const boldParts = part.split(/(\*\*[^*]+\*\*)/g);
                      return (
                        <span key={j}>
                            {boldParts.map((subPart, k) => {
                                const boldMatch = subPart.match(/^\*\*([^*]+)\*\*$/);
                                if (boldMatch) {
                                    return <strong key={k} className="text-white font-bold">{boldMatch[1]}</strong>;
                                }
                                return subPart;
                            })}
                        </span>
                      );
                  })}
              </div>
          );
      });
  };

  const positionClass = isSidebarOpen ? 'right-[380px]' : 'right-8';

  return (
    <>
      {/* Floating Toggle Button */}
      <button
        id="chat-toggle"
        onClick={() => setIsOpen(!isOpen)}
        className={`fixed bottom-8 z-50 flex items-center justify-center w-14 h-14 rounded-full shadow-2xl transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] hover:scale-105 ${positionClass} ${
          isOpen 
            ? 'bg-zinc-900 border border-zinc-700 text-emerald-500 rotate-90' 
            : 'bg-emerald-600 border border-emerald-500/50 text-white shadow-[0_0_20px_rgba(16,185,129,0.3)]'
        }`}
      >
        {/* Pulse Ring */}
        {!isOpen && (
            <span className="absolute inset-0 rounded-full border border-emerald-400 opacity-0 animate-[ping_2s_cubic-bezier(0,0,0.2,1)_infinite]"></span>
        )}
        
        {isOpen ? (
           <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
           </svg>
        ) : (
           <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
           </svg>
        )}
      </button>

      {/* Chat Window */}
      <div
        className={`fixed bottom-24 z-40 w-full max-w-[380px] bg-[#0c0c0e]/95 backdrop-blur-xl border border-white/10 rounded-xl shadow-2xl flex flex-col transition-all duration-500 cubic-bezier(0.16, 1, 0.3, 1) origin-bottom-right overflow-hidden ring-1 ring-white/5 ${positionClass} ${
          isOpen ? 'opacity-100 scale-100 translate-y-0' : 'opacity-0 scale-90 translate-y-10 pointer-events-none'
        }`}
        style={{ height: '600px', maxHeight: 'calc(100vh - 140px)' }}
      >
        {/* Header */}
        <div className="px-5 py-4 bg-zinc-900/50 border-b border-white/5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="relative">
                <div className="w-2 h-2 bg-emerald-500 rounded-full shadow-[0_0_8px_#10b981]"></div>
                <div className="absolute inset-0 w-2 h-2 bg-emerald-500 rounded-full animate-ping opacity-40"></div>
            </div>
            <div>
                <h3 className="text-xs font-bold text-zinc-100 uppercase tracking-widest leading-none">AI Analyst</h3>
                <span className="text-[9px] text-zinc-500 font-mono uppercase tracking-widest mt-0.5 block flex items-center gap-1">
                  Secure Channel • <span className="text-emerald-500/70">Web Enabled</span>
                </span>
            </div>
          </div>
        </div>

        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-thin scrollbar-thumb-zinc-800 scrollbar-track-transparent bg-gradient-to-b from-transparent to-zinc-900/20">
          {messages.length === 0 && (
             <div className="flex flex-col items-center justify-center h-full text-center py-10 opacity-40">
                <div className="w-16 h-16 bg-zinc-900 rounded-full flex items-center justify-center mb-4 border border-white/5 shadow-inner">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-zinc-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.384-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                    </svg>
                </div>
                <p className="text-zinc-300 text-xs font-bold tracking-wide uppercase">Ready for Inquiry</p>
                <p className="text-[9px] text-zinc-500 mt-2 max-w-[200px]">System has access to article content and real-time web data.</p>
             </div>
          )}
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-in fade-in slide-in-from-bottom-2 duration-300`}
            >
              <div
                className={`max-w-[85%] rounded-xl px-4 py-3 text-xs leading-relaxed shadow-sm ${
                  msg.role === 'user'
                    ? 'bg-emerald-700/80 text-white rounded-br-none border border-emerald-500/30'
                    : 'bg-zinc-800/80 text-zinc-300 rounded-bl-none border border-white/5'
                }`}
              >
                {renderMessageContent(msg.content)}
                <span className={`block text-[8px] mt-1.5 font-mono opacity-50 text-right uppercase`}>
                    {msg.timestamp.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                </span>
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="flex justify-start animate-in fade-in">
               <div className="bg-zinc-800/80 px-3 py-2 rounded-xl rounded-bl-none flex items-center gap-2 border border-white/5">
                  <LoadingSpinner small />
                  <span className="text-[10px] text-zinc-500 tracking-wide uppercase">Thinking</span>
               </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <form onSubmit={handleSend} className="p-3 bg-zinc-900/50 border-t border-white/5">
          <div className="relative flex items-center">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask about the article or web data..."
              className="w-full bg-black/40 border border-zinc-700/50 rounded-lg pl-3 pr-10 py-3 text-xs text-zinc-200 focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/30 transition-all placeholder-zinc-700"
            />
            <button
              type="submit"
              disabled={!input.trim() || isLoading}
              className="absolute right-1.5 p-1.5 bg-zinc-800 text-zinc-400 rounded hover:bg-emerald-600 hover:text-white disabled:opacity-50 disabled:hover:bg-zinc-800 disabled:hover:text-zinc-400 transition-all"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" viewBox="0 0 20 20" fill="currentColor">
                <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" />
              </svg>
            </button>
          </div>
        </form>
      </div>
    </>
  );
};
