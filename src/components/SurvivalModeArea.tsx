import React from 'react';
import { motion } from 'motion/react';
import { Zap, Play } from 'lucide-react';

interface PracticeWord {
  word: string;
  category: string;
  meaning: string;
}

interface SurvivalModeAreaProps {
  key?: string;
  isSurvivalActive: boolean;
  survivalScore: number;
  survivalTime: number;
  survivalCurrentWord: PracticeWord | null;
  wordProgressIdx: number;
  MORSE_DICT: Record<string, string>;
  onStartSurvival: () => void;
  onGiveUp: () => void;
}

export default function SurvivalModeArea({
  isSurvivalActive,
  survivalScore,
  survivalTime,
  survivalCurrentWord,
  wordProgressIdx,
  MORSE_DICT,
  onStartSurvival,
  onGiveUp,
}: SurvivalModeAreaProps) {
  return (
    <motion.div 
      key="survival"
      initial={{ opacity: 0, y: 5 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -5 }}
      className="flex flex-col gap-3 h-full justify-between flex-1 select-none"
    >
      <div>
        <h3 className="font-sans font-bold text-sm text-slate-200 flex justify-between items-center">
          <span className="flex items-center gap-1 text-rose-500 font-extrabold">
            <Zap className="w-4 h-4 text-rose-500 animate-bounce" /> 통신 재난 서바이벌!
          </span>
          <span className="text-[10px] bg-rose-950 text-rose-400 px-1.5 py-0.5 rounded font-mono">SURVIVAL</span>
        </h3>
        <p className="text-[11px] text-slate-400 mt-0.5 font-sans">
          침몰하는 타이타닉호에서 무전 기한 내에 아는 단어를 구출하십시오. (오타 입력 시 생존 시간 차감!)
        </p>
      </div>

      {!isSurvivalActive ? (
        /* Game Over / Idle Lobby screen */
        <div className="flex flex-col items-center justify-center my-4 py-8 bg-slate-950/80 rounded-2xl border border-rose-950/60">
          <span className="text-xs font-mono text-rose-500 font-bold uppercase tracking-widest animate-pulse">무전 송전 중단</span>
          <span className="text-3xl font-mono font-black text-slate-100 my-2">게임 오버</span>
          <span className="text-[11px] font-sans text-slate-400 mb-4 flex items-center gap-1.5 justify-center">
            최종 생존 점수: <b className="text-emerald-400 text-sm font-mono">{survivalScore}</b>점
          </span>
          
          <button
            type="button"
            onClick={onStartSurvival}
            className="py-2.5 px-6 rounded-xl bg-rose-600 hover:bg-rose-500 hover:scale-105 duration-150 cursor-pointer active:scale-95 text-slate-100 font-extrabold text-xs font-mono flex items-center gap-2 shadow-[0_4px_12px_rgba(239,68,68,0.2)]"
          >
            <Play className="w-4 h-4 text-white fill-white" /> 서바이벌 대기소 재진입
          </button>
        </div>
      ) : (
        /* Active gameplay block */
        <div className="my-2 select-none relative">
          <div className="flex justify-between items-center mb-1.5 bg-slate-950 px-3 py-1.5 rounded-lg border border-slate-850">
            <div className="flex items-center gap-1.5 text-[11px] font-mono">
              <span className="text-slate-500">생존 기한:</span>
              <span className={`font-black text-sm font-mono ${survivalTime < 10 ? 'text-rose-500 animate-pulse' : 'text-amber-400'}`}>
                {survivalTime}초
              </span>
            </div>
            <div className="flex items-center gap-1.5 text-[11px] font-mono">
              <span className="text-slate-555 text-slate-500">누적 점수:</span>
              <span className="text-emerald-400 font-black text-sm">{survivalScore}</span>
            </div>
          </div>

          <div className="p-4 bg-slate-950/60 rounded-2xl border border-slate-850 flex flex-col items-center">
            <div className="text-[10px] font-mono text-slate-530 text-slate-500 uppercase mb-1">
              분류 : <span className="text-amber-500 font-bold">{survivalCurrentWord?.category}</span>
            </div>

            <div className="flex gap-1 py-1.5 text-2xl font-mono tracking-widest font-black">
              {survivalCurrentWord?.word.split('').map((char, index) => {
                let colorClass = 'text-slate-600';
                let dotBorder = '';

                if (index < wordProgressIdx) {
                  colorClass = 'text-emerald-450 text-emerald-400 font-bold';
                } else if (index === wordProgressIdx) {
                  colorClass = 'text-rose-500 font-bold underline decoration-wavy scale-110 duration-200';
                  dotBorder = 'ring-2 ring-rose-500/30';
                }

                return (
                  <span 
                    key={`survival-chars-${index}`} 
                    className={`px-2 py-0.5 rounded ${dotBorder} ${colorClass}`}
                  >
                    {char}
                  </span>
                );
              })}
            </div>

            <span className="text-[10px] font-mono text-slate-400 italic">
              현재 타겟: <b className="text-rose-500">{survivalCurrentWord?.word[wordProgressIdx]}</b> &nbsp; 
              이코드: <b className="text-amber-400 font-bold">{MORSE_DICT[survivalCurrentWord?.word[wordProgressIdx] || '']}</b>
            </span>

            <span className="text-[10px] text-slate-500 mt-1.5 text-center font-sans">
              {survivalCurrentWord?.meaning}
            </span>
          </div>
        </div>
      )}

      {isSurvivalActive && (
        <button
          type="button"
          onClick={onGiveUp}
          className="w-full py-2 bg-slate-950 hover:bg-slate-900 border border-slate-850 hover:border-slate-800 text-rose-500 rounded-xl font-mono text-xs cursor-pointer text-center uppercase active:scale-95 transition-colors"
        >
          무전 퇴장 (포기)
        </button>
      )}
    </motion.div>
  );
}
