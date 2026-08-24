import React from 'react';
import { useGameStore } from '../store/useGameStore';
import { Dices, RotateCcw, Crown, Hand, CheckCircle } from 'lucide-react';

export default function AdminFooter() {
  const { rollDice, drawCard, resetGame, phase, players, myPlayerId, activePlayerId } = useGameStore();
  
  const myPlayer = players.find(p => p.id === myPlayerId);
  const isMyTurn = activePlayerId === myPlayerId;

  const renderActionButton = () => {
    if (phase === 'PRE_ROLL') {
      if (myPlayer?.is_ready) {
        return (
          <button disabled className="flex items-center space-x-2 bg-slate-300 text-slate-500 px-5 py-2.5 rounded-xl font-bold">
            <CheckCircle className="w-5 h-5" />
            <span>Aguardando Outros ({players.filter(p => p.is_ready).length}/{players.length})</span>
          </button>
        );
      }
      return (
        <button onClick={rollDice} className="flex items-center space-x-2 bg-medical-blue hover:bg-medical-blueDark px-5 py-2.5 rounded-xl font-bold transition-all shadow-lg text-white">
          <Dices className="w-5 h-5 animate-bounce" />
          <span>Rolar Dado (Pronto!)</span>
        </button>
      );
    }
    if (phase === 'GAME_OVER') {
      return (
        <button onClick={resetGame} className="flex items-center space-x-2 bg-gradient-to-r from-amber-500 to-yellow-400 hover:from-amber-600 hover:to-yellow-500 text-slate-950 px-5 py-2.5 rounded-xl font-black transition-all shadow-glow">
          <RotateCcw className="w-5 h-5" />
          <span>Jogar Novamente</span>
        </button>
      );
    }
    
    // BLUE, YELLOW, RED phases
    return (
      <button disabled className="flex items-center space-x-2 bg-slate-300 text-slate-500 px-5 py-2.5 rounded-xl font-bold">
        <span>Partida em andamento</span>
      </button>
    );
  };

  return (
    <div className="fixed bottom-0 left-72 right-0 bg-slate-900 text-white p-4 flex justify-center items-center space-x-4 z-50 shadow-[0_-10px_20px_rgba(0,0,0,0.2)]">
      <div className="flex items-center text-medical-yellow mr-4 bg-medical-yellow/10 px-3 py-1 rounded-full border border-medical-yellow/30">
        <Crown className="w-4 h-4 mr-2" />
        <span className="font-bold text-xs uppercase tracking-widest">Painel de Ações</span>
      </div>
      
      {renderActionButton()}

      <button 
        onClick={resetGame}
        className="flex items-center space-x-2 bg-slate-700 hover:bg-slate-600 px-4 py-2.5 rounded-xl font-bold transition-all ml-4 text-slate-300"
        title="Resetar Tabuleiro"
      >
        <RotateCcw className="w-5 h-5" />
      </button>

      <button 
        onClick={useGameStore.getState().leaveRoom}
        className="flex items-center space-x-2 bg-medical-red hover:bg-medical-redDark px-4 py-2.5 rounded-xl font-bold transition-all ml-4 text-white shadow-lg"
        title="Sair da Sala"
      >
        Sair da Sala
      </button>
    </div>
  );
}
