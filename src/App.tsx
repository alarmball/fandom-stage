/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion'; // motion/react 환경에 따라 framer-motion으로 변경 가능
import { Lock, Crown, X, Check, Trophy } from 'lucide-react';
import { CellStatus, CellData, Team, GameState } from './types';

// 1. 키워드별 고유 미션 설명 데이터
const INITIAL_KEYWORDS = [
  { keyword: '데뷔 앨범', description: '팬들이 가장 처음 입덕하게 된 데뷔곡의 초동 판매량을 맞혀보세요!' },
  { keyword: '월드 투어', description: '최근 진행한 월드 투어의 도시 개수와 총 관객 수를 정확히 분석하세요.' },
  { keyword: '음악 방송 1위', description: '해당 아티스트가 음악 방송에서 처음으로 1위를 한 날짜와 곡명을 맞혀주세요.' },
  { keyword: '뮤비 조회수', description: '24시간 내에 달성한 뮤직비디오 조회수의 앞자리 숫자를 맞히는 미션입니다.' },
  { keyword: '응원법', description: '가장 최근 타이틀곡의 킬링파트 응원법을 틀리지 않고 시연하세요.' },
  { keyword: '팬클럽 모집', description: '공식 팬클럽 기수별 상징 컬러와 혜택 한 가지를 설명하세요.' },
  { keyword: '솔로 데뷔', description: '멤버 중 첫 솔로 데뷔 주자의 앨범명과 발매일을 정확히 맞혀보세요.' },
  { keyword: '화보 촬영', description: '최근 화제가 된 패션 잡지 화보의 컨셉명을 맞히는 미션입니다.' },
  { keyword: '콜라보', description: '타 아티스트와 협업한 곡 중 가장 높은 차트 순위를 기록한 곡은?' },
  { keyword: '안무 영상', description: '안무 영상 조회수 1억 뷰를 가장 빨리 달성한 곡을 맞혀보세요.' },
  { keyword: 'OST 참여', description: '드라마 흥행과 함께 큰 사랑을 받은 OST의 드라마 제목을 맞혀보세요.' },
  { keyword: '광고 모델', description: '현재 브랜드 엠버서더로 활동 중인 럭셔리 브랜드의 이름을 맞히세요.' },
  { keyword: '앵콜 콘서트', description: '마지막 앵콜 콘서트에서 팬들이 준비했던 슬로건 문구를 맞혀보세요.' },
  { keyword: '미니 앨범', description: '두 번째 미니 앨범에 수록된 숨은 명곡(수록곡) 한 줄 가창 미션!' },
  { keyword: '라이브 방송', description: '최근 라이브 방송에서 언급한 가장 인상 깊은 팬의 댓글은?' },
  { keyword: '시상식', description: '작년 연말 시상식에서 수상한 상의 정확한 명칭을 맞혀주세요.' },
  { keyword: '챌린지', description: '틱톡/쇼츠에서 유행한 챌린지 안무의 핵심 동작을 시연하세요.' },
  { keyword: '팬 미팅', description: '오프라인 팬미팅 당시 진행했던 특별 코너의 이름을 맞혀보세요.' },
  { keyword: '시구/시타', description: '야구장 시구 당시 착용했던 유니폼의 등번호와 의미를 맞혀보세요.' },
  { keyword: '포토카드', description: '가장 구하기 힘들다는 ‘레전드 포토카드’의 착장 정보를 설명하세요.' },
  { keyword: '팝업 스토어', description: '최근 오픈한 팝업 스토어의 한정판 굿즈 품목 3가지를 말하세요.' },
  { keyword: '자체 콘텐츠', description: '유튜브 공식 채널의 자체 예능 중 가장 조회수가 높은 에피소드는?' },
  { keyword: '라디오 출연', description: '가장 최근에 출연한 라디오 프로그램명과 DJ의 이름을 맞혀보세요.' },
  { keyword: '공항 패션', description: '최근 해외 출국길에 착용하여 완판된 아이템의 브랜드를 맞히세요.' },
  { keyword: '시즌 그리팅', description: '올해 시즌 그리팅 패키지에 포함된 특별 구성품을 맞혀보세요.' },
];

// 2. 인터페이스 정의 (BingoCell 전용)
interface BingoCellProps {
  cell: CellData;
  onClick: () => void;
  isBingo?: boolean;
  bingoTeam?: Team;
}

