'use client'

import { useState } from 'react'
import useSWR from 'swr'
import Topbar from '@/components/ui/Topbar'
import CostTable from '@/components/financeiro/CostTable'
import CostModal from '@/components/financeiro/CostModal'
import { Cost } from '@/lib/types'

type ModalState =
  | { open: false }
  | { open: true; cost: Partial<Cost> | null }

const fetcher = (url: string) =>
  fetch(url).then(r => r.json()).then(d => (d.costs ?? []) as Cost[])

export default function FinanceiroPage() {
  const [modal, setModal] = useState<ModalState>({ open: false })

  const { data: costs = [], mutate } = useSWR<Cost[]>('/api/costs', fetcher)

  async function handleSave(data: Partial<Cost>) {
    const isEdit = !!data.id
    await fetch('/api/costs', {
      method: isEdit ? 'PUT' : 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })
    mutate()
    setModal({ open: false })
  }

  async function handleDelete(id: string) {
    await fetch(`/api/costs?id=${id}`, { method: 'DELETE' })
    mutate()
    setModal({ open: false })
  }

  return (
    <>
      <Topbar title="Financeiro" />
      <main style={{ flex: 1, padding: '1.5rem', overflowY: 'auto' }}>
        <CostTable
          costs={costs}
          onEdit={cost => setModal({ open: true, cost })}
          onAdd={() => setModal({ open: true, cost: null })}
        />
      </main>

      {modal.open && (
        <CostModal
          cost={modal.cost}
          onClose={() => setModal({ open: false })}
          onSave={handleSave}
          onDelete={handleDelete}
        />
      )}
    </>
  )
}
