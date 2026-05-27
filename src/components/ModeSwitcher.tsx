import React from "react";
import { Sparkles, Smile, Zap, FileText } from "lucide-react";

interface ModeSwitcherProps {
  gameMode: string;
  onChangeMode: (mode: 'sandbox' | 'practice-letters' | 'practice-words' | 'survival') => void;
}

export function ModeSwitcher({ gameMode, onChangeMode }: ModeSwitcherProps) {
  return (
    <div className="bg-slate-900 border border-slate-800 p-1.5 rounded-2xl flex flex-wrap gap-1 font-mono text-xs">
      <button
        type="button"
        onClick={() => onChangeMode('sandbox')}
        className={`flex-1 py-1 px-3 min-w-[70px] rounded-xl flex items-center justify-center gap-1.5 font-semibold cursor-pointer transition-all ${
          gameMode === 'sandbox' 
            ? 'bg-slate-950 border border-slate-800 text-amber-400 shadow-md scale-102 font-bold' 
            : 'text-slate-400 hover:text-slate-200'
        }`}
      >
        <Sparkles className="w-3.5 h-3.5" /> 자유연습
      </button>
      
      <button
        type="button"
        onClick={() => onChangeMode('practice-letters')}
        className={`flex-1 py-2 px-3 min-w-[80px] rounded-xl flex items-center justify-center gap-1.5 font-semibold cursor-pointer transition-all ${
          gameMode === 'practice-letters' 
            ? 'bg-slate-950 border border-slate-800 text-teal-400 shadow-md scale-102 font-bold' 
            : 'text-slate-400 hover:text-slate-200'
        }`}
      >
        <Smile className="w-3.5 h-3.5" /> 알파벳 퀴즈
      </button>

      <button
        type="button"
        onClick={() => onChangeMode('practice-words')}
        className={`flex-1 py-2 px-3 min-w-[80px] rounded-xl flex items-center justify-center gap-1.5 font-semibold cursor-pointer transition-all ${
          gameMode === 'practice-words' 
            ? 'bg-slate-950 border border-slate-800 text-indigo-400 shadow-md scale-102 font-bold' 
            : 'text-slate-400 hover:text-slate-200'
        }`}
      >
        <FileText className="w-3.5 h-3.5 text-indigo-450" /> 단어 훈련
      </button>

      <button
        type="button"
        onClick={() => onChangeMode('survival')}
        className={`flex-1 py-2 px-3 min-w-[80px] rounded-xl flex items-center justify-center gap-1.5 font-semibold cursor-pointer transition-all ${
          gameMode === 'survival' 
            ? 'bg-slate-950 border border-slate-800 text-rose-500 shadow-md scale-102 font-bold animate-pulse' 
            : 'text-slate-400 hover:text-slate-200'
        }`}
      >
        <Zap className="w-3.5 h-3.5" /> 서바이벌
      </button>
    </div>
  );
}
