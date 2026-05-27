import React from 'react';
import { motion } from 'motion/react';
import { Sparkles, Copy, Check, Volume2 } from 'lucide-react';

interface SandboxModeAreaProps {
  key?: string;
  autoSubmitDelay: number;
  accumulatedText: string;
  copied: boolean;
  onCopy: () => void;
  onPlayAll: () => void;
  onClear: () => void;
  currentSequence: string;
}

export default function SandboxModeArea({
  autoSubmitDelay,
  accumulatedText,
  copied,
  onCopy,
  onPlayAll,
  onClear,
  currentSequence,
}: SandboxModeAreaProps) {
  return (
    <motion.div 
      key="sandbox"
      initial={{ opacity: 0, y: 5 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -5 }}
      className="flex flex-col gap-3 h-full justify-between flex-1 select-none"
    >
      <div>
        <h3 className="font-sans font-bold text-sm text-slate-205 text-slate-200 flex items-center justify-between gap-1">
          <span className="flex items-center gap-1">
            <Sparkles className="w-4 h-4 text-amber-500 animate-pulse" /> 모스 전신 샌드박스 (자동 띄어쓰기)
          </span>
          <span className="text-[10px] bg-slate-950 text-slate-500 px-1.5 py-0.5 rounded font-mono">SANDBOX</span>
        </h3>
        <p className="text-[11px] text-slate-400 mt-0.5">
          자유롭게 송신기 패들을 누르거나 코드 키를 전송해 뜻을 파악해보세요. 송파 대기 시간이 {autoSubmitDelay}ms를 초과하면 버퍼가 자동 축적됩니다.
        </p>
      </div>

      <div className="my-3">
        <label className="text-[10px] font-mono text-slate-505 text-slate-500 block uppercase mb-1">복원 텍스트 전신 수신함 (Output)</label>
        <div className="bg-slate-950 border border-slate-850 p-3.5 rounded-xl min-h-[90px] font-mono text-slate-100 flex flex-wrap items-center gap-1.5 text-base tracking-widest relative">
          {accumulatedText ? (
            <span className="break-all font-bold select-text text-amber-400">{accumulatedText}</span>
          ) : (
            <span className="text-slate-600 italic text-xs select-none">신호를 송출하여 메시지를 복원하십시오...</span>
          )}

          {accumulatedText && (
            <div className="absolute right-2.5 bottom-2.5 flex items-center gap-1.5 no-print select-none">
              <button
                type="button"
                onClick={onCopy}
                title="텍스트 복사"
                className="p-1.5 rounded-lg bg-slate-900 hover:bg-slate-850 border border-slate-800 text-slate-400 hover:text-slate-200 active:scale-95 cursor-pointer flex items-center"
              >
                {copied ? <Check className="w-3 h-3 text-emerald-400 animate-bounce" /> : <Copy className="w-3 h-3" />}
              </button>
              <button
                type="button"
                onClick={onPlayAll}
                title="스피커로 전체 재생"
                className="p-1.5 rounded-lg bg-slate-900 hover:bg-slate-850 border border-slate-800 text-slate-400 hover:text-amber-400 active:scale-95 cursor-pointer flex items-center animate-pulse"
                style={{ animationDuration: '3s' }}
              >
                <Volume2 className="w-3 h-3" />
              </button>
            </div>
          )}
        </div>
      </div>

      <button
        type="button"
        onClick={onClear}
        disabled={!accumulatedText && !currentSequence}
        className="w-full py-2 bg-slate-950 text-slate-405 text-slate-400 border border-slate-850 hover:border-slate-800 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-900 rounded-xl font-mono text-xs cursor-pointer text-center uppercase transition-colors"
      >
        메시지 버퍼 비우기
      </button>
    </motion.div>
  );
}
