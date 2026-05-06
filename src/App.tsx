/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useCallback, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Lock, Crown, X, Check, Trophy, Play, Pause, Volume2 } from 'lucide-react';
import { CellStatus, CellData, Team, GameState } from './types';

// 1. 문제 구조
const INITIAL_KEYWORDS = [
  { keyword: '데뷔 앨범', description: '팬들이 가장 처음 입덕하게 된 데뷔곡의 초동 판매량을 맞혀보세요!', videoUrl: '', audioUrl: '', images: [] },
  { keyword: '월드 투어', description: '최근 진행한 월드 투어의 도시 개수와 총 관객 수를 정확히 분석하세요.', videoUrl: '', audioUrl: '', images: [] },
  { keyword: '음악 방송 1위', description: '해당 아티스트가 음악 방송에서 처음으로 1위를 한 날짜와 곡명을 맞혀주세요.', videoUrl: '', audioUrl: '', images: [] },
  { keyword: '뮤비 조회수', description: '24시간 내에 달성한 뮤직비디오 조회수의 앞자리 숫자를 맞히는 미션입니다.', videoUrl: '', audioUrl: '', images: [] },
  { keyword: '응원법', description: '가장 최근 타이틀곡의 킬링파트 응원법을 틀리지 않고 시연하세요.', videoUrl: '', audioUrl: '', images: [] },
  { keyword: '팬클럽 모집', description: '공식 팬클럽 기수별 상징 컬러와 혜택 한 가지를 설명하세요.', videoUrl: '', audioUrl: '', images: [] },
  { keyword: '솔로 데뷔', description: '멤버 중 첫 솔로 데뷔 주자의 앨범명과 발매일을 정확히 맞혀보세요.', videoUrl: '', audioUrl: '', images: [] },
  { keyword: '화보 촬영', description: '최근 화제가 된 패션 잡지 화보의 컨셉명을 맞히는 미션입니다.', videoUrl: '', audioUrl: '', images: [] },
  { keyword: '콜라보', description: '타 아티스트와 협업한 곡 중 가장 높은 차트 순위를 기록한 곡은?', videoUrl: '', audioUrl: '', images: [] },
  { keyword: '안무 영상', description: '안무 영상 조회수 1억 뷰를 가장 빠르게 달성한 곡을 맞혀보세요.', videoUrl: '', audioUrl: '', images: [] },
  { keyword: 'OST 참여', description: '드라마 흥행과 함께 큰 사랑을 받은 OST의 드라마 제목을 맞혀보세요.', videoUrl: '', audioUrl: '', images: [] },
  { keyword: '광고 모델', description: '현재 브랜드 엠버서더로 활동 중인 럭셔리 브랜드의 이름을 맞히세요.', videoUrl: '', audioUrl: '', images: [] },
  { keyword: '앵콜 콘서트', description: '마지막 앵콜 콘서트에서 팬들이 준비했던 슬로건 문구를 맞혀보세요.', videoUrl: '', audioUrl: '', images: [] },
  { keyword: '미니 앨범', description: '두 번째 미니 앨범에 수록된 숨은 명곡(수록곡) 한 줄 가창 미션!', videoUrl: '', audioUrl: '', images: [] },
  { keyword: '라이브 방송', description: '최근 라이브 방송에서 언급한 가장 인상 깊은 팬의 댓글은?', videoUrl: '', audioUrl: '', images: [] },
  { keyword: '시상식', description: '작년 연말 시상식에서 수상한 상의 정확한 명칭을 맞혀주세요.', videoUrl: '', audioUrl: '', images: [] },
  { keyword: '챌린지', description: '틱톡/쇼츠에서 유행한 챌린지 안무의 핵심 동작을 시연하세요.', videoUrl: '', audioUrl: '', images: [] },
  { keyword: '팬 미팅', description: '오프라인 팬미팅 당시 진행했던 특별 코너의 이름을 맞혀보세요.', videoUrl: '', audioUrl: '', images: [] },
  { keyword: '시구/시타', description: '야구장 시구 당시 착용했던 유니폼의 등번호와 의미를 맞혀보세요.', videoUrl: '', audioUrl: '', images: [] },
  { keyword: '포토카드', description: '가장 구하기 힘들다는 ‘레전드 포토카드’의 착장 정보를 설명하세요.', videoUrl: '', audioUrl: '', images: [] },
  { keyword: '팝업 스토어', description: '최근 오픈한 팝업 스토어의 한정판 굿즈 품목 3가지를 말하세요.', videoUrl: '', audioUrl: '', images: [] },
  { keyword: '자체 콘텐츠', description: '유튜브 공식 채널의 자체 예능 중 가장 조회수가 높은 에피소드는?', videoUrl: '', audioUrl: '', images: [] },
  { keyword: '라디오 출연', description: '가장 최근에 출연한 라디오 프로그램명과 DJ의 이름을 맞혀보세요.', videoUrl: '', audioUrl: '', images: [] },
  { keyword: '공항 패션', description: '최근 해외 출국길에 착용하여 완판된 아이템의 브랜드를 맞히세요.', videoUrl: '', audioUrl: '', images: [] },
  { keyword: '시즌 그리팅', description: '올해 시즌 그리팅 패키지에 포함된 특별 구성품을 맞혀보세요.', videoUrl: '', audioUrl: '', images: ['/src/images/green_bg.jpg','/src/images/orange_bg.jpg','/src/images/skyblue_bg.jpg'] },
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

  const processResult = (resultType: 'A' | 'B' | 'BOTH' | 'FAIL' | 'LOCK_A' | 'LOCK_B') => {
    if (selectedCellId === null) return;

    setGameState(prev => {
      const newCells = [...prev.cells];
      const cell = newCells[selectedCellId];
      let newAUsed = prev.teamAChanceUsed;
      let newBUsed = prev.teamBChanceUsed;

      if (resultType === 'A') cell.status = cell.status === CellStatus.TEAM_B ? CellStatus.BOTH : CellStatus.TEAM_A;
      else if (resultType === 'B') cell.status = cell.status === CellStatus.TEAM_A ? CellStatus.BOTH : CellStatus.TEAM_B;
      else if (resultType === 'BOTH') cell.status = CellStatus.BOTH;
      else if (resultType === 'FAIL') cell.status = CellStatus.FAIL;
      else if (resultType === 'LOCK_A') { cell.status = CellStatus.LOCKED_A; newAUsed = true; }
      else if (resultType === 'LOCK_B') { cell.status = CellStatus.LOCKED_B; newBUsed = true; }

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
  }, [showBingoAnimation]);

  return (
    <div className="min-h-screen bg-[#0a0a1a] text-white p-4 flex flex-col items-center justify-center overflow-hidden relative">
      {/* 배경 장식 */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_-20%,#3d1a52,transparent_40%),radial-gradient(circle_at_0%_50%,#1a3a52,transparent_30%),radial-gradient(circle_at_100%_50%,#521a3a,transparent_30%)] opacity-50 pointer-events-none" />

      <motion.div initial={{ y: -50, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="mb-8 text-center relative z-10">
        <span className="text-xs tracking-[0.5em] text-blue-400 font-bold uppercase mb-2 block">Fandom Stage Finals</span>
        <h1 className="text-4xl font-black italic text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500 tracking-tighter">
          팬덤 빙고 대결
        </h1>
      </motion.div>

      <div className="w-full max-w-7xl flex flex-col lg:flex-row items-center justify-center gap-6 relative z-10">
        <TeamCard name="제1팀" bingo={gameState.teamABingoCount} chanceUsed={gameState.teamAChanceUsed} isActive={gameState.turn === 'A'} color="skyblue" />

        <div className="flex-1 flex flex-col items-center gap-4">
          <div className="bg-white/5 border-2 border-white/10 p-4 rounded-xl backdrop-blur-md">
            <div className="grid grid-cols-5 gap-2 md:gap-3">
              {gameState.cells.map(cell => (
                <BingoCell 
                  key={cell.id} 
                  cell={cell} 
                  cellIndex={cell.id} // 셀의 인덱스를 전달
                  bingoAnimationInfo={showBingoAnimation} // 빙고 애니메이션 정보를 전달
                  onClick={() => handleCellClick(cell.id)} 
                />
              ))}
            </div>
          </div>
        </div>

        <TeamCard name="제2팀" bingo={gameState.teamBBingoCount} chanceUsed={gameState.teamBChanceUsed} isActive={gameState.turn === 'B'} color="orange" />
      </div>

      <AnimatePresence>
        {selectedCellId !== null && (
          <QuestionModal 
            cell={gameState.cells[selectedCellId]} 
            onClose={() => setSelectedCellId(null)} 
            onResult={processResult}
            canLockA={!gameState.teamAChanceUsed}
            canLockB={!gameState.teamBChanceUsed}
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
function QuestionModal({ cell, onClose, onResult, canLockA, canLockB }: any) {
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-xl">
      <motion.div initial={{ scale: 0.8, y: 30 }} animate={{ scale: 1, y: 0 }} className="w-full max-w-2xl bg-[#0a0a1a] border-2 border-white/20 rounded-[2.5rem] overflow-hidden p-8 md:p-10 relative">
        
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 flex items-center justify-center bg-gradient-to-br from-blue-500 to-pink-500 rounded-2xl shadow-lg shadow-purple-500/20">
              <Trophy className="text-white" />
            </div>
            <div>
              <h4 className="text-[10px] font-black uppercase tracking-widest text-white/40">Mission Module</h4>
              <p className="text-2xl font-black italic uppercase text-white">{cell.keyword}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-3 hover:bg-white/10 rounded-2xl transition-all"><X /></button>
        </div>

        <div className="space-y-6 mb-10">
          {/* 1. 비디오 영역 */}
          {cell.videoUrl && (
            <div className="relative aspect-video rounded-[1.5rem] overflow-hidden border-2 border-white/10 bg-black">
              <video src={cell.videoUrl} className="w-full h-full object-cover" autoPlay loop muted controls />
              <div className="absolute top-4 left-4 px-3 py-1 bg-red-600 text-[10px] font-black rounded-md flex items-center gap-2">
                <div className="w-1.5 h-1.5 bg-white rounded-full animate-pulse" /> LIVE VIDEO
              </div>
            </div>
          )}

          {/* 2. 오디오 영역 */}
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
                  className="relative aspect-video md:aspect-square rounded-2xl overflow-hidden border-2 border-white/10 bg-black/20"
                >
                  <img src={imgUrl} alt={`Mission ref ${idx}`} className="w-full h-full object-cover" />
                </motion.div>
              ))}
            </div>
          )}

          {/* 3. 미션 설명 영역 */}
          <div className="bg-white/5 border border-white/10 p-8 rounded-[1.5rem] text-center relative overflow-hidden">
             <div className="relative z-10 space-y-4">
               <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-500/20 rounded-full border border-blue-500/30">
                  <span className="text-[9px] font-black uppercase text-blue-400 tracking-tighter">Mission Instruction</span>
               </div>
               <h4 className="text-xl md:text-2xl font-black italic text-white leading-tight break-keep">
                 {cell.description}
               </h4>
             </div>
          </div>
        </div>

        {/* 하단 제어 버튼 */}
        <div className="grid grid-cols-3 sm:grid-cols-6 gap-4 mt-4">
          <StickButton label="A WIN" color="skyblue" icon={<Check />} onClick={() => onResult('A')} />
          <StickButton label="SHARED" color="purple" icon={<Crown />} onClick={() => onResult('BOTH')} />
          <StickButton label="B WIN" color="orange" icon={<Check />} onClick={() => onResult('B')} />
          <StickButton label="FAIL" color="red" icon={<X />} onClick={() => onResult('FAIL')} />
          <StickButton label="A LOCK" color="skyblue" icon={<Lock />} onClick={() => onResult('LOCK_A')} disabled={!canLockA} />
          <StickButton label="B LOCK" color="orange" icon={<Lock />} onClick={() => onResult('LOCK_B')} disabled={!canLockB} />
        </div>
      </motion.div>
    </motion.div>
  );
}

// 나머지 컴포넌트 (TeamCard, BingoCell, StickButton, BingoOverlay 등은 이전과 동일)
function TeamCard({ name, bingo, chanceUsed, isActive, color }: any) {
  const accentColor = color === 'skyblue' ? 'border-sky-500 shadow-sky-500/20' : 'border-orange-500 shadow-orange-500/20';
  return (
    <motion.div layout className={`w-full lg:w-64 p-6 rounded-3xl flex flex-col gap-6 backdrop-blur-2xl transition-all duration-700 ${isActive ? `border-2 scale-105 ${accentColor} shadow-[0_0_40px_-10px_currentColor]` : 'border border-white/10 opacity-70'} bg-white/5 relative overflow-hidden`}>
      <div className="flex items-center justify-between relative z-10">
        <div className={`p-2.5 rounded-xl ${color === 'skyblue' ? 'bg-sky-500' : 'bg-orange-500'}`}>
          <Trophy size={20} className="text-white" />
        </div>
        <div className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase ${isActive ? (color === 'skyblue' ? 'bg-sky-500' : 'bg-orange-500') : 'bg-white/10'}`}>
          {isActive ? '진행중' : '대기중'}
        </div>
      </div>
      <div className="relative z-10">
        <p className={`text-2xl font-black italic uppercase ${color === 'skyblue' ? 'text-sky-400' : 'text-orange-400'}`}>{name}</p>
      </div>
      <div className="bg-black/40 p-6 rounded-2xl border border-white/10 flex flex-col items-center justify-center relative z-10">
        <p className="text-[10px] font-bold text-white/40 uppercase tracking-widest mb-1">현재 빙고 개수</p>
        <p className={`text-5xl font-black ${bingo > 0 ? (color === 'skyblue' ? 'text-sky-400' : 'text-orange-400') : 'text-white'}`}>{bingo}</p>
      </div>
      <div className={`flex items-center justify-between p-4 rounded-xl border relative z-10 ${chanceUsed ? 'bg-white/5 opacity-50' : 'bg-white/10'}`}>
        <div className="flex items-center gap-2"><Lock size={14} /><span className="text-[10px] font-bold uppercase">자물쇠 찬스</span></div>
        {chanceUsed ? <X size={14} /> : <Check size={14} />}
      </div>
    </motion.div>
  );
}

function BingoCell({ cell, onClick, cellIndex, bingoAnimationInfo }: BingoCellProps) {
  const getCellStyles = () => {
    switch (cell.status) {
      case CellStatus.TEAM_A: return 'bg-sky-500/30 border-sky-400 text-sky-100';
      case CellStatus.TEAM_B: return 'bg-orange-500/30 border-orange-400 text-orange-100';
      case CellStatus.BOTH: return 'relative overflow-hidden border-white/30 text-white';
      case CellStatus.FAIL: return 'bg-black/60 opacity-40 grayscale';
      case CellStatus.LOCKED_A: return 'bg-sky-600/40 border-sky-400 text-sky-100'; // Team A lock color
      case CellStatus.LOCKED_B: return 'bg-orange-600/40 border-orange-400 text-orange-100'; // Team B lock color
      default: return 'bg-white/5 border-white/10 text-white/40 hover:bg-white/10';
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
      whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
      onClick={onClick}
      className={`relative w-16 h-16 md:w-24 md:h-24 p-2 rounded-xl border-2 transition-all font-black flex flex-col items-center justify-center text-center cursor-pointer ${getCellStyles()}`}
    >
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
      {cell.status === CellStatus.BOTH && (
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-sky-500/40" style={{ clipPath: 'polygon(0 0, 100% 0, 0 100%)' }} />
          <div className="absolute inset-0 bg-orange-500/40" style={{ clipPath: 'polygon(100% 100%, 100% 0, 0 100%)' }} />
        </div>
      )}
      {cell.status === CellStatus.LOCKED_A || cell.status === CellStatus.LOCKED_B ? (
        <motion.div 
          initial={{ scale: 0.7, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="z-10 flex flex-col items-center gap-1"
        >
          <Lock 
            size={28} 
            className={`text-white animate-pulse ${
              cell.status === CellStatus.LOCKED_A 
                ? 'drop-shadow-[0_0_15px_rgba(56,189,248,0.8)]' // A팀(하늘색) 자물쇠 광채
                : 'drop-shadow-[0_0_15px_rgba(251,146,60,0.8)]' // B팀(주황색) 자물쇠 광채
            }`} 
          />
          <span className="text-[10px] font-black uppercase tracking-widest opacity-90">Locked</span>
        </motion.div>
      ) : (
        <span className="z-10 text-[10px] md:text-[12px] leading-tight uppercase italic break-keep">
          {cell.keyword}
        </span>
      )}
    </motion.button>
  );
}

function StickButton({ label, color, icon, onClick, disabled = false }: any) {
  const colorConfigs: any = {
    skyblue: { bg: 'from-sky-400 to-sky-600', glow: 'shadow-[0_0_20px_rgba(56,189,248,0.6)]', border: 'border-sky-300/50', text: 'text-sky-300' },
    orange: { bg: 'from-orange-400 to-orange-600', glow: 'shadow-[0_0_20px_rgba(251,146,60,0.6)]', border: 'border-orange-300/50', text: 'text-orange-300' },
    purple: { bg: 'from-purple-400 to-purple-600', glow: 'shadow-[0_0_20px_rgba(192,132,252,0.6)]', border: 'border-purple-300/50', text: 'text-purple-300' },
    red: { bg: 'from-red-400 to-red-600', glow: 'shadow-[0_0_20px_rgba(248,113,113,0.6)]', border: 'border-red-300/50', text: 'text-red-300' },
  };
  const cfg = colorConfigs[color] || colorConfigs.purple;

  return (
    <motion.button
      whileHover={!disabled ? { y: -12, rotate: [0, -5, 5, 0] } : {}}
      whileTap={!disabled ? { scale: 0.9 } : {}}
      disabled={disabled}
      onClick={onClick}
      className={`flex flex-col items-center group relative transition-opacity ${disabled ? 'opacity-20 cursor-not-allowed' : 'cursor-pointer'}`}
    >
      {/* 발광부 (Lightstick Head) */}
      <div className={`w-14 h-14 rounded-full bg-gradient-to-br ${cfg.bg} ${cfg.glow} border-2 ${cfg.border} flex items-center justify-center relative z-10 transition-all group-hover:brightness-125`}>
        <div className="absolute inset-0 rounded-full bg-white/10 animate-pulse" />
        <div className="text-white drop-shadow-lg scale-110">
          {icon}
        </div>
      </div>

      {/* 텍스트 (Label) */}
      <span className={`mt-3 text-[10px] font-black italic tracking-tighter uppercase ${cfg.text} drop-shadow-md`}>
        {label}
      </span>

      {/* 손잡이 (Handle) */}
      <div className="mt-1 w-5 h-14 bg-gradient-to-b from-white/20 via-white/5 to-transparent rounded-b-2xl border-x border-b border-white/10 relative overflow-hidden">
        <div className="absolute top-0 w-full h-[2px] bg-white/40" />
        {/* 하단 버튼 디테일 */}
        <div className="absolute bottom-2 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-white/10" />
      </div>
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
        className={`relative z-10 text-6xl md:text-8xl font-black italic uppercase px-16 py-8 border-4 rounded-[3rem] backdrop-blur-md ${team === 'A' ? 'text-white bg-sky-900/40 border-sky-400 shadow-[0_0_80px_rgba(14,165,233,0.6)]' : 'text-white bg-orange-900/40 border-orange-400 shadow-[0_0_80px_rgba(249,115,22,0.6)]'}`}
      >
        <div className="flex flex-col items-center gap-2">
          <span className={`text-2xl tracking-[0.3em] ${team === 'A' ? 'text-sky-300' : 'text-orange-300'}`}>{team === 'A' ? 'STARLIGHT' : 'AURORA'}</span>
          <span>BINGO!</span>
        </div>
      </motion.div>
    </motion.div>
  );
}