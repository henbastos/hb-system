# HB System — Spec v1.0
> Sistema pessoal de produtividade do Henrique Bastos
> Data: 27/04/2026
> Status: APROVADO — pronto para construção

---

## Problema

Henrique precisa de um sistema central para gerenciar sua rotina semanal, acompanhar o progresso dos clientes e prospects da Velane, e controlar custos fixos mensais. Hoje isso está fragmentado entre Google Agenda (sem flexibilidade), RD Station (etapas fixas, não editáveis) e planilhas. O objetivo é produtividade e constância.

---

## Usuário

Um único usuário: **Henrique Bastos**. Sistema pessoal, sem múltiplos usuários na V1.

---

## Módulos — V1 (construir agora)

### Módulo 1 — Cronograma

**O que faz:**
Gerenciador de agenda pessoal com visualização semanal e diária. Henrique cria, edita e exclui eventos manualmente. O sistema começa em branco — Henrique preenche do zero.

**User stories:**
- Como Henrique, quero criar um evento com título, categoria, horário de início, duração e descrição opcional, para organizar minha semana
- Como Henrique, quero adicionar um link de reunião (Meet/Zoom) em eventos de trabalho, para acessar rápido sem buscar no email
- Como Henrique, quero ver a semana inteira de uma vez (Seg a Dom), para ter visão geral
- Como Henrique, quero ver o dia em formato de linha do tempo, para ver detalhes de cada evento
- Como Henrique, quero filtrar por categoria, para focar no que importa em cada momento
- Como Henrique, quero excluir um evento clicando nele, para manter o cronograma atualizado
- Como Henrique, quero que o sistema lembre da Academia toda semana automaticamente (recorrência), para não precisar recriar

**Categorias (com cores fixas):**
| Categoria | Cor |
|---|---|
| Academia | Verde escuro |
| Alimentação | Verde claro |
| Trabalho | Azul |
| Conteúdo | Âmbar |
| Prospecção | Roxo |
| Aprendizado | Vermelho terroso |
| Pessoal | Amarelo |

Henrique pode criar categorias novas pelo sistema.

**Horário:** 05:00 até 00:00 (19 horas visíveis, com scroll)

**Visualizações:**
- Semana (padrão) — grade Seg a Dom com blocos coloridos
- Dia — linha do tempo com título, descrição e link visível ao clicar

**Recorrência:** eventos podem ser marcados como "toda semana" — aparecem automaticamente na semana seguinte sem precisar recriar

**O que NÃO está no escopo:**
- Integração com Google Agenda
- Notificações push
- Compartilhamento de agenda
- Convites para outras pessoas

---

### Módulo 2 — Tarefas & Funil (Kanban)

**O que faz:**
Kanban com três abas: Tarefas, Conteúdo e Funil de Vendas. Cada card tem título, data/hora, descrição e tag. O sistema começa em branco.

**User stories:**
- Como Henrique, quero criar cards em qualquer coluna do kanban, para organizar o trabalho
- Como Henrique, quero mover cards entre colunas arrastando, para atualizar o status
- Como Henrique, quero ver data e horário no card, para saber quando foi criado ou agendado
- Como Henrique, quero adicionar tags coloridas nos cards, para categorizar rapidamente
- Como Henrique, quero marcar um card como "follow-up" (tag especial âmbar), para identificar o que precisa de acompanhamento em qualquer etapa

**Aba Tarefas — colunas:**
A fazer → Em andamento → Revisão → Concluído

**Aba Conteúdo — colunas:**
Roteiro → Gravado → Editado → Publicado

**Aba Funil de Vendas — colunas:**
Lead → Abordagem → Diagnóstico → Proposta enviada → Construção → Retainer → Parceria → Perdido

Tag especial "follow-up" aparece em qualquer coluna do funil — é um status do card, não uma coluna.

**O que NÃO está no escopo:**
- Automação entre etapas
- Integração com WhatsApp ou email
- Relatórios de conversão do funil
- Múltiplos usuários

---

### Módulo 3 — Financeiro

**O que faz:**
Registro manual de custos fixos mensais com categorias. Resumo com total por categoria e total geral. Sistema começa em branco.

**User stories:**
- Como Henrique, quero cadastrar um custo fixo com nome, valor e categoria, para acompanhar meus gastos mensais
- Como Henrique, quero ver o total geral e total por categoria, para saber quanto gasto por área
- Como Henrique, quero editar ou excluir um custo, para manter os dados atualizados

**Categorias de custo:**
Infraestrutura, Pessoal, Ferramentas, Clientes (para quando tiver custos de infra por cliente)

Henrique pode criar categorias novas.

**O que NÃO está no escopo:**
- Integração com banco (Nubank, etc.) — V2
- Receitas e DRE — V2
- Relatórios financeiros — V2

---

## Critérios de Aceitação Globais

- [ ] Sistema roda no computador e no celular (PWA)
- [ ] Tema escuro por padrão
- [ ] Dados persistem no Supabase
- [ ] Autenticação simples (email + senha — só Henrique)
- [ ] Deploy na Vercel em `app.henriquebastos.com.br`
- [ ] Cronograma inicia completamente em branco
- [ ] Kanban inicia completamente em branco
- [ ] Financeiro inicia completamente em branco
- [ ] Todos os dados são editáveis e excluíveis
- [ ] Interface em português

---

## O que NÃO está no escopo da V1

- Conteúdo (scripts, insights de redes sociais) — V2
- CRM completo (contatos, histórico, email) — V2
- AIOS / integração WhatsApp — V3
- Integração com Instagram, TikTok, YouTube — V3
- Tráfego pago e SDR automatizado — V3
- Múltiplos usuários — nunca (sistema pessoal)

---

## Módulos futuros já mapeados (não construir agora)

**V2:**
- Módulo Conteúdo: armazenar roteiros de reels e carrosseis, colar insights de métricas manualmente, IA consulta para sugerir novos roteiros
- CRM: contatos, histórico de interações, integração com funil de vendas

**V3:**
- AIOS: integração WhatsApp — Henrique solicita informações do sistema via mensagem
- Integração com APIs de redes sociais (Meta, TikTok)
- Agente SDR automatizado

---

## Notas de implementação para o Claude Code

- Stack: Next.js + Supabase + Tailwind + Vercel
- Tema escuro por padrão, usando variáveis CSS para cores
- Cores das categorias definidas no código como constantes — não deixar o usuário escolher cor livre na V1
- Kanban: usar biblioteca `@hello-pangea/dnd` para drag and drop
- PWA: adicionar `manifest.json` e service worker básico para funcionar no celular
- Seguir checklist de segurança do `sdd-construcao.md` antes do go-live
- RLS no Supabase: usuário só acessa os próprios dados
- Começar pelo Módulo 1 (Cronograma), validar, depois Módulo 2, depois Módulo 3
