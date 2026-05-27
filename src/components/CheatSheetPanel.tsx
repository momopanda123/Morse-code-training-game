import React from "react";
import { BookOpen } from "lucide-react";

interface CheatSheetPanelProps {
  gameMode: string;
  targetChar: string;
  wordTargetString: string;
  wordProgressIdx: number;
  survivalCurrentWord?: { word: string; category: string; meaning: string } | null;
  MORSE_DICT: Record<string, string>;
  onTriggerCheat: (char: string, code: string) => void;
}

export function CheatSheetPanel({
  gameMode,
  targetChar,
  wordTargetString,
  wordProgressIdx,
  survivalCurrentWord,
  MORSE_DICT,
  onTriggerCheat
}: CheatSheetPanelProps) {
  return (
    <div className="bg-slate-900 border border-slate-800 rounded-3xl p-4">
      <h4 className="font-mono text-xs font-bold text-slate-350 mb-2.5 flex items-center gap-1.5 uppercase pl-1">
        <BookOpen className="w-3.5 h-3.5 text-indigo-400" /> 모스 부호 규격 요약표 (클릭 시 소리 청취 & 기입)
      </h4>
      <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-7 lg:grid-cols-8 xl:grid-cols-9 gap-1.5 font-mono">
        {Object.entries(MORSE_DICT).map(([char, code]) => {
          // Check if this specific character is currently requested in the active drilling challenge.
          const isTargeting = (
            (gameMode === 'practice-letters' && targetChar === char) ||
            (gameMode === 'practice-words' && wordTargetString[wordProgressIdx] === char) ||
            (gameMode === 'survival' && survivalCurrentWord?.word[wordProgressIdx] === char)
          );

          return (
            <button
              key={char}
              type="button"
              onClick={() => onTriggerCheat(char, code)}
              title={`${char} 전송음 듣기 및 샌드박스 버퍼 기입`}
              className={`py-1.5 px-2 rounded-xl border text-center cursor-pointer duration-100 flex flex-col justify-center items-center gap-0.5 ${
                isTargeting 
                  ? 'bg-amber-500 text-slate-950 border-amber-400 font-bold scale-105 shadow-[0_3px_10px_rgba(245,158,11,0.4)]' 
                  : 'bg-slate-950 border-slate-850 hover:bg-slate-900 hover:border-slate-800 text-slate-300'
              }`}
            >
              {/* Alphabet */}
              <span className="text-sm font-black tracking-wide">{char}</span>
              {/* Morse symbols */}
              <span className="text-[9px] font-bold tracking-tighter text-slate-400">
                {code}
              </span>
            </button>
          );
        })}
      </div>
      <p className="text-[10px] font-sans text-slate-500 mt-2.5 italic text-left pl-1">
        * 팁: 요약표 철자를 클릭하면 기어 주파수 전파음이 발송되며, 자유연습(샌드박스)의 수신기 문맥에 해당 문자가 추가됩니다!
      </p>
    </div>
  );
}
