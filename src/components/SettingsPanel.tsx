import React from "react";
import { Sliders, Volume2, VolumeX } from "lucide-react";

interface SettingsPanelProps {
  soundEnabled: boolean;
  setSoundEnabled: (val: boolean) => void;
  pitch: number;
  setPitch: (val: number) => void;
  volume: number;
  setVolume: (val: number) => void;
  paddleSensitivity: number;
  setPaddleSensitivity: (val: number) => void;
  showHelperCode: boolean;
  setShowHelperCode: (val: boolean) => void;
}

export function SettingsPanel({
  soundEnabled,
  setSoundEnabled,
  pitch,
  setPitch,
  volume,
  setVolume,
  paddleSensitivity,
  setPaddleSensitivity,
  showHelperCode,
  setShowHelperCode
}: SettingsPanelProps) {
  return (
    <div className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden p-4">
      <div className="flex bg-slate-950 p-1.5 rounded-xl border border-slate-850 text-xs font-mono justify-between mb-3 items-center">
        <span className="text-slate-400 flex items-center gap-1 font-bold pl-1.5 text-[11px]">
          <Sliders className="w-3.5 h-3.5 text-amber-500" /> 장치 환경설정 (Telegraph Settings)
        </span>
        
        {/* audio switch on header */}
        <button 
          type="button"
          onClick={() => setSoundEnabled(!soundEnabled)}
          className={`px-3 py-1 rounded-lg border gap-1 flex items-center duration-150 cursor-pointer ${
            soundEnabled 
              ? 'bg-slate-900 border-emerald-500/30 text-emerald-400 font-bold' 
              : 'bg-slate-900 border-slate-800 text-slate-500'
          }`}
        >
          {soundEnabled ? <Volume2 className="w-3.5 h-3.5" /> : <VolumeX className="w-3.5 h-3.5" />}
          {soundEnabled ? '사운드 ON' : '사운드 MUTE'}
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 font-mono text-xs">
        
        {/* range controls */}
        <div className="flex flex-col gap-3 p-2 bg-slate-950/40 rounded-xl border border-slate-955">
          <div>
            <div className="flex justify-between text-[11px] mb-1">
              <span className="text-slate-400">송신 비프 주파수 (Pitch)</span>
              <span className="text-amber-400 font-bold">{pitch} Hz</span>
            </div>
            <input 
              type="range" 
              min="300" 
              max="1200" 
              step="50"
              value={pitch} 
              onChange={(e) => setPitch(Number(e.target.value))}
              className="w-full accent-amber-500 h-1.5 rounded bg-slate-800"
            />
          </div>

          <div>
            <div className="flex justify-between text-[11px] mb-1">
              <span className="text-slate-400">수신기 지지 음량 (Volume)</span>
              <span className="text-indigo-400 font-bold">{Math.round(volume * 100)}%</span>
            </div>
            <input 
              type="range" 
              min="0" 
              max="1.0" 
              step="0.05"
              value={volume} 
              onChange={(e) => setVolume(Number(e.target.value))}
              className="w-full accent-indigo-500 h-1.5 rounded bg-slate-800"
            />
          </div>
        </div>

        {/* sensitivities & toggle */}
        <div className="flex flex-col gap-3 p-2 bg-slate-950/40 rounded-xl border border-slate-955">
          <div>
            <div className="flex justify-between text-[11px] mb-1">
              <span className="text-slate-400">도트/대시 판정 임계치 (Duration Threshold)</span>
              <span className="text-rose-400 font-bold">{paddleSensitivity} ms</span>
            </div>
            <input 
              type="range" 
              min="110" 
              max="400" 
              step="10"
              value={paddleSensitivity} 
              onChange={(e) => setPaddleSensitivity(Number(e.target.value))}
              className="w-full accent-rose-500 h-1.5 rounded bg-slate-800"
            />
            <span className="text-[9px] text-slate-500 mt-0.5 block italic">
              * 누름 시간이 {paddleSensitivity}ms 미만이면 단일 도트(•), 이상이면 대시(—)로 번역 기재됩니다.
            </span>
          </div>

          <div className="flex justify-between items-center py-1.5 border-t border-slate-850/65 mt-1">
            <span className="text-slate-400 text-[10px]">화면에 정답 가이드 상시 표시</span>
            <button
              type="button"
              onClick={() => setShowHelperCode(!showHelperCode)}
              className={`px-2.5 py-1 rounded text-[10px] font-bold cursor-pointer transition-colors ${
                showHelperCode 
                  ? 'bg-indigo-950 border border-indigo-500/30 text-indigo-400' 
                  : 'bg-slate-950 border border-slate-850 text-slate-500'
              }`}
            >
              {showHelperCode ? '활성화' : '가리기'}
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
