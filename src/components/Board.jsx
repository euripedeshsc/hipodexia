import React from 'react';
import { motion } from 'framer-motion';
import { useGameStore } from '../store/useGameStore';

export default function Board() {
  const players = useGameStore((state) => state.players);
  const totalSpaces = 21; // 0 to 20

  const renderSpaces = () => {
    let spaces = [];
    for (let i = 0; i < totalSpaces; i++) {
      const isStart = i === 0;
      const isFinish = i === 20;
      spaces.push(
        <div 
          key={i} 
          className={`relative w-16 h-16 md:w-20 md:h-20 rounded-2xl border-4 flex flex-col items-center justify-center font-black shadow-sm m-2 transition-all ${
            isFinish 
              ? 'border-yellow-400 bg-gradient-to-br from-yellow-100 to-amber-200 text-amber-800 shadow-[0_0_20px_rgba(250,204,21,0.5)] scale-105' 
              : isStart 
                ? 'border-medical-blue bg-blue-50 text-medical-blueDark'
                : 'border-slate-300 bg-white text-slate-400'
          }`}
        >
          <span className="text-sm md:text-base">{i}</span>
          {isFinish && <span className="text-[10px] uppercase font-black text-amber-700">🏆 Meta</span>}
          {isStart && <span className="text-[10px] uppercase font-bold text-blue-600">Início</span>}
          
          <div className="absolute top-0 left-0 w-full h-full flex flex-wrap justify-center items-center pointer-events-none">
            {players.filter(p => p.position === i).map((player, idx) => (
              <motion.img
                key={player.id}
                layoutId={`player-${player.id}`}
                src={player.avatar}
                initial={false}
                transition={{ type: "spring", stiffness: 60, damping: 15 }}
                className="w-8 h-8 rounded-full border-2 border-medical-blue shadow-lg absolute"
                style={{ 
                  zIndex: 20 + idx, 
                  marginTop: `${(idx % 2 === 0 ? -1 : 1) * (15 + idx * 5)}px`,
                  marginLeft: `${(idx < 2 ? -1 : 1) * (15 + idx * 5)}px`
                }}
              />
            ))}
          </div>
        </div>
      );
    }
    return spaces;
  };

  return (
    <div className="flex-1 bg-slate-50 p-8 overflow-auto flex flex-col items-center justify-center bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]">
      <div className="max-w-5xl w-full flex flex-wrap justify-center content-center">
        {renderSpaces()}
      </div>
    </div>
  );
}
