import React from 'react';
import { motion } from 'motion/react';
import { Volume2 } from 'lucide-react';

interface PracticeWord {
  word: string;
  category: string;
  meaning: string;
}

interface WordsModeAreaProps {
  key?: string;
  wordTargetString: string;
  wordProgressIdx: number;
  WORD_DB: PracticeWord[];
  MORSE_DICT: Record<string, string>;
  showHelperCode: boolean;
  onPlaySample: (code: string) => void;
  onNextWord: () => void;
}

export default function WordsModeArea({
  wordTargetString,
  wordProgressIdx,
  WORD_DB,
  MORSE_DICT,
  showHelperCode,
  onPlaySample,
  onNextWord,
}: WordsModeAreaProps) {
  const currentWordInfo = WORD_DB.find(w => w.word === wordTargetString);

  return (
    <motion.div 
      key="words"
      initial={{ opacity: 0, y: 5 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -5 }}
      className="flex flex-col gap-3 h-full justify-between flex-1 select-none"
    >
      <div>
        <h3 className="font-sans font-bold text-sm text-slate-205 text-slate-200 flex justify-between">
          <span>핵심 조난/조타 통용 단어 훈련</span>
          <span className="text-[10px] bg-indigo-950 text-indigo-400 px-1.5 py-0.5 rounded font-mono">WORDS</span>
        </h3>
        <p className="text-[11px] text-slate-400 mt-0.5">
          주요 단어들을 철자 단위로 입력하는 실무 통신 훈련입니다.
        </p>
      </div>

      <div className="my-3 p-4 bg-slate-950/60 rounded-2xl border border-slate-850 flex flex-col items-center">
        <div className="text-[10px] font-mono text-slate-500 uppercase mb-1">
          분류: <span className="text-indigo-400 font-bold">{currentWordInfo?.category || '일반 통신'}</span>
        </div>

        {/* Word spelling progress visualization */}
        <div className="flex gap-1 py-1.5 text-2xl font-mono tracking-widest font-black">
          {wordTargetString.split('').map((char, index) => {
            let colorClass = 'text-slate-600 font-medium';
            let dotBorder = '';

            if (index < wordProgressIdx) {
              colorClass = 'text-indigo-400 font-bold';
            } else if (index === wordProgressIdx) {
              colorClass = 'text-amber-400 font-bold underline decoration-wavy scale-110 duration-200';
              dotBorder = 'ring-2 ring-amber-500/30';
            }

            return (
              <span 
                key={`word-progress-${index}`} 
                className={`px-2 py-0.5 rounded ${dotBorder} ${colorClass}`}
              >
                {char}
              </span>
            );
          })}
        </div>

        <div className="mt-1.5 text-xs text-slate-300 font-sans text-center max-w-sm">
          {currentWordInfo?.meaning || ''}
        </div>

        <div className="mt-2.5 flex items-center gap-1.5 text-[10px] font-mono text-slate-500">
          <span>현재 타겟 철자:</span>
          <span className="text-amber-500 font-bold text-xs">{wordTargetString[wordProgressIdx]}</span>
          {showHelperCode && (
            <span className="text-slate-405">({MORSE_DICT[wordTargetString[wordProgressIdx]]})</span>
          )}
          <button 
            type="button"
            onClick={() => onPlaySample(MORSE_DICT[wordTargetString[wordProgressIdx]])}
            className="ml-1 text-slate-400 hover:text-slate-200 cursor-pointer active:scale-95"
            title="힌트음 청취"
          >
            <Volume2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      <button
        type="button"
        onClick={onNextWord}
        className="w-full py-2 bg-slate-950 hover:bg-slate-900 border border-slate-850 hover:border-slate-800 rounded-xl font-mono text-xs cursor-pointer text-center uppercase active:scale-95 transition-colors"
      >
        다음 고정 단어로 가기
      </button>
    </motion.div>
  );
}
