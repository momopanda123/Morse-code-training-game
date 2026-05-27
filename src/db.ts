import { MorseNode, PracticeWord } from './types';

export const MORSE_DICT: Record<string, string> = {
  'A': '.-',    'B': '-...',  'C': '-.-.',  'D': '-..',   'E': '.',
  'F': '..-.',  'G': '--.',   'H': '....',  'I': '..',    'J': '.---',
  'K': '-.-',   'L': '.-..',  'M': '--',    'N': '-.',    'O': '---',
  'P': '.--.',  'Q': '--.-',  'R': '.-.',   'S': '...',   'T': '-',
  'U': '..-',   'V': '...-',  'W': '.--',   'X': '-..-',  'Y': '-.--',
  'Z': '--..',
};

// Create a reverse mapping for fast decoding
export const REVERSE_MORSE_DICT: Record<string, string> = Object.entries(MORSE_DICT).reduce(
  (acc, [char, code]) => {
    acc[code] = char;
    return acc;
  },
  {} as Record<string, string>
);

/**
 * Nodes and visual coordinates for the PCB tree layout.
 * Viewport size: 600 x 680
 * Antenna sits at (300, 50). Traces lead out left and right.
 */
export const PCB_NODES: MorseNode[] = [
  // --- RIGHT BRANCH (DOTS, starts with E) ---
  { char: 'E', code: '.', shape: 'circle', x: 350, y: 110, parentCode: '' },
  { char: 'I', code: '..', shape: 'circle', x: 410, y: 110, parentCode: '.' },
  { char: 'S', code: '...', shape: 'circle', x: 470, y: 110, parentCode: '..' },
  { char: 'H', code: '....', shape: 'circle', x: 530, y: 110, parentCode: '...' },

  // Branch down from S ('...')
  { char: 'V', code: '...-', shape: 'rectangle', x: 470, y: 350, parentCode: '...' },

  // Branch down from I ('..')
  { char: 'U', code: '..-', shape: 'rectangle', x: 410, y: 195, parentCode: '..' },
  { char: 'F', code: '..-.', shape: 'circle', x: 410, y: 275, parentCode: '..-' },

  // Branch down from E ('.')
  { char: 'A', code: '.-', shape: 'rectangle', x: 350, y: 350, parentCode: '.' },
  { char: 'R', code: '.-.', shape: 'circle', x: 430, y: 350, parentCode: '.-' },
  { char: 'L', code: '.-..', shape: 'circle', x: 520, y: 350, parentCode: '.-.' },

  // Branch down from A ('.-')
  { char: 'W', code: '.--', shape: 'rectangle', x: 350, y: 425, parentCode: '.-' },
  { char: 'P', code: '.--.', shape: 'circle', x: 430, y: 425, parentCode: '.--' },
  { char: 'J', code: '.---', shape: 'rectangle', x: 350, y: 500, parentCode: '.--' },


  // --- LEFT BRANCH (DASHES, starts with T) ---
  { char: 'T', code: '-', shape: 'rectangle', x: 250, y: 110, parentCode: '' },
  { char: 'M', code: '--', shape: 'rectangle', x: 190, y: 110, parentCode: '-' },
  { char: 'O', code: '---', shape: 'rectangle', x: 130, y: 110, parentCode: '--' },

  // Branch down from T (-), N and its descendants
  { char: 'N', code: '-.', shape: 'circle', x: 250, y: 350, parentCode: '-' },
  { char: 'K', code: '-.-', shape: 'rectangle', x: 170, y: 350, parentCode: '-.' },
  { char: 'Y', code: '-.--', shape: 'rectangle', x: 90, y: 350, parentCode: '-.-' },
  { char: 'C', code: '-.-.', shape: 'circle', x: 170, y: 425, parentCode: '-.-' },

  // Branch down from N ('-.')
  { char: 'D', code: '-..', shape: 'circle', x: 250, y: 500, parentCode: '-.' },
  { char: 'X', code: '-..-', shape: 'rectangle', x: 170, y: 500, parentCode: '-..' },
  { char: 'B', code: '-...', shape: 'circle', x: 250, y: 575, parentCode: '-..' },

  // Branch down from M ('--')
  { char: 'G', code: '--.', shape: 'circle', x: 190, y: 195, parentCode: '--' },
  { char: 'Z', code: '--..', shape: 'circle', x: 190, y: 275, parentCode: '--.' },
  { char: 'Q', code: '--.-', shape: 'rectangle', x: 110, y: 195, parentCode: '--.' },
];

