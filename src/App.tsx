import React, { useState } from 'react';
import MorseGame from './components/MorseGame';
import { HelpCircle, Info, Radio, Monitor, Laptop, Play, Compass, Wifi } from 'lucide-react';

export default function App() {
  const [showHowToPlay, setShowHowToPlay] = useState(false);

  return (
    <div id="morse-app-root" className="min-h-screen bg-[#0b0f17] text-slate-100 flex flex-col justify-between py-6 px-4 selection:bg-indigo-500 selection:text-white">
      {/* Background radial atmosphere */}
      <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-900/40 via-indigo-950/5 to-slate-950 pointer-events-none z-0"></div>

      <header className="relative max-w-6xl w-full mx-auto flex flex-col sm:flex-row justify-between items-center gap-4 border-b border-slate-800/80 pb-4 mb-6 z-10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-amber-500 to-emerald-500 p-0.5 shadow-lg shadow-emerald-500/15">
            <div className="w-full h-full rounded-[14px] bg-slate-950 flex items-center justify-center">
              <Radio className="w-5 h-5 text-emerald-400" />
            </div>
          </div>
          <div>
            <h1 className="font-sans font-bold tracking-tight text-lg text-slate-100 flex items-center gap-2">
              모스부호 실시간 전신주 게임
              <span className="text-[10px] font-mono tracking-widest bg-emerald-950 text-emerald-400 font-black px-1.5 py-0.5 rounded border border-emerald-900/40">
                PRO TRAINER
              </span>
            </h1>
            <p className="text-xs text-slate-400 font-sans mt-0.5">
              실물 PCB 바이너리 트리 디자인을 통해 소리치고 교감하며 정복하는 완벽 가이드
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 font-mono text-xs">
          <button
            onClick={() => setShowHowToPlay(!showHowToPlay)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-800 hover:border-slate-700 bg-slate-900/60 hover:bg-slate-900 text-slate-300 hover:text-slate-100 transition-all cursor-pointer"
          >
            <HelpCircle className="w-4 h-4 text-amber-400" />
            {showHowToPlay ? '가이드 숨기기' : '조작 규칙 보기'}
          </button>
        </div>
      </header>

      {/* Main Container Wrapper */}
      <main className="relative max-w-6xl w-full mx-auto flex-1 z-10 flex flex-col justify-center">
        {/* Toggle Instruction Drawer */}
        {showHowToPlay && (
          <div 
            id="how-to-play-banner"
            className="mb-6 p-5 bg-gradient-to-br from-slate-900 to-slate-950 border border-slate-800 rounded-3xl font-sans text-xs text-slate-300 animate-slide-down flex flex-col gap-3 shadow-2xl relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 rounded-full blur-2xl pointer-events-none"></div>

            <div className="flex items-center gap-2 font-bold text-sm text-slate-100 border-b border-slate-800 pb-2">
              <Compass className="w-4 h-4 text-emerald-400" /> 비지트 전용 모스 마스터 속성 가이드
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-900/60 flex flex-col gap-1">
                <span className="font-bold text-amber-400 text-[11px] uppercase tracking-wider block">1. 이분법 구조도 학습 (Binary Search)</span>
                <p className="leading-relaxed text-slate-400">
                  모스 부호는 점(Dot, ·)을 만나면 <b>오른쪽(Green)</b>으로, 선(Dash, -)을 만나면 <b>왼쪽(Yellow)</b>으로 뻗어나는 이진 검색 트리 구조입니다. 이미지의 카드 선로를 눈으로 따라가며 글자가 만들어지는 규칙을 이해해 보세요!
                </p>
              </div>

              <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-900/60 flex flex-col gap-1">
                <span className="font-bold text-emerald-400 text-[11px] uppercase tracking-wider block">2. 다양한 송신기 모드</span>
                <p className="leading-relaxed text-slate-400">
                  <b>쉬운 버튼형</b> 모드에서는 도트(·)와 대시(-) 키를 각각 클릭하고 제출을 눌러 안정적으로 훈련할 수 있습니다. <b>리얼 패들</b> 모드에서는 버튼을 정밀하게 홀드하여 실제 전파 오퍼레이터처럼 신호를 조율합니다.
                </p>
              </div>

              <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-900/60 flex flex-col gap-1">
                <span className="font-bold text-indigo-400 text-[11px] uppercase tracking-wider block">3. 빠른 키보드 단축키 지원 (PC 데스크탑)</span>
                <p className="leading-relaxed text-slate-400">
                  데스크탑 사용자는 키보드 <b>닷(키: `.`)</b>, <b>대시(키: `-`)</b>를 타이핑하고, 전신 패들은 <b>`스페이스바(Space)`</b>를 꾹 누르고 뗌으로써 모바일 장비와 완전히 동일한 손맛을 체험할 수 있습니다!
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Real Core Game Area */}
        <MorseGame />
      </main>

      <footer className="relative max-w-6xl w-full mx-auto border-t border-slate-900 pt-5 mt-8 text-center text-[11px] font-mono text-slate-500 z-10 flex flex-col sm:flex-row justify-between items-center gap-3">
        <p className="flex items-center gap-1.5 justify-center">
          <Wifi className="w-3.5 h-3.5 text-emerald-500/80" />
          <span>Interactive pocket telegraph synthesizer connected and operational.</span>
        </p>
        <p>
          Morse Code Trainer &copy; 2026. Designed for offline tactile learning.
        </p>
      </footer>
    </div>
  );
}
