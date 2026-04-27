# HB System — Plano Técnico v1.0
> Data: 27/04/2026

---

## Stack e justificativa

| Tecnologia | Função | Motivo |
|---|---|---|
| Next.js 14 (App Router) | Frontend + API routes | Já usado na fazenda, Vercel nativo, PWA fácil |
| Supabase | Banco de dados + Auth | Já criado, RLS nativo, gratuito no início |
| Tailwind CSS | Estilo | Rápido, sem CSS customizado |
| @hello-pangea/dnd | Drag and drop no Kanban | Fork mantido do react-beautiful-dnd |
| Vercel | Deploy | Já conectado ao GitHub |

---

## Arquitetura do banco (Supabase)

### Tabelas

**events** (Cronograma)
```
id          uuid primary key
user_id     uuid references auth.users
title       text not null
category    text not null
color       text
start_time  time not null
duration    numeric not null  -- em horas (ex: 1.5 = 1h30)
day_of_week int  -- 0=seg, 6=dom (para recorrência semanal)
date        date null  -- se null, é recorrente toda semana
description text
meet_link   text
created_at  timestamptz default now()
```

**cards** (Kanban)
```
id          uuid primary key
user_id     uuid references auth.users
board       text not null  -- 'tarefas' | 'conteudo' | 'funil'
column_name text not null
title       text not null
description text
tags        text[]
scheduled_at timestamptz
position    int  -- ordem dentro da coluna
followup    boolean default false
created_at  timestamptz default now()
```

**costs** (Financeiro)
```
id          uuid primary key
user_id     uuid references auth.users
name        text not null
value       numeric not null
category    text not null
created_at  timestamptz default now()
```

**categories** (categorias customizadas)
```
id          uuid primary key
user_id     uuid references auth.users
name        text not null
color       text not null
type        text  -- 'event' | 'cost'
created_at  timestamptz default now()
```

### RLS
Todas as tabelas: `user_id = auth.uid()` — usuário só lê e escreve os próprios dados.

---

## Estrutura de pastas (Next.js)

```
hb-system/
  app/
    (auth)/
      login/page.tsx
    (app)/
      layout.tsx          ← sidebar + topbar
      cronograma/page.tsx
      tarefas/page.tsx
      financeiro/page.tsx
    api/
      events/route.ts
      cards/route.ts
      costs/route.ts
  components/
    cronograma/
      WeekView.tsx
      DayView.tsx
      EventModal.tsx      ← criar/editar evento
    kanban/
      KanbanBoard.tsx
      KanbanCard.tsx
      CardModal.tsx
    financeiro/
      CostTable.tsx
      CostModal.tsx
    ui/
      Sidebar.tsx
      Topbar.tsx
      CategoryChip.tsx
  lib/
    supabase.ts
    constants.ts          ← cores das categorias
  public/
    manifest.json         ← PWA
  middleware.ts           ← proteção de rotas autenticadas
```

---

## Gates de simplicidade

- [ ] Usa só 1 banco (Supabase) — sem Redis, sem cache externo
- [ ] Sem abstração de ORM — queries diretas com supabase-js
- [ ] Sem estado global complexo — useState/useEffect por componente, SWR para fetch
- [ ] Máximo 3 dependências externas além do Next.js

---

## Sequência de entrega

### Fase 1 — Base (Sessão 1 Claude Code)
- [ ] Setup Next.js + Tailwind + Supabase
- [ ] Autenticação (login page + middleware)
- [ ] Layout base: sidebar + topbar + tema escuro
- [ ] Deploy inicial na Vercel (página em branco funcionando)

### Fase 2 — Cronograma (Sessão 2)
- [ ] Criar tabela `events` no Supabase com RLS
- [ ] WeekView: grade 7 dias × 19 horas, blocos coloridos por categoria
- [ ] DayView: linha do tempo com eventos do dia
- [ ] EventModal: criar/editar evento (título, categoria, horário, duração, descrição, link)
- [ ] Filtros por categoria
- [ ] Excluir evento ao clicar
- [ ] Recorrência semanal (campo day_of_week)

### Fase 3 — Kanban (Sessão 3)
- [ ] Criar tabela `cards` no Supabase com RLS
- [ ] KanbanBoard com 3 abas (Tarefas, Conteúdo, Funil)
- [ ] Colunas configuradas por aba (ver spec)
- [ ] Drag and drop entre colunas (@hello-pangea/dnd)
- [ ] CardModal: criar/editar card
- [ ] Tag "follow-up" especial (âmbar)
- [ ] Data e horário no card

### Fase 4 — Financeiro (Sessão 4)
- [ ] Criar tabela `costs` no Supabase com RLS
- [ ] Listagem de custos com total por categoria e total geral
- [ ] CostModal: criar/editar custo
- [ ] Excluir custo

### Fase 5 — PWA + Go-live (Sessão 5)
- [ ] manifest.json + ícones
- [ ] Service worker básico (cache offline da shell)
- [ ] Checklist de segurança (ver sdd-construcao.md)
- [ ] Testar no celular
- [ ] Configurar domínio app.henriquebastos.com.br na Vercel

---

## Riscos e mitigações

| Risco | Mitigação |
|---|---|
| Drag and drop quebra no mobile | Testar em iOS e Android antes do go-live |
| Cronograma com scroll longo (19h) | Scroll suave, âncora no horário atual ao carregar |
| Supabase gratuito tem limite de requests | Suficiente para uso pessoal — monitorar |
