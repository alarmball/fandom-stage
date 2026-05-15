/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useCallback, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Play, Pause, Volume2 } from 'lucide-react';
import { CellStatus, CellData, Team, GameState } from './types';

import background from './backgrounds/background.png';
import question from './backgrounds/question_no_text.png';

import briize from './cells/briize.png';
import once from './cells/once.png';
import shinee from './cells/shinee world.png';

import both_1 from './cells/both_1.png';
import both_2 from './cells/both_2.png';
import both_3 from './cells/both_3.png';

import chance_cell from './cells/chance.png';
import chance_cell_2 from './cells/chance_2.png';
import chance_cell_3 from './cells/chance_3.png';

import cheer_a from './icons/cheer_icon1.png';
import cheer_b from './icons/cheer_icon2.png';
import cheer_both from './icons/cheer_icon3.png';
import cheer_fail from './icons/cheer_icon4.png';
import cheer_lock_a from './icons/cheer_icon5.png';
import cheer_lock_b from './icons/cheer_icon6.png';

import greenBg from './images/green_bg.jpg';
import orangeBg from './images/orange_bg.jpg';
import skyblueBg from './images/skyblue_bg.jpg';

import audio1 from './audios/1-108.mp3';
import video1 from './videos/example.mp4';

// 1. 문제 구조
const INITIAL_KEYWORDS = [
  { keyword: '주인공', description: 'Q. 다음 사진 속 주인공을 맞히시오.', videoUrl: '', audioUrl: '', images: [] },
  { keyword: '영단어', description: 'Q. 다음 영어 가사의 빈칸을 채우시오', videoUrl: '', audioUrl: '', images: [] },
  { keyword: '사복', description: 'Q. 다음 사진을 보고, 곡 제목을 맞히시오.', videoUrl: '', audioUrl: '', images: [] },
  { keyword: '시상식', description: 'Q. 다음 사진을 보고, 어떤 곡으로 수상했는지 맞히시오.', videoUrl: '', audioUrl: '', images: [] },
  { keyword: '이벤트', description: 'Q. 다음 콘서트의 슬로건 문구를 정확히 맞히시오.', videoUrl: '', audioUrl: '', images: [] },
  { keyword: '낭독', description: 'Q. AI가 읽어주는 가사를 듣고, 곡 제목과 해당 파트의 멤버 이름을 맞히시오.', videoUrl: '', audioUrl: '', images: [] },
  { keyword: '노래제목', description: 'Q. 다음 앨범의 트랙 리스트를 순서대로 맞히시오. (제한 시간 1분 30초)', videoUrl: '', audioUrl: '', images: [] },
  { keyword: '해석', description: 'Q. 우리 팀의 그룹명과 팬덤명의 의미를 맞히시오.', videoUrl: '', audioUrl: '', images: [] },
  { keyword: 'SNS', description: 'Q. SNS에서 멤버가 직접 태그한 위치를 맞히시오.', videoUrl: '', audioUrl: '', images: [] },
  { keyword: '교복', description: 'Q. 우리 팀 멤버 중 한 명을 선택하여, 졸업 중학교와 멤버 이름을 맞히시오. ', videoUrl: '', audioUrl: '', images: [] },
  { keyword: '산수', description: 'Q. 멤버 2명의 생년월일 숫자를 모두 더하시오.\n  ex) 1993년 9월 18일, 1995년 10월 18일 \n = 1+9+9+3+0+9+1+8 + 1+9+9+5+1+0+1+8 = 74', videoUrl: '', audioUrl: '', images: [] },
  { keyword: '빈칸', description: 'Q. 다음 기사 제목의 빈칸을 채우시오.', videoUrl: '', audioUrl: '', images: [] },
  { keyword: '?', description: 'Q. 다음 팬송에서 제시어가 총 몇 번 등장하는지 맞히시오. (제한 시간 2분)', videoUrl: '', audioUrl: '', images: [] },
  { keyword: '소속사', description: 'Q. 다음 멤버의 소속사 입사 경로를 설명하시오.', videoUrl: '', audioUrl: '', images: [] },
  { keyword: '유튜브', description: 'Q. 우리 팀 뮤직비디오 중 조회수가 가장 높은 곡을 맞히시오.', videoUrl: '', audioUrl: '', images: [] },
  { keyword: '실루엣', description: 'Q. 다음 사진을 보고, 빈칸에 맞는 멤버를 맞히시오.', videoUrl: '', audioUrl: '', images: [] },
  { keyword: '한자', description: 'Q. 다음 멤버의 본명을 한자로 쓰시오.', videoUrl: '', audioUrl: '', images: [] },
  { keyword: '앵콜', description: 'Q. 다음 콘서트의 앵콜 곡을 <보기>에서 모두 고르시오.', videoUrl: '', audioUrl: '', images: [] },
  { keyword: '노래방', description: 'Q. 다음 영상 속 해당 파트를 부르시오. ', videoUrl: '', audioUrl: '', images: [] },
  { keyword: '눈물', description: 'Q. 다음 시상식에서 눈물을 보인 멤버 이름을 맞히시오.', videoUrl: '', audioUrl: '', images: [] },
  { keyword: '듣기', description: 'Q. 다음 소리의 주인공을 맞히시오.', videoUrl: '', audioUrl: '', images: [] },
  { keyword: '편지', description: 'Q. 다음 편지를 쓴 멤버를 맞히시오.', videoUrl: '', audioUrl: '', images: [] },
  { keyword: '릴레이', description: 'Q. 우리 팀 노래 중, 제목이 N글자 이상인 곡을 각자 1개씩 말하시오.', videoUrl: video1, audioUrl: '', images: [] },
  { keyword: '투어', description: 'Q. 다음 사진을 보고, 콘서트명과 개최 장소를 맞히시오.', videoUrl: '', audioUrl: audio1, images: [] },
  { keyword: '1위', description: 'Q. 우리 팀의 음악방송 첫 1위 곡과 프로그램명을 맞히시오', videoUrl: '', audioUrl: '', images: [greenBg, orangeBg, skyblueBg] },
];
interface BingoCellProps {
  cell: CellData;
  onClick: () => void;
  cellIndex: number; // Add cellIndex
  bingoAnimationInfo: { team: Team, bingoDetails: { line: number[], type: 'row' | 'col' | 'diag1' | 'diag2' }[] } | null; // Add bingoAnimationInfo
}

