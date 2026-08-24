import React, { useState, useEffect } from 'react';
import HUD from './components/HUD';
import Board from './components/Board';
import CardModals from './components/CardModals';
import AdminFooter from './components/AdminFooter';
import Lobby from './components/Lobby';
import AdminPanel from './components/AdminPanel';
import RoomList from './components/RoomList';
import { useGameStore } from './store/useGameStore';
import { Loader2 } from 'lucide-react';

function App() {
  const { initApp, isLoading, userProfile, activeGameId } = useGameStore();
  const [showAdmin, setShowAdmin] = useState(false);

  useEffect(() => {
    initApp();
  }, []);

  if (isLoading) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center space-y-4">
          <Loader2 className="w-12 h-12 text-medical-blue animate-spin" />
          <h2 className="text-xl font-bold text-slate-700">Carregando Hipodexia...</h2>
        </div>
      </div>
    );
  }

  if (showAdmin) {
    return <AdminPanel onBack={() => setShowAdmin(false)} />;
  }

  // 1. Passo 1: Criar Perfil
  if (!userProfile) {
    return <Lobby onOpenAdmin={() => setShowAdmin(true)} />;
  }

  // 2. Passo 2: Saguão de Salas
  if (!activeGameId) {
    return <RoomList />;
  }

  // 3. Passo 3: O Jogo
  return (
    <div className="flex h-screen w-full overflow-hidden bg-slate-50 font-sans">
      <HUD />
      <div className="flex-1 relative flex flex-col">
        <Board />
        <CardModals />
        <AdminFooter />
      </div>
    </div>
  );
}

export default App;
