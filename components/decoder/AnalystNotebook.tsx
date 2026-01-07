
import React, { useState, useMemo, useRef, useEffect } from 'react';
import { useNotebook } from '../../contexts/NotebookContext';
import { type NotebookEntry } from '../../types';
import { getCipherBreakdown, calculateAllCiphers } from '../../services/gematriaService';
import html2canvas from 'html2canvas';

// Replicating theme logic for consistent visuals
const CIPHER_THEMES: { [key: string]: string } = {
  'Chaldean': 'emerald',
  'Septenary': 'blue',
  'Ordinal': 'amber',
  'Reduction': 'orange',
  'Sumerian': 'cyan',
  'Latin': 'amber',
  'Reverse Ordinal': 'purple',
  'Reverse Reduction': 'indigo',
  'Fibonacci': 'lime',
  'Primes': 'sky',
  'Pi': 'fuchsia',
  'Three Six Nine': 'violet',
  'Keypad': 'zinc',
  'Satanic': 'rose',
  'English Kabbalah': 'emerald',
  'Trigrammaton': 'zinc',
  'Trigonal': 'amber',
  'Standard': 'cyan',
  'Squares': 'emerald',
};

const getThemeClasses = (color: string) => {
    const map: Record<string, any> = {
        'emerald': { border: 'border-emerald-500/50', text: 'text-emerald-400', bg: 'bg-emerald-900/10', title: 'text-emerald-500', val: 'text-emerald-300' },
        'blue': { border: 'border-blue-500/50', text: 'text-blue-400', bg: 'bg-blue-900/10', title: 'text-blue-500', val: 'text-blue-300' },
        'amber': { border: 'border-amber-500/50', text: 'text-amber-400', bg: 'bg-amber-900/10', title: 'text-amber-500', val: 'text-amber-300' },
        'orange': { border: 'border-orange-500/50', text: 'text-orange-400', bg: 'bg-orange-900/10', title: 'text-orange-500', val: 'text-orange-300' },
        'cyan': { border: 'border-cyan-500/50', text: 'text-cyan-400', bg: 'bg-cyan-900/10', title: 'text-cyan-500', val: 'text-cyan-300' },
        'purple': { border: 'border-purple-500/50', text: 'text-purple-400', bg: 'bg-purple-900/10', title: 'text-purple-500', val: 'text-purple-300' },
        'pink': { border: 'border-pink-500/50', text: 'text-pink-400', bg: 'bg-pink-900/10', title: 'text-pink-500', val: 'text-pink-300' },
        'rose': { border: 'border-rose-500/50', text: 'text-rose-400', bg: 'bg-rose-900/10', title: 'text-rose-500', val: 'text-rose-300' },
        'sky': { border: 'border-sky-500/50', text: 'text-sky-400', bg: 'bg-sky-900/10', title: 'text-sky-500', val: 'text-sky-300' },
        'lime': { border: 'border-lime-500/50', text: 'text-lime-400', bg: 'bg-lime-900/10', title: 'text-lime-500', val: 'text-lime-300' },
        'indigo': { border: 'border-indigo-500/50', text: 'text-indigo-400', bg: 'bg-indigo-900/10', title: 'text-indigo-500', val: 'text-indigo-300' },
        'violet': { border: 'border-violet-500/50', text: 'text-violet-400', bg: 'bg-violet-900/10', title: 'text-violet-500', val: 'text-violet-300' },
        'fuchsia': { border: 'border-fuchsia-500/50', text: 'text-fuchsia-400', bg: 'bg-fuchsia-900/10', title: 'text-fuchsia-500', val: 'text-fuchsia-300' },
        'zinc': { border: 'border-zinc-500/50', text: 'text-zinc-400', bg: 'bg-zinc-900/10', title: 'text-zinc-500', val: 'text-zinc-300' },
    };
    return map[color] || map['zinc'];
};

