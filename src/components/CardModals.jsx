import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGameStore } from '../store/useGameStore';
import { Clock, AlertTriangle, ShieldCheck } from 'lucide-react';

export default function CardModals() {
  const { phase, advancePhase, submitAnswer, activePlayerId, myPlayerId, players, currentQuestion } = useGameStore();

  if (phase === 'PRE_ROLL' || phase === 'PRE_DRAW' || phase === 'GAME_OVER' || !currentQuestion) return null;

  const activePlayer = players.find(p => String(p.id) === String(activePlayerId));
  const isMyTurn = String(activePlayerId) === String(myPlayerId);
  const question = currentQuestion;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-40 flex items-center justify-center p-4">
        <motion.div 
          initial={{ scale: 0.9, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0, y: -20 }}
          className={`w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden ${
            phase === 'BLUE_CARD' ? 'bg-medical-blueLight border-4 border-medical-blue' :
            phase === 'YELLOW_CARD' ? 'bg-medical-yellowLight border-4 border-medical-yellow' :
            'bg-medical-redLight border-4 border-medical-red'
          }`}
        >
          {/* Header */}
          <div className={`p-4 flex items-center justify-between text-white ${
            phase === 'BLUE_CARD' ? 'bg-medical-blue' :
            phase === 'YELLOW_CARD' ? 'bg-medical-yellow text-slate-800' :
            'bg-medical-red'
          }`}>
            <div className="flex items-center space-x-2">
              {phase === 'BLUE_CARD' && <ShieldCheck className="w-6 h-6" />}
              {phase === 'YELLOW_CARD' && <AlertTriangle className="w-6 h-6" />}
              {phase === 'RED_CARD' && <AlertTriangle className="w-6 h-6 animate-pulse" />}
              <span className="font-bold text-lg uppercase tracking-wide">
                {phase === 'BLUE_CARD' ? 'Caso Clínico' : phase === 'YELLOW_CARD' ? 'Fase 1: Conduta' : 'Fase 2: Urgência'}
              </span>
            </div>
            <div className="flex items-center space-x-1 font-mono font-bold text-xl bg-white/30 px-3 py-1 rounded-lg">
              <Clock className="w-5 h-5" />
              <span>60s</span>
            </div>
          </div>

          {/* Body */}
          <div className="p-8 text-center bg-white/90">
            {phase === 'BLUE_CARD' && (
              <>
                <p className="text-xl text-slate-800 font-medium mb-8">{question.blue_text}</p>
                <button 
                  onClick={advancePhase}
                  disabled={!isMyTurn}
                  className={`w-full py-4 font-bold rounded-xl text-lg shadow-lg transition-transform ${
                    isMyTurn ? 'bg-medical-blue hover:bg-medical-blueDark text-white hover:scale-105' : 'bg-slate-300 text-slate-500 cursor-not-allowed'
                  }`}
                >
                  {isMyTurn ? 'Analisar Sinais Iniciais' : `Aguardando ${activePlayer?.name}...`}
                </button>
              </>
            )}

            {phase === 'YELLOW_CARD' && (
              <>
                <p className="text-lg text-slate-800 font-bold mb-6">{question.yellow_question}</p>
                <div className="grid grid-cols-1 gap-3">
                  {question.yellow_options.map((opt, i) => (
                    <button 
                      key={i} 
                      onClick={() => submitAnswer(i)}
                      disabled={!isMyTurn}
                      className={`p-4 text-left font-semibold rounded-lg border-2 transition-colors shadow-sm ${
                        isMyTurn 
                          ? 'bg-white border-slate-200 text-slate-700 hover:bg-medical-yellowLight hover:border-medical-yellow' 
                          : 'bg-slate-100 border-transparent text-slate-400 cursor-not-allowed'
                      }`}
                    >
                      {opt}
                    </button>
                  ))}
                </div>
                {!isMyTurn && <p className="mt-4 text-medical-red font-bold text-sm animate-pulse">Assistindo {activePlayer?.name} jogar...</p>}
              </>
            )}

            {phase === 'RED_CARD' && (
              <>
                <p className="text-lg text-slate-800 font-bold mb-6 flex items-center justify-center">
                  <AlertTriangle className="text-medical-red w-7 h-7 mr-2" /> {question.red_text}
                </p>
                <div className="grid grid-cols-1 gap-3">
                  {question.red_options.map((opt, i) => (
                    <button 
                      key={i} 
                      onClick={() => submitAnswer(i)}
                      disabled={!isMyTurn}
                      className={`p-4 text-left font-bold rounded-lg border-2 transition-colors shadow-sm ${
                        isMyTurn 
                          ? 'bg-white border-slate-200 text-slate-800 hover:bg-medical-redLight hover:border-medical-red' 
                          : 'bg-slate-100 border-transparent text-slate-400 cursor-not-allowed'
                      }`}
                    >
                      {opt}
                    </button>
                  ))}
                </div>
                {!isMyTurn && <p className="mt-4 text-medical-red font-bold text-sm animate-pulse">Assistindo {activePlayer?.name} jogar...</p>}
              </>
            )}
          </div>
          
          <div className="p-3 bg-slate-100 border-t border-slate-200 text-center text-sm font-bold text-slate-500">
            Turno atual: <span className="text-medical-blueDark ml-1">{activePlayer?.name}</span>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