export default function App() {
  const [gameState, setGameState] = useState<Omit<GameState, 'teamAScore' | 'teamBScore'>>({
    cells: INITIAL_KEYWORDS.map((k, i) => ({ 
      id: i, 
      keyword: k.keyword, 
      description: k.description,
      videoUrl: k.videoUrl,
      audioUrl: k.audioUrl, // 오디오 경로 매핑
      images: k.images || [], // 이미지 배열 매핑
      status: CellStatus.EMPTY 
    })),
    teamABingoCount: 0,
    teamBBingoCount: 0,
    teamAChanceUsed: false,
    teamBChanceUsed: false,
    turn: 'A'
  });

  const [selectedCellId, setSelectedCellId] = useState<number | null>(null); // 선택된 셀 ID
  const [showBingoAnimation, setShowBingoAnimation] = useState<{ team: Team, bingoDetails: { line: number[], type: 'row' | 'col' | 'diag1' | 'diag2' }[] } | null>(null); // 빙고 애니메이션 정보

  const checkBingo = useCallback((cells: CellData[], team: Team) => {
    const size = 5;
    const lines: number[][] = [];
    const isOwner = (s: CellStatus) => {
      if (team === 'A') return s === CellStatus.TEAM_A || s === CellStatus.BOTH || s === CellStatus.LOCKED_A;
      return s === CellStatus.TEAM_B || s === CellStatus.BOTH || s === CellStatus.LOCKED_B;
    };
    
    const bingoDetails: { line: number[], type: 'row' | 'col' | 'diag1' | 'diag2' }[] = [];

    // Check rows
    for (let i = 0; i < size; i++) {
      const row = Array.from({ length: size }, (_, j) => i * size + j);
      if (row.every(idx => isOwner(cells[idx].status))) bingoDetails.push({ line: row, type: 'row' });
    }
    // Check columns
    for (let i = 0; i < size; i++) {
      const col = Array.from({ length: size }, (_, j) => j * size + i);
      if (col.every(idx => isOwner(cells[idx].status))) bingoDetails.push({ line: col, type: 'col' });
    }
    // Check diagonals
    const diag1 = [0, 6, 12, 18, 24];
    if (diag1.every(idx => isOwner(cells[idx].status))) bingoDetails.push({ line: diag1, type: 'diag1' });
    const diag2 = [4, 8, 12, 16, 20];
    if (diag2.every(idx => isOwner(cells[idx].status))) bingoDetails.push({ line: diag2, type: 'diag2' });
    
    return bingoDetails;
  }, []);

  const handleCellClick = (id: number) => {
    const cell = gameState.cells[id];
    if (cell.status === CellStatus.FAIL || cell.status === CellStatus.LOCKED_A || cell.status === CellStatus.LOCKED_B) return;
    setSelectedCellId(id);
  };

  const processResult = (resultType: 'TEAM_A' | 'TEAM_B' | 'BOTH' | 'FAIL' | 'LOCKED_A' | 'LOCKED_B') => {
    if (selectedCellId === null) return;

    setGameState(prev => {
      const newCells = [...prev.cells];
      const cell = newCells[selectedCellId];
      let newAUsed = prev.teamAChanceUsed;
      let newBUsed = prev.teamBChanceUsed;

      if (resultType === 'TEAM_A') cell.status = cell.status === CellStatus.TEAM_B ? CellStatus.BOTH : CellStatus.TEAM_A;
      else if (resultType === 'TEAM_B') cell.status = cell.status === CellStatus.TEAM_A ? CellStatus.BOTH : CellStatus.TEAM_B;
      else if (resultType === 'BOTH') cell.status = CellStatus.BOTH;
      else if (resultType === 'FAIL') cell.status = CellStatus.FAIL;
      else if (resultType === 'LOCKED_A') { cell.status = CellStatus.LOCKED_A; newAUsed = true; }
      else if (resultType === 'LOCKED_B') { cell.status = CellStatus.LOCKED_B; newBUsed = true; }

      const bingoA = checkBingo(newCells, 'A'); // 팀 A의 빙고 상세 정보
      const bingoB = checkBingo(newCells, 'B'); // 팀 B의 빙고 상세 정보

      if (bingoA.length > prev.teamABingoCount) setShowBingoAnimation({ team: 'A', bingoDetails: bingoA });
      else if (bingoB.length > prev.teamBBingoCount) setShowBingoAnimation({ team: 'B', bingoDetails: bingoB });

      return {
        ...prev,
        cells: newCells,
        teamABingoCount: bingoA.length,
        teamBBingoCount: bingoB.length,
        teamAChanceUsed: newAUsed,
        teamBChanceUsed: newBUsed,
        turn: prev.turn === 'A' ? 'B' : 'A'
      };
    });
    setSelectedCellId(null);
  };

  useEffect(() => {
    if (showBingoAnimation) {
      const timer = setTimeout(() => setShowBingoAnimation(null), 4000);
      return () => clearTimeout(timer);
    }

    let startX = 0;
    let startY = 0;

    const handleMouseDown = (e: MouseEvent) => {
      startX = e.clientX;
      startY = e.clientY;
    };

    const handleMouseUp = (e: MouseEvent) => {
      const endX = e.clientX;
      const endY = e.clientY;

      const width = Math.abs(endX - startX);
      const height = Math.abs(endY - startY);

      // 드래그 거리가 거의 없는 단순 클릭은 무시 (5px 이상일 때만 로그)
      if (width > 5 || height > 5) {
        console.log(`%c📏 Measured Area: ${width}px x ${height}px`, "color: #00ff00; font-weight: bold;");
        console.log(`Details: Width: ${width}, Height: ${height}, Start: (${startX}, ${startY}), End: (${endX}, ${endY})`);
      }
    };

    window.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mouseup', handleMouseUp);

    return () => {
      window.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [showBingoAnimation]);

  return (
    <div 
      className="min-h-screen text-white p-4 flex flex-col items-center justify-center overflow-hidden relative bg-[length:100%_100%] bg-no-repeat"
      style={{ backgroundImage: `url(${background})`, fontFamily: "'Sandoll GothicNeo1', 'Apple SD Gothic Neo', sans-serif" }}
    >

      {/* 빙고 보드 컨테이너: 1920x1080 배경 좌표에 맞춘 절대 위치 설정 */}
      <div 
        className="absolute z-10 animate-fade-up"
        style={{
          left: '30.95%',
          top: '13.15%',
          width: '38.1%',
          height: '61.2%',
        }}
      >
        {/* 적응형 빙고 그리드 */}
        <div className="grid grid-cols-5 gap-x-2 gap-y-35 w-full h-full relative z-20">
                {gameState.cells.map(cell => (
                  <BingoCell
                    key={cell.id}
                    cell={cell}
                    cellIndex={cell.id}
                    bingoAnimationInfo={showBingoAnimation}
                    onClick={() => handleCellClick(cell.id)}
                  />
                ))}
        </div>
      </div>

      <AnimatePresence>
        {selectedCellId !== null && (
          <QuestionModal 
            cell={gameState.cells[selectedCellId]} 
            onClose={() => setSelectedCellId(null)} 
            onResult={processResult}
            canLockA={!gameState.teamAChanceUsed}
            canLockB={!gameState.teamBChanceUsed}
            cheerIcons={{ cheer_a, cheer_b, cheer_both, cheer_fail, cheer_lock_a, cheer_lock_b }}
          />
        )}
        
        {showBingoAnimation && (
          <BingoOverlay team={showBingoAnimation.team} /> // BingoOverlay는 이제 team만 필요
        )}
      </AnimatePresence>
    </div>
  );
}

// 오디오 플레이어 컴포넌트
function AudioPlayer({ src }: { src: string }) {
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const togglePlay = () => {
    if (!audioRef.current) return;
    if (isPlaying) audioRef.current.pause();
    else audioRef.current.play();
    setIsPlaying(!isPlaying);
  };

  return (
    <div className="w-full bg-gradient-to-r from-purple-900/40 to-blue-900/40 border border-white/10 p-4 rounded-2xl flex items-center gap-4 backdrop-blur-md">
      <audio ref={audioRef} src={src} onEnded={() => setIsPlaying(false)} />
      <button 
        onClick={togglePlay}
        className="w-12 h-12 flex items-center justify-center bg-white text-black rounded-full hover:scale-110 transition-transform"
      >
        {isPlaying ? <Pause size={20} fill="black" /> : <Play size={20} fill="black" className="ml-1" />}
      </button>
      <div className="flex-1">
        <div className="flex items-center justify-between mb-2">
          <span className="text-[10px] font-black uppercase tracking-tighter text-blue-400">Audio Mission Clip</span>
          <Volume2 size={14} className="text-white/40" />
        </div>
        {/* 오디오 파형 애니메이션 (재생 중일 때만) */}
        <div className="flex items-end gap-1 h-6">
          {[...Array(15)].map((_, i) => (
            <motion.div
              key={i}
              animate={isPlaying ? { height: [4, 16, 8, 20, 4] } : { height: 4 }}
              transition={{ repeat: Infinity, duration: 0.8, delay: i * 0.05 }}
              className="flex-1 bg-gradient-to-t from-blue-500 to-purple-400 rounded-full"
            />
          ))}
        </div>
      </div>
    </div>
  );
}

// 미션 모달 (오디오/비디오 지원)
function QuestionModal({ cell, onClose, onResult, canLockA, canLockB, cheerIcons }: any) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8, y: "-40%", x: "-50%" }}
      animate={{ opacity: 1, scale: 1, y: "-50%", x: "-50%" }}
      exit={{ opacity: 0 }}
      className="fixed z-50 top-1/2 left-1/2 w-[65.7vw] max-w-[1010px] aspect-[10/9] flex flex-col overflow-hidden p-8 md:p-11 bg-[length:100%_100%] bg-no-repeat shadow-2xl backdrop-blur-2xl max-h-[85.5vh]"
      style={{ backgroundImage: `url(${question})` }}
    >
        <div className="relative flex items-center justify-center mb-8 w-full">
          <h2 
            className="text-[3.5rem] font-bold uppercase text-white drop-shadow-[0_4px_12px_rgba(0,0,0,1)] tracking-tight text-center w-full px-12"
            style={{ fontFamily: "'Apple SD Gothic Neo', 'Sandoll GothicNeo1', sans-serif" }}
          >
            {cell.keyword}
          </h2>
          <button onClick={onClose} className="absolute right-0 p-3 hover:bg-white/10 rounded-2xl transition-all">
            <X size={48} />
          </button>
        </div>

        <div className="space-y-10 mb-6 flex-1 flex flex-col justify-center overflow-y-auto px-10">
          {/* 1. 미션 설명 영역 */}
          <h1 
            className="text-3xl md:text-5xl font-bold text-white leading-tight break-keep text-center drop-shadow-[0_4px_10px_rgba(0,0,0,0.9)] max-w-5xl mx-auto"
            style={{ fontFamily: "'Sandoll GothicNeo1', 'Apple SD Gothic Neo', sans-serif" }}
          >
            {cell.description}
          </h1>

          {/* 2. 비디오 영역 */}
          {cell.videoUrl && (
            <div className="relative aspect-video max-w-3xl mx-auto w-full rounded-[1.5rem] overflow-hidden border-2 border-white/10 bg-black">
              <video src={cell.videoUrl} className="w-full h-full object-cover" autoPlay loop muted controls />
            </div>
          )}

          {/* 3. 오디오 영역 */}
          {cell.audioUrl && (
            <AudioPlayer src={cell.audioUrl} />
          )}

          {/* 4. 이미지 갤러리 영역 (1~3장) */}
          {cell.images && cell.images.length > 0 && (
            <div className={`grid gap-4 ${
              cell.images.length === 1 ? 'grid-cols-1' : 
              cell.images.length === 2 ? 'grid-cols-2' : 
              'grid-cols-3'
            }`}>
              {cell.images.map((imgUrl: string, idx: number) => (
                <motion.div 
                  key={idx}
                  whileHover={{ scale: 1.05 }}
                  className="relative aspect-video md:aspect-square max-w-[300px] mx-auto w-full rounded-2xl overflow-hidden border-2 border-white/10 bg-black/20"
                >
                  <img src={imgUrl} alt={`Mission ref ${idx}`} className="w-full h-full object-cover" />
                </motion.div>
              ))}
            </div>
          )}
        </div>

        {/* 하단 제어 버튼 */}
        <div className="grid grid-cols-6 gap-2 mt-auto mx-auto w-full pb-4">
          <StickButton label="A WIN" color="skyblue" icon={cheerIcons.cheer_a} onClick={() => onResult('TEAM_A')} />
          <StickButton label="SHARED" color="purple" icon={cheerIcons.cheer_both} onClick={() => onResult('BOTH')} />
          <StickButton label="B WIN" color="orange" icon={cheerIcons.cheer_b} onClick={() => onResult('TEAM_B')} />
          <StickButton label="FAIL" color="red" icon={cheerIcons.cheer_fail} onClick={() => onResult('FAIL')} />
          <StickButton label="A LOCK" color="skyblue" icon={cheerIcons.cheer_lock_a} onClick={() => onResult('LOCKED_A')} disabled={!canLockA} />
          <StickButton label="B LOCK" color="orange" icon={cheerIcons.cheer_lock_b} onClick={() => onResult('LOCKED_B')} disabled={!canLockB} />
        </div>
    </motion.div>
  );
}

