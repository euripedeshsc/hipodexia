import React, { useState } from 'react';
import { useGameStore } from '../store/useGameStore';
import { Stethoscope, UserRound } from 'lucide-react';

const AVATARS = [
  'https://i.pravatar.cc/150?img=33',
  'https://i.pravatar.cc/150?img=47',
  'https://i.pravatar.cc/150?img=12',
  'https://i.pravatar.cc/150?img=5',
  'https://i.pravatar.cc/150?img=41',
  'https://i.pravatar.cc/150?img=32',
];

export default function Lobby({ onOpenAdmin }) {
  const { setUserProfile, userProfile } = useGameStore();
  const [name, setName] = useState(userProfile?.name || '');
  const [selectedAvatar, setSelectedAvatar] = useState(userProfile?.avatar || AVATARS[0]);

  const handleContinue = (e) => {
    e.preventDefault();
    if (!name.trim()) return;
    setUserProfile(name, selectedAvatar);
  };

  return (
    <div className="min-h-screen bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] bg-slate-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-3xl shadow-2xl overflow-hidden border border-slate-100 relative">
        <div className="bg-medical-blue p-8 text-center text-white relative overflow-hidden">
          <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center mx-auto mb-4 backdrop-blur-md shadow-lg border border-white/30">
            <Stethoscope className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold mb-2 tracking-tight">Hipodexia Gamer</h1>
          <p className="text-medical-blueLight font-medium">Faça check-in no seu plantão médico</p>
        </div>
        
        <form onSubmit={handleContinue} className="p-8">
          <div className="mb-6">
            <label className="block text-sm font-bold text-slate-700 mb-2">Seu Nome / Título</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <UserRound className="h-5 w-5 text-slate-400" />
              </div>
              <input 
                type="text" 
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ex: Dr. Lucas"
                className="w-full pl-10 pr-4 py-3 bg-slate-50 border-2 border-slate-200 rounded-xl focus:border-medical-blue focus:ring-4 focus:ring-medical-blue/20 outline-none transition-all text-slate-700 font-medium"
                required
              />
            </div>
          </div>

          <div className="mb-8">
            <label className="block text-sm font-bold text-slate-700 mb-3">Escolha seu Avatar</label>
            <div className="grid grid-cols-3 gap-3">
              {AVATARS.map((avatar, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setSelectedAvatar(avatar)}
                  className={`relative rounded-2xl overflow-hidden border-4 transition-all duration-200 ${
                    selectedAvatar === avatar ? 'border-medical-blue shadow-lg scale-105 z-10' : 'border-transparent opacity-70 hover:opacity-100 hover:scale-100 bg-slate-100'
                  }`}
                >
                  <img src={avatar} alt={`Avatar ${idx}`} className="w-full h-auto object-cover" />
                  {selectedAvatar === avatar && (
                    <div className="absolute inset-0 bg-medical-blue/20 mix-blend-overlay"></div>
                  )}
                </button>
              ))}
            </div>
          </div>

          <button 
            type="submit" 
            disabled={!name.trim()}
            className="w-full py-4 bg-medical-blue hover:bg-medical-blueDark disabled:bg-slate-300 text-white font-bold rounded-xl text-lg shadow-xl shadow-medical-blue/30 transition-all hover:-translate-y-1 flex justify-center items-center"
          >
            Continuar para o Saguão
          </button>
        </form>

        <button 
          onClick={onOpenAdmin} 
          type="button"
          className="absolute top-4 right-4 text-white hover:text-medical-yellow font-bold text-xs uppercase tracking-widest bg-black/20 hover:bg-black/40 py-1 px-3 rounded-full transition-colors"
        >
          Acesso Admin
        </button>
      </div>
    </div>
  );
}
