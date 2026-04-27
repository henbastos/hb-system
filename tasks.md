# HB System — Tasks v1.0
> Executar no Claude Code em ordem de fase
> [P] = pode rodar em paralelo com outras tarefas [P] da mesma fase

---

## Fase 1 — Base

- [ ] [P] Criar projeto Next.js 14: `npx create-next-app@latest hb-system --typescript --tailwind --app`
- [ ] [P] Instalar dependências: `@supabase/supabase-js @supabase/auth-helpers-nextjs @hello-pangea/dnd swr`
- [ ] Criar projeto no Supabase (já criado) — copiar URL e anon key para `.env.local`
- [ ] Configurar `lib/supabase.ts` com cliente browser e servidor
- [ ] Criar `middleware.ts` para proteger rotas `/cronograma`, `/tarefas`, `/financeiro`
- [ ] Criar página de login em `app/(auth)/login/page.tsx` — email + senha, tema escuro
- [ ] Criar layout base em `app/(app)/layout.tsx` — sidebar com 3 itens + topbar
- [ ] Definir constantes de cores em `lib/constants.ts` (7 categorias com hex)
- [ ] Configurar tema escuro global no `globals.css`
- [ ] Deploy na Vercel — conectar repo GitHub, variáveis de ambiente, testar login

**Critério de conclusão da Fase 1:** conseguir fazer login e ver o layout com sidebar em branco, tanto no computador quanto no celular.

---

## Fase 2 — Cronograma

- [ ] Criar tabela `events` no Supabase com RLS (`user_id = auth.uid()`)
- [ ] Criar API route `app/api/events/route.ts` (GET, POST, PUT, DELETE)
- [ ] Criar `components/cronograma/WeekView.tsx` — grade 7 colunas × 19 linhas (05h-00h)
- [ ] Renderizar blocos de evento na WeekView com altura proporcional à duração
- [ ] Criar `components/cronograma/DayView.tsx` — linha do tempo vertical
- [ ] Mostrar link de Meet no DayView ao clicar no evento
- [ ] Criar `components/cronograma/EventModal.tsx` — form: título, categoria, dia, horário início, duração, descrição, link, recorrente sim/não
- [ ] [P] Implementar filtros por categoria (chips coloridos no topo)
- [ ] [P] Implementar excluir evento (botão ✕ ao hover no DayView)
- [ ] Implementar recorrência: ao carregar a semana, gerar eventos dos registros com `day_of_week` preenchido
- [ ] Implementar troca de semana (← →) no topbar
- [ ] Testar criação, edição e exclusão de eventos

**Critério de conclusão da Fase 2:** criar "Academia — 18h30 — 1h30 — toda semana" e ver aparecer em todas as semanas. Criar uma reunião com link e ver o link ao clicar.

---

## Fase 3 — Kanban

- [ ] Criar tabela `cards` no Supabase com RLS
- [ ] Criar API route `app/api/cards/route.ts` (GET, POST, PUT, DELETE, PATCH para reordenar)
- [ ] Criar `components/kanban/KanbanBoard.tsx` com 3 abas (Tarefas / Conteúdo / Funil)
- [ ] Configurar colunas por aba como constante (ver spec)
- [ ] Implementar drag and drop com `@hello-pangea/dnd` entre colunas da mesma aba
- [ ] Persistir nova posição e coluna no Supabase após soltar o card
- [ ] Criar `components/kanban/KanbanCard.tsx` — título, data/hora, tags, badge follow-up
- [ ] Criar `components/kanban/CardModal.tsx` — form: título, descrição, data/hora, tags, follow-up
- [ ] Implementar tag especial "follow-up" (badge âmbar no card)
- [ ] Testar drag and drop no mobile

**Critério de conclusão da Fase 3:** criar um card no Funil em "Lead", arrastar para "Abordagem" e ver persistir após recarregar a página.

---

## Fase 4 — Financeiro

- [ ] Criar tabela `costs` no Supabase com RLS
- [ ] Criar API route `app/api/costs/route.ts` (GET, POST, PUT, DELETE)
- [ ] Criar `components/financeiro/CostTable.tsx` — lista de custos agrupados por categoria
- [ ] Calcular e exibir total por categoria e total geral
- [ ] Criar `components/financeiro/CostModal.tsx` — form: nome, valor, categoria
- [ ] Implementar editar e excluir custo
- [ ] Testar cadastro e exclusão

**Critério de conclusão da Fase 4:** cadastrar 3 custos de categorias diferentes e ver o total calculado corretamente.

---

## Fase 5 — PWA e Go-live

- [ ] Criar `public/manifest.json` com nome, ícone, cor de fundo escuro, display standalone
- [ ] Criar ícone 192x192 e 512x512 (pode ser texto "HB" em fundo escuro)
- [ ] Adicionar `<link rel="manifest">` no layout raiz
- [ ] Testar instalação como PWA no iPhone e Android
- [ ] Rodar checklist de segurança completo (ver `sdd-construcao.md`)
- [ ] Verificar F12 — nenhum dado sensível exposto no front
- [ ] Configurar domínio `app.henriquebastos.com.br` na Vercel
- [ ] Comprar domínio `henriquebastos.com.br` no registro.br
- [ ] Teste final: criar evento, criar card no funil, cadastrar custo — tudo funcionando no celular

**Critério de conclusão da Fase 5:** sistema no ar em `app.henriquebastos.com.br`, instalável como app no celular, todos os módulos funcionando com dados reais.
