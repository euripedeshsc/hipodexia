import React, { useState } from 'react';
import { useGameStore } from '../store/useGameStore';
import { Users, Plus, Lock, Unlock, LogOut, Search, Trash2, Edit3, KeyRound } from 'lucide-react';
import Swal from 'sweetalert2';

export default function RoomList() {
  const { rooms, createdRooms, createRoom, deleteRoom, updateRoomName, joinRoom, userProfile, setUserProfile } = useGameStore();
  
  const [showCreate, setShowCreate] = useState(false);
  const [newRoomName, setNewRoomName] = useState('');
  
  const [joinRoomId, setJoinRoomId] = useState(null);
  const [joinCode, setJoinCode] = useState('');
  
  const [editingRoomId, setEditingRoomId] = useState(null);
  const [editRoomName, setEditRoomName] = useState('');

  const [isProcessing, setIsProcessing] = useState(false);

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!newRoomName.trim()) return;
    setIsProcessing(true);
    const success = await createRoom(newRoomName);
    setIsProcessing(false);
    
    if (success) {
      setShowCreate(false);
      setNewRoomName('');
      Swal.fire({
        title: 'Sala Criada!',
        text: 'O seu plantão foi aberto com sucesso. Passe o código para os colegas entrarem!',
        icon: 'success',
        confirmButtonText: 'Entendido'
      });
    }
  };

  const handleJoin = async (e) => {
    e.preventDefault();
    setIsProcessing(true);
    const success = await joinRoom(joinRoomId, joinCode);
    setIsProcessing(false);
    if(success) {
      setJoinRoomId(null);
      setJoinCode('');
    }
  };

  const startEditing = (room) => {
    setEditingRoomId(room.id);
    setEditRoomName(room.room_name);
  };

  const saveEdit = async (roomId) => {
    if (!editRoomName.trim()) return;
    await updateRoomName(roomId, editRoomName);
    setEditingRoomId(null);
  };

  const handleDelete = async (roomId) => {
    const result = await Swal.fire({
      title: 'Excluir esta sala?',
      text: 'Todos os jogadores conectados serão desconectados.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#64748b',
      confirmButtonText: 'Sim, excluir',
      cancelButtonText: 'Cancelar',
      customClass: {
        popup: 'rounded-2xl shadow-2xl',
        title: 'text-xl font-bold text-slate-800'
      }
    });

    if (result.isConfirmed) {
      await deleteRoom(roomId);
      Swal.fire({
        title: 'Sala Excluída!',
        icon: 'success',
        timer: 1500,
        showConfirmButton: false
      });
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center p-8">
      {/* Header Profile */}
      <div className="w-full max-w-4xl bg-white p-4 rounded-2xl shadow-sm border border-slate-200 flex justify-between items-center mb-8">
        <div className="flex items-center space-x-4">
          <img src={userProfile?.avatar} alt="avatar" className="w-12 h-12 rounded-xl border-2 border-medical-blue" />
          <div>
            <h2 className="font-bold text-slate-800">{userProfile?.name}</h2>
            <p className="text-xs text-slate-500">Pronto para o plantão</p>
          </div>
        </div>
        <button onClick={() => setUserProfile(null, null)} className="flex items-center text-slate-500 hover:text-medical-red font-bold text-sm">
          <LogOut className="w-4 h-4 mr-1" /> Trocar Perfil
        </button>
      </div>

      {/* Main Content */}
      <div className="w-full max-w-4xl flex justify-between items-end mb-6">
        <div>
          <h1 className="text-3xl font-bold text-slate-800">Saguão do Hospital</h1>
          <p className="text-slate-500 mt-1">Escolha um plantão ou crie o seu próprio.</p>
        </div>
        <button onClick={() => setShowCreate(true)} className="flex items-center space-x-2 bg-medical-blue hover:bg-medical-blueDark text-white px-5 py-3 rounded-xl font-bold shadow-lg transition-transform hover:scale-105">
          <Plus className="w-5 h-5" /> <span>Criar Sala</span>
        </button>
      </div>

      <div className="w-full max-w-4xl grid grid-cols-1 md:grid-cols-2 gap-4">
        {rooms.length === 0 ? (
          <div className="col-span-full p-12 text-center border-2 border-dashed border-slate-300 rounded-2xl bg-white/50">
            <Search className="w-12 h-12 text-slate-400 mx-auto mb-4" />
            <p className="text-slate-600 font-bold text-lg">Nenhuma sala aberta no momento.</p>
            <p className="text-slate-500">Crie a sua e convide a equipe!</p>
          </div>
        ) : (
          rooms.map(room => {
            const isCreator = createdRooms.includes(room.id);
            return (
              <div key={room.id} className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 hover:shadow-md transition-shadow flex flex-col justify-between">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex-1 mr-4">
                    {editingRoomId === room.id ? (
                      <div className="flex items-center space-x-2">
                        <input type="text" value={editRoomName} onChange={e => setEditRoomName(e.target.value)} className="w-full p-2 border border-medical-blue rounded outline-none font-bold text-slate-800" />
                        <button onClick={() => saveEdit(room.id)} className="bg-medical-blue text-white px-3 py-2 rounded font-bold text-sm">Salvar</button>
                      </div>
                    ) : (
                      <h3 className="font-bold text-xl text-slate-800 flex items-center">
                        {room.room_name} 
                        {isCreator ? (
                           <button onClick={() => startEditing(room)} className="ml-2 text-slate-400 hover:text-medical-yellow transition-colors"><Edit3 className="w-4 h-4" /></button>
                        ) : (
                           room.room_code ? <Lock className="w-4 h-4 ml-2 text-medical-yellowDark" /> : <Unlock className="w-4 h-4 ml-2 text-slate-400" />
                        )}
                      </h3>
                    )}
                    
                    <div className="flex items-center space-x-2 mt-2">
                      <span className={`px-2 py-0.5 rounded text-xs font-bold ${room.status === 'OPEN' ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-600'}`}>
                        {room.status === 'OPEN' ? 'ABERTA' : 'EM JOGO'}
                      </span>
                      <span className="flex items-center text-sm font-bold text-medical-blue">
                        <Users className="w-4 h-4 mr-1" /> {room.playerCount} / {room.max_players}
                      </span>
                    </div>
                  </div>
                  
                  <button 
                    onClick={() => room.room_code ? setJoinRoomId(room.id) : joinRoom(room.id, null)}
                    disabled={room.playerCount >= room.max_players}
                    className="bg-medical-blueLight text-medical-blueDark hover:bg-medical-blue hover:text-white disabled:opacity-50 px-4 py-2 rounded-lg font-bold transition-colors"
                  >
                    Entrar
                  </button>
                </div>
                
                {/* Creator Controls Panel */}
                {isCreator && (
                  <div className="mt-4 pt-4 border-t border-slate-100 flex items-center justify-between">
                    <div className="flex items-center bg-medical-yellowLight/50 text-medical-yellowDark px-3 py-1.5 rounded-lg border border-medical-yellow/30 font-mono text-sm font-bold">
                      <KeyRound className="w-4 h-4 mr-2" />
                      Código: {room.room_code}
                    </div>
                    <button onClick={() => handleDelete(room.id)} className="text-slate-400 hover:text-medical-red flex items-center text-sm font-bold transition-colors">
                      <Trash2 className="w-4 h-4 mr-1" /> Excluir
                    </button>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Modals */}
      {showCreate && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <form onSubmit={handleCreate} className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl">
            <h2 className="text-2xl font-bold text-slate-800 mb-6">Criar Novo Plantão</h2>
            <div className="space-y-4 mb-8">
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">Nome da Sala</label>
                <input type="text" required value={newRoomName} onChange={e => setNewRoomName(e.target.value)} className="w-full p-3 border-2 border-slate-200 rounded-xl focus:border-medical-blue outline-none" placeholder="Ex: UTI Central" />
              </div>
              <p className="text-sm text-slate-500 bg-slate-50 p-3 rounded-lg border border-slate-100">
                O sistema gerará um código de 4 dígitos automaticamente. Apenas você (criador) poderá ver o código na lista e excluir a sala.
              </p>
            </div>
            <div className="flex space-x-3">
              <button type="button" onClick={() => setShowCreate(false)} className="flex-1 py-3 bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold rounded-xl transition-colors">Cancelar</button>
              <button type="submit" disabled={isProcessing} className="flex-1 py-3 bg-medical-blue hover:bg-medical-blueDark text-white font-bold rounded-xl transition-colors">{isProcessing ? 'Criando...' : 'Criar e Entrar'}</button>
            </div>
          </form>
        </div>
      )}

      {joinRoomId && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <form onSubmit={handleJoin} className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl">
            <h2 className="text-2xl font-bold text-slate-800 mb-2 flex items-center"><Lock className="w-6 h-6 mr-2 text-medical-yellowDark" /> Sala Privada</h2>
            <p className="text-slate-500 mb-6">Esta sala exige uma senha para entrar.</p>
            <div className="mb-8">
              <label className="block text-sm font-bold text-slate-700 mb-2">Senha da Sala</label>
              <input type="text" required value={joinCode} onChange={e => setJoinCode(e.target.value)} className="w-full p-3 border-2 border-slate-200 rounded-xl focus:border-medical-blue outline-none uppercase" placeholder="Código de 4 dígitos" maxLength={4} />
            </div>
            <div className="flex space-x-3">
              <button type="button" onClick={() => {setJoinRoomId(null); setJoinCode('');}} className="flex-1 py-3 bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold rounded-xl transition-colors">Cancelar</button>
              <button type="submit" disabled={isProcessing} className="flex-1 py-3 bg-medical-blue hover:bg-medical-blueDark text-white font-bold rounded-xl transition-colors">{isProcessing ? 'Entrando...' : 'Confirmar e Entrar'}</button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
