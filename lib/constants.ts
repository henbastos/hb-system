export const EVENT_CATEGORIES = {
  Academia: { color: '#166534', textColor: '#bbf7d0', label: 'Academia' },
  Alimentação: { color: '#15803d', textColor: '#dcfce7', label: 'Alimentação' },
  Trabalho: { color: '#1d4ed8', textColor: '#bfdbfe', label: 'Trabalho' },
  Conteúdo: { color: '#b45309', textColor: '#fde68a', label: 'Conteúdo' },
  Prospecção: { color: '#7e22ce', textColor: '#e9d5ff', label: 'Prospecção' },
  Aprendizado: { color: '#9a3412', textColor: '#fed7aa', label: 'Aprendizado' },
  Pessoal: { color: '#a16207', textColor: '#fef08a', label: 'Pessoal' },
} as const

export type EventCategoryKey = keyof typeof EVENT_CATEGORIES

export const COST_CATEGORIES = [
  'Infraestrutura',
  'Pessoal',
  'Ferramentas',
  'Clientes',
] as const

export type CostCategoryKey = (typeof COST_CATEGORIES)[number]

export const KANBAN_BOARDS = {
  tarefas: {
    label: 'Tarefas',
    columns: ['A fazer', 'Em andamento', 'Revisão', 'Concluído'],
  },
  conteudo: {
    label: 'Conteúdo',
    columns: ['Roteiro', 'Gravado', 'Editado', 'Publicado'],
  },
  funil: {
    label: 'Funil de Vendas',
    columns: [
      'Lead',
      'Abordagem',
      'Diagnóstico',
      'Proposta enviada',
      'Construção',
      'Retainer',
      'Parceria',
      'Perdido',
    ],
  },
} as const

export type KanbanBoardKey = keyof typeof KANBAN_BOARDS
