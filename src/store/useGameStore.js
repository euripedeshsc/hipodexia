import { create } from 'zustand';
import { supabase } from '../lib/supabase';
import Swal from 'sweetalert2';

export const useGameStore = create((set, get) => ({
  userProfile: null,
  myPlayerId: null,
  
  rooms: [],
  activeGameId: null,
  createdRooms: [],

  players: [],
  questions: [],
  currentQuestion: null,
  activePlayerId: null,
  phase: 'PRE_ROLL', // PRE_ROLL, PRE_DRAW, BLUE_CARD, YELLOW_CARD, RED_CARD
  isLoading: true,
  
  gameSubscription: null,
  playersSubscription: null,

  initApp: async () => {
    const savedProfile = localStorage.getItem('hipodexia_profile');
    if (savedProfile) {
      try {
        const parsed = JSON.parse(savedProfile);
        if (parsed && parsed.name) {
          set({ userProfile: parsed });
        } else {
          localStorage.removeItem('hipodexia_profile');
        }
      } catch (e) {
        localStorage.removeItem('hipodexia_profile');
      }
    }

    const savedCreatedRooms = localStorage.getItem('hipodexia_createdRooms');
    if (savedCreatedRooms) {
      try {
        set({ createdRooms: JSON.parse(savedCreatedRooms) });
      } catch (e) {}
    }
    
    const savedId = localStorage.getItem('hipodexia_playerId');
    const savedGameId = localStorage.getItem('hipodexia_activeGameId');
    if (savedId && savedGameId) {
      set({ myPlayerId: parseInt(savedId, 10), activeGameId: savedGameId });
      get().connectToGame(savedGameId);
    } else {
      set({ isLoading: false });
    }

    const { data: qData } = await supabase.from('questions').select('*');
    if (qData) set({ questions: qData });

    get().fetchRooms();

    supabase.channel('public:rooms')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'games' }, () => {
        get().fetchRooms();
      })
      .subscribe();
  },

  setUserProfile: (name, avatar) => {
    if (!name) {
      localStorage.removeItem('hipodexia_profile');
      set({ userProfile: null });
      return;
    }
    const profile = { name, avatar };
    localStorage.setItem('hipodexia_profile', JSON.stringify(profile));
    set({ userProfile: profile });
  },

  fetchRooms: async () => {
    const { data } = await supabase.from('games').select(`
      id, room_name, room_code, max_players, status, phase
    `).order('created_at', { ascending: false });
    
    const { data: allPlayers } = await supabase.from('players').select('game_id');
    
    if (data) {
      const roomsWithCounts = data.map(room => {
        const pCount = allPlayers ? allPlayers.filter(p => p.game_id === room.id).length : 0;
        return { ...room, playerCount: pCount };
      });
      set({ rooms: roomsWithCounts });
    }
  },

  createRoom: async (name) => {
    const generatedCode = Math.random().toString(36).substring(2, 6).toUpperCase();
    
    const { data } = await supabase.from('games').insert([{ 
      room_name: name, 
      room_code: generatedCode,
      status: 'OPEN',
      phase: 'PRE_ROLL',
      turn_order: [],
      current_turn_index: 0
    }]).select().single();

    if (data) {
      const newCreatedRooms = [...get().createdRooms, data.id];
      localStorage.setItem('hipodexia_createdRooms', JSON.stringify(newCreatedRooms));
      set({ createdRooms: newCreatedRooms });
      get().fetchRooms();
      return true;
    }
    return false;
  },

  deleteRoom: async (roomId) => {
    const { error } = await supabase.from('games').delete().eq('id', roomId);
    if (!error) {
      const newCreatedRooms = get().createdRooms.filter(id => id !== roomId);
      localStorage.setItem('hipodexia_createdRooms', JSON.stringify(newCreatedRooms));
      set({ createdRooms: newCreatedRooms });
      get().fetchRooms();
    }
  },

  updateRoomName: async (roomId, newName) => {
    await supabase.from('games').update({ room_name: newName }).eq('id', roomId);
    get().fetchRooms();
  },

  joinRoom: async (roomId, providedCode) => {
    const room = get().rooms.find(r => r.id === roomId);
    
    if (room && room.room_code && room.room_code !== providedCode) {
      Swal.fire('Acesso Negado', 'Senha incorreta!', 'error');
      return false;
    }

    set({ isLoading: true });
    const { userProfile } = get();
    
    const { data: existingPlayers } = await supabase
      .from('players')
      .select('*')
      .eq('game_id', roomId)
      .eq('name', userProfile.name);

    if (existingPlayers && existingPlayers.length > 0) {
      const existingPlayer = existingPlayers[0];
      localStorage.setItem('hipodexia_playerId', existingPlayer.id);
      localStorage.setItem('hipodexia_activeGameId', roomId);
      set({ myPlayerId: existingPlayer.id, activeGameId: roomId });
      await get().connectToGame(roomId);
      return true;
    }

    const { data: playerData } = await supabase.from('players').insert([
      { game_id: roomId, name: userProfile.name, avatar: userProfile.avatar, position: 0, lives: 3, wildcard_available: true, is_ready: false, dice_number: 0 }
    ]).select().single();
    
    if (playerData) {
      localStorage.setItem('hipodexia_playerId', playerData.id);
      localStorage.setItem('hipodexia_activeGameId', roomId);
      set({ myPlayerId: playerData.id, activeGameId: roomId });
      await get().connectToGame(roomId);
      return true;
    }
    set({ isLoading: false });
    return false;
  },

  connectToGame: async (roomId) => {
    const { gameSubscription, playersSubscription } = get();
    if (gameSubscription) supabase.removeChannel(gameSubscription);
    if (playersSubscription) supabase.removeChannel(playersSubscription);

    const { data: gameData } = await supabase.from('games').select('*').eq('id', roomId).single();
    const { data: playersData } = await supabase.from('players').select('*').eq('game_id', roomId).order('id');
    
    if (!gameData) {
      get().leaveRoom();
      return;
    }

    const { questions } = get();
    const currentQ = questions.find(q => q.id === gameData.current_question_id) || null;
    set({ phase: gameData.phase, activePlayerId: gameData.active_player_id, currentQuestion: currentQ });
    
    if (playersData) {
      set({ players: playersData, isLoading: false });
    }

    const newGameSub = supabase.channel(`game:${roomId}`)
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'games', filter: `id=eq.${roomId}` }, async (payload) => {
        const oldPhase = get().phase;
        const oldActivePlayer = get().activePlayerId;
        
        const { questions } = get();
        const currentQ = questions.find(q => q.id === payload.new.current_question_id) || null;
        
        set({ 
          phase: payload.new.phase, 
          activePlayerId: payload.new.active_player_id,
          currentQuestion: currentQ
        });

        // ==========================================
        // ALERTS DE FASES DO JOGO
        // ==========================================
        if (oldPhase === 'PRE_ROLL' && payload.new.phase === 'BLUE_CARD') {
          const myPlayerId = get().myPlayerId;
          const turnOrder = payload.new.turn_order || [];
          const myPos = turnOrder.indexOf(myPlayerId) + 1;
          const posText = myPos > 0 ? `<br/><br/><b style="color: #FACC15; font-size: 1.3rem;">Sua posição: ${myPos}º a jogar!</b>` : '';

          Swal.fire({
            title: '🎲 Sorteio Realizado!',
            html: `A ordem dos turnos foi definida para toda a partida!${posText}`,
            icon: 'success',
            timer: 4500,
            showConfirmButton: false,
            backdrop: `rgba(15,23,42,0.8)`,
            customClass: {
              popup: 'bg-gradient-to-br from-slate-800 to-slate-900 border-2 border-medical-blue rounded-3xl shadow-[0_0_50px_rgba(56,189,248,0.5)]',
              title: 'text-3xl text-white font-black tracking-tight',
              htmlContainer: 'text-slate-300 font-bold text-lg',
            }
          });
        }
        
        if (oldActivePlayer && String(oldActivePlayer) !== String(payload.new.active_player_id) && payload.new.phase === 'BLUE_CARD') {
          const { data: pData } = await supabase.from('players').select('name').eq('id', payload.new.active_player_id).single();
          const currentPlayers = get().players;
          const localPlayer = currentPlayers.find(p => String(p.id) === String(payload.new.active_player_id));
          const nextPlayerName = pData?.name || localPlayer?.name || 'Próximo Médico';

          Swal.fire({
            title: 'Vez no Plantão 🩺',
            html: `É a vez de <b style="color: #fde047;">${nextPlayerName}</b> resolver o caso!`,
            icon: 'info',
            toast: true,
            position: 'top-end',
            timer: 3500,
            showConfirmButton: false,
            background: '#0f172a',
            color: '#ffffff',
            customClass: {
              popup: 'border-2 border-cyan-400 shadow-[0_0_20px_rgba(34,211,238,0.5)] rounded-2xl',
              title: 'text-cyan-300 font-black text-base',
              htmlContainer: 'text-slate-100 text-sm font-medium'
            }
          });
        }

        // ==========================================
        // ALERTA DE FIM DE JOGO / VITÓRIA
        // ==========================================
        if (payload.new.phase === 'GAME_OVER') {
          const { data: latestPlayers } = await supabase.from('players').select('*').eq('game_id', roomId);
          const playersList = latestPlayers || get().players;
          const winnerByPosition = playersList.find(p => p.position >= 20);
          const alivePlayers = playersList.filter(p => p.lives > 0);

          let winnerTitle = 'Plantão Concluído!';
          let winnerName = 'Nenhum sobrevivente';
          let winReason = 'Todos os médicos perderam suas vidas.';
          let iconType = 'info';

          if (winnerByPosition) {
            winnerTitle = '🎉 CAMPEÃO DO PLANTÃO! 🎉';
            winnerName = winnerByPosition.name;
            winReason = 'Chegou primeiro à Casa 20 e completou o plantão com maestria!';
            iconType = 'success';
          } else if (alivePlayers.length === 1) {
            winnerTitle = '👑 ÚLTIMO SOBREVIVENTE! 👑';
            winnerName = alivePlayers[0].name;
            winReason = 'Foi o único médico que resistiu a todas as emergências!';
            iconType = 'success';
          }

          Swal.fire({
            title: winnerTitle,
            html: `
              <div style="text-align: center; padding: 10px;">
                <div style="font-size: 3.5rem; margin-bottom: 8px;">🏆</div>
                <p style="color: #94a3b8; font-size: 0.9rem; text-transform: uppercase; letter-spacing: 2px; margin-bottom: 4px;">Vencedor</p>
                <p style="color: #facc15; font-size: 2.2rem; font-weight: 900; margin-bottom: 12px;">${winnerName}</p>
                <p style="color: #e2e8f0; font-size: 1rem;">${winReason}</p>
              </div>
            `,
            icon: iconType,
            confirmButtonText: 'Jogar Novamente 🔄',
            confirmButtonColor: '#0284c7',
            allowOutsideClick: false,
            backdrop: 'rgba(15, 23, 42, 0.9)',
            customClass: {
              popup: 'bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 border-4 border-yellow-400 rounded-3xl shadow-[0_0_80px_rgba(250,204,21,0.5)]',
              title: 'text-2xl text-yellow-400 font-black'
            }
          }).then((res) => {
            if (res.isConfirmed) {
              get().resetGame();
            }
          });
        }
      })
      .on('postgres_changes', { event: 'DELETE', schema: 'public', table: 'games', filter: `id=eq.${roomId}` }, () => {
        Swal.fire('Aviso', 'A sala foi encerrada pelo criador.', 'warning');
        get().leaveRoom();
      })
      .subscribe();

    const newPlayerSub = supabase.channel(`players:${roomId}`)
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'players', filter: `game_id=eq.${roomId}` }, (payload) => {
        const oldPlayer = get().players.find(p => p.id === payload.new.id);
        
        // ==========================================
        // ALERTS DE ACERTOS E ERROS
        // ==========================================
        if (oldPlayer) {
          if (payload.new.position > oldPlayer.position) {
            Swal.fire({
              title: 'Acertou! 🎉',
              html: `<b>${payload.new.name}</b> avançou para a Casa ${payload.new.position}!`,
              icon: 'success',
              timer: 3500,
              showConfirmButton: false,
              backdrop: `rgba(0,0,0,0.5)`,
              customClass: {
                popup: 'bg-gradient-to-br from-green-50 to-green-100 border-4 border-green-500 rounded-3xl shadow-[0_0_60px_rgba(34,197,94,0.6)]',
                title: 'text-3xl text-green-700 font-black tracking-tight',
                htmlContainer: 'text-green-800 font-bold text-lg',
              }
            });
          } else if (payload.new.lives < oldPlayer.lives) {
            Swal.fire({
              title: 'Errou! 💔',
              html: `<b>${payload.new.name}</b> perdeu uma vida! (Restam: ${payload.new.lives})`,
              icon: 'error',
              timer: 3500,
              showConfirmButton: false,
              backdrop: `rgba(0,0,0,0.5)`,
              customClass: {
                popup: 'bg-gradient-to-br from-red-50 to-red-100 border-4 border-red-500 rounded-3xl shadow-[0_0_60px_rgba(239,68,68,0.6)]',
                title: 'text-3xl text-red-700 font-black tracking-tight',
                htmlContainer: 'text-red-800 font-bold text-lg',
              }
            });
          }
        }

        const updatedPlayers = get().players.map(p => p.id === payload.new.id ? payload.new : p);
        set({ players: updatedPlayers });

        if (updatedPlayers.length > 0 && updatedPlayers.every(p => p.is_ready)) {
          if (payload.new.id === get().myPlayerId) {
             get().generateTurnSequence(updatedPlayers, roomId);
          }
        }
      })
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'players', filter: `game_id=eq.${roomId}` }, (payload) => {
        set((state) => ({ players: [...state.players, payload.new] }));
        get().fetchRooms();
      })
      .subscribe();

    set({ gameSubscription: newGameSub, playersSubscription: newPlayerSub });
  },

  leaveRoom: () => {
    const { gameSubscription, playersSubscription } = get();
    if (gameSubscription) supabase.removeChannel(gameSubscription);
    if (playersSubscription) supabase.removeChannel(playersSubscription);
    
    localStorage.removeItem('hipodexia_playerId');
    localStorage.removeItem('hipodexia_activeGameId');
    
    set({ 
      activeGameId: null, 
      myPlayerId: null, 
      players: [], 
      currentQuestion: null, 
      activePlayerId: null, 
      phase: 'PRE_ROLL',
      isLoading: false
    });
  },

  // Novo Sistema de Ciclos
  rollDice: async () => {
    const { myPlayerId } = get();
    await supabase.from('players').update({ is_ready: true }).eq('id', myPlayerId);
  },

  generateTurnSequence: async (roomPlayers, roomId) => {
    const { activeGameId, questions } = get();
    const { data: gameData } = await supabase.from('games').select('phase').eq('id', activeGameId).single();
    if (gameData && gameData.phase !== 'PRE_ROLL') return;

    let shuffled = [...roomPlayers].sort(() => Math.random() - 0.5);
    const N = shuffled.length;
    
    const updates = shuffled.map((p, index) => {
      const dice = N - index;
      return supabase.from('players').update({ dice_number: dice }).eq('id', p.id);
    });
    await Promise.all(updates);

    const turnOrder = shuffled.map(p => p.id);
    const randomQuestion = questions.length > 0 ? questions[Math.floor(Math.random() * questions.length)] : null;

    await supabase.from('games').update({ 
      phase: 'BLUE_CARD', 
      turn_order: turnOrder,
      current_turn_index: 0,
      active_player_id: turnOrder[0],
      current_question_id: randomQuestion ? randomQuestion.id : null,
      status: 'PLAYING'
    }).eq('id', roomId);
  },

  advancePhase: async () => {
    const { phase, activeGameId } = get();
    if (!activeGameId) return;
    
    let nextPhase = phase;
    if (phase === 'BLUE_CARD') nextPhase = 'YELLOW_CARD';
    
    await supabase.from('games').update({ phase: nextPhase }).eq('id', activeGameId);
  },

  submitAnswer: async (optionIndex) => {
    const { phase, activePlayerId, currentQuestion, activeGameId } = get();
    if (!currentQuestion || !activeGameId) return;

    if (phase === 'YELLOW_CARD') {
      if (optionIndex === currentQuestion.yellow_correct_index) {
        await supabase.from('games').update({ phase: 'RED_CARD' }).eq('id', activeGameId);
      } else {
        get().triggerWrongAnswer(activePlayerId);
      }
    } else if (phase === 'RED_CARD') {
      if (optionIndex === currentQuestion.red_correct_index) {
        get().triggerCorrectAnswer(activePlayerId);
      } else {
        get().triggerWrongAnswer(activePlayerId);
      }
    }
  },

  advanceCycleTurn: async () => {
    const { activeGameId, questions } = get();
    const { data: game } = await supabase.from('games').select('current_turn_index, turn_order').eq('id', activeGameId).single();
    const { data: playersData } = await supabase.from('players').select('*').eq('game_id', activeGameId);
    
    if (game && playersData) {
      const turnOrder = game.turn_order || [];
      if (turnOrder.length === 0) return;

      const alivePlayers = playersData.filter(p => p.lives > 0);
      
      // Checagem de Fim de Jogo: Nenhum vivo ou apenas 1 sobrevivente (em sala multijogador)
      if (alivePlayers.length === 0) {
        await supabase.from('games').update({ phase: 'GAME_OVER', status: 'FINISHED' }).eq('id', activeGameId);
        return;
      }
      if (playersData.length > 1 && alivePlayers.length === 1) {
        await supabase.from('games').update({ phase: 'GAME_OVER', status: 'FINISHED' }).eq('id', activeGameId);
        return;
      }

      // Encontrar o próximo jogador vivo na fila circular (usando %)
      let nextIndex = (game.current_turn_index + 1) % turnOrder.length;
      let attempts = 0;
      while (attempts < turnOrder.length) {
        const candidateId = turnOrder[nextIndex];
        const candidate = playersData.find(p => String(p.id) === String(candidateId));
        if (candidate && candidate.lives > 0) {
          break;
        }
        nextIndex = (nextIndex + 1) % turnOrder.length;
        attempts++;
      }

      const randomQuestion = questions.length > 0 ? questions[Math.floor(Math.random() * questions.length)] : null;
      
      // O jogo segue em loop contínuo sem nunca pedir novo sorteio!
      await supabase.from('games').update({ 
        phase: 'BLUE_CARD',
        current_turn_index: nextIndex,
        active_player_id: turnOrder[nextIndex],
        current_question_id: randomQuestion ? randomQuestion.id : null
      }).eq('id', activeGameId);
    }
  },

  triggerCorrectAnswer: async (playerId) => {
    const { players, activeGameId } = get();
    const player = players.find(p => String(p.id) === String(playerId));
    if (!player) return;

    const newPosition = Math.min(20, player.position + 2);
    await supabase.from('players').update({ position: newPosition }).eq('id', player.id);

    // Condição de Vitória: Chegar na Casa 20
    if (newPosition >= 20) {
      await supabase.from('games').update({ 
        phase: 'GAME_OVER',
        status: 'FINISHED'
      }).eq('id', activeGameId);
      return;
    }

    await get().advanceCycleTurn();
  },

  triggerWrongAnswer: async (playerId) => {
    const { players, activeGameId } = get();
    const player = players.find(p => String(p.id) === String(playerId));
    if (!player) return;

    const newPosition = Math.max(0, player.position - 2);
    const newLives = Math.max(0, player.lives - 1);
    await supabase.from('players').update({ position: newPosition, lives: newLives }).eq('id', player.id);

    // Checa se o jogo terminou por eliminação
    const { data: updatedPlayers } = await supabase.from('players').select('*').eq('game_id', activeGameId);
    if (updatedPlayers && updatedPlayers.length > 1) {
      const alivePlayers = updatedPlayers.filter(p => p.lives > 0);
      if (alivePlayers.length <= 1) {
        await supabase.from('games').update({ 
          phase: 'GAME_OVER',
          status: 'FINISHED'
        }).eq('id', activeGameId);
        return;
      }
    }

    await get().advanceCycleTurn();
  },

  useWildcard: async (playerId) => {
    await supabase.from('players').update({ wildcard_available: false }).eq('id', playerId);
  },
  
  resetGame: async () => {
    const { players, activeGameId } = get();
    if (!activeGameId) return;
    for (const p of players) {
      await supabase.from('players').update({ position: 0, lives: 3, wildcard_available: true, is_ready: false, dice_number: 0 }).eq('id', p.id);
    }
    await supabase.from('games').update({ phase: 'PRE_ROLL', active_player_id: null, current_question_id: null, status: 'OPEN', turn_order: [], current_turn_index: 0 }).eq('id', activeGameId);
  }
}));