/**
 * Traces connecting the nodes on the PCB board.
 * Each trace represents the wire copper connection.
 * We draw them dynamically or explicitly via lines.
 */
export interface PcbTrace {
  id: string;
  fromX: number;
  fromY: number;
  toX: number;
  toY: number;
  codeTrigger: string; // The subset of morse code sequence that activates this trace
}

export const PCB_TRACES: PcbTrace[] = [
  // --- Antenna center trunk & branch ---
  { id: 'ant-trunk', fromX: 300, fromY: 60, toX: 300, toY: 110, codeTrigger: '*' }, // Always active or acts as root
  { id: 'ant-to-E', fromX: 300, fromY: 110, toX: 350, toY: 110, codeTrigger: '.' },
  { id: 'ant-to-T', fromX: 300, fromY: 110, toX: 250, toY: 110, codeTrigger: '-' },

  // --- Right Branch Chain (Dots) ---
  { id: 'E-to-I', fromX: 350, fromY: 110, toX: 410, toY: 110, codeTrigger: '..' },
  { id: 'I-to-S', fromX: 410, fromY: 110, toX: 470, toY: 110, codeTrigger: '...' },
  { id: 'S-to-H', fromX: 470, fromY: 110, toX: 530, toY: 110, codeTrigger: '....' },

  // S to V (down)
  { id: 'S-to-V', fromX: 470, fromY: 110, toX: 470, toY: 350, codeTrigger: '...-' },

  // I to U (down)
  { id: 'I-to-U', fromX: 410, fromY: 110, toX: 410, toY: 195, codeTrigger: '..-' },
  // U to F (down)
  { id: 'U-to-F', fromX: 410, fromY: 195, toX: 410, toY: 275, codeTrigger: '..-.' },

  // E to A (down)
  { id: 'E-to-A', fromX: 350, fromY: 110, toX: 350, toY: 350, codeTrigger: '.-' },
  // A to R (right)
  { id: 'A-to-R', fromX: 350, fromY: 350, toX: 430, toY: 350, codeTrigger: '.-.' },
  // R to L (right)
  { id: 'R-to-L', fromX: 430, fromY: 350, toX: 520, toY: 350, codeTrigger: '.-..' },

  // A to W (down)
  { id: 'A-to-W', fromX: 350, fromY: 350, toX: 350, toY: 425, codeTrigger: '.--' },
  // W to P (right)
  { id: 'W-to-P', fromX: 350, fromY: 425, toX: 430, toY: 425, codeTrigger: '.--.' },
  // W to J (down)
  { id: 'W-to-J', fromX: 350, fromY: 425, toX: 350, toY: 500, codeTrigger: '.---' },


  // --- Left Branch Chain (Dashes) ---
  { id: 'T-to-M', fromX: 250, fromY: 110, toX: 190, toY: 110, codeTrigger: '--' },
  { id: 'M-to-O', fromX: 190, fromY: 110, toX: 130, toY: 110, codeTrigger: '---' },

  // T to N (down)
  { id: 'T-to-N', fromX: 250, fromY: 110, toX: 250, toY: 350, codeTrigger: '-.' },
  // N to K (left)
  { id: 'N-to-K', fromX: 250, fromY: 350, toX: 170, toY: 350, codeTrigger: '-.-' },
  // K to Y (left)
  { id: 'K-to-Y', fromX: 170, fromY: 350, toX: 90, toY: 350, codeTrigger: '-.--' },
  // K to C (down)
  { id: 'K-to-C', fromX: 170, fromY: 350, toX: 170, toY: 425, codeTrigger: '-.-.' },

  // N to D (down)
  { id: 'N-to-D', fromX: 250, fromY: 350, toX: 250, toY: 500, codeTrigger: '-..' },
  // D to X (left)
  { id: 'D-to-X', fromX: 250, fromY: 500, toX: 170, toY: 500, codeTrigger: '-..-' },
  // D to B (down)
  { id: 'D-to-B', fromX: 250, fromY: 500, toX: 250, toY: 575, codeTrigger: '-...' },

  // M to G (down)
  { id: 'M-to-G', fromX: 190, fromY: 110, toX: 190, toY: 195, codeTrigger: '--.' },
  // G to Z (down)
  { id: 'G-to-Z', fromX: 190, fromY: 195, toX: 190, toY: 275, codeTrigger: '--..' },
  // G to Q (left)
  { id: 'G-to-Q', fromX: 190, fromY: 195, toX: 110, toY: 195, codeTrigger: '--.-' },
];