export const AnalystNotebook: React.FC = () => {
  const { entries, removeEntry, removeEntries, updateEntry, isOpen, setIsOpen, addEntry } = useNotebook();
  const [quickNote, setQuickNote] = useState('');
  
  // View State
  const [view, setView] = useState<'list' | 'export'>('list');
  const [exportData, setExportData] = useState<{ entries: NotebookEntry[], availableCiphers: string[], selectedCiphers: Set<string> }>({ entries: [], availableCiphers: [], selectedCiphers: new Set() });
  const [isExporting, setIsExporting] = useState(false);
  const exportContainerRef = useRef<HTMLDivElement>(null);
  
  // Logo State
  const [logoBase64, setLogoBase64] = useState<string | null>(null);

  // Edit Mode State
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<{ title: string; content: string }>({ title: '', content: '' });

  // Selection Mode State
  const [isSelectionMode, setIsSelectionMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  // Convert Logo to Base64 on mount to avoid CORS issues in html2canvas
  // Using corsproxy.io to bypass CORS restrictions on the image server
  useEffect(() => {
      const imgUrl = 'https://image2url.com/images/1766030316827-ed61bc35-a2e9-4237-94fb-796e6c4f4148.png';
      const convertLogo = async () => {
          try {
              // Use a CORS proxy to fetch the image data safely
              const proxyUrl = 'https://corsproxy.io/?' + encodeURIComponent(imgUrl);
              const response = await fetch(proxyUrl);
              const blob = await response.blob();
              const reader = new FileReader();
              reader.onloadend = () => {
                  if (reader.result) {
                      setLogoBase64(reader.result as string);
                  }
              };
              reader.readAsDataURL(blob);
          } catch (e) {
              console.warn("Failed to load export logo via CORS Proxy, falling back to direct URL", e);
              // Fallback: try fetching directly (might fail if server blocks CORS)
              setLogoBase64(imgUrl); 
          }
      };
      convertLogo();
  }, []);

  const handleAddQuickNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickNote.trim()) return;
    addEntry({
      type: 'text',
      title: 'Manual Entry',
      content: quickNote,
      tags: ['User Note']
    });
    setQuickNote('');
  };

  const startEditing = (entry: NotebookEntry) => {
      setEditingId(entry.id);
      let contentStr = '';
      if (typeof entry.content === 'string') {
          contentStr = entry.content;
      } else {
          contentStr = JSON.stringify(entry.content, null, 2);
      }
      setEditForm({ title: entry.title, content: contentStr });
  };

  const saveEdit = () => {
      if (!editingId) return;
      
      let newContent: any = editForm.content;
      
      const originalEntry = entries.find(e => e.id === editingId);
      
      // Auto-Recalculate Gematria if type is gematria
      if (originalEntry && originalEntry.type === 'gematria') {
          // Recalculate using the new title (text)
          newContent = calculateAllCiphers(editForm.title);
      } else if (originalEntry && typeof originalEntry.content !== 'string') {
          // Try to parse JSON for other complex types
          try {
              newContent = JSON.parse(editForm.content);
          } catch (e) {
              alert("Invalid JSON format. Please correct the syntax or cancel.");
              return;
          }
      }

      updateEntry(editingId, {
          title: editForm.title,
          content: newContent
      });
      setEditingId(null);
  };

  const updateJsonField = (key: string, value: string) => {
      try {
          const current = JSON.parse(editForm.content);
          const updated = { ...current, [key]: value };
          setEditForm(prev => ({ ...prev, content: JSON.stringify(updated, null, 2) }));
      } catch (e) {
          console.error("Error updating JSON field", e);
      }
  };

  const deleteCipherFromEntry = (entry: NotebookEntry, cipherKey: string) => {
      const newContent = { ...entry.content };
      delete newContent[cipherKey];
      
      if (Object.keys(newContent).length === 0) {
          removeEntry(entry.id);
      } else {
          updateEntry(entry.id, { content: newContent });
      }
  };

  const toggleSelection = (id: string) => {
      const newSelected = new Set(selectedIds);
      if (newSelected.has(id)) {
          newSelected.delete(id);
      } else {
          newSelected.add(id);
      }
      setSelectedIds(newSelected);
  };

  const handleBulkDelete = () => {
      if (selectedIds.size === 0) return;
      if (confirm(`Are you sure you want to delete ${selectedIds.size} entries?`)) {
          removeEntries(Array.from(selectedIds));
          setSelectedIds(new Set());
          setIsSelectionMode(false);
      }
  };

  const handleInitiateExport = (targetEntries: NotebookEntry[], title: string) => {
      // Check if any gematria entries exist
      const gematriaEntries = targetEntries.filter(e => e.type === 'gematria');
      
      // Collect all available ciphers
      const allCiphers = new Set<string>();
      gematriaEntries.forEach(entry => {
          Object.keys(entry.content).forEach(key => allCiphers.add(key));
      });

      setExportData({
          entries: targetEntries,
          availableCiphers: Array.from(allCiphers).sort(),
          selectedCiphers: new Set(allCiphers) // Select all by default
      });
      setView('export');
  };

  const confirmExport = async () => {
      if (!exportContainerRef.current) return;
      
      setIsExporting(true);
      
      // Wait for React to render the export template
      await new Promise(resolve => setTimeout(resolve, 800)); // Increased delay for image rendering

      try {
          const canvas = await html2canvas(exportContainerRef.current, {
              backgroundColor: '#050505',
              scale: 2, // Retina quality
              logging: false,
              useCORS: true, // Critical for external images
              allowTaint: false,
          });

          const image = canvas.toDataURL("image/png");
          const link = document.createElement('a');
          const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
          link.href = image;
          link.download = `DECRYPTED_NOTEBOOK_${timestamp}.png`;
          link.click();
      } catch (err) {
          console.error("Export generation failed", err);
          alert("Failed to generate image export. Browser security may be blocking the external logo.");
      } finally {
          setIsExporting(false);
          setView('list');
          setIsSelectionMode(false);
          setSelectedIds(new Set());
      }
  };

  const toggleExportCipher = (cipher: string) => {
      const newSet = new Set(exportData.selectedCiphers);
      if (newSet.has(cipher)) newSet.delete(cipher);
      else newSet.add(cipher);
      setExportData(prev => ({ ...prev, selectedCiphers: newSet }));
  };

  const handleExportSelected = () => {
      if (selectedIds.size === 0) return;
      const selectedEntries = entries.filter(e => selectedIds.has(e.id));
      handleInitiateExport(selectedEntries, 'PARTIAL NOTEBOOK EXPORT');
  };

  const handleExportAll = () => {
      if (entries.length === 0) return;
      handleInitiateExport(entries, 'FULL NOTEBOOK EXPORT');
  };

  const formatTime = (ts: number) => {
    return new Date(ts).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const renderEntryContent = (entry: NotebookEntry, forExport: boolean = false) => {
    switch (entry.type) {
      case 'entity':
        return (
          <div className="bg-emerald-900/10 border-l-[3px] border-emerald-500/50 pl-3 py-1.5 rounded-r text-xs transition-colors hover:bg-emerald-900/20">
            <div className="flex justify-between items-center mb-1">
                <span className="font-bold text-emerald-400 uppercase tracking-wide">{entry.content.name}</span>
                <span className="text-[8px] text-zinc-500 uppercase border border-zinc-800 px-1 py-0.5 rounded">{entry.content.type}</span>
            </div>
            <p className="text-zinc-400 leading-relaxed opacity-80">{entry.content.details}</p>
          </div>
        );
      case 'article_header':
        return (
            <div className="bg-zinc-900/40 border border-white/5 rounded-lg p-3 relative overflow-hidden group/article">
                <div className="absolute top-0 left-0 w-1 h-full bg-emerald-500/50"></div>
                <div className="pl-3">
                    <div className="flex justify-between items-start mb-2">
                        <span className="text-[9px] text-zinc-500 font-mono uppercase tracking-widest">{entry.content.date} • {entry.content.category}</span>
                        {entry.content.url && !forExport && (
                            <a href={entry.content.url} target="_blank" rel="noreferrer" className="text-zinc-600 hover:text-emerald-400">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" viewBox="0 0 20 20" fill="currentColor">
                                    <path d="M11 3a1 1 0 100 2h2.586l-6.293 6.293a1 1 0 101.414 1.414L15 6.414V9a1 1 0 102 0V4a1 1 0 00-1-1h-5z" />
                                    <path d="M5 5a2 2 0 00-2 2v8a2 2 0 002 2h8a2 2 0 002-2v-3a1 1 0 10-2 0v3H5V7h3a1 1 0 000-2H5z" />
                                </svg>
                            </a>
                        )}
                    </div>
                    <p className="text-xs text-zinc-300 italic leading-relaxed border-l-2 border-zinc-700 pl-2 mb-2">
                        "{entry.content.summary}"
                    </p>
                </div>
            </div>
        );
      case 'gematria':
        // Filter ciphers if in export mode
        const entriesToShow = Object.entries(entry.content).filter(([cipher]) => 
            !forExport || exportData.selectedCiphers.has(cipher)
        );

        if (entriesToShow.length === 0) return <p className="text-[10px] text-zinc-500 italic">No ciphers selected for export.</p>;

        return (
          <div className={forExport ? "grid grid-cols-2 gap-3" : "space-y-3"}>
             {entriesToShow.map(([cipherName, totalValue]: [string, any]) => {
                 const themeColor = CIPHER_THEMES[cipherName] || 'zinc';
                 const styles = getThemeClasses(themeColor);
                 // We breakdown based on the entry TITLE which contains the word
                 const breakdown = getCipherBreakdown(entry.title, cipherName);

                 return (
                    <div key={cipherName} className={`relative border ${styles.border} ${styles.bg} p-3 rounded-lg flex flex-col items-center shadow-sm group/card`}>
                        {!forExport && (
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    deleteCipherFromEntry(entry, cipherName);
                                }}
                                className="absolute top-1 right-1 p-1 text-zinc-500 hover:text-red-400 opacity-0 group-hover/card:opacity-100 transition-opacity"
                                title="Remove this cipher"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                                </svg>
                            </button>
                        )}

                        <div className={`text-[9px] font-mono uppercase tracking-widest ${styles.title} mb-2`}>
                            {cipherName}
                        </div>
                        
                        <div className="flex flex-wrap justify-center gap-x-0.5 gap-y-1 mb-2 w-full px-2">
                            {breakdown.map((item, idx) => (
                                <div key={idx} className="flex flex-col items-center min-w-[12px]">
                                    <span className={`text-lg font-bold ${styles.text} leading-none`}>
                                        {item.char}
                                    </span>
                                    {item.val > 0 && (
                                        <span className="text-[9px] text-zinc-500 font-mono mt-0.5">
                                            {item.val}
                                        </span>
                                    )}
                                </div>
                            ))}
                        </div>

                        <div className={`text-2xl font-mono font-bold ${styles.val} mt-1 drop-shadow-sm`}>
                            {totalValue}
                        </div>
                    </div>
                 );
             })}
          </div>
        );
      case 'cosmic':
        return (
          <div className="bg-purple-900/10 border-l-[3px] border-purple-500/50 pl-3 py-1.5 rounded-r text-xs transition-colors hover:bg-purple-900/20">
             <div className="text-purple-300 font-medium mb-1 tracking-wide text-[11px] uppercase">{entry.content.headline}</div>
             <p className="text-zinc-400 text-[10px] italic leading-relaxed">"{entry.content.detail}"</p>
          </div>
        );
      case 'etymology':
        return (
          <div className="bg-amber-900/10 border-l-[3px] border-amber-500/50 pl-3 py-1.5 rounded-r text-xs transition-colors hover:bg-amber-900/20">
             <div className="flex justify-between items-baseline mb-1">
                <span className="text-amber-500 font-serif italic text-[11px]">{entry.content.root}</span>
                <span className="text-[9px] text-zinc-600 uppercase tracking-widest">ROOT</span>
             </div>
             <p className="text-zinc-300 text-[10px] italic mb-2">"{entry.content.meaning}"</p>
             <p className="text-zinc-400 leading-relaxed border-t border-amber-500/10 pt-1 mt-1">{entry.content.connection}</p>
          </div>
        );
      case 'qliphoth':
        return (
          <div className="bg-red-950/20 border-l-[3px] border-red-600/50 pl-3 py-1.5 rounded-r text-xs transition-colors hover:bg-red-900/20">
             <div className="text-red-400 font-medium mb-1 tracking-wide text-[11px] uppercase">{entry.content.name}</div>
             <p className="text-red-300/70 text-[10px] italic mb-1">{entry.content.title}</p>
             <p className="text-zinc-400 text-[10px] leading-relaxed border-t border-red-500/10 pt-1 mt-1">Lesson: {entry.content.lesson}</p>
          </div>
        );
      case 'narrative':
        return (
          <div className="bg-zinc-800/30 border-l-[3px] border-zinc-500/50 pl-3 py-1.5 rounded-r text-xs transition-colors hover:bg-zinc-800/50">
             <div className="text-zinc-300 font-medium mb-1 tracking-wide text-[11px] uppercase">{entry.content.headline}</div>
             <p className="text-zinc-400 text-[10px] italic leading-relaxed">{entry.content.detail}</p>
          </div>
        );
      case 'number_analysis':
        return (
          <div className="bg-blue-900/10 border-l-[3px] border-blue-500/50 pl-3 py-1.5 rounded-r text-xs transition-colors hover:bg-blue-900/20">
             <div className="flex justify-between items-center mb-2 border-b border-blue-500/10 pb-1">
                <span className="text-blue-400 font-bold font-mono text-sm">{entry.content.number}</span>
                <span className="text-[9px] text-zinc-500 uppercase tracking-widest">Analysis</span>
             </div>
             {entry.content.esoteric ? (
                 <div>
                     <span className="text-zinc-300 text-[10px] font-bold block">{entry.content.esoteric.archetype}</span>
                     <p className="text-zinc-400 text-[10px] mt-1 leading-snug line-clamp-3">{entry.content.esoteric.meaning}</p>
                 </div>
             ) : (
                 <div className="text-zinc-500 text-[10px] italic">Mathematical analysis data stored.</div>
             )}
          </div>
        );
      default:
        return <p className="text-zinc-300 text-xs whitespace-pre-wrap leading-relaxed pl-3 border-l-2 border-zinc-700/50">{typeof entry.content === 'string' ? entry.content : JSON.stringify(entry.content)}</p>;
    }
  };

  const renderEditFields = (entry: NotebookEntry) => {
      // Parse current content state
      let data: any = {};
      try {
          data = JSON.parse(editForm.content);
      } catch (e) {
          // Fallback if parsing fails or empty
          data = {}; 
      }

      if (entry.type === 'entity') {
          return (
              <>
                  <div className="mb-3">
                      <label className="text-[9px] text-zinc-500 block mb-1 uppercase tracking-wider">Entity Name</label>
                      <input 
                          value={data.name || ''} 
                          onChange={e => updateJsonField('name', e.target.value)}
                          className="w-full bg-black/40 border border-zinc-700 rounded px-2 py-1.5 text-xs text-white focus:border-emerald-500/50 outline-none"
                      />
                  </div>
                  <div className="mb-3">
                      <label className="text-[9px] text-zinc-500 block mb-1 uppercase tracking-wider">Type</label>
                      <input 
                          value={data.type || ''} 
                          onChange={e => updateJsonField('type', e.target.value)}
                          className="w-full bg-black/40 border border-zinc-700 rounded px-2 py-1.5 text-xs text-white focus:border-emerald-500/50 outline-none"
                      />
                  </div>
                  <div>
                      <label className="text-[9px] text-zinc-500 block mb-1 uppercase tracking-wider">Details</label>
                      <textarea 
                          value={data.details || ''}
                          onChange={e => updateJsonField('details', e.target.value)}
                          className="w-full h-32 bg-black/40 border border-zinc-700 rounded px-2 py-1.5 text-xs text-zinc-300 font-mono focus:border-emerald-500/50 outline-none resize-none leading-relaxed"
                      />
                  </div>
              </>
          );
      } 
      
      if (entry.type === 'cosmic' || entry.type === 'narrative') {
          return (
              <>
                  <div className="mb-3">
                      <label className="text-[9px] text-zinc-500 block mb-1 uppercase tracking-wider">Headline / Concept</label>
                      <input 
                          value={data.headline || ''} 
                          onChange={e => updateJsonField('headline', e.target.value)}
                          className="w-full bg-black/40 border border-zinc-700 rounded px-2 py-1.5 text-xs text-white focus:border-purple-500/50 outline-none"
                      />
                  </div>
                  <div>
                      <label className="text-[9px] text-zinc-500 block mb-1 uppercase tracking-wider">Analysis Detail</label>
                      <textarea 
                          value={data.detail || ''}
                          onChange={e => updateJsonField('detail', e.target.value)}
                          className="w-full h-32 bg-black/40 border border-zinc-700 rounded px-2 py-1.5 text-xs text-zinc-300 font-mono focus:border-purple-500/50 outline-none resize-none leading-relaxed"
                      />
                  </div>
              </>
          );
      }

      if (entry.type === 'etymology') {
          return (
              <>
                  <div className="grid grid-cols-2 gap-3 mb-3">
                      <div>
                          <label className="text-[9px] text-zinc-500 block mb-1 uppercase tracking-wider">Root Word</label>
                          <input 
                              value={data.root || ''} 
                              onChange={e => updateJsonField('root', e.target.value)}
                              className="w-full bg-black/40 border border-zinc-700 rounded px-2 py-1.5 text-xs text-amber-200 font-serif italic focus:border-amber-500/50 outline-none"
                          />
                      </div>
                      <div>
                          <label className="text-[9px] text-zinc-500 block mb-1 uppercase tracking-wider">Original Meaning</label>
                          <input 
                              value={data.meaning || ''} 
                              onChange={e => updateJsonField('meaning', e.target.value)}
                              className="w-full bg-black/40 border border-zinc-700 rounded px-2 py-1.5 text-xs text-white focus:border-amber-500/50 outline-none"
                          />
                      </div>
                  </div>
                  <div>
                      <label className="text-[9px] text-zinc-500 block mb-1 uppercase tracking-wider">Modern Connection</label>
                      <textarea 
                          value={data.connection || ''}
                          onChange={e => updateJsonField('connection', e.target.value)}
                          className="w-full h-24 bg-black/40 border border-zinc-700 rounded px-2 py-1.5 text-xs text-zinc-300 font-mono focus:border-amber-500/50 outline-none resize-none leading-relaxed"
                      />
                  </div>
              </>
          );
      }

      if (entry.type === 'qliphoth') {
          return (
              <>
                  <div className="mb-3">
                      <label className="text-[9px] text-zinc-500 block mb-1 uppercase tracking-wider">Sphere Name</label>
                      <input 
                          value={data.name || ''} 
                          onChange={e => updateJsonField('name', e.target.value)}
                          className="w-full bg-black/40 border border-zinc-700 rounded px-2 py-1.5 text-xs text-red-400 focus:border-red-500/50 outline-none"
                      />
                  </div>
                  <div className="mb-3">
                      <label className="text-[9px] text-zinc-500 block mb-1 uppercase tracking-wider">Title</label>
                      <input 
                          value={data.title || ''} 
                          onChange={e => updateJsonField('title', e.target.value)}
                          className="w-full bg-black/40 border border-zinc-700 rounded px-2 py-1.5 text-xs text-zinc-300 italic focus:border-red-500/50 outline-none"
                      />
                  </div>
                  <div>
                      <label className="text-[9px] text-zinc-500 block mb-1 uppercase tracking-wider">Lesson / Warning</label>
                      <textarea 
                          value={data.lesson || ''}
                          onChange={e => updateJsonField('lesson', e.target.value)}
                          className="w-full h-24 bg-black/40 border border-zinc-700 rounded px-2 py-1.5 text-xs text-zinc-300 font-mono focus:border-red-500/50 outline-none resize-none leading-relaxed"
                      />
                  </div>
              </>
          );
      }

      // Default Fallback for Unknown JSON or Text
      return (
          <div>
              <label className="text-[9px] text-zinc-500 block mb-1 uppercase tracking-wider">Content {entry.type === 'text' ? '(Text)' : '(Raw JSON)'}</label>
              <textarea 
                  value={editForm.content}
                  onChange={e => setEditForm(prev => ({...prev, content: e.target.value}))}
                  className="w-full h-32 bg-black/40 border border-zinc-700 rounded px-2 py-1.5 text-xs text-zinc-300 font-mono focus:border-emerald-500/50 outline-none resize-none"
              />
          </div>
      );
  };

  return (
    <>
      {/* Toggle Tab */}
      <button
        id="notebook-toggle"
        onClick={() => setIsOpen(!isOpen)}
        className={`fixed right-0 top-[60%] -translate-y-1/2 z-[60] py-8 px-1.5 flex flex-col items-center gap-6 transition-all duration-500 cubic-bezier(0.16, 1, 0.3, 1) rounded-l-lg border-l border-y border-white/10 shadow-xl group ${
            isOpen 
            ? 'translate-x-[-350px] bg-[#0c0c0e] border-emerald-500/20' 
            : 'translate-x-0 bg-zinc-900/90 backdrop-blur-md hover:bg-zinc-800 hover:border-emerald-500/40 hover:shadow-[0_0_20px_rgba(0,0,0,0.4)]'
        }`}
      >
         <span className="text-[9px] font-mono font-bold uppercase tracking-[0.3em] [writing-mode:vertical-rl] rotate-180 text-zinc-500 group-hover:text-emerald-400 transition-colors">
            Notebook
         </span>
         <div className={`w-1 h-1 rounded-full transition-all duration-300 ${entries.length > 0 ? 'bg-emerald-500 animate-pulse shadow-[0_0_8px_#10b981]' : 'bg-zinc-700'}`}></div>
         <svg xmlns="http://www.w3.org/2000/svg" className={`h-3 w-3 text-zinc-500 group-hover:text-white transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
         </svg>
      </button>

      {/* Sidebar Drawer */}
      <div className={`fixed right-0 top-0 bottom-0 w-[350px] bg-[#0c0c0e]/95 border-l border-white/10 shadow-[0_0_50px_rgba(0,0,0,0.8)] z-[55] transform transition-transform duration-500 cubic-bezier(0.16, 1, 0.3, 1) flex flex-col backdrop-blur-md ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}>
         
         <div className="p-5 border-b border-white/5 bg-zinc-900/50">
            <div className="flex justify-between items-start">
                <h2 className="text-xs font-bold text-zinc-100 uppercase tracking-[0.2em] flex items-center gap-3">
                    <div className="w-6 h-6 rounded bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-500">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
                        </svg>
                    </div>
                    Notebook
                </h2>
                <div className="flex gap-2">
                    <button 
                        onClick={handleExportAll}
                        disabled={entries.length === 0}
                        className="text-[9px] font-bold uppercase tracking-widest px-2 py-1 rounded bg-zinc-800 text-zinc-400 hover:text-white hover:bg-zinc-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        title="Export All Entries"
                    >
                        Export
                    </button>
                    <button 
                        onClick={() => { setIsSelectionMode(!isSelectionMode); setSelectedIds(new Set()); }}
                        className={`text-[9px] font-bold uppercase tracking-widest px-2 py-1 rounded transition-colors ${isSelectionMode ? 'bg-emerald-600 text-white' : 'bg-zinc-800 text-zinc-400 hover:text-white hover:bg-zinc-700'}`}
                    >
                        {isSelectionMode ? 'Cancel' : 'Select'}
                    </button>
                </div>
            </div>
            
            <div className="flex justify-between items-center mt-4 px-1">
                <span className="text-[9px] text-zinc-600 font-mono tracking-wider">ENTRIES: {entries.length}</span>
                <span className="text-[9px] text-emerald-500 font-mono tracking-wider flex items-center gap-1.5">
                    <span className="w-1 h-1 bg-emerald-500 rounded-full animate-pulse"></span>
                    SYNCING
                </span>
            </div>
         </div>

         <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-zinc-800 scrollbar-track-transparent bg-gradient-to-b from-transparent to-black/30 pb-20">
            {view === 'export' ? (
                <div className="p-6 animate-in slide-in-from-right duration-300">
                    <h3 className="text-sm font-bold text-white uppercase tracking-widest mb-4 border-b border-white/10 pb-2">Export Configuration</h3>
                    
                    <div className="mb-6">
                        <p className="text-[10px] text-zinc-500 uppercase tracking-wider mb-2">Target Data</p>
                        <div className="bg-zinc-900 p-3 rounded border border-white/5">
                            <p className="text-zinc-300 text-xs">{exportData.entries.length} Entries Selected</p>
                        </div>
                    </div>

                    {exportData.availableCiphers.length > 0 && (
                        <div className="mb-6">
                            <div className="flex justify-between items-end mb-2">
                                <p className="text-[10px] text-zinc-500 uppercase tracking-wider">Include Ciphers</p>
                                <button 
                                    onClick={() => {
                                        if (exportData.selectedCiphers.size === exportData.availableCiphers.length) {
                                            setExportData(prev => ({ ...prev, selectedCiphers: new Set() }));
                                        } else {
                                            setExportData(prev => ({ ...prev, selectedCiphers: new Set(prev.availableCiphers) }));
                                        }
                                    }}
                                    className="text-[9px] text-emerald-500 hover:text-emerald-400"
                                >
                                    {exportData.selectedCiphers.size === exportData.availableCiphers.length ? 'None' : 'All'}
                                </button>
                            </div>
                            <div className="space-y-2 bg-zinc-900/50 p-2 rounded border border-white/5 max-h-[300px] overflow-y-auto">
                                {exportData.availableCiphers.map(cipher => (
                                    <label key={cipher} className="flex items-center gap-3 p-2 hover:bg-zinc-800 rounded cursor-pointer group">
                                        <div className={`w-4 h-4 rounded border flex items-center justify-center transition-colors ${exportData.selectedCiphers.has(cipher) ? 'bg-emerald-600 border-emerald-500' : 'bg-zinc-950 border-zinc-700'}`}>
                                            {exportData.selectedCiphers.has(cipher) && <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>}
                                        </div>
                                        <input 
                                            type="checkbox" 
                                            className="hidden" 
                                            checked={exportData.selectedCiphers.has(cipher)}
                                            onChange={() => toggleExportCipher(cipher)}
                                        />
                                        <span className={`text-xs ${exportData.selectedCiphers.has(cipher) ? 'text-zinc-200' : 'text-zinc-500 group-hover:text-zinc-400'}`}>{cipher}</span>
                                    </label>
                                ))}
                            </div>
                        </div>
                    )}

                    <div className="flex gap-3 pt-4 border-t border-white/10">
                        <button 
                            onClick={() => setView('list')}
                            className="flex-1 py-2 bg-zinc-800 text-zinc-400 hover:text-white rounded text-xs font-bold uppercase tracking-wider transition-colors"
                        >
                            Cancel
                        </button>
                        <button 
                            onClick={confirmExport}
                            disabled={isExporting}
                            className="flex-1 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded text-xs font-bold uppercase tracking-wider transition-colors shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isExporting ? 'Processing...' : 'Download PNG'}
                        </button>
                    </div>
                </div>
            ) : (
                <div className="p-4 space-y-3">
                    {entries.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-[60vh] opacity-30 text-center px-6">
                            <div className="w-10 h-10 border border-dashed border-zinc-600 rounded-full flex items-center justify-center mb-3">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-zinc-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                                </svg>
                            </div>
                            <p className="text-zinc-500 text-[10px] font-mono uppercase tracking-wide">Empty Notebook</p>
                        </div>
                    ) : (
                        entries.map(entry => {
                            if (editingId === entry.id) {
                                return (
                                    <div key={entry.id} className="bg-zinc-900 border border-emerald-500/50 rounded-lg p-3 space-y-3 animate-in fade-in zoom-in-95">
                                        <div className="flex justify-between items-center border-b border-white/5 pb-2">
                                            <span className="text-[9px] text-emerald-500 uppercase tracking-wider font-bold">Edit Mode</span>
                                            <span className="text-[9px] text-zinc-500 uppercase">{entry.type}</span>
                                        </div>
                                        <div>
                                            <label className="text-[9px] text-zinc-500 block mb-1 uppercase tracking-wider">Title</label>
                                            <input 
                                                value={editForm.title}
                                                onChange={e => setEditForm(prev => ({...prev, title: e.target.value}))}
                                                className="w-full bg-black/40 border border-zinc-700 rounded px-2 py-1.5 text-xs text-white focus:border-emerald-500/50 outline-none"
                                            />
                                        </div>
                                        
                                        {/* Dynamic Content Edit Fields */}
                                        {entry.type !== 'gematria' && entry.type !== 'number_analysis' ? (
                                            renderEditFields(entry)
                                        ) : entry.type === 'gematria' ? (
                                            <p className="text-[9px] text-zinc-500 italic border-l-2 border-emerald-500/20 pl-2">Values will automatically recalculate based on the new title.</p>
                                        ) : (
                                            <p className="text-[9px] text-zinc-500 italic border-l-2 border-blue-500/20 pl-2">Complex mathematical data. Delete and re-analyze to update.</p>
                                        )}

                                        <div className="flex justify-end gap-2 pt-2 border-t border-white/5 mt-2">
                                            <button onClick={() => setEditingId(null)} className="px-3 py-1.5 bg-zinc-800 border border-zinc-700 rounded text-[10px] text-zinc-300 hover:text-white transition-colors">Cancel</button>
                                            <button onClick={saveEdit} className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 rounded text-[10px] text-white font-bold transition-colors">Save Changes</button>
                                        </div>
                                    </div>
                                );
                            }

                            const isSelected = selectedIds.has(entry.id);

                            return (
                                <div 
                                    key={entry.id} 
                                    onClick={() => isSelectionMode && toggleSelection(entry.id)}
                                    className={`group relative border rounded-lg p-3.5 transition-all duration-300 shadow-sm hover:shadow-md ${
                                        isSelected 
                                        ? 'bg-emerald-900/20 border-emerald-500/50' 
                                        : 'bg-[#121214]/60 border-white/5 hover:border-emerald-500/20 hover:bg-[#151518]'
                                    } ${isSelectionMode ? 'cursor-pointer' : ''}`}
                                >
                                    <div className="flex justify-between items-start mb-2.5">
                                        <div className="flex items-center gap-2">
                                            {isSelectionMode ? (
                                                <div className={`w-3.5 h-3.5 rounded border flex items-center justify-center transition-colors ${isSelected ? 'bg-emerald-500 border-emerald-500' : 'border-zinc-600 bg-zinc-900'}`}>
                                                    {isSelected && <svg className="w-2.5 h-2.5 text-black" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={4} d="M5 13l4 4L19 7" /></svg>}
                                                </div>
                                            ) : (
                                                <span className={`w-1 h-1 rounded-full shadow-[0_0_5px_currentColor] ${
                                                    entry.type === 'gematria' ? 'bg-red-500 text-red-500' :
                                                    entry.type === 'cosmic' ? 'bg-purple-500 text-purple-500' :
                                                    entry.type === 'etymology' ? 'bg-amber-500 text-amber-500' :
                                                    entry.type === 'entity' ? 'bg-emerald-500 text-emerald-500' : 
                                                    entry.type === 'article_header' ? 'bg-blue-500 text-blue-500' : 'bg-zinc-400 text-zinc-400'
                                                }`}></span>
                                            )}
                                            <span className="text-[9px] text-zinc-600 font-mono">{formatTime(entry.timestamp)}</span>
                                        </div>
                                        
                                        {!isSelectionMode && (
                                            <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-all transform translate-x-2 group-hover:translate-x-0">
                                                <button onClick={(e) => { e.stopPropagation(); startEditing(entry); }} className="text-zinc-600 hover:text-emerald-400 p-1" title="Edit">
                                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" viewBox="0 0 20 20" fill="currentColor">
                                                        <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                                                    </svg>
                                                </button>
                                                <button onClick={(e) => { e.stopPropagation(); removeEntry(entry.id); }} className="text-zinc-600 hover:text-red-400 p-1" title="Delete">
                                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" viewBox="0 0 20 20" fill="currentColor">
                                                        <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                                                    </svg>
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                    <div className="mb-2">
                                        {entry.type !== 'gematria' && entry.type !== 'article_header' && <div className="font-bold text-zinc-200 text-xs mb-1.5">{entry.title}</div>}
                                        {entry.type === 'article_header' && <div className="font-bold text-zinc-200 text-xs mb-1.5">{entry.title}</div>}
                                        {renderEntryContent(entry)}
                                    </div>
                                    {entry.tags.length > 0 && (
                                        <div className="flex flex-wrap gap-1 mt-2.5 pt-2 border-t border-white/5 opacity-60 group-hover:opacity-100 transition-opacity">
                                            {entry.tags.map(tag => (
                                                <span key={tag} className="text-[8px] text-zinc-500 px-1.5 py-0.5 rounded bg-zinc-900 border border-zinc-800">#{tag}</span>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            );
                        })
                    )}
                </div>
            )}
         </div>

         {/* Selection Footer */}
         {isSelectionMode && view === 'list' ? (
             <div className="p-3 bg-zinc-900 border-t border-white/10 flex items-center justify-between animate-in slide-in-from-bottom-2">
                 <span className="text-[10px] text-zinc-400">{selectedIds.size} Selected</span>
                 <div className="flex gap-2">
                     <button 
                        onClick={() => setSelectedIds(new Set())}
                        className="px-3 py-1.5 rounded text-[10px] bg-zinc-800 text-zinc-400 hover:text-white transition-colors"
                     >
                         Deselect All
                     </button>
                     <button 
                        onClick={handleExportSelected}
                        disabled={selectedIds.size === 0}
                        className="px-3 py-1.5 rounded text-[10px] bg-emerald-900/30 text-emerald-400 border border-emerald-500/20 hover:bg-emerald-900/50 hover:border-emerald-500/40 transition-all disabled:opacity-50 flex items-center gap-1"
                     >
                         <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                         Export
                     </button>
                     <button 
                        onClick={handleBulkDelete}
                        disabled={selectedIds.size === 0}
                        className="px-3 py-1.5 rounded text-[10px] bg-red-900/30 text-red-400 border border-red-500/20 hover:bg-red-900/50 hover:border-red-500/40 transition-all disabled:opacity-50"
                     >
                         Delete
                     </button>
                 </div>
             </div>
         ) : view === 'list' ? (
            <form onSubmit={handleAddQuickNote} className="p-3 bg-zinc-900/50 border-t border-white/5">
                <div className="relative group">
                    <input
                        type="text"
                        value={quickNote}
                        onChange={(e) => setQuickNote(e.target.value)}
                        placeholder="Add manual observation..."
                        className="w-full bg-black/40 border border-zinc-800 rounded-md text-[11px] text-zinc-300 p-2.5 pr-8 focus:border-emerald-500/30 focus:outline-none focus:ring-1 focus:ring-emerald-500/20 transition-all placeholder-zinc-700"
                    />
                    <button type="submit" disabled={!quickNote.trim()} className="absolute right-1.5 top-1/2 -translate-y-1/2 text-zinc-600 hover:text-emerald-500 disabled:opacity-30 transition-colors p-1">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-8.707l-3-3a1 1 0 00-1.414 0l-3 3a1 1 0 001.414 1.414L9 9.414V13a1 1 0 102 0V9.414l1.293 1.293a1 1 0 001.414-1.414z" clipRule="evenodd" />
                        </svg>
                    </button>
                </div>
            </form>
         ) : null}
      </div>

      {/* Hidden Export Template */}
      <div 
        ref={exportContainerRef}
        className="fixed top-0 left-[-9999px] w-[800px] min-h-[600px] bg-[#050505] p-12 text-zinc-100 font-sans border-2 border-emerald-500/30"
      >
          <div className="flex justify-between items-center mb-10 pb-6 border-b border-emerald-500/30">
              <div className="flex items-center gap-6">
                  <div className="w-16 h-16 rounded-full bg-zinc-900 border border-emerald-500/30 p-3 flex items-center justify-center shadow-[0_0_15px_rgba(16,185,129,0.2)]">
                        <img 
                            src={logoBase64 || "https://image2url.com/images/1766030316827-ed61bc35-a2e9-4237-94fb-796e6c4f4148.png"} 
                            alt="Decrypted Media"
                            className="w-full h-full object-contain"
                            crossOrigin={logoBase64?.startsWith('data:') ? undefined : "anonymous"} 
                        />
                  </div>
                  <div>
                      <h1 className="text-3xl font-heading font-bold text-white tracking-widest uppercase mb-2">Decrypted Media</h1>
                      <p className="text-sm text-emerald-500 font-mono uppercase tracking-[0.3em]">Discovery of Hidden Reality</p>
                  </div>
              </div>
          </div>

          <div className="space-y-8">
              {exportData.entries.map((entry, index) => (
                  <div key={index} className="flex gap-6 relative">
                      <div className="w-12 pt-1 flex flex-col items-center">
                          <span className="text-xl font-bold text-zinc-700 font-mono">{(index + 1).toString().padStart(2, '0')}</span>
                          <div className="w-px h-full bg-zinc-800 my-2"></div>
                      </div>
                      <div className="flex-1 bg-[#0c0c0e] p-5 rounded-lg border border-white/5 shadow-sm">
                          <div className="flex justify-between items-start mb-3 border-b border-white/5 pb-2">
                              <h3 className="text-lg font-bold text-emerald-100 uppercase tracking-wide">{entry.title}</h3>
                              <span className="text-[10px] text-zinc-500 font-mono border border-zinc-800 px-2 py-1 rounded uppercase tracking-wider">{entry.type}</span>
                          </div>
                          <div className="text-zinc-300">
                              {renderEntryContent(entry, true)}
                          </div>
                          {entry.tags.length > 0 && (
                              <div className="mt-4 pt-3 border-t border-white/5 flex gap-2 flex-wrap">
                                  {entry.tags.map(t => (
                                      <span key={t} className="text-[10px] text-zinc-500 font-mono">#{t}</span>
                                  ))}
                              </div>
                          )}
                      </div>
                  </div>
              ))}
          </div>

          <div className="mt-16 pt-8 border-t border-emerald-500/30 flex justify-between items-center">
              <p className="text-xs text-zinc-600 font-mono uppercase tracking-widest">Confidential // Eyes Only</p>
              <p className="text-xs text-emerald-500/50 font-mono uppercase tracking-widest">End of Transmission</p>
          </div>
      </div>
    </>
  );
};
