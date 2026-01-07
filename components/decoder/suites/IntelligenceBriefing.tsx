
import React, { useState, useEffect, useRef, useMemo } from 'react';
import { type IntelligenceBriefing as IntelligenceBriefingType, type Entity, type EnrichmentData, type Relationship } from '../../../types';
import { Card } from '../../shared/Card';
import { LoadingSpinner } from '../../shared/LoadingSpinner';
import { Modal } from '../../shared/Modal';
import { calculateAllCiphers } from '../../../services/gematriaService';
import { useNotebook } from '../../../contexts/NotebookContext';
import { GematriaCard } from './GematriaCard';

interface IntelligenceBriefingProps {
  briefing: IntelligenceBriefingType | null;
  enrichment: EnrichmentData | null;
  onSearchEntity: (entityName: string) => void;
  articleId: string;
  onEnhanceEntities: () => void;
  isEnhancing: boolean;
  onLocalSearch: (term: string) => void;
}

// Simple physics node interface
interface Node extends Entity {
  x: number;
  y: number;
  vx: number;
  vy: number;
  id: string;
}

// Graph Component
const NetworkGraph: React.FC<{ 
    entities: Entity[], 
    relationships: Relationship[] | undefined, 
    onSelect: (entity: Entity) => void 
}> = ({ entities, relationships, onSelect }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [nodes, setNodes] = useState<Node[]>([]);
  const [dimensions, setDimensions] = useState({ width: 800, height: 500 });
  const [hoveredNodeId, setHoveredNodeId] = useState<string | null>(null);
  
  // Zoom & Pan State
  const [transform, setTransform] = useState({ x: 0, y: 0, scale: 1 });
  
  // Interaction Refs
  const isDraggingView = useRef(false);
  const lastMousePos = useRef({ x: 0, y: 0 });
  
  // Node Dragging Refs
  const activeNodeRef = useRef<string | null>(null);
  const graphMousePosRef = useRef<{x: number, y: number} | null>(null);
  
  // Physics State
  const physicsRef = useRef({ alpha: 1, active: true });

  // Initialize Simulation
  useEffect(() => {
      if(!containerRef.current) return;
      
      const width = containerRef.current.clientWidth;
      const height = 500; // Fixed height
      setDimensions({ width, height });
      
      // Init nodes with random positions near center
      const newNodes: Node[] = entities.map((e) => ({
          ...e,
          id: e.name,
          x: width / 2 + (Math.random() - 0.5) * 200,
          y: height / 2 + (Math.random() - 0.5) * 200,
          vx: 0,
          vy: 0
      }));
      setNodes(newNodes);
      physicsRef.current = { alpha: 1, active: true }; // Reset physics energy
  }, [entities]);

  // Run Physics Loop
  useEffect(() => {
    if (nodes.length === 0) return;
    
    let animationFrameId: number;
    const width = containerRef.current?.clientWidth || 600;
    const height = 500;
    
    const simulate = () => {
        // Optimization: Stop simulating if energy is low and not dragging
        if (!physicsRef.current.active && !activeNodeRef.current && physicsRef.current.alpha < 0.01) {
             // Stop loop completely to save CPU
             return; 
        }

        setNodes(prevNodes => {
            const nextNodes = prevNodes.map(n => ({ ...n }));
            
            // Physics Parameters
            const repulsion = 8000; 
            const springLength = 180; // Increased spacing for labels
            const springStrength = 0.04;
            const centerStrength = 0.005;
            const damping = 0.82; // Slight friction

            // 1. Apply Repulsion (Node vs Node)
            for (let i = 0; i < nextNodes.length; i++) {
                for (let j = i + 1; j < nextNodes.length; j++) {
                    const dx = nextNodes[i].x - nextNodes[j].x;
                    const dy = nextNodes[i].y - nextNodes[j].y;
                    const distSq = dx*dx + dy*dy || 1;
                    const dist = Math.sqrt(distSq);
                    
                    if (dist < 300) { // Optimization: Only repel nearby nodes
                        const force = repulsion / distSq;
                        const fx = (dx / dist) * force;
                        const fy = (dy / dist) * force;
                        
                        nextNodes[i].vx += fx;
                        nextNodes[i].vy += fy;
                        nextNodes[j].vx -= fx;
                        nextNodes[j].vy -= fy;
                    }
                }
            }

            // 2. Apply Links (Springs)
            if (relationships) {
                relationships.forEach(rel => {
                    const sourceIdx = nextNodes.findIndex(n => n.name === rel.source);
                    const targetIdx = nextNodes.findIndex(n => n.name === rel.target);
                    
                    if (sourceIdx !== -1 && targetIdx !== -1) {
                        const source = nextNodes[sourceIdx];
                        const target = nextNodes[targetIdx];
                        
                        const dx = target.x - source.x;
                        const dy = target.y - source.y;
                        const dist = Math.sqrt(dx*dx + dy*dy) || 1;
                        const displacement = dist - springLength;
                        
                        const fx = (dx / dist) * displacement * springStrength;
                        const fy = (dy / dist) * displacement * springStrength;
                        
                        source.vx += fx;
                        source.vy += fy;
                        target.vx -= fx;
                        target.vy -= fy;
                    }
                });
            }

            // 3. Apply Center Gravity & Update Position
            nextNodes.forEach(node => {
                // If this node is being dragged, position is set by mouse, override physics
                if (activeNodeRef.current === node.id && graphMousePosRef.current) {
                    node.x += (graphMousePosRef.current.x - node.x) * 0.3; // Easing towards mouse
                    node.y += (graphMousePosRef.current.y - node.y) * 0.3;
                    node.vx = 0;
                    node.vy = 0;
                } else {
                    // Gravity towards center
                    const dx = (width / 2) - node.x;
                    const dy = (height / 2) - node.y;
                    
                    node.vx += dx * centerStrength;
                    node.vy += dy * centerStrength;
                    
                    // Velocity Damping
                    node.vx *= damping;
                    node.vy *= damping;
                    
                    // Apply Velocity
                    node.x += node.vx * physicsRef.current.alpha; // Scale movement by system energy
                    node.y += node.vy * physicsRef.current.alpha;

                    // Soft Bounds
                    const margin = 20;
                    if (node.x < margin) node.vx += 1;
                    if (node.x > width - margin) node.vx -= 1;
                    if (node.y < margin) node.vy += 1;
                    if (node.y > height - margin) node.vy -= 1;
                }
            });
            
            return nextNodes;
        });
        
        // Decay energy
        if (physicsRef.current.active) {
            physicsRef.current.alpha *= 0.98;
            if (physicsRef.current.alpha < 0.01) {
                physicsRef.current.active = false;
            }
        }

        animationFrameId = requestAnimationFrame(simulate);
    };

    simulate();
    return () => cancelAnimationFrame(animationFrameId);
  }, [relationships]); // Re-init if connections change

  const getTypeColor = (type: string) => {
      switch(type) {
          case 'Person': return '#10b981'; // Emerald
          case 'Company': return '#8b5cf6'; // Violet
          case 'Organization': return '#3b82f6'; // Blue
          case 'Location': return '#f59e0b'; // Amber
          default: return '#71717a'; // Zinc
      }
  };

  // Zoom Handlers
  const handleWheel = (e: React.WheelEvent) => {
      e.stopPropagation();
      const sensitivity = 0.001;
      const delta = -e.deltaY * sensitivity;
      const newScale = Math.min(Math.max(0.2, transform.scale + delta), 5);
      setTransform(prev => ({ ...prev, scale: newScale }));
  };

  const handleMouseDown = (e: React.MouseEvent) => {
      // Background Drag (Pan)
      if (e.button === 0 && !activeNodeRef.current) {
          isDraggingView.current = true;
          lastMousePos.current = { x: e.clientX, y: e.clientY };
      }
  };

  const handleNodeMouseDown = (e: React.MouseEvent, nodeId: string) => {
      e.stopPropagation(); // Prevent panning start
      e.preventDefault();
      
      // Wake up physics
      physicsRef.current.alpha = 1;
      physicsRef.current.active = true;
      
      activeNodeRef.current = nodeId;
      
      // Calculate initial mouse pos in graph coords
      if (containerRef.current) {
          const rect = containerRef.current.getBoundingClientRect();
          graphMousePosRef.current = {
              x: (e.clientX - rect.left - transform.x) / transform.scale,
              y: (e.clientY - rect.top - transform.y) / transform.scale
          };
      }
      
      setNodes(prev => [...prev]); 
  };

  const handleMouseMove = (e: React.MouseEvent) => {
      e.preventDefault();
      
      if (activeNodeRef.current && containerRef.current) {
          // Dragging Node
          // Ensure physics is awake while dragging
          physicsRef.current.active = true;
          physicsRef.current.alpha = 1;

          const rect = containerRef.current.getBoundingClientRect();
          graphMousePosRef.current = {
              x: (e.clientX - rect.left - transform.x) / transform.scale,
              y: (e.clientY - rect.top - transform.y) / transform.scale
          };
      } else if (isDraggingView.current) {
          // Panning View
          const dx = e.clientX - lastMousePos.current.x;
          const dy = e.clientY - lastMousePos.current.y;
          lastMousePos.current = { x: e.clientX, y: e.clientY };
          setTransform(prev => ({ ...prev, x: prev.x + dx, y: prev.y + dy }));
      }
  };

  const handleMouseUp = () => { 
      isDraggingView.current = false; 
      activeNodeRef.current = null;
      graphMousePosRef.current = null;
  };
  
  const handleMouseLeave = () => { 
      isDraggingView.current = false; 
      activeNodeRef.current = null;
      graphMousePosRef.current = null;
  };

  const handleZoomIn = () => setTransform(prev => ({ ...prev, scale: Math.min(prev.scale * 1.2, 5) }));
  const handleZoomOut = () => setTransform(prev => ({ ...prev, scale: Math.max(prev.scale / 1.2, 0.2) }));
  const handleReset = () => setTransform({ x: 0, y: 0, scale: 1 });

  return (
      <div 
        ref={containerRef} 
        className="w-full h-[500px] bg-zinc-950/50 rounded-lg border border-white/5 overflow-hidden relative cursor-move group"
        onWheel={handleWheel}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseLeave}
      >
          {/* Zoom Controls */}
          <div className="absolute top-4 left-4 flex flex-col gap-1 z-20 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              <button onClick={handleZoomIn} className="p-1.5 bg-zinc-900/80 text-zinc-400 rounded-t border border-white/10 border-b-0 hover:bg-emerald-900/50 hover:text-emerald-400 transition-colors" title="Zoom In">
                  <svg className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" /></svg>
              </button>
              <button onClick={handleZoomOut} className="p-1.5 bg-zinc-900/80 text-zinc-400 border border-white/10 border-y-0 hover:bg-emerald-900/50 hover:text-emerald-400 transition-colors" title="Zoom Out">
                  <svg className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M3 10a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" /></svg>
              </button>
              <button onClick={handleReset} className="p-1.5 bg-zinc-900/80 text-zinc-400 rounded-b border border-white/10 border-t-0 hover:bg-emerald-900/50 hover:text-emerald-400 transition-colors" title="Reset View">
                  <svg className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd" /></svg>
              </button>
          </div>

          <svg width="100%" height="100%">
              <defs>
                  <marker id="arrowhead" markerWidth="10" markerHeight="7" refX="24" refY="3.5" orient="auto">
                      <polygon points="0 0, 10 3.5, 0 7" fill="#52525b" />
                  </marker>
                  <marker id="arrowhead-active" markerWidth="10" markerHeight="7" refX="24" refY="3.5" orient="auto">
                      <polygon points="0 0, 10 3.5, 0 7" fill="#10b981" />
                  </marker>
                  <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
                    <feGaussianBlur stdDeviation="2" result="blur" />
                    <feComposite in="SourceGraphic" in2="blur" operator="over" />
                  </filter>
              </defs>
              
              <g 
                style={{ 
                    transform: `translate(${transform.x}px, ${transform.y}px) scale(${transform.scale})`,
                    transformOrigin: 'center',
                    transition: isDraggingView.current || activeNodeRef.current ? 'none' : 'transform 0.1s ease-out' 
                }}
              >
                  {/* Invisible rect for transform consistency */}
                  <rect x="0" y="0" width={dimensions.width} height={dimensions.height} fill="transparent" />

                  {/* Lines & Labels */}
                  {relationships && relationships.map((rel, i) => {
                      const s = nodes.find(n => n.name === rel.source);
                      const t = nodes.find(n => n.name === rel.target);
                      if (!s || !t) return null;
                      
                      const isConnected = hoveredNodeId === s.id || hoveredNodeId === t.id;
                      const opacity = hoveredNodeId ? (isConnected ? 1 : 0.1) : 0.6;
                      const strokeWidth = hoveredNodeId && isConnected ? 2.5 : 1.5;
                      const strokeColor = hoveredNodeId && isConnected ? "#10b981" : "#52525b";
                      const markerId = hoveredNodeId && isConnected ? "url(#arrowhead-active)" : "url(#arrowhead)";
                      
                      const midX = (s.x + t.x) / 2;
                      const midY = (s.y + t.y) / 2;
                      
                      const showLabel = isConnected || transform.scale > 0.6;

                      return (
                          <g key={i} className="transition-all duration-300" style={{ opacity }}>
                              <line 
                                x1={s.x} y1={s.y} 
                                x2={t.x} y2={t.y} 
                                stroke={strokeColor} 
                                strokeWidth={strokeWidth} 
                                markerEnd={markerId}
                              />
                              {showLabel && (
                                <g transform={`translate(${midX},${midY})`}>
                                    <rect 
                                        x="-50" y="-10" width="100" height="20" 
                                        rx="4" 
                                        fill="#09090b" 
                                        stroke={strokeColor} 
                                        strokeWidth="1"
                                        fillOpacity="0.9"
                                    />
                                    <text 
                                        textAnchor="middle" 
                                        dy="4" 
                                        fill={isConnected ? "#fff" : "#a1a1aa"}
                                        style={{ fontSize: `${Math.max(10, 12 / transform.scale)}px` }}
                                        className="font-mono tracking-tight pointer-events-none select-none"
                                    >
                                        {rel.description.length > 20 ? rel.description.substring(0, 18) + '..' : rel.description}
                                    </text>
                                </g>
                              )}
                          </g>
                      );
                  })}

                  {/* Nodes */}
                  {nodes.map(node => {
                      // Determine if dimming needed
                      let opacity = 1;
                      if (hoveredNodeId && hoveredNodeId !== node.id) {
                          // Check if connected
                          const isConnected = relationships?.some(r => 
                              (r.source === node.name && r.target === hoveredNodeId) || 
                              (r.target === node.name && r.source === hoveredNodeId)
                          );
                          if (!isConnected) opacity = 0.2;
                      }

                      return (
                      <g 
                        key={node.id} 
                        transform={`translate(${node.x},${node.y})`} 
                        onMouseDown={(e) => handleNodeMouseDown(e, node.id)}
                        onClick={(e) => { e.stopPropagation(); onSelect(node); }}
                        onMouseEnter={() => setHoveredNodeId(node.name)}
                        onMouseLeave={() => setHoveredNodeId(null)}
                        className="cursor-pointer transition-all duration-300"
                        style={{ opacity }}
                      >
                          {/* Hover/Active Ring */}
                          <circle 
                            r={activeNodeRef.current === node.id || hoveredNodeId === node.id ? 22 : 0} 
                            fill="transparent" 
                            stroke={getTypeColor(node.type)} 
                            strokeWidth="1"
                            opacity={0.5}
                            className="transition-all duration-300"
                          />
                          
                          {/* Main Body */}
                          <circle 
                            r={16} 
                            fill={getTypeColor(node.type)} 
                            stroke="#18181b" 
                            strokeWidth="2" 
                            filter="url(#glow)"
                            className="shadow-lg"
                          />
                          
                          {/* Icon/Text */}
                          <text 
                            dy={28} 
                            textAnchor="middle" 
                            className="fill-zinc-300 text-[10px] font-mono uppercase tracking-wide pointer-events-none shadow-black drop-shadow-md select-none"
                            style={{ fontSize: `${Math.max(8, 10 / transform.scale)}px` }} 
                          >
                              {node.name.length > 15 ? node.name.substring(0, 12) + '...' : node.name}
                          </text>
                      </g>
                  )})}
              </g>
          </svg>
          
          {/* Legend overlay */}
          <div className="absolute bottom-4 right-4 bg-zinc-900/80 p-2 rounded border border-white/5 text-[10px] font-mono pointer-events-none backdrop-blur z-10 select-none">
              <div className="flex items-center gap-2 mb-1"><span className="w-2 h-2 rounded-full bg-emerald-500"></span> Person</div>
              <div className="flex items-center gap-2 mb-1"><span className="w-2 h-2 rounded-full bg-violet-500"></span> Company</div>
              <div className="flex items-center gap-2 mb-1"><span className="w-2 h-2 rounded-full bg-blue-500"></span> Org</div>
              <div className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-amber-500"></span> Location</div>
          </div>
      </div>
  );
};


