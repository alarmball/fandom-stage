/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Lock, Crown, X, Check, Users, Trophy } from 'lucide-react';
import { CellStatus, CellData, Team, GameState } from './types';

const INITIAL_KEYWORDS = [
  '데뷔 앨범', '월드 투어', '음악 방송 1위', '뮤비 조회수', '응원법',
  '팬클럽 모집', '솔로 데뷔', '화보 촬영', '콜라보', '안무 영상',
  'OST 참여', 'OST 참여', '음악 방송 1위', 'OST 참여', '응원법',
  '광고 모델', '앵콜 콘서트', '미니 앨범', '라이브 방송', '시상식',
  '챌린지', '팬 미팅', '시구/시타', '서브컬처 포토카드', '팝업 스토어'
];

export default function App() {
  const [gameState, setGameState] = useState<GameState>({
    cells: INITIAL_KEYWORDS.map((k, i) => ({ id: i, keyword: k, status: CellStatus.EMPTY })),
    teamAScore: 0,
    teamBScore: 0,
    teamABingoCount: 0,
    teamBBingoCount: 0,
    teamAChanceUsed: false,
    teamBChanceUsed: false,
    turn: 'A'
  });

  const [selectedCellId, setSelectedCellId] = useState<number | null>(null);
  const [showBingoAnimation, setShowBingoAnimation] = useState<{ team: Team, lines: number[][] } | null>(null);

  const checkBingo = useCallback((cells: CellData[], team: Team) => {
    const size = 5;
    const lines: number[][] = [];
    
    // Check rows
    for (let i = 0; i < size; i++) {
      const row = Array.from({ length: size }, (_, j) => i * size + j);
      if (row.every(idx => {
        const s = cells[idx].status;
        return team === 'A' ? (s === CellStatus.TEAM_A || s === CellStatus.BOTH || s === CellStatus.LOCKED_A) : (s === CellStatus.TEAM_B || s === CellStatus.BOTH || s === CellStatus.LOCKED_B);
      })) {
        lines.push(row);
      }
    }
    
    // Check columns
    for (let i = 0; i < size; i++) {
      const col = Array.from({ length: size }, (_, j) => j * size + i);
      if (col.every(idx => {
        const s = cells[idx].status;
        return team === 'A' ? (s === CellStatus.TEAM_A || s === CellStatus.BOTH || s === CellStatus.LOCKED_A) : (s === CellStatus.TEAM_B || s === CellStatus.BOTH || s === CellStatus.LOCKED_B);
      })) {
        lines.push(col);
      }
    }
    
    // Check diagonals
    const diag1 = [0, 6, 12, 18, 24];
    if (diag1.every(idx => {
      const s = cells[idx].status;
      return team === 'A' ? (s === CellStatus.TEAM_A || s === CellStatus.BOTH || s === CellStatus.LOCKED_A) : (s === CellStatus.TEAM_B || s === CellStatus.BOTH || s === CellStatus.LOCKED_B);
    })) {
      lines.push(diag1);
    }
    
    const diag2 = [4, 8, 12, 16, 20];
    if (diag2.every(idx => {
      const s = cells[idx].status;
      return team === 'A' ? (s === CellStatus.TEAM_A || s === CellStatus.BOTH || s === CellStatus.LOCKED_A) : (s === CellStatus.TEAM_B || s === CellStatus.BOTH || s === CellStatus.LOCKED_B);
    })) {
      lines.push(diag2);
    }
    
    return lines;
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
      let newTeamAScore = prev.teamAScore;
      let newTeamBScore = prev.teamBScore;
      let newTeamAChanceUsed = prev.teamAChanceUsed;
      let newTeamBChanceUsed = prev.teamBChanceUsed;

      if (resultType === 'A') {
        if (cell.status === CellStatus.TEAM_B) cell.status = CellStatus.BOTH;
        else if (cell.status === CellStatus.EMPTY) cell.status = CellStatus.TEAM_A;
        newTeamAScore += 25;
      } else if (resultType === 'B') {
        if (cell.status === CellStatus.TEAM_A) cell.status = CellStatus.BOTH;
        else if (cell.status === CellStatus.EMPTY) cell.status = CellStatus.TEAM_B;
        newTeamBScore += 25;
      } else if (resultType === 'BOTH') {
        cell.status = CellStatus.BOTH;
        newTeamAScore += 25;
        newTeamBScore += 25;
      } else if (resultType === 'FAIL') {
        cell.status = CellStatus.FAIL;
      } else if (resultType === 'LOCK_A') {
        cell.status = CellStatus.LOCKED_A;
        newTeamAChanceUsed = true;
      } else if (resultType === 'LOCK_B') {
        cell.status = CellStatus.LOCKED_B;
        newTeamBChanceUsed = true;
      }

      const bingoA = checkBingo(newCells, 'A');
      const bingoB = checkBingo(newCells, 'B');

      if (bingoA.length > prev.teamABingoCount) {
         setShowBingoAnimation({ team: 'A', lines: bingoA });
      } else if (bingoB.length > prev.teamBBingoCount) {
         setShowBingoAnimation({ team: 'B', lines: bingoB });
      }

      return {
        ...prev,
        cells: newCells,
        teamAScore: newTeamAScore,
        teamBScore: newTeamBScore,
        teamABingoCount: bingoA.length,
        teamBBingoCount: bingoB.length,
        teamAChanceUsed: newTeamAChanceUsed,
        teamBChanceUsed: newTeamBChanceUsed,
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

  const isInBingoLine = (cellId: number) => {
    if (!showBingoAnimation) return false;
    return showBingoAnimation.lines.some(line => line.includes(cellId));
  };

  return (
    <div className="min-h-screen bg-[#0a0a1a] text-white font-sans p-4 flex flex-col items-center justify-center overflow-hidden relative" id="bingo-app">
      {/* Neon Gradient Background */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_-20%,#3d1a52,transparent_40%),radial-gradient(circle_at_0%_50%,#1a3a52,transparent_30%),radial-gradient(circle_at_100%_50%,#521a3a,transparent_30%)] opacity-50 pointer-events-none" />

      {/* Header */}
      <motion.div 
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="mb-8 text-center"
      >
        <span className="text-xs tracking-[0.5em] text-blue-400 font-bold uppercase mb-2 block">Fandom Stage Finals</span>
        <h1 className="text-4xl font-black italic text-transparent bg-clip-text bg-linear-to-r from-blue-400 via-purple-500 to-pink-500 tracking-tighter">
          팬덤 빙고 대결
        </h1>
      </motion.div>

      <div className="w-full max-w-7xl flex flex-col lg:flex-row items-stretch justify-center gap-6 relative z-10">
        
        {/* Team Starlight (A) */}
        <TeamCard 
          team="A" 
          name="STARLIGHT (스타라이트)" 
          score={gameState.teamAScore} 
          bingo={gameState.teamABingoCount} 
          chanceUsed={gameState.teamAChanceUsed}
          isActive={gameState.turn === 'A'}
          color="blue"
        />

        {/* Main Grid */}
        <div className="flex-1 flex flex-col items-center gap-4">
          <div className="bg-white/5 border-2 border-white/10 p-4 rounded-xl backdrop-blur-md shadow-[0_0_50px_-12px_rgba(0,0,0,0.5)]">
            <div className="grid grid-cols-5 gap-2 md:gap-3 relative">
              {gameState.cells.map(cell => (
                <BingoCell 
                  key={cell.id} 
                  cell={cell} 
                  isBingo={isInBingoLine(cell.id)}
                  bingoTeam={showBingoAnimation?.team}
                  onClick={() => handleCellClick(cell.id)} 
                />
              ))}
            </div>
          </div>
          <div className="flex gap-4 text-xs font-bold tracking-widest uppercase opacity-60">
            <div className="flex items-center gap-2"><div className="w-3 h-3 bg-blue-500 rounded-xs" /> Team A</div>
            <div className="flex items-center gap-2"><div className="w-3 h-3 bg-pink-500 rounded-xs" /> Team B</div>
            <div className="flex items-center gap-2"><div className="w-3 h-3 bg-orange-500 rounded-xs" /> Locked</div>
          </div>
        </div>

        {/* Team Aurora (B) */}
        <TeamCard 
          team="B" 
          name="AURORA (오로라)" 
          score={gameState.teamBScore} 
          bingo={gameState.teamBBingoCount} 
          chanceUsed={gameState.teamBChanceUsed}
          isActive={gameState.turn === 'B'}
          color="pink"
        />
      </div>

      {/* Popups & Overlays */}
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
          <motion.div 
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 1.5, opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none"
          >
            <div className={`text-6xl font-black italic uppercase px-12 py-6 border-4 rounded-2xl ${showBingoAnimation.team === 'A' ? 'text-blue-400 border-blue-400 shadow-[0_0_30px_rgba(59,130,246,0.5)]' : 'text-pink-400 border-pink-400 shadow-[0_0_30px_rgba(236,72,153,0.5)]'}`}>
              {showBingoAnimation.team === 'A' ? 'Starlight' : 'Aurora'} BINGO!
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating Elements for atmosphere */}
      <div className="fixed bottom-10 left-10 w-24 h-24 bg-blue-500/10 rounded-full blur-3xl animate-pulse" />
      <div className="fixed top-20 right-20 w-32 h-32 bg-pink-500/10 rounded-full blur-3xl animate-pulse delay-1000" />
    </div>
  );
}

function TeamCard({ team, name, score, bingo, chanceUsed, isActive, color }: { team: Team, name: string, score: number, bingo: number, chanceUsed: boolean, isActive: boolean, color: 'blue' | 'pink' }) {
  const accentColor = color === 'blue' ? 'border-blue-500 shadow-blue-500/20' : 'border-pink-500 shadow-pink-500/20';
  const glowStyle = isActive ? `border-2 scale-105 ${accentColor} shadow-[0_0_40px_-10px_currentColor]` : 'border border-white/10 opacity-70 scale-100';

  return (
    <motion.div 
      layout
      className={`w-full lg:w-72 p-6 rounded-3xl flex flex-col gap-6 backdrop-blur-2xl transition-all duration-700 ${glowStyle} bg-white/5 relative overflow-hidden`}
    >
      {isActive && (
        <motion.div 
          layoutId="active-glow" 
          className={`absolute -inset-2 opacity-20 blur-xl ${color === 'blue' ? 'bg-blue-400' : 'bg-pink-400'}`} 
        />
      )}
      
      <div className="flex items-center justify-between relative z-10">
        <div className={`p-2.5 rounded-xl ${color === 'blue' ? 'bg-blue-500 shadow-[0_0_15px_rgba(59,130,246,0.5)]' : 'bg-pink-500 shadow-[0_0_15px_rgba(236,72,153,0.5)]'}`}>
          {team === 'A' ? <Crown size={20} className="text-white" /> : <Trophy size={20} className="text-white" />}
        </div>
        <div className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-[0.2em] ${isActive ? (color === 'blue' ? 'bg-blue-500 text-white' : 'bg-pink-500 text-white') : 'bg-white/10 text-white/40'}`}>
          {isActive ? 'Live Playing' : 'Wait'}
        </div>
      </div>
      
      <div className="relative z-10">
        <h2 className="text-[10px] font-black text-white/40 mb-1 uppercase tracking-widest">Contender</h2>
        <p className={`text-2xl font-black italic tracking-tighter uppercase ${color === 'blue' ? 'text-blue-400 drop-shadow-[0_0_8px_rgba(59,130,246,0.4)]' : 'text-pink-400 drop-shadow-[0_0_8px_rgba(236,72,153,0.4)]'}`}>{name}</p>
      </div>

      <div className="grid grid-cols-1 gap-4 relative z-10">
        <div className="bg-black/60 p-5 rounded-2xl border border-white/5 flex items-center justify-between">
          <div>
            <p className="text-[10px] font-bold text-white/40 uppercase mb-0.5 tracking-widest">Points</p>
            <motion.p key={score} initial={{ scale: 1.2, color: '#fff' }} animate={{ scale: 1 }} className="text-3xl font-black text-white tracking-tighter">{score}</motion.p>
          </div>
          <div className="text-right">
            <p className="text-[10px] font-bold text-white/40 uppercase mb-0.5 tracking-widest">Bingo</p>
            <motion.p key={bingo} initial={{ scale: 1.2 }} animate={{ scale: 1 }} className={`text-3xl font-black tracking-tighter ${bingo > 0 ? (color === 'blue' ? 'text-blue-400' : 'text-pink-400') : 'text-white'}`}>{bingo}</motion.p>
          </div>
        </div>
      </div>

      <div className={`flex items-center justify-between p-4 rounded-xl border relative z-10 ${chanceUsed ? 'bg-white/5 border-white/5 opacity-50' : (color === 'blue' ? 'bg-blue-500/10 border-blue-500/20' : 'bg-pink-500/10 border-pink-500/20')}`}>
        <div className="flex items-center gap-2">
          {chanceUsed ? <Lock size={14} className="text-white/40" /> : <Lock size={14} className={`${color === 'blue' ? 'text-blue-400' : 'text-pink-400'}`} />}
          <span className="text-[10px] font-bold uppercase tracking-widest leading-none">Lock Chance</span>
        </div>
        {chanceUsed ? <X size={14} className="text-white/20" /> : <Check size={14} className={color === 'blue' ? 'text-blue-400' : 'text-pink-400'} />}
      </div>
    </motion.div>
  );
}

interface BingoCellProps {
  cell: CellData;
  onClick: () => void;
  isBingo?: boolean;
  bingoTeam?: Team;
}

const BingoCell: React.FC<BingoCellProps> = ({ cell, onClick, isBingo, bingoTeam }) => {
  const getCellStyles = () => {
    switch (cell.status) {
      case CellStatus.TEAM_A:
        return 'bg-blue-500/30 border-blue-400/60 shadow-[inset_0_0_20px_rgba(59,130,246,0.3)] text-blue-100';
      case CellStatus.TEAM_B:
        return 'bg-pink-500/30 border-pink-400/60 shadow-[inset_0_0_20px_rgba(236,72,153,0.3)] text-pink-100';
      case CellStatus.BOTH:
        return 'relative overflow-hidden border-white/30 text-white';
      case CellStatus.FAIL:
        return 'bg-black/60 opacity-40 border-white/5 text-white/20 grayscale';
      case CellStatus.LOCKED_A:
        return 'bg-orange-600/40 border-orange-400 shadow-[inset_0_0_25px_rgba(249,115,22,0.4)] text-orange-100 ring-2 ring-orange-500/20';
      case CellStatus.LOCKED_B:
        return 'bg-orange-600/40 border-orange-400 shadow-[inset_0_0_25px_rgba(249,115,22,0.4)] text-orange-100 ring-2 ring-orange-500/20';
      default:
        return 'bg-white/5 border-white/10 text-white/40 hover:bg-white/10 hover:border-white/30 hover:scale-105 active:scale-95';
    }
  };

  return (
    <motion.button
      id={`cell-${cell.id}`}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      layout
      onClick={onClick}
      disabled={cell.status === CellStatus.FAIL || cell.status === CellStatus.LOCKED_A || cell.status === CellStatus.LOCKED_B}
      className={`relative w-16 h-16 md:w-24 md:h-24 p-2 rounded-xl border-2 transition-all duration-300 font-black flex flex-col items-center justify-center text-center cursor-pointer disabled:cursor-not-allowed ${getCellStyles()} ${isBingo ? 'z-20' : 'z-0'}`}
    >
      {/* Shared Cell split design */}
      {cell.status === CellStatus.BOTH && (
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-blue-500/40" style={{ clipPath: 'polygon(0 0, 100% 0, 0 100%)' }} />
          <div className="absolute inset-0 bg-pink-500/40" style={{ clipPath: 'polygon(100% 100%, 100% 0, 0 100%)' }} />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-[2px] bg-white/40 rotate-135" />
        </div>
      )}

      {/* Bingo Line Sweep Animation */}
      <AnimatePresence>
        {isBingo && (
          <motion.div 
            initial={{ opacity: 0, x: '-100%' }}
            animate={{ opacity: 1, x: '100%' }}
            transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
            className={`absolute inset-0 z-10 w-full h-full skew-x-12 blur-md opacity-50 ${bingoTeam === 'A' ? 'bg-blue-400' : 'bg-pink-400'}`}
          />
        )}
      </AnimatePresence>

      {(cell.status === CellStatus.LOCKED_A || cell.status === CellStatus.LOCKED_B) ? (
        <div className="z-10 flex flex-col items-center gap-1.5">
          <div className="bg-orange-500 p-1.5 rounded-lg shadow-[0_0_15px_rgba(249,115,22,0.6)]">
            <Lock size={22} className="text-white" strokeWidth={3} />
          </div>
          <span className="text-[7px] md:text-[9px] uppercase font-black tracking-tighter leading-none opacity-80">
            {cell.status === CellStatus.LOCKED_A ? 'STARLIGHT' : 'AURORA'} LOCK
          </span>
        </div>
      ) : (
        <span className="z-10 text-[10px] md:text-[12px] leading-tight tracking-tighter uppercase italic break-keep drop-shadow-md">
          {cell.keyword}
        </span>
      )}
    </motion.button>
  );
}

function QuestionModal({ cell, onClose, onResult, canLockA, canLockB }: { cell: CellData, onClose: () => void, onResult: (res: any) => void, canLockA: boolean, canLockB: boolean }) {
  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-xl"
    >
      <motion.div 
        initial={{ scale: 0.8, y: 30 }}
        animate={{ scale: 1, y: 0 }}
        className="w-full max-w-3xl bg-[#0a0a1a] border-2 border-white/20 rounded-[2.5rem] overflow-hidden shadow-[0_0_150px_-20px_rgba(0,0,0,1)] relative"
      >
        {/* Decorative Grid */}
        <div className="absolute inset-0 opacity-5 pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle, #fff 1px, transparent 1px)', backgroundSize: '20px 20px' }} />

        <div className="p-10 space-y-10 relative z-10">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 flex items-center justify-center bg-linear-to-br from-blue-500 to-pink-500 rounded-2xl shadow-lg">
                <Trophy size={24} className="text-white" />
              </div>
              <div>
                <h4 className="text-[10px] font-black uppercase tracking-[0.4em] text-white/40 leading-none mb-1">Mission Module</h4>
                <p className="text-2xl font-black italic tracking-tighter uppercase text-white">{cell.keyword}</p>
              </div>
            </div>
            <button onClick={onClose} className="p-3 hover:bg-white/10 rounded-2xl transition-all border border-white/5 bg-white/5 active:scale-90">
              <X size={24} className="text-white/60" />
            </button>
          </div>

          <div className="bg-white/5 border border-white/10 p-16 rounded-[2rem] text-center relative overflow-hidden backdrop-blur-md">
               {/* Animated Pulse in background */}
               <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 bg-blue-500/10 rounded-full blur-[60px] animate-pulse" />
               
               <div className="relative z-10 space-y-6">
                 <div className="inline-flex items-center gap-2 px-5 py-1.5 bg-white/10 rounded-full border border-white/10">
                    <div className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-ping" />
                    <span className="text-[10px] font-black tracking-[0.2em] uppercase text-white/80">Awaiting Response</span>
                 </div>
                 <h4 className="text-3xl font-black italic tracking-tighter text-white leading-tight">
                   이 키워드와 관련된 <span className="text-blue-400 underline decoration-blue-500/50 underline-offset-8">팬덤 데이터</span>를<br />정확하게 분석하여 맞혀주세요!
                 </h4>
                 <p className="text-white/40 text-sm max-w-md mx-auto">팀장의 가이드에 따라 결과를 집계한 후,<br />아래의 버튼 시스템을 사용하여 상태를 업데이트하세요.</p>
               </div>
          </div>

          <div className="grid grid-cols-3 sm:grid-cols-6 gap-4">
            <StickButton 
               label="A WIN" 
               color="blue" 
               icon={<Check size={20} />} 
               onClick={() => onResult('A')} 
            />
            <StickButton 
               label="SHARED" 
               color="purple" 
               icon={<Crown size={20} />} 
               onClick={() => onResult('BOTH')} 
            />
             <StickButton 
               label="B WIN" 
               color="pink" 
               icon={<Check size={20} />} 
               onClick={() => onResult('B')} 
            />
            <StickButton 
               label="FAIL" 
               color="red" 
               icon={<X size={20} />} 
               onClick={() => onResult('FAIL')} 
            />
            <StickButton 
               label="A LOCK" 
               color="orange" 
               icon={<Lock size={20} />} 
               onClick={() => onResult('LOCK_A')} 
               disabled={!canLockA}
            />
            <StickButton 
               label="B LOCK" 
               color="orange" 
               icon={<Lock size={20} />} 
               onClick={() => onResult('LOCK_B')} 
               disabled={!canLockB}
            />
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

function StickButton({ label, color, icon, onClick, disabled = false }: { label: string, color: string, icon: React.ReactNode, onClick: () => void, disabled?: boolean }) {
  const getColors = () => {
    if (disabled) return 'from-white/5 to-transparent border-white/10 opacity-30';
    switch (color) {
      case 'blue': return 'from-blue-500/40 to-blue-900/20 border-blue-400 shadow-[0_10px_20px_-10px_rgba(59,130,246,0.5)]';
      case 'pink': return 'from-pink-500/40 to-pink-900/20 border-pink-400 shadow-[0_10px_20px_-10px_rgba(236,72,153,0.5)]';
      case 'purple': return 'from-purple-500/40 to-purple-900/20 border-purple-400 shadow-[0_10px_20px_-10px_rgba(168,85,247,0.5)]';
      case 'orange': return 'from-orange-500/40 to-orange-900/20 border-orange-400 shadow-[0_10px_20px_-10px_rgba(249,115,22,0.5)]';
      case 'red': return 'from-red-500/40 to-red-900/20 border-red-400 shadow-[0_10px_20px_-10px_rgba(239,68,68,0.5)]';
      default: return 'from-white/10 to-transparent border-white/20';
    }
  };

  return (
    <motion.button
      whileHover={disabled ? {} : { scale: 1.05, y: -5 }}
      whileTap={disabled ? {} : { scale: 0.95 }}
      disabled={disabled}
      onClick={onClick}
      className={`flex flex-col items-center gap-3 p-4 rounded-full border-2 bg-linear-to-b transition-all duration-300 ${getColors()} ${disabled ? 'cursor-not-allowed' : 'cursor-pointer'}`}
    >
      <div className={`w-12 h-12 flex items-center justify-center rounded-full bg-black/40 border border-white/20`}>
        {icon}
      </div>
      <span className="text-[10px] font-black tracking-tighter uppercase whitespace-nowrap">{label}</span>
      {/* Light stick visual effect */}
      <div className="w-1 h-8 rounded-full bg-linear-to-b from-white/20 to-transparent" />
    </motion.button>
  );
}