export const WORD_DB: PracticeWord[] = [
  // Easy (Short, recognizable)
  { word: 'SOS', category: '구조 신호', meaning: '국제 해상 구조 신호 (· · · - - - · · ·)' },
  { word: 'HELP', category: '위기 대처', meaning: '도와주세요! 위기 상황 긴급 요청 단어' },
  { word: 'HELLO', category: '인사', meaning: '안녕! 가장 대중적인 컴퓨터 세계의 첫 인사' },
  { word: 'HI', category: '인사', meaning: '안녕! 두 글자 모스부호 연습' },
  { word: 'EAT', category: '행동', meaning: '먹다 (쉽고 짧은 세 글자 조합)' },
  { word: 'TEA', category: '음료', meaning: '차 (· 와 - 를 학습하기 아주 좋은 단어)' },
  { word: 'CAT', category: '동물', meaning: '고양이 (- · - ·  · -  -)' },
  { word: 'DOG', category: '동물', meaning: '개 (- · ·  ---  -- ·)' },

  // Medium (Historical & Technical)
  { word: 'CQD', category: '역사', meaning: '타이타닉호가 침몰할 때 SOS 이전에 썼던 고전 구조신호' },
  { word: 'RADIO', category: '기술', meaning: '라디오, 전파 통신의 정수' },
  { word: 'SPACE', category: '우주', meaning: '우주, 전파가 오가는 고요한 공간' },
  { word: 'MOON', category: '우주', meaning: '달 (대시가 많아 수동 오실레이터 패들 연습용)' },
  { word: 'LOVE', category: '감정', meaning: '사랑 (· · - ·  ---  · · · -  ·)' },
  { word: 'PEACE', category: '행동', meaning: '평화 (· - - ·  ·  · -  - · - ·  ·)' },
  { word: 'CODE', category: '기술', meaning: '부호, 코드' },

  // Survival / Professional (Special terms)
  { word: 'TITANIC', category: '구조/역사', meaning: '타이타닉, 무선 모스 단말기로 유명해진 침몰선' },
  { word: 'ROGER', category: '통신', meaning: '수신 완료! "확인했습니다"의 통신 은어' },
  { word: 'MAYDAY', category: '구조신호', meaning: '메이데이! 항공/해상 긴급 재난 조난 호출' },
  { word: 'HAM', category: '통신', meaning: '아마추어 무선국 (H A M)' },
  { word: 'SIGNAL', category: '통신', meaning: '신호' },
  { word: 'SENDER', category: '통신', meaning: '송신자' },
  { word: 'BEACON', category: '통신', meaning: '위치 안내 및 신호용 표지 비콘' }
];

export const RANDOM_ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');