export const IntelligenceBriefing: React.FC<IntelligenceBriefingProps> = ({ briefing, enrichment, onSearchEntity, articleId, onEnhanceEntities, isEnhancing, onLocalSearch }) => {
  const [selectedEntity, setSelectedEntity] = useState<Entity | null>(null);
  const [activeSearchMenu, setActiveSearchMenu] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'list' | 'graph'>('list');
  const [hoveredTooltip, setHoveredTooltip] = useState<{ name: string, results: Record<string, number>, x: number, y: number } | null>(null);
  
  const { addEntry } = useNotebook();

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (activeSearchMenu && !(event.target as HTMLElement).closest('.search-menu-container')) {
        setActiveSearchMenu(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [activeSearchMenu]);

  const handleAddToNotebook = (entity: Entity) => {
    addEntry({
      type: 'entity',
      title: entity.name,
      content: {
        name: entity.name,
        type: entity.type,
        details: entity.details
      },
      tags: ['Briefing', entity.type]
    });
    setActiveSearchMenu(null);
  };

  const handleSaveSentiment = () => {
    if (briefing) {
        addEntry({
            type: 'text',
            title: 'Sentiment Profile',
            content: `Tone: ${briefing.sentiment.tone} (${Math.round(briefing.sentiment.confidence * 100)}%)\n\nAnalysis: ${briefing.sentiment.justification}\n\nKeywords: ${briefing.sentiment.keyPhrases.join(', ')}`,
            tags: ['Sentiment', briefing.sentiment.tone]
        });
    }
  };

  const handleEntityMouseEnter = (e: React.MouseEvent, name: string) => {
      const rect = e.currentTarget.getBoundingClientRect();
      setHoveredTooltip({
          name,
          results: calculateAllCiphers(name),
          x: rect.left + (rect.width / 2),
          y: rect.top
      });
  };

  const handleEntityMouseLeave = () => {
      setHoveredTooltip(null);
  };

  const headerControls = (
      <div className="flex items-center gap-3">
        <div id="view-mode-toggle" className="flex bg-zinc-900/50 rounded-lg p-1 border border-white/5">
            <button 
                onClick={() => setViewMode('list')}
                className={`p-1.5 rounded transition-colors ${viewMode === 'list' ? 'bg-zinc-700 text-white shadow-sm' : 'text-zinc-500 hover:text-zinc-300'}`}
                title="List View"
            >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
                </svg>
            </button>
            <button 
                onClick={() => setViewMode('graph')}
                className={`p-1.5 rounded transition-colors ${viewMode === 'graph' ? 'bg-zinc-700 text-white shadow-sm' : 'text-zinc-500 hover:text-zinc-300'}`}
                title="Graph View"
            >
                 <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3zM6 8a2 2 0 11-4 0 2 2 0 014 0zM16 18v-3a5.972 5.972 0 00-.75-2.906A3.005 3.005 0 0119 15v3h-3zM4.75 12.094A5.973 5.973 0 004 15v3H1v-3a3 3 0 013.75-2.906z" />
                 </svg>
            </button>
        </div>

        <button
        id="deep-scan-btn"
        onClick={onEnhanceEntities}
        disabled={isEnhancing}
        title="Run a more detailed scan for all entities"
        className="flex items-center gap-2 text-xs bg-zinc-800 text-zinc-300 font-medium py-1.5 px-3 rounded-md border border-white/10 hover:bg-emerald-900/30 hover:text-emerald-300 hover:border-emerald-500/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
        {isEnhancing ? (
            <>
            <LoadingSpinner small />
            Scanning...
            </>
        ) : (
            <>
            <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8zm8-3a1 1 0 011 1v1h1a1 1 0 110 2h-1v1a1 1 0 11-2 0v-1H7a1 1 0 110-2h1V6a1 1 0 011-1z" clipRule="evenodd" />
            </svg>
            Deep Scan
            </>
        )}
        </button>
      </div>
  );

  const selectedEntityEnrichment = selectedEntity && enrichment ? enrichment[selectedEntity.name] : null;
  const selectedEntityGematria = selectedEntity ? calculateAllCiphers(selectedEntity.name) : null;

  return (
    <>
      {/* Tooltip Portal/Fixed Render */}
      {hoveredTooltip && (
          <div 
            className="fixed z-[60] bg-zinc-950/95 backdrop-blur border border-emerald-500/30 rounded-lg shadow-2xl p-3 transform -translate-x-1/2 -translate-y-full pointer-events-none animate-in fade-in zoom-in-95 duration-150"
            style={{ left: hoveredTooltip.x, top: hoveredTooltip.y - 10 }}
          >
             <div className="absolute bottom-[-6px] left-1/2 -translate-x-1/2 w-3 h-3 bg-zinc-950 border-r border-b border-emerald-500/30 rotate-45"></div>
             <strong className="block text-emerald-400 text-[10px] font-mono mb-2 border-b border-white/10 pb-1 uppercase tracking-widest">{hoveredTooltip.name}</strong>
             <ul className="space-y-1 font-mono text-[10px]">
                <li className="flex justify-between gap-6"><span className="text-zinc-500">Ordinal</span> <span className="text-zinc-200 font-bold">{hoveredTooltip.results['Ordinal']}</span></li>
                <li className="flex justify-between gap-6"><span className="text-zinc-500">Reverse</span> <span className="text-zinc-200 font-bold">{hoveredTooltip.results['Reverse Ordinal']}</span></li>
                <li className="flex justify-between gap-6"><span className="text-zinc-500">Reduction</span> <span className="text-zinc-200 font-bold">{hoveredTooltip.results['Reduction']}</span></li>
                <li className="flex justify-between gap-6"><span className="text-zinc-500">Sumerian</span> <span className="text-zinc-200 font-bold">{hoveredTooltip.results['Sumerian']}</span></li>
             </ul>
          </div>
      )}

      <div className="flex flex-col gap-8">
        <Card title="Key Entities & Relationships" headerContent={headerControls}>
          <div id="entity-display-area" className="min-h-[500px]">
            {!briefing ? (
                <div className="flex justify-center items-center h-full w-full">
                    <LoadingSpinner />
                </div>
            ) : (
                viewMode === 'list' ? (
                    <div className="space-y-2 max-h-[500px] overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-zinc-800 scrollbar-track-transparent">
                        {briefing.entities.map(entity => {
                        return (
                        <div key={entity.name} className="group flex items-center justify-between bg-zinc-800/30 hover:bg-zinc-800/60 rounded-lg border border-white/5 transition-colors">
                            <div className="flex-1 min-w-0">
                                <button
                                    onClick={() => setSelectedEntity(entity)}
                                    className="w-full text-left p-3 focus:outline-none"
                                >
                                    <div className="flex items-center min-w-0 mb-1">
                                        <span className="px-1.5 py-0.5 rounded text-[10px] font-mono uppercase tracking-wide bg-zinc-700 text-zinc-300 mr-2 flex-shrink-0">
                                            {entity.type}
                                        </span>
                                        <p className="font-semibold text-zinc-200 truncate group-hover:text-emerald-300 transition-colors" title={entity.name}>
                                            {entity.name}
                                        </p>
                                        {/* Gematria Tooltip Trigger */}
                                        <div 
                                            className="ml-2 flex-shrink-0"
                                            onMouseEnter={(e) => handleEntityMouseEnter(e, entity.name)}
                                            onMouseLeave={handleEntityMouseLeave}
                                        >
                                            <span className="cursor-help text-zinc-600 hover:text-emerald-400 transition-colors p-0.5">
                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" viewBox="0 0 20 20" fill="currentColor">
                                                <path fillRule="evenodd" d="M6 2a2 2 0 00-2 2v12a2 2 0 002 2h8a2 2 0 002-2V4a2 2 0 00-2-2H6zm1 2a1 1 0 00-1 1v2a1 1 0 001 1h6a1 1 0 001-1V5a1 1 0 00-1-1H7zM6 14a1 1 0 011-1h1a1 1 0 110 2H7a1 1 0 01-1-1zm3 0a1 1 0 011-1h1a1 1 0 110 2h-1a1 1 0 01-1-1z" clipRule="evenodd" />
                                                </svg>
                                            </span>
                                        </div>
                                    </div>
                                    <p className="text-zinc-500 text-xs line-clamp-1 pl-1">
                                    {entity.details}
                                    </p>
                                </button>
                            </div>
                            <div className="relative search-menu-container flex items-center flex-shrink-0 pr-3 border-l border-white/5 pl-2">
                                <button 
                                    onClick={() => setActiveSearchMenu(entity.name === activeSearchMenu ? null : entity.name)} 
                                    className="p-1.5 text-zinc-500 hover:text-zinc-200 rounded-md hover:bg-zinc-700/50 transition-colors"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                                        <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
                                    </svg>
                                </button>
                                {activeSearchMenu === entity.name && (
                                <div className="absolute right-0 top-full mt-1 w-48 bg-zinc-900 border border-zinc-700 rounded-lg shadow-xl z-20 animate-in fade-in zoom-in-95 duration-100 overflow-hidden">
                                    <button onClick={() => { onLocalSearch(entity.name); setActiveSearchMenu(null); }} className="block w-full text-left px-4 py-2 text-xs font-medium text-zinc-300 hover:bg-zinc-800 hover:text-white first:rounded-t-lg transition-colors">
                                    Find in Article
                                    </button>
                                    <button onClick={() => { setSelectedEntity(entity); setActiveSearchMenu(null); }} className="block w-full text-left px-4 py-2 text-xs font-medium text-zinc-300 hover:bg-zinc-800 hover:text-white transition-colors">
                                    Gematria Breakdown
                                    </button>
                                    <button onClick={() => { window.open(`https://www.google.com/search?q=${encodeURIComponent(entity.name)}`, '_blank'); setActiveSearchMenu(null); }} className="block w-full text-left px-4 py-2 text-xs font-medium text-zinc-500 hover:bg-zinc-800 hover:text-white transition-colors">
                                    Web Uplink (Google)
                                    </button>
                                    <button onClick={() => handleAddToNotebook(entity)} className="block w-full text-left px-4 py-2 text-xs font-medium text-emerald-400 hover:bg-emerald-900/30 transition-colors border-t border-white/5 last:rounded-b-lg flex items-center gap-2">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                    </svg>
                                    Add to Notebook
                                    </button>
                                </div>
                                )}
                            </div>
                        </div>
                        )})}
                    </div>
                ) : (
                    <NetworkGraph 
                        entities={briefing.entities} 
                        relationships={briefing.relationships} 
                        onSelect={(e) => setSelectedEntity(e)} 
                    />
                )
            )}
          </div>
        </Card>

        <div id="sentiment-card">
            <Card title="Sentiment Analysis" headerContent={
                <button 
                    onClick={handleSaveSentiment}
                    className="text-zinc-500 hover:text-emerald-400 p-1"
                    title="Save Sentiment to Notebook"
                >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M5 4a2 2 0 012-2h6a2 2 0 012 2v14l-5-2.5L5 18V4z" />
                </svg>
                </button>
            }>
            {!briefing ? (
                <div className="flex justify-center items-center min-h-[200px]"><LoadingSpinner /></div>
            ) : (
                <>
                    <div className="flex flex-col items-center justify-center mb-6 mt-2">
                        <div className="relative flex items-center justify-center w-32 h-32">
                            <svg className="transform -rotate-90 w-32 h-32">
                                <circle cx="64" cy="64" r="60" stroke="currentColor" strokeWidth="8" fill="transparent" className="text-zinc-800" />
                                <circle cx="64" cy="64" r="60" stroke="currentColor" strokeWidth="8" fill="transparent" 
                                    strokeDasharray={377} 
                                    strokeDashoffset={377 - (377 * briefing.sentiment.confidence)} 
                                    className={briefing.sentiment.tone === 'Positive' ? 'text-emerald-400' : briefing.sentiment.tone === 'Negative' ? 'text-red-400' : 'text-amber-400'} 
                                />
                            </svg>
                            <span className="absolute text-2xl font-bold text-zinc-100">{Math.round(briefing.sentiment.confidence * 100)}%</span>
                        </div>
                        <p className={`mt-2 text-lg font-bold tracking-wide ${briefing.sentiment.tone === 'Positive' ? 'text-emerald-400' : briefing.sentiment.tone === 'Negative' ? 'text-red-400' : 'text-amber-400'}`}>{briefing.sentiment.tone}</p>
                    </div>
                    
                    <p className="text-sm text-zinc-400 mb-4 leading-relaxed border-l-2 border-white/10 pl-3">
                        {briefing.sentiment.justification}
                    </p>
                    
                    <div className="pt-4 border-t border-white/5">
                        <h4 className="text-xs font-bold text-zinc-500 uppercase mb-2">Indicators</h4>
                        <div className="flex flex-wrap gap-2">
                            {briefing.sentiment.keyPhrases.map(phrase => (
                                <span key={phrase} className="px-2 py-1 bg-zinc-800 text-zinc-300 text-xs rounded border border-zinc-700/50">
                                    {phrase}
                                </span>
                            ))}
                        </div>
                    </div>
                </>
            )}
            </Card>
        </div>
      </div>

      {selectedEntity && (
        <Modal
          isOpen={!!selectedEntity}
          onClose={() => setSelectedEntity(null)}
          title={`${selectedEntity.name}`}
        >
            <div className="space-y-6">
              <div>
                <div className="flex items-center gap-2 mb-3">
                     <span className="px-2 py-0.5 bg-zinc-800 text-zinc-400 text-xs uppercase tracking-wider rounded">{selectedEntity.type}</span>
                </div>
                <h3 className="text-sm font-bold text-emerald-500 uppercase tracking-wider mb-2">Contextual Data</h3>
                {selectedEntity.details && selectedEntity.details.trim() !== '' ? (
                  <div className="bg-zinc-900/50 p-4 rounded-lg border border-white/5">
                      <p className="text-zinc-300 leading-relaxed italic text-sm">
                          "{selectedEntity.details}"
                      </p>
                  </div>
                ) : (
                  <p className="text-zinc-500 text-sm italic">No specific context available.</p>
                )}
              </div>

              {/* Gematria Profile Section */}
              {selectedEntityGematria && (
                  <div className="pt-4 border-t border-white/5">
                      <h3 className="text-sm font-bold text-emerald-500 uppercase tracking-wider mb-3">Gematria Profile</h3>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <GematriaCard text={selectedEntity.name} cipherName="Ordinal" totalValue={selectedEntityGematria['Ordinal']} themeColor="amber" />
                          <GematriaCard text={selectedEntity.name} cipherName="Reverse Ordinal" totalValue={selectedEntityGematria['Reverse Ordinal']} themeColor="purple" />
                          <GematriaCard text={selectedEntity.name} cipherName="Reduction" totalValue={selectedEntityGematria['Reduction']} themeColor="orange" />
                          <GematriaCard text={selectedEntity.name} cipherName="Sumerian" totalValue={selectedEntityGematria['Sumerian']} themeColor="cyan" />
                      </div>
                  </div>
              )}

              {/* Relationships section for the modal */}
              {briefing?.relationships && briefing.relationships.some(r => r.source === selectedEntity.name || r.target === selectedEntity.name) && (
                <div className="pt-4 border-t border-white/5">
                    <h3 className="text-sm font-bold text-emerald-500 uppercase tracking-wider mb-2">Network Connections</h3>
                    <ul className="space-y-2">
                        {briefing.relationships
                            .filter(r => r.source === selectedEntity.name || r.target === selectedEntity.name)
                            .map((rel, i) => (
                                <li key={i} className="text-xs bg-zinc-900 p-2 rounded border border-white/5">
                                    <span className="text-zinc-400">
                                        {rel.source === selectedEntity.name ? (
                                            <>Connected to <strong className="text-zinc-200">{rel.target}</strong></>
                                        ) : (
                                            <>Linked from <strong className="text-zinc-200">{rel.source}</strong></>
                                        )}
                                    </span>
                                    <p className="text-emerald-500/80 mt-0.5 italic">{rel.description}</p>
                                </li>
                            ))
                        }
                    </ul>
                </div>
              )}

              <div className="pt-4 border-t border-white/5">
                <h3 className="text-sm font-bold text-emerald-500 uppercase tracking-wider mb-2">Enrichment Summary</h3>
                {selectedEntityEnrichment ? (
                   <p className="text-zinc-300 text-sm leading-relaxed">
                     {selectedEntityEnrichment.summary}
                   </p>
                ) : (
                  <div className="flex items-center gap-2 text-zinc-500 text-sm">
                      <LoadingSpinner small />
                      <span>Retrieving enrichment data...</span>
                  </div>
                )}
              </div>

              <div className="pt-6 border-t border-white/5 flex justify-end items-center gap-3">
                <button
                   onClick={() => { handleAddToNotebook(selectedEntity); setSelectedEntity(null); }}
                   className="px-4 py-2 bg-zinc-800 text-emerald-400 text-sm font-medium rounded-lg hover:bg-emerald-900/20 hover:border-emerald-500/30 border border-transparent transition-all flex items-center gap-2"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                        <path d="M5 4a2 2 0 012-2h6a2 2 0 012 2v14l-5-2.5L5 18V4z" />
                    </svg>
                   Add to Notebook
                </button>
                <a
                  href={selectedEntityEnrichment?.url || `https://www.google.com/search?q=${encodeURIComponent(selectedEntity.name)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-2 bg-zinc-800 text-zinc-200 text-sm font-medium rounded-lg hover:bg-zinc-700 transition-colors"
                >
                  Web Uplink
                </a>
              </div>
            </div>
        </Modal>
      )}
    </>
  );
};