export default function App() {
  const [gameState, setGameState] = useState<GameState>({
    cells: INITIAL_KEYWORDS.map((k, i) => ({ 
      id: i, 
      keyword: k.keyword, 
      description: k.description, // 동적 데이터 매핑
      status: CellStatus.EMPTY 
    })),
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

  // 빙고 체크 로직
  const checkBingo = useCallback((cells: CellData[], team: Team) => {
    const size = 5;
    const lines: number[][] = [];
    const isOwner = (s: CellStatus) => {
      if (team === 'A') return s === CellStatus.TEAM_A || s === CellStatus.BOTH || s === CellStatus.LOCKED_A;
      return s === CellStatus.TEAM_B || s === CellStatus.BOTH || s === CellStatus.LOCKED_B;
    };
    
    for (let i = 0; i < size; i++) {
      const row = Array.from({ length: size }, (_, j) => i * size + j);
      if (row.every(idx => isOwner(cells[idx].status))) lines.push(row);
      const col = Array.from({ length: size }, (_, j) => j * size + i);
      if (col.every(idx => isOwner(cells[idx].status))) lines.push(col);
    }
    const diag1 = [0, 6, 12, 18, 24];
    if (diag1.every(idx => isOwner(cells[idx].status))) lines.push(diag1);
    const diag2 = [4, 8, 12, 16, 20];
    if (diag2.every(idx => isOwner(cells[idx].status))) lines.push(diag2);
    
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
      let newAScore = prev.teamAScore;
      let newBScore = prev.teamBScore;
      let newAUsed = prev.teamAChanceUsed;
      let newBUsed = prev.teamBChanceUsed;

      if (resultType === 'A') {
        cell.status = cell.status === CellStatus.TEAM_B ? CellStatus.BOTH : CellStatus.TEAM_A;
        newAScore += 25;
      } else if (resultType === 'B') {
        cell.status = cell.status === CellStatus.TEAM_A ? CellStatus.BOTH : CellStatus.TEAM_B;
        newBScore += 25;
      } else if (resultType === 'BOTH') {
        cell.status = CellStatus.BOTH;
        newAScore += 25; newBScore += 25;
      } else if (resultType === 'FAIL') {
        cell.status = CellStatus.FAIL;
      } else if (resultType === 'LOCK_A') {
        cell.status = CellStatus.LOCKED_A; newAUsed = true;
      } else if (resultType === 'LOCK_B') {
        cell.status = CellStatus.LOCKED_B; newBUsed = true;
      }

      const bingoA = checkBingo(newCells, 'A');
      const bingoB = checkBingo(newCells, 'B');

      if (bingoA.length > prev.teamABingoCount) setShowBingoAnimation({ team: 'A', lines: bingoA });
      else if (bingoB.length > prev.teamBBingoCount) setShowBingoAnimation({ team: 'B', lines: bingoB });

      return {
        ...prev,
        cells: newCells,
        teamAScore: newAScore,
        teamBScore: newBScore,
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
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_-20%,#3d1a52,transparent_40%),radial-gradient(circle_at_0%_50%,#1a3a52,transparent_30%),radial-gradient(circle_at_100%_50%,#521a3a,transparent_30%)] opacity-50 pointer-events-none" />

      <motion.div initial={{ y: -50, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="mb-8 text-center">
        <span className="text-xs tracking-[0.5em] text-blue-400 font-bold uppercase mb-2 block">Fandom Stage Finals</span>
        <h1 className="text-4xl font-black italic text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500 tracking-tighter">
          팬덤 빙고 대결
        </h1>
      </motion.div>

      <div className="w-full max-w-7xl flex flex-col lg:flex-row items-stretch justify-center gap-6 relative z-10">
        <TeamCard team="A" name="STARLIGHT" score={gameState.teamAScore} bingo={gameState.teamABingoCount} chanceUsed={gameState.teamAChanceUsed} isActive={gameState.turn === 'A'} color="blue" />

        <div className="flex-1 flex flex-col items-center gap-4">
          <div className="bg-white/5 border-2 border-white/10 p-4 rounded-xl backdrop-blur-md">
            <div className="grid grid-cols-5 gap-2 md:gap-3">
              {gameState.cells.map(cell => (
                <BingoCell 
                  key={cell.id} 
                  cell={cell} 
                  isBingo={showBingoAnimation?.lines.some(l => l.includes(cell.id))}
                  bingoTeam={showBingoAnimation?.team}
                  onClick={() => handleCellClick(cell.id)} 
                />
              ))}
            </div>
          </div>
        </div>

        <TeamCard team="B" name="AURORA" score={gameState.teamBScore} bingo={gameState.teamBBingoCount} chanceUsed={gameState.teamBChanceUsed} isActive={gameState.turn === 'B'} color="pink" />
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
          <motion.div initial={{ scale: 0.5, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 1.5, opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none">
            <div className={`text-6xl font-black italic uppercase px-12 py-6 border-4 rounded-2xl ${showBingoAnimation.team === 'A' ? 'text-blue-400 border-blue-400 shadow-[0_0_30px_rgba(59,130,246,0.5)]' : 'text-pink-400 border-pink-400 shadow-[0_0_30px_rgba(236,72,153,0.5)]'}`}>
              {showBingoAnimation.team === 'A' ? 'Starlight' : 'Aurora'} BINGO!
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// 팀 카드 컴포넌트
function TeamCard({ team, name, score, bingo, chanceUsed, isActive, color }: any) {
  const accentColor = color === 'blue' ? 'border-blue-500 shadow-blue-500/20' : 'border-pink-500 shadow-pink-500/20';
  return (
    <motion.div layout className={`w-full lg:w-72 p-6 rounded-3xl flex flex-col gap-6 backdrop-blur-2xl transition-all duration-700 ${isActive ? `border-2 scale-105 ${accentColor} shadow-[0_0_40px_-10px_currentColor]` : 'border border-white/10 opacity-70'} bg-white/5 relative overflow-hidden`}>
      <div className="flex items-center justify-between relative z-10">
        <div className={`p-2.5 rounded-xl ${color === 'blue' ? 'bg-blue-500' : 'bg-pink-500'}`}>
          <Trophy size={20} className="text-white" />
        </div>
        <div className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase ${isActive ? (color === 'blue' ? 'bg-blue-500' : 'bg-pink-500') : 'bg-white/10'}`}>
          {isActive ? 'Live Playing' : 'Wait'}
        </div>
      </div>
      <div className="relative z-10">
        <p className={`text-2xl font-black italic uppercase ${color === 'blue' ? 'text-blue-400' : 'text-pink-400'}`}>{name}</p>
      </div>
      <div className="bg-black/60 p-5 rounded-2xl border border-white/5 flex items-center justify-between relative z-10">
        <div><p className="text-[10px] font-bold text-white/40 uppercase">Points</p><p className="text-3xl font-black">{score}</p></div>
        <div className="text-right"><p className="text-[10px] font-bold text-white/40 uppercase">Bingo</p><p className={`text-3xl font-black ${bingo > 0 ? (color === 'blue' ? 'text-blue-400' : 'text-pink-400') : ''}`}>{bingo}</p></div>
      </div>
      <div className={`flex items-center justify-between p-4 rounded-xl border relative z-10 ${chanceUsed ? 'bg-white/5 opacity-50' : 'bg-white/10'}`}>
        <div className="flex items-center gap-2"><Lock size={14} /><span className="text-[10px] font-bold uppercase">Lock Chance</span></div>
        {chanceUsed ? <X size={14} /> : <Check size={14} />}
      </div>
    </motion.div>
  );
}

// 빙고 셀 컴포넌트
const BingoCell: React.FC<BingoCellProps> = ({ cell, onClick, isBingo, bingoTeam }) => {
  const getCellStyles = () => {
    switch (cell.status) {
      case CellStatus.TEAM_A: return 'bg-blue-500/30 border-blue-400 text-blue-100';
      case CellStatus.TEAM_B: return 'bg-pink-500/30 border-pink-400 text-pink-100';
      case CellStatus.BOTH: return 'relative overflow-hidden border-white/30 text-white';
      case CellStatus.FAIL: return 'bg-black/60 opacity-40 grayscale';
      case CellStatus.LOCKED_A:
      case CellStatus.LOCKED_B: return 'bg-orange-600/40 border-orange-400 text-orange-100';
      default: return 'bg-white/5 border-white/10 text-white/40 hover:bg-white/10';
    }
  };

  return (
    <motion.button
      whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
      onClick={onClick}
      disabled={cell.status === CellStatus.FAIL || cell.status.toString().includes('LOCKED')}
      className={`relative w-16 h-16 md:w-24 md:h-24 p-2 rounded-xl border-2 transition-all font-black flex flex-col items-center justify-center text-center cursor-pointer ${getCellStyles()} ${isBingo ? 'z-20 ring-4 ring-yellow-400' : ''}`}
    >
      {cell.status === CellStatus.BOTH && (
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-blue-500/40" style={{ clipPath: 'polygon(0 0, 100% 0, 0 100%)' }} />
          <div className="absolute inset-0 bg-pink-500/40" style={{ clipPath: 'polygon(100% 100%, 100% 0, 0 100%)' }} />
        </div>
      )}
      <span className="z-10 text-[10px] md:text-[12px] leading-tight uppercase italic break-keep">
        {cell.status.toString().includes('LOCKED') ? 'LOCKED' : cell.keyword}
      </span>
    </motion.button>
  );
}

// 미션 모달 컴포넌트 (동적 설명 반영)
function QuestionModal({ cell, onClose, onResult, canLockA, canLockB }: any) {
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-xl">
      <motion.div initial={{ scale: 0.8, y: 30 }} animate={{ scale: 1, y: 0 }} className="w-full max-w-3xl bg-[#0a0a1a] border-2 border-white/20 rounded-[2.5rem] overflow-hidden p-10 relative">
        <div className="flex items-center justify-between mb-10">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 flex items-center justify-center bg-gradient-to-br from-blue-500 to-pink-500 rounded-2xl"><Trophy className="text-white" /></div>
            <div>
              <h4 className="text-[10px] font-black uppercase tracking-widest text-white/40">Mission Module</h4>
              <p className="text-2xl font-black italic uppercase text-white">{cell.keyword}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-3 hover:bg-white/10 rounded-2xl transition-all"><X /></button>
        </div>

        <div className="bg-white/5 border border-white/10 p-12 rounded-[2rem] text-center mb-10">
           <div className="space-y-6">
             <div className="inline-flex items-center gap-2 px-4 py-1 bg-white/10 rounded-full border border-white/10">
                <div className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-ping" />
                <span className="text-[10px] font-black uppercase text-white/80">Instruction</span>
             </div>
             {/* 핵심 수정 사항: cell.description을 동적으로 출력 */}
             <h4 className="text-3xl font-black italic text-white leading-tight break-keep">
               {cell.description}
             </h4>
             <p className="text-white/40 text-sm">데이터 확인 후 아래 버튼을 통해 결과를 확정하세요.</p>
           </div>
        </div>

        <div className="grid grid-cols-3 sm:grid-cols-6 gap-4">
          <StickButton label="A WIN" color="blue" icon={<Check />} onClick={() => onResult('A')} />
          <StickButton label="SHARED" color="purple" icon={<Crown />} onClick={() => onResult('BOTH')} />
          <StickButton label="B WIN" color="pink" icon={<Check />} onClick={() => onResult('B')} />
          <StickButton label="FAIL" color="red" icon={<X />} onClick={() => onResult('FAIL')} />
          <StickButton label="A LOCK" color="orange" icon={<Lock />} onClick={() => onResult('LOCK_A')} disabled={!canLockA} />
          <StickButton label="B LOCK" color="orange" icon={<Lock />} onClick={() => onResult('LOCK_B')} disabled={!canLockB} />
        </div>
      </motion.div>
    </motion.div>
  );
}

// 공통 버튼 컴포넌트
function StickButton({ label, color, icon, onClick, disabled = false }: any) {
  const colors: any = {
    blue: 'from-blue-500/40 to-blue-900/20 border-blue-400',
    pink: 'from-pink-500/40 to-pink-900/20 border-pink-400',
    purple: 'from-purple-500/40 to-purple-900/20 border-purple-400',
    orange: 'from-orange-500/40 to-orange-900/20 border-orange-400',
    red: 'from-red-500/40 to-red-900/20 border-red-400',
  };
  return (
    <motion.button
      whileHover={!disabled ? { scale: 1.05, y: -5 } : {}}
      whileTap={!disabled ? { scale: 0.95 } : {}}
      disabled={disabled}
      onClick={onClick}
      className={`flex flex-col items-center gap-3 p-4 rounded-full border-2 bg-gradient-to-b transition-all ${disabled ? 'opacity-20 cursor-not-allowed' : `cursor-pointer ${colors[color]}`}`}
    >
      <div className="w-10 h-10 flex items-center justify-center rounded-full bg-black/40 border border-white/20">{icon}</div>
      <span className="text-[9px] font-black uppercase">{label}</span>
      <div className="w-1 h-6 rounded-full bg-white/20" />
    </motion.button>
  );
}