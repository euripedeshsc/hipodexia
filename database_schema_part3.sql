-- Adicionar colunas necessárias para gerenciar múltiplas salas
ALTER TABLE public.games ADD COLUMN IF NOT EXISTS room_name text DEFAULT 'Sala Geral';
ALTER TABLE public.games ADD COLUMN IF NOT EXISTS room_code text;
ALTER TABLE public.games ADD COLUMN IF NOT EXISTS max_players integer DEFAULT 6;
ALTER TABLE public.games ADD COLUMN IF NOT EXISTS status text DEFAULT 'OPEN'; -- 'OPEN' ou 'PLAYING'

-- Atualiza a sala mockada antiga para ter nome
UPDATE public.games SET room_name = 'Sala de Testes Antiga' WHERE id = '11111111-1111-1111-1111-111111111111';
