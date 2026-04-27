'use client'

import { useState } from 'react'
import useSWR from 'swr'
import { DropResult } from '@hello-pangea/dnd'
import Topbar from '@/components/ui/Topbar'
import KanbanBoard from '@/components/kanban/KanbanBoard'
import CardModal from '@/components/kanban/CardModal'
import { KanbanCard } from '@/lib/types'
import { KANBAN_BOARDS, KanbanBoardKey } from '@/lib/constants'

type ModalState =
  | { open: false }
  | { open: true; card: Partial<KanbanCard> | null }

const fetcher = (url: string) =>
  fetch(url).then(r => r.json()).then(d => (d.cards ?? []) as KanbanCard[])

const tabBtn = (active: boolean): React.CSSProperties => ({
  padding: '0.3rem 0.7rem',
  border: 'none',
  borderRadius: '6px',
  fontSize: '0.82rem',
  fontWeight: '500',
  cursor: 'pointer',
  background: active ? 'var(--bg-hover)' : 'transparent',
  color: active ? 'var(--text-primary)' : 'var(--text-muted)',
  transition: 'all 0.1s',
})

export default function TarefasPage() {
  const [activeBoard, setActiveBoard] = useState<KanbanBoardKey>('tarefas')
  const [modal, setModal] = useState<ModalState>({ open: false })

  const { data: cards = [], mutate } = useSWR<KanbanCard[]>(
    `/api/cards?board=${activeBoard}`,
    fetcher
  )

  function openModal(card: Partial<KanbanCard> | null) {
    setModal({ open: true, card })
  }

  async function handleSave(data: Partial<KanbanCard>) {
    const isEdit = !!data.id
    data.board = activeBoard
    if (!isEdit) {
      const colCards = cards.filter(c => c.column_name === data.column_name)
      data.position = colCards.length
    }
    await fetch('/api/cards', {
      method: isEdit ? 'PUT' : 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })
    mutate()
    setModal({ open: false })
  }

  async function handleDelete(id: string) {
    await fetch(`/api/cards?id=${id}`, { method: 'DELETE' })
    mutate()
    setModal({ open: false })
  }

  async function handleDragEnd(result: DropResult) {
    const { source, destination } = result
    if (!destination) return
    if (source.droppableId === destination.droppableId && source.index === destination.index) return

    const columns = [...KANBAN_BOARDS[activeBoard].columns] as string[]

    const cardsByColumn: Record<string, KanbanCard[]> = {}
    for (const col of columns) {
      cardsByColumn[col] = cards
        .filter(c => c.column_name === col)
        .sort((a, b) => a.position - b.position)
    }

    const sourceCol = source.droppableId
    const destCol = destination.droppableId

    const sourceCards = [...(cardsByColumn[sourceCol] ?? [])]
    const [movedCard] = sourceCards.splice(source.index, 1)

    const destCards = sourceCol === destCol
      ? sourceCards
      : [...(cardsByColumn[destCol] ?? [])]
    destCards.splice(destination.index, 0, { ...movedCard, column_name: destCol })

    const updates: Array<{ id: string; column_name: string; position: number }> = []
    if (sourceCol === destCol) {
      destCards.forEach((card, i) => updates.push({ id: card.id, column_name: destCol, position: i }))
    } else {
      sourceCards.forEach((card, i) => updates.push({ id: card.id, column_name: sourceCol, position: i }))
      destCards.forEach((card, i) => updates.push({ id: card.id, column_name: destCol, position: i }))
    }

    // Optimistic update
    const newCards = cards.map(card => {
      const upd = updates.find(u => u.id === card.id)
      return upd ? { ...card, column_name: upd.column_name, position: upd.position } : card
    })
    mutate(newCards, false)

    await fetch('/api/cards', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ updates }),
    })
    mutate()
  }

  const boardKeys = Object.keys(KANBAN_BOARDS) as KanbanBoardKey[]

  const topbarActions = (
    <div style={{ display: 'flex', gap: '0.2rem', background: 'var(--bg-card)', borderRadius: '8px', padding: '3px' }}>
      {boardKeys.map(key => (
        <button key={key} onClick={() => setActiveBoard(key)} style={tabBtn(activeBoard === key)}>
          {KANBAN_BOARDS[key].label}
        </button>
      ))}
    </div>
  )

  return (
    <>
      <Topbar title="Tarefas" actions={topbarActions} />
      <div style={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
        <KanbanBoard
          board={activeBoard}
          cards={cards}
          onDragEnd={handleDragEnd}
          onCardClick={card => openModal(card)}
          onAddCard={columnName => openModal({ column_name: columnName, board: activeBoard })}
        />
      </div>

      {modal.open && (
        <CardModal
          card={modal.card}
          board={activeBoard}
          onClose={() => setModal({ open: false })}
          onSave={handleSave}
          onDelete={handleDelete}
        />
      )}
    </>
  )
}
