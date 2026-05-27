import React from 'react';
import { PCB_NODES, PCB_TRACES, REVERSE_MORSE_DICT } from '../db';
import { MorseNode } from '../types';

interface PcbCardProps {
  currentSequence: string; // User's active input sequence (e.g. "...")
  onNodeClick?: (char: string, code: string) => void;
  targetChar?: string; // If in test mode, the character to highlight
  errorChar?: string; // Node that was incorrectly typed
}

export default function PcbCard({
  currentSequence,
  onNodeClick,
  targetChar,
  errorChar,
}: PcbCardProps) {
  // Check if a trace (connecting pathway) is part of the current active path
  const isTraceActive = (codeTrigger: string) => {
    if (codeTrigger === '*') return true; // root trunk is always energized
    return currentSequence.startsWith(codeTrigger);
  };

  // Check if a node is the current selection node (corresponds to currentSequence)
  const isNodeSelected = (nodeCode: string) => {
    return currentSequence === nodeCode;
  };

  // Check if a node lies on the active path being navigated
  const isNodeOnActivePath = (nodeCode: string) => {
    return currentSequence.startsWith(nodeCode);
  };

  return (
    <div id="pcb-card-container" className="relative w-full max-w-lg mx-auto bg-slate-950 p-4 rounded-3xl shadow-2xl border border-slate-800">
      {/* Decorative Gold Corner Brackets for PCB feel */}
      <div className="absolute top-3 left-3 w-6 h-6 border-t-2 border-l-2 border-amber-500/50 rounded-tl"></div>
      <div className="absolute top-3 right-3 w-6 h-6 border-t-2 border-r-2 border-amber-500/50 rounded-tr"></div>
      <div className="absolute bottom-3 left-3 w-6 h-6 border-b-2 border-l-2 border-amber-500/50 rounded-bl"></div>
      <div className="absolute bottom-3 right-3 w-6 h-6 border-b-2 border-r-2 border-amber-500/50 rounded-br"></div>

      {/* Golden Mount Hole in top-right corner to match typical pocket PCBs */}
      <div className="absolute top-5 right-5 w-5 h-5 rounded-full border-2 border-amber-500/40 bg-slate-900 flex items-center justify-center">
        <div className="w-2.5 h-2.5 rounded-full bg-transparent border border-amber-500/30"></div>
      </div>

      <div className="text-center mb-1">
        <h2 id="pcb-title" className="font-mono text-xl tracking-widest text-slate-100 font-bold flex items-center justify-center gap-1.5 grayscale-0">
          <span className="text-amber-500">M⦾RSE</span>
          <span className="text-slate-400">⚡</span>
          <span className="text-emerald-500">C●DE</span>
        </h2>
        <p className="text-[10px] font-mono text-amber-500/60 uppercase tracking-widest">
          Binary Dichotomous Key Trainer
        </p>
      </div>

      {/* Interactive SVG Canvas */}
      <svg
        id="pcb-svg"
        viewBox="0 0 600 600"
        className="w-full h-auto bg-slate-900 border border-slate-800 rounded-2xl shadow-inner select-none"
        style={{ backgroundImage: 'radial-gradient(#1e293b 1px, transparent 1px)', backgroundSize: '16px 16px' }}
      >
        <defs>
          {/* LED Glow Filters */}
          <filter id="pcb-glow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur in="SourceGraphic" stdDeviation="6" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          
          <filter id="pcb-led-active" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="8" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>

          {/* Copper trace copper metallic gradients */}
          <linearGradient id="gold-trace-grad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#d97706" />
            <stop offset="100%" stopColor="#f59e0b" />
          </linearGradient>

          <linearGradient id="active-trace-grad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#10b981" />
            <stop offset="100%" stopColor="#34d399" />
          </linearGradient>

          {/* Solder Mask Circular Gradients */}
          <radialGradient id="ring-glow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#10b981" stopOpacity="0.4" />
            <stop offset="100%" stopColor="#10b981" stopOpacity="0" />
          </radialGradient>
        </defs>

        {/* --- Silk Screen Borders & Texts --- */}
        <rect x="15" y="15" width="570" height="570" rx="12" fill="none" stroke="#f59e0b" strokeWidth="1" strokeOpacity="0.15" />
        <rect x="20" y="20" width="560" height="560" rx="10" fill="none" stroke="#f59e0b" strokeWidth="1.5" strokeOpacity="0.25" strokeDasharray="6,4" />

        {/* Antenna Icon (Origin of signal) */}
        <g id="antenna-icon" transform="translate(300, 35)" className="opacity-80">
          <line x1="0" y1="0" x2="0" y2="25" stroke="#f59e0b" strokeWidth="2.5" />
          <path d="M-15,-5 L0,20 L15,-5" fill="none" stroke="#f59e0b" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
          <circle cx="0" cy="23" r="3.5" fill="#f59e0b" />
          <circle cx="0" cy="-5" r="3" fill="#10b981" className={currentSequence ? "animate-ping" : ""} style={{ animationDuration: '1.5s' }} />
          {/* Signal waves */}
          <path d="M-8,-10 Q0,-16 8,-10" fill="none" stroke="#f59e0b" strokeWidth="1.5" strokeLinecap="round" className={currentSequence ? "animate-pulse" : ""} />
          <path d="M-14,-15 Q0,-25 14,-15" fill="none" stroke="#f59e0b" strokeWidth="1" strokeLinecap="round" strokeDasharray="3,2" />
        </g>

        {/* Binary search tree direction guides */}
        <text x="315" y="60" fill="#10b981" fontSize="10" fontFamily="monospace" fontWeight="bold" opacity="0.8">
          · (D●T)
        </text>
        <text x="255" y="60" fill="#f59e0b" fontSize="10" fontFamily="monospace" fontWeight="bold" opacity="0.8" textAnchor="end">
          - (DASH)
        </text>

        {/* Sub-signals layout markings */}
        <g opacity="0.15" stroke="#e2e8f0" strokeWidth="0.5" strokeDasharray="2,5">
          <line x1="300" y1="65" x2="300" y2="560" />
          <line x1="50" y1="110" x2="550" y2="110" />
          <line x1="50" y1="250" x2="550" y2="250" />
          <line x1="50" y1="390" x2="550" y2="390" />
        </g>

        {/* --- Draw Copper Traces (Solder pathways) --- */}
        <g id="pcb-tracks">
          {PCB_TRACES.map((trace) => {
            const isActive = isTraceActive(trace.codeTrigger);
            return (
              <g key={trace.id}>
                {/* Background thicker line (PCB shadow/groove/mask) */}
                <line
                  x1={trace.fromX}
                  y1={trace.fromY}
                  x2={trace.toX}
                  y2={trace.toY}
                  stroke="#101b2a"
                  strokeWidth="6"
                  strokeLinecap="round"
                />
                
                {/* Copper trace line */}
                <line
                  x1={trace.fromX}
                  y1={trace.fromY}
                  x2={trace.toX}
                  y2={trace.toY}
                  stroke={isActive ? 'url(#active-trace-grad)' : 'url(#gold-trace-grad)'}
                  strokeWidth={isActive ? '3.5' : '1.8'}
                  strokeLinecap="round"
                  className="transition-all duration-200"
                  style={isActive ? { filter: 'url(#pcb-glow)' } : { opacity: 0.45 }}
                />

                {/* Flowing animated pulse dots on active lines */}
                {isActive && currentSequence.length > 0 && (
                  <circle r="6" fill="#10b981" filter="url(#pcb-glow)">
                    <animateMotion
                      dur="0.45s"
                      repeatCount="indefinite"
                      path={`M ${trace.fromX} ${trace.fromY} L ${trace.toX} ${trace.toY}`}
                    />
                  </circle>
                )}
              </g>
            );
          })}
        </g>

        {/* --- Draw Nodes (Joint Solder Pads & LEDs) --- */}
        <g id="pcb-pads">
          {PCB_NODES.map((node) => {
            const isSelected = isNodeSelected(node.code);
            const isActivePath = isNodeOnActivePath(node.code);
            const isTarget = targetChar === node.char;
            const isError = errorChar === node.char;

            // Define custom colors based on state
            let padColor = '#1e293b'; // off dark
            let strokeColor = '#b45309'; // amber stroke
            let ledColor = 'transparent';
            let strokeWidth = '1.5';
            let extraClasses = '';

            if (isSelected) {
              padColor = '#065f46'; // active rich emerald background
              strokeColor = '#34d399'; // vivid emerald stroke
              ledColor = '#10b981'; // bright neon led
              strokeWidth = '2.5';
              extraClasses = 'animate-pulse';
            } else if (isActivePath) {
              padColor = '#0f2d24'; // muted active dark teal
              strokeColor = '#059669'; // medium green stroke
              ledColor = '#059669'; // secondary led glow
              strokeWidth = '2.0';
            }

            if (isTarget) {
              // Target is pulsing amber/gold to grab attention
              strokeColor = '#f59e0b';
              strokeWidth = '3';
              extraClasses += ' cursor-pointer scale-110 duration-200';
            }

            if (isError) {
              // Highlight code errors in crimson red
              padColor = '#7f1d1d';
              strokeColor = '#ef4444';
              ledColor = '#ef4444';
              strokeWidth = '3';
            }

            const handlePadClick = () => {
              if (onNodeClick) {
                onNodeClick(node.char, node.code);
              }
            };

            return (
              <g
                key={node.char}
                onClick={handlePadClick}
                className="cursor-pointer group hover:scale-110 transition-transform duration-150"
                style={{ transformOrigin: `${node.x}px ${node.y}px` }}
              >
                {/* Outer Solder Ring (Mask Area) */}
                {node.shape === 'circle' ? (
                  <>
                    <circle cx={node.x} cy={node.y} r="22" fill="transparent" stroke="#f59e0b" strokeWidth="0.5" strokeOpacity="0.1" />
                    {isSelected && (
                      <circle cx={node.x} cy={node.y} r="20" fill="url(#ring-glow)" />
                    )}
                    {/* Solder donut ring */}
                    <circle
                      cx={node.x}
                      cy={node.y}
                      r="14"
                      fill={padColor}
                      stroke={strokeColor}
                      strokeWidth={strokeWidth}
                      className="transition-colors duration-200"
                    />
                    {/* Mini Center LED */}
                    {isActivePath && (
                      <circle
                        cx={node.x}
                        cy={node.y}
                        r="5.5"
                        fill={ledColor}
                        filter="url(#pcb-led-active)"
                        className={extraClasses}
                      />
                    )}
                  </>
                ) : (
                  <>
                    <rect x={node.x - 22} y={node.y - 15} width="44" height="30" rx="4" fill="transparent" stroke="#f59e0b" strokeWidth="0.5" strokeOpacity="0.1" />
                    {isSelected && (
                      <rect x={node.x - 18} y={node.y - 12} width="36" height="24" rx="4" fill="url(#ring-glow)" />
                    )}
                    {/* Solder rectangle pad */}
                    <rect
                      x={node.x - 16}
                      y={node.y - 10}
                      width="32"
                      height="20"
                      rx="3.5"
                      fill={padColor}
                      stroke={strokeColor}
                      strokeWidth={strokeWidth}
                      className="transition-colors duration-200"
                    />
                    {/* Mini Center LED - rectangular */}
                    {isActivePath && (
                      <rect
                        x={node.x - 8}
                        y={node.y - 4}
                        width="16"
                        height="8"
                        rx="1"
                        fill={ledColor}
                        filter="url(#pcb-led-active)"
                        className={extraClasses}
                      />
                    )}
                  </>
                )}

                {/* Silk-screen character letter label (e.g. A, B, C) */}
                <text
                  x={node.x}
                  y={node.y + (node.shape === 'circle' ? -25 : -21)}
                  fill={isTarget ? '#fbbf24' : isSelected ? '#a7f3d0' : '#e2e8f0'}
                  fontSize="15"
                  fontFamily="monospace"
                  fontWeight="black"
                  textAnchor="middle"
                  className="transition-all duration-200 pointer-events-none filter drop-shadow font-extrabold"
                >
                  {node.char}
                  {isTarget && ' ★'}
                </text>

                {/* Mini cheat sequence written below node */}
                <text
                  x={node.x}
                  y={node.y + (node.shape === 'circle' ? 26 : 24)}
                  fill="#f1f5f9"
                  fontSize="11.5"
                  fontFamily="monospace"
                  fontWeight="extrabold"
                  textAnchor="middle"
                  opacity="1"
                  className="transition-opacity pointer-events-none fill-slate-100 font-extrabold filter drop-shadow"
                >
                  {node.code}
                </text>
              </g>
            );
          })}
        </g>
      </svg>
    </div>
  );
}
