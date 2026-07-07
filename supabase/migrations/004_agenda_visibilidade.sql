-- Visibilidade de eventos da agenda: 'equipe' (todos veem) ou 'privado' (só o criador e o técnico responsável)
alter table agenda_eventos
  add column if not exists visibilidade text not null default 'equipe'
  check (visibilidade in ('equipe', 'privado'));
