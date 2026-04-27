'use client'

import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd'
import { KanbanCard as KanbanCardType } from '@/lib/types'
import { KANBAN_BOARDS, KanbanBoardKey } from '@/lib/constants'
import KanbanCard from './KanbanCard'

const COLUMN_ACCENT: Record<string, string> = {
  // Tarefas
  'Em andamento': '#3b82f6',
  'Revisão':      '#3b82f6',
  'Concluído':    '#22c55e',
  // Conteúdo
  'Gravado':      '#3b82f6',
  'Editado':      '#3b82f6',
  'Publicado':    '#22c55e',
  // Funil
  'Diagnóstico':        '#f59e0b',
  'Proposta construção':'#f59e0b',
  'Construção':         '#3b82f6',
  'Retainer':           '#22c55e',
  'Parceria':           '#a855f7',
  'Perdido':            '#ef4444',
}

const FUNIL_DESCRIPTIONS: Record<string, string> = {
  'Lead':                 'Identificado, não abordado',
  'Abordagem':            'Primeiro contato feito',
  'Reunião agendada':     'Call marcada',
  'Diagnóstico':          'Diagnóstico em andamento',
  'Proposta construção':  'Aguardando resposta',
  'Construção':           'Contrato assinado, em execução',
  'Retainer':             'Mensalidade ativa',
  'Parceria':             'Indicação ou canal',
  'Perdido':              'Não fechou',
}

interface KanbanBoardProps {
  board: KanbanBoardKey
  cards: KanbanCardType[]
  onDragEnd: (result: DropResult) => void
  onCardClick: (card: KanbanCardType) => void
  onAddCard: (columnName: string) => void
}

export default function KanbanBoard({ board, cards, onDragEnd, onCardClick, onAddCard }: KanbanBoardProps) {
  const columns = KANBAN_BOARDS[board].columns
  const isFunil = board === 'funil'

  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <div
        style={{
          display: 'flex',
          gap: '0.75rem',
          padding: '1rem 1.25rem',
          overflowX: 'auto',
          height: '100%',
          alignItems: 'flex-start',
          boxSizing: 'border-box',
        }}
      >
        {columns.map(col => {
          const colCards = cards
            .filter(c => c.column_name === col)
            .sort((a, b) => a.position - b.position)
          const accent = COLUMN_ACCENT[col]

          return (
            <div
              key={col}
              style={{
                flexShrink: 0,
                width: 240,
                display: 'flex',
                flexDirection: 'column',
                background: 'var(--bg-secondary)',
                borderLeft: '1px solid var(--border)',
                borderRight: '1px solid var(--border)',
                borderBottom: '1px solid var(--border)',
                borderTop: accent ? `3px solid ${accent}` : '1px solid var(--border)',
                borderRadius: '10px',
                overflow: 'hidden',
              }}
            >
              {/* Column header */}
              <div
                style={{
                  padding: '0.65rem 0.75rem',
                  borderBottom: '1px solid var(--border)',
                  flexShrink: 0,
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ color: 'var(--text-primary)', fontSize: '0.82rem', fontWeight: '600' }}>
                    {col}
                  </span>
                  <span
                    style={{
                      background: 'var(--bg-card)',
                      color: 'var(--text-muted)',
                      fontSize: '0.72rem',
                      padding: '1px 7px',
                      borderRadius: '10px',
                      fontWeight: '500',
                      flexShrink: 0,
                    }}
                  >
                    {colCards.length}
                  </span>
                </div>
                {isFunil && FUNIL_DESCRIPTIONS[col] && (
                  <div style={{ color: 'var(--text-muted)', fontSize: '0.71rem', marginTop: '0.2rem', lineHeight: 1.3 }}>
                    {FUNIL_DESCRIPTIONS[col]}
                  </div>
                )}
              </div>

              {/* Droppable card list */}
              <Droppable droppableId={col}>
                {(provided, snapshot) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                    style={{
                      padding: '0.5rem',
                      minHeight: 64,
                      background: snapshot.isDraggingOver ? 'rgba(59,130,246,0.06)' : undefined,
                      transition: 'background 0.12s',
                    }}
                  >
                    {colCards.map((card, index) => (
                      <Draggable key={card.id} draggableId={card.id} index={index}>
                        {(provided, snapshot) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                            style={{
                              ...provided.draggableProps.style,
                              opacity: snapshot.isDragging ? 0.88 : 1,
                            }}
                          >
                            <KanbanCard card={card} board={board} onClick={() => onCardClick(card)} />
                          </div>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>

              {/* Add card */}
              <button
                onClick={() => onAddCard(col)}
                style={{
                  margin: '0 0.5rem 0.5rem',
                  padding: '0.4rem',
                  background: 'transparent',
                  border: '1px dashed var(--border)',
                  borderRadius: '6px',
                  color: 'var(--text-muted)',
                  fontSize: '0.78rem',
                  cursor: 'pointer',
                  textAlign: 'center',
                  flexShrink: 0,
                }}
              >
                + Adicionar card
              </button>
            </div>
          )
        })}
      </div>
    </DragDropContext>
  )
}
