-- Deleta a sala de testes antiga e, por consequência (CASCADE), todos os 11 jogadores falsos.
DELETE FROM public.games WHERE id = '11111111-1111-1111-1111-111111111111';