// 나머지 컴포넌트 (BingoCell, StickButton, BingoOverlay 등은 이전과 동일)

function BingoCell({ cell, onClick, cellIndex, bingoAnimationInfo }: BingoCellProps) {
  const getCellStyles = () => {
    switch (cell.status) {
      case CellStatus.TEAM_A: return 'border-white';
      case CellStatus.TEAM_B: return 'border-white';
      case CellStatus.BOTH: return 'border-white';
      case CellStatus.FAIL: return 'bg-black/80 opacity-60 grayscale border-white/20';
      case CellStatus.LOCKED_A: return 'border-white';
      case CellStatus.LOCKED_B: return 'border-white';
      default: return 'bg-white/5 border-white/40 hover:bg-white/10 hover:border-white';
    }
  };

  const bingoLineMatch = bingoAnimationInfo?.bingoDetails.find(detail => detail.line.includes(cellIndex));
  const isPartOfBingo = !!bingoLineMatch;
  const bingoTeam = isPartOfBingo ? bingoAnimationInfo?.team : null;
  const bingoLineType = bingoLineMatch?.type;
  const positionInLine = bingoLineMatch?.line.indexOf(cellIndex);

  let initialProps: any = {};
  let animateProps: any = {};
  let exitProps: any = {};
  let transitionProps: any = { duration: 0.3, ease: "easeOut" };
  let highlightStyle: any = {};

  if (isPartOfBingo && bingoTeam) {
    const baseDelay = (positionInLine || 0) * 0.1; // Sequential delay for cells in a line
    transitionProps.delay = baseDelay;

    if (bingoLineType === 'row') {
      initialProps = { width: 0, opacity: 0 };
      animateProps = { width: '100%', opacity: 1 };
      exitProps = { opacity: 0, transition: { delay: baseDelay + 0.3 } }; // Fade out after sweep
      highlightStyle = { left: 0, top: 0, height: '100%' };
    } else if (bingoLineType === 'col') {
      initialProps = { height: 0, opacity: 0 };
      animateProps = { height: '100%', opacity: 1 };
      exitProps = { opacity: 0, transition: { delay: baseDelay + 0.3 } }; // Fade out after sweep
      highlightStyle = { top: 0, left: 0, width: '100%' };
    } else { // Diagonals or fallback to a general highlight
      initialProps = { opacity: 0, scale: 0.8 };
      animateProps = { opacity: 1, scale: 1 };
      exitProps = { opacity: 0, scale: 1.2, transition: { delay: baseDelay + 0.3 } };
      highlightStyle = { inset: 0 };
    }
  }

  return (
    <motion.button
      initial={{ scale: 1, y: 0 }}
      animate={{ scale: 1, y: 0 }}
      whileHover={{ scale: 1.05, y: -5, zIndex: 30 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className={`relative w-full aspect-square transition-all cursor-pointer overflow-hidden border-4 rounded-xl flex items-center justify-center ${getCellStyles()}`}
    >
      {/* 문제 그리드와 동일한 중앙 보라색 원형 그라데이션 효과 추가 */}
      <div 
        className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(167,139,250,0.3)_0%,transparent_75%)] pointer-events-none z-0" 
      />

      <AnimatePresence>
        {isPartOfBingo && bingoTeam && (
          <motion.div
            initial={initialProps}
            animate={animateProps}
            exit={exitProps}
            transition={transitionProps}
            className={`absolute rounded-xl z-20 ${bingoTeam === 'A' ? 'bg-sky-400/50 ring-2 ring-sky-300' : 'bg-orange-400/50 ring-2 ring-orange-300'}`}
            style={highlightStyle}
          />
        )}
      </AnimatePresence>
      {cell.status === CellStatus.TEAM_A && (
        <div className="absolute inset-0 z-0">
          <img src={shinee} alt="" className="w-full h-full object-cover opacity-90" />
        </div>
      )}
      {cell.status === CellStatus.TEAM_B && (
        <div className="absolute inset-0 z-0">
          <img src={once} alt="" className="w-full h-full object-cover opacity-90" />
        </div>
      )}
      {cell.status === CellStatus.BOTH && (
        <div className="absolute inset-0 z-0">
          <img src={both_2} alt="" className="w-full h-full object-cover opacity-90" />
        </div>
      )}
      {cell.status === CellStatus.LOCKED_A || cell.status === CellStatus.LOCKED_B ? (
        <motion.div 
          initial={{ scale: 0.7, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="absolute inset-0 z-10"
        >
          <img
            src={cell.status === CellStatus.LOCKED_A ? chance_cell_2 : chance_cell_3}
            alt="Locked"
            className={`w-full h-full object-contain p-2 animate-pulse ${
              cell.status === CellStatus.LOCKED_A 
                ? 'drop-shadow-[0_0_15px_rgba(56,189,248,0.8)]' // A팀(하늘색) 자물쇠 광채
                : 'drop-shadow-[0_0_15px_rgba(251,146,60,0.8)]' // B팀(주황색) 자물쇠 광채
            }`} 
          />
        </motion.div>
      ) : (
        cell.status === CellStatus.EMPTY && (
          <span 
            className="z-10 text-base md:text-2xl lg:text-3xl text-white font-bold pointer-events-none drop-shadow-[0_2px_10px_rgba(0,0,0,1)]"
            style={{ fontFamily: "'Apple SD Gothic Neo', 'Sandoll GothicNeo1', sans-serif" }}
          >
            {cell.keyword}
          </span>
        )
      )}
    </motion.button>
  );
}

function StickButton({ label, color, icon, onClick, disabled = false }: {
  label: string; color: string; icon: React.ReactNode | string; onClick: () => void; disabled?: boolean;
}) {
  return (
    <motion.button
      whileHover={!disabled ? { scale: 1.15 } : {}}
      whileTap={!disabled ? { scale: 0.95 } : {}}
      disabled={disabled}
      onClick={onClick}
      className={`relative flex items-center justify-center transition-opacity ${disabled ? 'opacity-20 cursor-not-allowed' : 'cursor-pointer'}`}
    >
      {typeof icon === 'string' ? (
        <img src={icon} alt={label} className="w-[60px] h-[60px] md:w-[90px] md:h-[90px] object-contain drop-shadow-2xl" />
      ) : (
        <div className="text-white drop-shadow-lg scale-[0.7]">
          {icon}
        </div>
      )}
    </motion.button>
  );
}

function BingoOverlay({ team }: { team: Team }) {
  return (
    <motion.div initial={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[100] flex items-center justify-center pointer-events-none">
      <motion.div 
        initial={{ scale: 0.3, opacity: 0, y: 50 }} 
        animate={{ scale: 1, opacity: 1, y: 0 }} 
        transition={{ delay: 0.3, type: 'spring', bounce: 0.6 }}
        className={`relative z-10 text-6xl md:text-8xl font-bold uppercase px-16 py-8 border-4 rounded-[3rem] backdrop-blur-md ${team === 'A' ? 'text-white bg-sky-900/40 border-sky-400 shadow-[0_0_80px_rgba(14,165,233,0.6)]' : 'text-white bg-orange-900/40 border-orange-400 shadow-[0_0_80px_rgba(249,115,22,0.6)]'}`}
      >
        <div className="flex flex-col items-center gap-2">
          <span className={`text-2xl tracking-[0.3em] ${team === 'A' ? 'text-sky-300' : 'text-orange-300'}`}>{team === 'A' ? 'STARLIGHT' : 'AURORA'}</span>
          <span>BINGO!</span>
        </div>
      </motion.div>
    </motion.div>
  );
}