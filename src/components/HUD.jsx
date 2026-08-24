import React from 'react';
import { useGameStore } from '../store/useGameStore';
import { Heart, HeartOff, Sparkles } from 'lucide-react';

export default function HUD() {
  const { players, activePlayerId, useWildcard } = useGameStore();

  return (
    <div className="w-72 bg-white border-r border-slate-200 h-screen flex flex-col shadow-lg z-10">
      <div className="p-4 bg-medical-blueDark text-white font-bold text-center text-xl shadow-md">
        Hipodexia Gamer
      </div>
      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        {players.map((player) => {
          const isActive = String(player.id) === String(activePlayerId);
          const isEliminated = player.lives <= 0;
          return (
            <div key={player.id} className={`relative p-4 rounded-xl border-2 transition-all duration-300 ${
              isEliminated 
                ? 'opacity-50 grayscale border-slate-200 bg-slate-100' 
                : isActive 
                  ? 'border-medical-blue shadow-glow-blue bg-medical-blueLight/30 scale-105' 
                  : 'border-slate-100 bg-slate-50'
            }`}>
              
              {player.dice_number > 0 && !isEliminated && (
                <div className="absolute -top-3 -right-3 bg-medical-yellow text-slate-800 font-black rounded-full w-8 h-8 flex items-center justify-center shadow-md border-2 border-white z-10" title="Ordem no sorteio">
                  {player.dice_number}
                </div>
              )}

              {isEliminated && (
                <div className="absolute -top-3 -right-3 bg-rose-600 text-white font-black rounded-full px-2 py-0.5 text-[10px] flex items-center justify-center shadow-md border-2 border-white z-10">
                  💀 ELIMINADO
                </div>
              )}

              <div className="flex items-center space-x-3 mb-3">
                <img src={player.avatar} alt={player.name} className={`w-12 h-12 rounded-full border-2 ${isActive ? 'border-medical-blue' : 'border-slate-300'}`} />
                <div>
                  <h3 className="font-semibold text-slate-800 leading-tight">{player.name}</h3>
                  <p className="text-xs text-slate-500 font-medium">Casa {player.position} / 20</p>
                </div>
              </div>
              
              <div className="flex justify-between items-center mb-3">
                <div className="flex space-x-1">
                  {[...Array(3)].map((_, i) => (
                    i < player.lives 
                      ? <Heart key={i} className="w-5 h-5 text-medical-red fill-medical-red" />
                      : <HeartOff key={i} className="w-5 h-5 text-slate-300" />
                  ))}
                </div>
              </div>

              <button
                disabled={!player.wildcardAvailable}
                onClick={() => useWildcard(player.id)}
                className={`w-full flex items-center justify-center space-x-2 py-2 rounded-lg text-sm font-bold transition-all ${
                  player.wildcardAvailable 
                    ? 'bg-gradient-to-r from-medical-blue to-cyan-500 text-white shadow-glow hover:scale-105 animate-pulse-fast cursor-pointer' 
                    : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                }`}
              >
                <Sparkles className="w-4 h-4" />
                <span>Carta Branca</span>
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
