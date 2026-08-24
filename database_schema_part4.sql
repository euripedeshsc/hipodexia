-- Adicionando colunas de ciclo de turnos
ALTER TABLE public.games ADD COLUMN IF NOT EXISTS turn_order jsonb DEFAULT '[]'::jsonb;
ALTER TABLE public.games ADD COLUMN IF NOT EXISTS current_turn_index integer DEFAULT 0;

-- Adicionando colunas de status do jogador
ALTER TABLE public.players ADD COLUMN IF NOT EXISTS is_ready boolean DEFAULT false;
ALTER TABLE public.players ADD COLUMN IF NOT EXISTS dice_number integer DEFAULT 0;
