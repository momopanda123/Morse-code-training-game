import React from 'react';
import { motion } from 'motion/react';
import { Volume2 } from 'lucide-react';

interface QuizModeAreaProps {
  key?: string;
  targetChar: string;
  showHelperCode: boolean;
  MORSE_DICT: Record<string, string>;
  onPlaySample: (code: string) => void;
  onSkip: () => void;
}

export default function QuizModeArea({
  targetChar,
  showHelperCode,
  MORSE_DICT,
  onPlaySample,
  onSkip,
}: QuizModeAreaProps) {
  return (
    <motion.div 
      key="quiz"
      initial={{ opacity: 0, y: 5 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -5 }}
      className="flex flex-col gap-3 h-full justify-between flex-1 select-none"
    >
      <div>
        <h3 className="font-sans font-bold text-sm text-slate-205 text-slate-200 flex justify-between">
          <span>알파벳 개별 무작위 퀴즈</span>
          <span className="text-[10px] bg-slate-950 text-emerald-500 px-1.5 py-0.5 rounded font-mono">QUIZ</span>
        </h3>
        <p className="text-[11px] text-slate-400 mt-0.5">
          화면에 지시된 알파벳을 해석하여 알맞은 모스 코드를 순서대로 차례차례 입력해주세요.
        </p>
      </div>

      <div className="flex flex-col items-center justify-center my-4 py-3 bg-slate-950/60 rounded-2xl border border-slate-900 relative">
        <span className="text-[10px] font-mono text-slate-450 text-slate-400 absolute top-2 left-3 uppercase select-none">목표 알파벳</span>
        <div className="text-5xl font-sans font-black text-emerald-400 tracking-wide mt-2">{targetChar}</div>
        
        {showHelperCode && (
          <div className="mt-2 text-xs font-mono text-slate-405 text-slate-300 bg-slate-950 px-2 py-0.5 rounded border border-slate-850">
            답안 코드: <span className="text-amber-500 font-bold">{MORSE_DICT[targetChar]}</span>
          </div>
        )}

        <button 
          type="button"
          onClick={() => onPlaySample(MORSE_DICT[targetChar])}
          className="mt-2 text-[10px] font-mono text-indigo-400 hover:text-indigo-300 flex items-center gap-1 cursor-pointer active:scale-95"
        >
          <Volume2 className="w-3.5 h-3.5" /> 모스 소리 힌트 듣기
        </button>
      </div>

      <button
        type="button"
        onClick={onSkip}
        className="w-full py-2 bg-slate-950 hover:bg-slate-900 border border-slate-850 hover:border-slate-800 rounded-xl font-mono text-xs cursor-pointer text-center uppercase active:scale-95 transition-colors"
      >
        지나치기 (스킵)
      </button>
    </motion.div>
  );
}
