import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Play, 
  RotateCcw, 
  HelpCircle, 
  Layers, 
  Sparkles, 
  Smile, 
  Volume2, 
  VolumeX, 
  HelpCircle as HelpIcon,
  BookOpen, 
  Sliders, 
  Copy, 
  Check, 
  Zap, 
  Heart, 
  Info, 
  FileText
} from 'lucide-react';
import { morseAudio } from '../utils/audio';
import { PCB_NODES, WORD_DB, REVERSE_MORSE_DICT, MORSE_DICT } from '../db';
import PcbCard from './PcbCard';
import { ModeSwitcher } from './ModeSwitcher';
import { SettingsPanel } from './SettingsPanel';
import { CheatSheetPanel } from './CheatSheetPanel';
import SandboxModeArea from './SandboxModeArea';
import QuizModeArea from './QuizModeArea';
import WordsModeArea from './WordsModeArea';
import SurvivalModeArea from './SurvivalModeArea';
import { GameMode, ScoreState, PracticeWord } from '../types';

export default function MorseGame() {
  // Input sequence typed so far for the CURRENT letter (e.g., "...")
  const [currentSequence, setCurrentSequence] = useState<string>('');
  // Decoded string accumulated in sandbox or current word challenge
  const [accumulatedText, setAccumulatedText] = useState<string>('');
  
  // Game Setup & Modes
  const [gameMode, setGameMode] = useState<GameMode>('sandbox');
  const [scoreState, setScoreState] = useState<ScoreState>({
    score: 0,
    streak: 0,
    highScore: parseInt(localStorage.getItem('morse_high_score') || '0', 10),
    totalAttempts: 0,
    correctAttempts: 0,
  });

  // Settings
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);
  const [pitch, setPitch] = useState<number>(700);
  const [volume, setVolume] = useState<number>(0.5);
  const [paddleSensitivity, setPaddleSensitivity] = useState<number>(180); // Ms threshold for Dot vs Dash
  const [showHelperCode, setShowHelperCode] = useState<boolean>(true);
  const [autoSubmitDelay, setAutoSubmitDelay] = useState<number>(800); // ms inactivity to trigger decode
  const [inputStyle, setInputStyle] = useState<'discrete' | 'paddle'>('discrete'); // Discrete (.) / (-) vs True Analog Paddle
  
  // States of Active Targets
  const [targetChar, setTargetChar] = useState<string>('S');
  const [activeWordIdx, setActiveWordIdx] = useState<number>(0);
  const [wordTargetString, setWordTargetString] = useState<string>('SOS');
  const [wordProgressIdx, setWordProgressIdx] = useState<number>(0); // how many letters typed correctly in current word
  const [errorCharFlash, setErrorCharFlash] = useState<string>('');

  // Survival Blitz State
  const [survivalTime, setSurvivalTime] = useState<number>(30);
  const [isSurvivalActive, setIsSurvivalActive] = useState<boolean>(false);
  const [survivalCurrentWord, setSurvivalCurrentWord] = useState<PracticeWord | null>(null);
  const [survivalScore, setSurvivalScore] = useState<number>(0);

  // States for copy feedback
  const [copied, setCopied] = useState<boolean>(false);

  // Responsive design viewport state trackers
  const [isMobile, setIsMobile] = useState<boolean>(false);
  const [showPcbOnMobile, setShowPcbOnMobile] = useState<boolean>(false);
  const [showCheatSheetOnMobile, setShowCheatSheetOnMobile] = useState<boolean>(false);

  useEffect(() => {
    const checkViewport = () => {
      setIsMobile(window.innerWidth < 1024);
    };
    checkViewport();
    window.addEventListener('resize', checkViewport);
    return () => window.removeEventListener('resize', checkViewport);
  }, []);

  // Audio configuration updates
  useEffect(() => {
    morseAudio.setFrequency(pitch);
    morseAudio.setVolume(soundEnabled ? volume : 0);
  }, [pitch, volume, soundEnabled]);

  // Handle high-score recording
  useEffect(() => {
    if (scoreState.score > scoreState.highScore) {
      setScoreState(prev => ({ ...prev, highScore: prev.score }));
      localStorage.setItem('morse_high_score', scoreState.score.toString());
    }
  }, [scoreState.score]);

  // Auto-submit timer ref (to parse characters when user stops typing in Sandbox or Word/Quiz)
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Restart auto-submit timeout whenever sequence changes
  useEffect(() => {
    if (currentSequence === '') return;

    if (timerRef.current) clearTimeout(timerRef.current);

    if (gameMode === 'sandbox' || inputStyle === 'paddle') {
      timerRef.current = setTimeout(() => {
        handleInactivityTimeout();
      }, autoSubmitDelay);
    }

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [currentSequence, gameMode, autoSubmitDelay, inputStyle]);

  // Analog Paddle Tap Tracking references
  const pressStartTime = useRef<number>(0);
  const isPaddleHolding = useRef<boolean>(false);

  // Time survival clock
  useEffect(() => {
    let survivalTimer: NodeJS.Timeout;
    if (gameMode === 'survival' && isSurvivalActive && survivalTime > 0) {
      survivalTimer = setInterval(() => {
        setSurvivalTime(prev => {
          if (prev <= 1) {
            setIsSurvivalActive(false);
            // End of survival game
            morseAudio.playSequence('---'); // Play Game Over beep rhythm
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(survivalTimer);
  }, [gameMode, isSurvivalActive, survivalTime]);

  // Play audio sequences
  const playSampleCode = (code: string) => {
    morseAudio.playSequence(code, 120);
  };

  /**
   * Action when no typing occurs for autoDecodeDelay ms
   */
  const handleInactivityTimeout = () => {
    if (currentSequence === '') return;
    decodeCurrentSequence();
  };

  /**
   * Translates current dot/dash string into character
   */
  const decodeCurrentSequence = () => {
    const char = REVERSE_MORSE_DICT[currentSequence] || '';

    if (gameMode === 'sandbox') {
      if (char) {
        setAccumulatedText(prev => prev + char);
      } else {
        // Unidentified signal, output a placeholder symbol or blink red
        setAccumulatedText(prev => prev + '❓');
        setErrorCharFlash('?');
        setTimeout(() => setErrorCharFlash(''), 700);
      }
      setCurrentSequence('');
    } else {
      // In structured drilling, evaluate the keyed inputs
      evaluateStructuredInput(char);
    }
  };

  /**
   * Validates user inputs against current game target
   */
  const evaluateStructuredInput = (inputChar: string) => {
    if (!inputChar) {
      setErrorCharFlash('?');
      setTimeout(() => setErrorCharFlash(''), 600);
      setCurrentSequence('');
      return;
    }

    if (gameMode === 'practice-letters') {
      if (inputChar === targetChar) {
        // Success
        playSoundEffect(true);
        setScoreState(prev => ({
          ...prev,
          score: prev.score + 10 + Math.min(prev.streak, 5) * 2, // bonus for streak
          streak: prev.streak + 1,
          totalAttempts: prev.totalAttempts + 1,
          correctAttempts: prev.correctAttempts + 1,
        }));
        generateNewLetterTarget();
      } else {
        // Mistake
        playSoundEffect(false);
        setErrorCharFlash(inputChar);
        setTimeout(() => setErrorCharFlash(''), 800);
        setScoreState(prev => ({
          ...prev,
          streak: 0,
          totalAttempts: prev.totalAttempts + 1,
        }));
      }
      setCurrentSequence('');
    } 
    else if (gameMode === 'practice-words') {
      const expectedChar = wordTargetString[wordProgressIdx];
      if (inputChar === expectedChar) {
        // Correct letter of the word
        playSoundEffect(true);
        const nextProg = wordProgressIdx + 1;
        if (nextProg >= wordTargetString.length) {
          // Completed entire word!
          setScoreState(prev => ({
            ...prev,
            score: prev.score + 50 + prev.streak * 5,
            streak: prev.streak + 1,
            totalAttempts: prev.totalAttempts + 1,
            correctAttempts: prev.correctAttempts + 1,
          }));
          setAccumulatedText('');
          setWordProgressIdx(0);
          generateNewWordTarget();
        } else {
          // Progress within word
          setWordProgressIdx(nextProg);
          setAccumulatedText(prev => prev + inputChar);
        }
      } else {
        // Failed this letter
        playSoundEffect(false);
        setErrorCharFlash(inputChar);
        setTimeout(() => setErrorCharFlash(''), 800);
        setScoreState(prev => ({
          ...prev,
          streak: 0,
          totalAttempts: prev.totalAttempts + 1,
        }));
      }
      setCurrentSequence('');
    } 
    else if (gameMode === 'survival') {
      if (!survivalCurrentWord) return;
      const expectedChar = survivalCurrentWord.word[wordProgressIdx];

      if (inputChar === expectedChar) {
        playSoundEffect(true);
        const nextProg = wordProgressIdx + 1;
        if (nextProg >= survivalCurrentWord.word.length) {
          // Spelled word successfully! Add substantial time bonus
          const bonusTime = survivalCurrentWord.word.length * 4;
          setSurvivalTime(t => Math.min(60, t + bonusTime));
          setSurvivalScore(s => s + survivalCurrentWord.word.length * 20);
          setScoreState(prev => ({
            ...prev,
            score: prev.score + survivalCurrentWord.word.length * 15,
            streak: prev.streak + 1,
            totalAttempts: prev.totalAttempts + 1,
            correctAttempts: prev.correctAttempts + 1,
          }));
          setWordProgressIdx(0);
          setAccumulatedText('');
          generateNewSurvivalWord();
        } else {
          setWordProgressIdx(nextProg);
          setAccumulatedText(prev => prev + inputChar);
        }
      } else {
        playSoundEffect(false);
        setErrorCharFlash(inputChar);
        setTimeout(() => setErrorCharFlash(''), 800);
        // Deduct time for penalty
        setSurvivalTime(t => Math.max(1, t - 4));
        setScoreState(prev => ({
          ...prev,
          streak: 0,
          totalAttempts: prev.totalAttempts + 1,
        }));
      }
      setCurrentSequence('');
    }
  };

  /**
   * Sound generator helper for correctness chimes
   */
  const playSoundEffect = (success: boolean) => {
    if (!soundEnabled) return;
    if (success) {
      // Pleasant dual high pitch ding
      morseAudio.setFrequency(900);
      morseAudio.playBeep(60).then(() => {
        setTimeout(() => {
          morseAudio.setFrequency(1100);
          morseAudio.playBeep(70).then(() => {
            morseAudio.setFrequency(pitch); // revert
          });
        }, 50);
      });
    } else {
      // Dense error buzz
      morseAudio.setFrequency(180);
      morseAudio.playBeep(250).then(() => {
        morseAudio.setFrequency(pitch); // revert
      });
    }
  };

  const generateNewLetterTarget = () => {
    const activeNodes = PCB_NODES;
    const randomNode = activeNodes[Math.floor(Math.random() * activeNodes.length)];
    setTargetChar(randomNode.char);
  };

  const generateNewWordTarget = () => {
    const words = WORD_DB;
    // pick starting words, then scale up
    const filtered = words.filter(w => w.word !== 'SOS');
    const randomWord = filtered[Math.floor(Math.random() * filtered.length)];
    setWordTargetString(randomWord.word);
    setWordProgressIdx(0);
  };

  const generateNewSurvivalWord = () => {
    const words = WORD_DB;
    const randomWord = words[Math.floor(Math.random() * words.length)];
    setSurvivalCurrentWord(randomWord);
    setWordProgressIdx(0);
  };

  // Switch game modes cleanly
  const changeMode = (mode: GameMode) => {
    setGameMode(mode);
    setCurrentSequence('');
    setAccumulatedText('');
    setWordProgressIdx(0);

    if (mode === 'practice-letters') {
      generateNewLetterTarget();
    } else if (mode === 'practice-words') {
      // start with SOS to ease them in
      setWordTargetString('SOS');
      setWordProgressIdx(0);
    } else if (mode === 'survival') {
      setSurvivalTime(35);
      setIsSurvivalActive(true);
      setSurvivalScore(0);
      generateNewSurvivalWord();
    }
  };

  // Keyboard support for desktop sandboxers 
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Only process when not typing into inputs if settings details expanded
      if (e.target instanceof HTMLInputElement) return;

      if (e.repeat) return; // prevent key repeats!

      if (e.key === '.' || e.key === '*') {
        handleTapDot();
      } else if (e.key === '-' || e.key === '_') {
        handleTapDash();
      } else if (e.key === 'Spacebar' || e.key === ' ') {
        e.preventDefault();
        if (inputStyle === 'discrete') {
          // Submit current letter
          decodeCurrentSequence();
        } else {
          // True paddle press
          handlePaddleStart();
        }
      } else if (e.key === 'Backspace' || e.key === 'Delete') {
        setCurrentSequence('');
      } else if (e.key === 'Enter') {
        if (accumulatedText.length > 0 && gameMode === 'sandbox') {
          // Play current message
          playAccumulatedSandbox();
        }
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.key === ' ' && inputStyle === 'paddle') {
        e.preventDefault();
        handlePaddleEnd();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [currentSequence, gameMode, inputStyle, targetChar, wordTargetString, wordProgressIdx, survivalCurrentWord, accumulatedText]);

  // Input Handlers
  const handleTapDot = () => {
    if (gameMode === 'survival' && !isSurvivalActive) return;
    morseAudio.playBeep(90);
    
    // Add dot to layout
    if (currentSequence.length < 5) {
      setCurrentSequence(prev => prev + '.');
    }
  };

  const handleTapDash = () => {
    if (gameMode === 'survival' && !isSurvivalActive) return;
    morseAudio.playBeep(270);

    // Add dash to layout
    if (currentSequence.length < 5) {
      setCurrentSequence(prev => prev + '-');
    }
  };

  // Telegraph Key paddle interactions
  const handlePaddleStart = (e?: React.TouchEvent | React.MouseEvent) => {
    if (e) {
      // Prevent browser text select & scrolling loops
      if (e.cancelable) e.preventDefault();
    }
    if (gameMode === 'survival' && !isSurvivalActive) return;

    isPaddleHolding.current = true;
    pressStartTime.current = Date.now();
    morseAudio.startBeep();
  };

  const handlePaddleEnd = (e?: React.TouchEvent | React.MouseEvent) => {
    if (e) {
      if (e.cancelable) e.preventDefault();
    }
    if (!isPaddleHolding.current) return;
    isPaddleHolding.current = false;
    morseAudio.stopBeep();

    const duration = Date.now() - pressStartTime.current;
    
    // Convert duration to DOT or DASH based on ms threshold sensitivity
    if (duration > 5) {
      const isDash = duration >= paddleSensitivity;
      const symbol = isDash ? '-' : '.';
      if (currentSequence.length < 5) {
        setCurrentSequence(prev => prev + symbol);
      }
    }
  };

  const handleClear = () => {
    setCurrentSequence('');
    if (gameMode === 'sandbox') {
      setAccumulatedText('');
    }
  };

  // Play sandbox contents as audio sequentials
  const playAccumulatedSandbox = async () => {
    if (accumulatedText === '') return;
    for (let char of accumulatedText) {
      const cleanUpper = char.toUpperCase();
      const code = MORSE_DICT[cleanUpper];
      if (code) {
        await morseAudio.playSequence(code, 90);
        // wait for short space between characters
        await new Promise(r => setTimeout(r, 200));
      } else if (char === ' ') {
        // word gap
        await new Promise(r => setTimeout(r, 500));
      }
    }
  };

  // Copy sandbox interpreted strings to clipboard
  const copySandboxToClipboard = () => {
    if (!accumulatedText) return;
    navigator.clipboard.writeText(accumulatedText)
      .then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      });
  };

  // Reference tables interaction
  const triggerCheatListItem = (char: string, code: string) => {
    playSampleCode(code);
    if (gameMode === 'sandbox') {
      setCurrentSequence(code);
    }
  };

  // Render score boards nicely
  const successPercentage = scoreState.totalAttempts > 0 
    ? Math.round((scoreState.correctAttempts / scoreState.totalAttempts) * 100)
    : 100;

  // --- SUB-RENDER ELEMENTS (Reused in both Desktop and Mobile view branches) ---
  const pcbCardElement = (
    <PcbCard 
      currentSequence={currentSequence}
      onNodeClick={(char, code) => triggerCheatListItem(char, code)}
      targetChar={
        gameMode === 'practice-letters' ? targetChar :
        gameMode === 'practice-words' ? wordTargetString[wordProgressIdx] :
        gameMode === 'survival' && survivalCurrentWord ? survivalCurrentWord.word[wordProgressIdx] :
        undefined
      }
      errorChar={errorCharFlash}
    />
  );

  const signalAnalyzerDashboardElement = (
    <div id="signal-analyzer-dashboard" className="bg-slate-900 border border-slate-800 p-3 rounded-2xl font-mono text-xs flex flex-wrap items-center gap-3">
      <div className="flex items-center gap-2 bg-slate-950/40 px-2.5 py-1.5 rounded-xl border border-slate-850/60">
        <span className="relative flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
        </span>
        <span className="text-slate-400 font-medium">신호 분석기:</span>
        <div className="flex items-center gap-1 min-h-[24px]">
          <AnimatePresence mode="popLayout">
            {currentSequence ? (
              <div className="flex gap-1">
                {currentSequence.split('').map((char, index) => (
                  <motion.span
                    key={`signal-display-${index}-${char}`}
                    initial={{ scale: 0.4, y: 10, opacity: 0 }}
                    animate={{ scale: 1, y: 0, opacity: 1 }}
                    exit={{ scale: 0.6, y: -10, opacity: 0 }}
                    transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                    className={`inline-flex items-center justify-center font-bold text-[10px] h-5 px-1.5 rounded ${
                      char === '.' 
                        ? 'bg-emerald-950/80 text-emerald-400 border border-emerald-800/40 shadow-[0_0_8px_rgba(16,185,129,0.15)] font-mono' 
                        : 'bg-amber-950/80 text-amber-500 border border-amber-800/40 shadow-[0_0_8px_rgba(245,158,11,0.15)] font-mono'
                    }`}
                  >
                    {char === '.' ? '●' : '■'}
                  </motion.span>
                ))}
              </div>
            ) : (
              <span className="text-slate-600 italic text-[11px] px-1">대기 중...</span>
            )}
          </AnimatePresence>
        </div>
      </div>

      <div className="flex items-center gap-2 bg-slate-950/40 px-2.5 py-1.5 rounded-xl border border-slate-850/60">
        <span className="text-slate-400 font-medium">감지 문자:</span>
        <AnimatePresence mode="wait">
          <motion.span
            key={`analyzer-char-${REVERSE_MORSE_DICT[currentSequence] || '-'}`}
            initial={{ scale: 0.7, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.7, opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="text-amber-400 font-black text-sm min-w-[20px] text-center"
          >
            {REVERSE_MORSE_DICT[currentSequence] || '-'}
          </motion.span>
        </AnimatePresence>
      </div>

      {gameMode !== 'sandbox' && (
        <div className="text-slate-400 flex items-center gap-2 sm:ml-auto">
          <span>적중률:</span>
          <span className="text-teal-400 font-black bg-slate-950/50 px-2 py-0.5 rounded border border-slate-850">{successPercentage}%</span>
        </div>
      )}
    </div>
  );
  // --- 1. Virtual Telegraph Paddle Control Area (Ergonomic keys and tap paddle) ---
  const virtualTelegraphPaddleElement = (
    <div className="bg-slate-900 border border-slate-800 p-4 rounded-3xl flex flex-col gap-3 relative select-none">
      <div className="flex justify-between items-center bg-slate-950 px-3 py-1.5 rounded-xl border border-slate-850/60 text-[10px] font-mono text-slate-400">
        <span className="flex items-center gap-1">⚙️ 물리 모스 패들 기어</span>
        <span className="text-amber-500 font-bold">PADDLE GEAR</span>
      </div>

      <div className="grid grid-cols-2 gap-2 font-mono">
        <button
          type="button"
          onTouchStart={(e) => { e.preventDefault(); handleTapDot(); }}
          onMouseDown={handleTapDot}
          className="py-3 px-1 border border-emerald-900 bg-emerald-950/20 hover:bg-emerald-900/10 text-emerald-400 active:scale-95 duration-100 flex flex-col items-center justify-center gap-0.5 rounded-2xl cursor-pointer"
        >
          <span className="text-xl font-black">●</span>
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">도트 [단점]</span>
        </button>

        <button
          type="button"
          onTouchStart={(e) => { e.preventDefault(); handleTapDash(); }}
          onMouseDown={handleTapDash}
          className="py-3 px-1 border border-amber-900 bg-amber-950/20 hover:bg-amber-900/10 text-amber-500 active:scale-95 duration-100 flex flex-col items-center justify-center gap-0.5 rounded-2xl cursor-pointer"
        >
          <span className="text-xl font-black">■</span>
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">대시 [장점]</span>
        </button>
      </div>

      {/* Ergonomic spring-loaded Paddle hold box */}
      <div 
        role="button"
        tabIndex={0}
        onMouseDown={handlePaddleStart}
        onMouseUp={handlePaddleEnd}
        onMouseLeave={handlePaddleEnd}
        onTouchStart={handlePaddleStart}
        onTouchEnd={handlePaddleEnd}
        className="w-full py-7 rounded-2xl border border-slate-800 bg-slate-950 flex flex-col items-center justify-center gap-1 active:bg-slate-900 active:scale-98 active:border-slate-700 duration-75 cursor-pointer select-none"
      >
        <span className="w-10 h-10 rounded-full bg-slate-900 border-4 border-indigo-500 shadow-[0_0_12px_rgba(99,102,241,0.25)] flex items-center justify-center text-xs font-black text-indigo-400">
          TAP
        </span>
        <span className="text-[10px] font-mono font-bold text-indigo-400 uppercase tracking-widest mt-1">송신기 전용 패들 (꾹 누르기 가능)</span>
        <span className="text-[9px] text-slate-500 font-mono">* 팁: 스페이스바로도 전송 가능! (길게 누르면 대시로 인식)</span>
      </div>

      <div className="flex gap-2 font-mono text-[9px] text-slate-500 justify-center">
        <kbd className="bg-slate-950 border border-slate-850 px-1.5 py-0.5 rounded text-[9px]">SPACE</kbd> 송신 탭 &nbsp;
        <kbd className="bg-slate-950 border border-slate-850 px-1.5 py-0.5 rounded text-[9px]">BS/DEL</kbd> 지우기 &nbsp;
        <kbd className="bg-slate-950 border border-slate-850 px-1.5 py-0.5 rounded text-[9px]">ENTER</kbd> 줄바꿈
      </div>
    </div>
  );

  // --- 2. Dynamic Game Play Mode routing switcher content panels ---
  const gameAreaContentElement = (
    <div className="bg-slate-900 border border-slate-800 p-5 rounded-3xl min-h-[220px] flex flex-col justify-between">
      <AnimatePresence mode="wait">
        {gameMode === 'sandbox' && (
          <SandboxModeArea
            key="sandbox-mode"
            autoSubmitDelay={autoSubmitDelay}
            accumulatedText={accumulatedText}
            copied={copied}
            onCopy={copySandboxToClipboard}
            onPlayAll={playAccumulatedSandbox}
            onClear={handleClear}
            currentSequence={currentSequence}
          />
        )}

        {gameMode === 'practice-letters' && (
          <QuizModeArea
            key="quiz-mode"
            targetChar={targetChar}
            showHelperCode={showHelperCode}
            MORSE_DICT={MORSE_DICT}
            onPlaySample={playSampleCode}
            onSkip={generateNewLetterTarget}
          />
        )}

        {gameMode === 'practice-words' && (
          <WordsModeArea
            key="words-mode"
            wordTargetString={wordTargetString}
            wordProgressIdx={wordProgressIdx}
            WORD_DB={WORD_DB}
            MORSE_DICT={MORSE_DICT}
            showHelperCode={showHelperCode}
            onPlaySample={playSampleCode}
            onNextWord={generateNewWordTarget}
          />
        )}

        {gameMode === 'survival' && (
          <SurvivalModeArea
            key="survival-mode"
            isSurvivalActive={isSurvivalActive}
            survivalScore={survivalScore}
            survivalTime={survivalTime}
            survivalCurrentWord={survivalCurrentWord}
            wordProgressIdx={wordProgressIdx}
            MORSE_DICT={MORSE_DICT}
            onStartSurvival={() => {
              setSurvivalTime(35);
              setSurvivalScore(0);
              setIsSurvivalActive(true);
              generateNewSurvivalWord();
            }}
            onGiveUp={() => setIsSurvivalActive(false)}
          />
        )}
      </AnimatePresence>
    </div>
  );

  // --- 3. Global Score stats dashboard panels ---
  const globalScoresPanelElement = gameMode !== 'sandbox' && (
    <div className="bg-slate-900 border border-slate-800 p-4 rounded-3xl grid grid-cols-3 gap-2.5 font-mono text-xs text-center select-none">
      <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-850">
        <span className="text-slate-500 block text-[9px] uppercase tracking-wider">누적 스코어</span>
        <span className="text-emerald-400 text-lg font-black">{scoreState.score}</span>
      </div>

      <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-850 flex flex-col justify-center items-center">
        <span className="text-slate-500 block text-[9px] uppercase tracking-wider flex items-center justify-center gap-0.5">
          <Zap className="w-2.5 h-2.5 text-amber-500 animate-pulse" /> 연속 성공콤보
        </span>
        <span className="text-amber-400 text-lg font-black animate-bounce" style={{ animationDuration: '2s' }}>
          {scoreState.streak} <span className="text-[10px] font-normal">Combo</span>
        </span>
      </div>

      <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-850">
        <span className="text-slate-500 block text-[9px] uppercase tracking-wider">최종 하이스코어</span>
        <span className="text-indigo-400 text-lg font-black">{scoreState.highScore}</span>
      </div>
    </div>
  );

  return (
    <div className="flex flex-col lg:flex-row gap-6 w-full max-w-6xl mx-auto px-1 select-none">
      
      {/* LEFT COLUMN: The Interactive PCB device and Quick status info */}
      <div className="w-full lg:w-[48%] flex flex-col gap-4">
        
        {/* PCB Card */}
        {pcbCardElement}

        {/* LED Dashboard displaying active status with reduced spacing and signal queue */}
        {signalAnalyzerDashboardElement}

        {/* Virtual Telegraph Paddle Control Area */}
        {virtualTelegraphPaddleElement}

      </div>

      {/* RIGHT COLUMN: Mode Selector, Scoreboards, Sandbox logs, Cheat sheet charts, and Settings */}
      <div className="w-full lg:w-[52%] flex flex-col gap-4">

        {/* Level & Game Mode Switcher Tab */}
        <div className="bg-slate-900 border border-slate-800 p-1.5 rounded-2xl flex flex-wrap gap-1 font-mono text-xs">
          <button
            onClick={() => changeMode('sandbox')}
            className={`flex-1 py-2 px-3 rounded-xl flex items-center justify-center gap-1.5 font-semibold cursor-pointer transition-all ${
              gameMode === 'sandbox' 
                ? 'bg-slate-950 border border-slate-800 text-amber-400 shadow-md scale-102 font-bold' 
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" /> 자유연습
          </button>
          
          <button
            onClick={() => changeMode('practice-letters')}
            className={`flex-1 py-2 px-3 rounded-xl flex items-center justify-center gap-1.5 font-semibold cursor-pointer transition-all ${
              gameMode === 'practice-letters' 
                ? 'bg-slate-950 border border-slate-800 text-teal-400 shadow-md scale-102 font-bold' 
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Smile className="w-3.5 h-3.5" /> 알파벳 퀴즈
          </button>

          <button
            onClick={() => changeMode('practice-words')}
            className={`flex-1 py-2 px-3 rounded-xl flex items-center justify-center gap-1.5 font-semibold cursor-pointer transition-all ${
              gameMode === 'practice-words' 
                ? 'bg-slate-950 border border-slate-800 text-indigo-400 shadow-md scale-102 font-bold' 
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <LayeredBadge /> 단어 훈련
          </button>

          <button
            onClick={() => changeMode('survival')}
            className={`flex-1 py-2 px-3 rounded-xl flex items-center justify-center gap-1.5 font-semibold cursor-pointer transition-all ${
              gameMode === 'survival' 
                ? 'bg-slate-950 border border-slate-800 text-rose-500 shadow-md scale-102 font-bold animate-pulse' 
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Zap className="w-3.5 h-3.5" /> 서바이벌
          </button>
        </div>

        {/* Game Area Content */}
        {gameAreaContentElement}

        {/* Global score panels (excluding sandbox and active survival) */}
        {globalScoresPanelElement}


        {isMobile ? (
          <div className="flex flex-col gap-4 w-full max-w-xl mx-auto pb-10">
            
            {/* 1. Dynamic Mode Switcher */}
            <ModeSwitcher gameMode={gameMode} onChangeMode={changeMode} />

            {/* 2. Target Goal & Sandbox visual text box */}
            {gameAreaContentElement}

            {/* 3. Real-time Analyzer and Queue status indicator */}
            {signalAnalyzerDashboardElement}

            {/* 4. Ergonomic switches and telegraph paddle holds */}
            {virtualTelegraphPaddleElement}

            {/* 5. Drill Score statistics */}
            {globalScoresPanelElement}

            {/* 6. Collapsible PCB Device */}
            <div className="bg-slate-900 border border-slate-800 p-3.5 rounded-3xl flex flex-col gap-2">
              <button
                type="button"
                onClick={() => setShowPcbOnMobile(!showPcbOnMobile)}
                className="flex items-center justify-between w-full text-xs font-bold text-slate-350 bg-slate-950/80 px-3 py-2.5 rounded-xl border border-slate-850 cursor-pointer hover:bg-slate-950 transition-colors"
              >
                <span className="flex items-center gap-2 select-none">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-500 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                  </span>
                  📐 이진 트리 기판 구조도 (실물 PCB 학습선로)
                </span>
                <span className="text-indigo-400 font-mono text-[10px] font-black underline select-none">
                  {showPcbOnMobile ? '접기 [▲]' : '기판 펼쳐보기 [▼]'}
                </span>
              </button>
              
              <AnimatePresence initial={false}>
                {showPcbOnMobile && (
                  <motion.div
                    key="mobile-pcb-animation"
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1, transition: { duration: 0.25 } }}
                    exit={{ height: 0, opacity: 0, transition: { duration: 0.2 } }}
                    className="overflow-hidden mt-1 bg-slate-950/30 p-2 rounded-xl border border-slate-850"
                  >
                    {pcbCardElement}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* 7. Collapsible Cheat Sheet Chart Table */}
            <div className="bg-slate-900 border border-slate-800 p-3.5 rounded-3xl flex flex-col gap-2">
              <button
                type="button"
                onClick={() => setShowCheatSheetOnMobile(!showCheatSheetOnMobile)}
                className="flex items-center justify-between w-full text-xs font-bold text-slate-350 bg-slate-950/80 px-3 py-2.5 rounded-xl border border-slate-850 cursor-pointer hover:bg-slate-950 transition-colors"
              >
                <span className="flex items-center gap-2 select-none">
                  <BookOpen className="w-3.5 h-3.5 text-indigo-400" />
                  📖 모스 전송 규격 요약표 (클릭 즉시발송)
                </span>
                <span className="text-indigo-400 font-mono text-[10px] font-black underline select-none">
                  {showCheatSheetOnMobile ? '접기 [▲]' : '요약표 펼치기 [▼]'}
                </span>
              </button>
              
              <AnimatePresence initial={false}>
                {showCheatSheetOnMobile && (
                  <motion.div
                    key="mobile-cheat-sheet-animation"
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1, transition: { duration: 0.25 } }}
                    exit={{ height: 0, opacity: 0, transition: { duration: 0.2 } }}
                    className="overflow-hidden mt-1"
                  >
                    <CheatSheetPanel
                      gameMode={gameMode}
                      targetChar={targetChar}
                      wordTargetString={wordTargetString}
                      wordProgressIdx={wordProgressIdx}
                      survivalCurrentWord={survivalCurrentWord}
                      MORSE_DICT={MORSE_DICT}
                      onTriggerCheat={triggerCheatListItem}
                    />
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* 8. Frequency and volume Tuning controls */}
            <SettingsPanel
              soundEnabled={soundEnabled}
              setSoundEnabled={setSoundEnabled}
              pitch={pitch}
              setPitch={setPitch}
              volume={volume}
              setVolume={setVolume}
              paddleSensitivity={paddleSensitivity}
              setPaddleSensitivity={setPaddleSensitivity}
              showHelperCode={showHelperCode}
              setShowHelperCode={setShowHelperCode}
            />

          </div>
        ) : (
          /* --- DESKTOP VIEW LAYOUT --- */
          <div className="w-[100%] flex flex-col gap-4">
            
            {/* Settings block */}
            <SettingsPanel
              soundEnabled={soundEnabled}
              setSoundEnabled={setSoundEnabled}
              pitch={pitch}
              setPitch={setPitch}
              volume={volume}
              setVolume={setVolume}
              paddleSensitivity={paddleSensitivity}
              setPaddleSensitivity={setPaddleSensitivity}
              showHelperCode={showHelperCode}
              setShowHelperCode={setShowHelperCode}
            />

            {/* Cheat reference */}
            <CheatSheetPanel
              gameMode={gameMode}
              targetChar={targetChar}
              wordTargetString={wordTargetString}
              wordProgressIdx={wordProgressIdx}
              survivalCurrentWord={survivalCurrentWord}
              MORSE_DICT={MORSE_DICT}
              onTriggerCheat={triggerCheatListItem}
            />

          </div>
        )}

      </div>

    </div>
  );
}

// Simple custom Badge to bypass any complex dependency conflicts on SVGs, keeping bundle clean
function LayeredBadge() {
  return (
    <span className="flex items-center gap-1">
      <FileText className="w-3.5 h-3.5 text-indigo-500" />
    </span>
  );
}
