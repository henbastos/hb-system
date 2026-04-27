# HB System — Contexto para Claude Code

## O que é este projeto
Sistema pessoal de produtividade do Henrique Bastos.
Usuário único. Tema escuro. PWA (computador + celular).

## Leia antes de qualquer tarefa
1. `spec.md` — o que o sistema faz (requisitos)
2. `plan.md` — decisões técnicas e estrutura do banco
3. `tasks.md` — lista executável por fase

## Regras obrigatórias
- Nunca adicionar funcionalidade fora da spec sem perguntar
- Nunca criar usuário de teste com dados — o sistema começa em branco
- Todo dado sensível fica no `.env.local` — nunca hardcoded
- RLS ativo em todas as tabelas do Supabase
- Perguntar antes de assumir qualquer ambiguidade

## Stack
- Next.js 14 (App Router)
- Supabase (banco + auth)
- Tailwind CSS
- @hello-pangea/dnd (kanban)
- SWR (fetch)
- Vercel (deploy)

## Variáveis de ambiente necessárias
```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
```

## Começar pela Fase 1 do tasks.md
