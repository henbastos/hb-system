'use client'

import { useState } from 'react'
import { Cost } from '@/lib/types'

const CATEGORIES = ['Infraestrutura', 'Pessoal', 'Ferramentas', 'Clientes']

interface CostModalProps {
  cost: Partial<Cost> | null
  onClose: () => void
  onSave: (data: Partial<Cost>) => Promise<void>
  onDelete: (id: string) => Promise<void>
}

function formatBRL(num: number): string {
  return num.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

function parseBRL(str: string): number {
  if (!str) return 0
  if (str.includes(',')) {
    return parseFloat(str.replace(/\./g, '').replace(',', '.')) || 0
  }
  return parseFloat(str) || 0
}

export default function CostModal({ cost, onClose, onSave, onDelete }: CostModalProps) {
  const isEdit = !!cost?.id

  const [name, setName] = useState(cost?.name ?? '')
  const [value, setValue] = useState(cost?.value != null ? formatBRL(cost.value) : '')
  const [category, setCategory] = useState(cost?.category ?? CATEGORIES[0])
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    await onSave({
      ...(isEdit ? { id: cost!.id } : {}),
      name: name.trim(),
      value: parseBRL(value),
      category,
    })
    setSaving(false)
  }

  async function handleDelete() {
    if (!cost?.id) return
    setDeleting(true)
    await onDelete(cost.id)
    setDeleting(false)
  }

  const field: React.CSSProperties = {
    width: '100%',
    padding: '0.55rem 0.75rem',
    background: 'var(--bg-card)',
    border: '1px solid var(--border)',
    borderRadius: '8px',
    color: 'var(--text-primary)',
    fontSize: '0.9rem',
    outline: 'none',
    fontFamily: 'inherit',
    boxSizing: 'border-box',
  }

  const label: React.CSSProperties = {
    display: 'block',
    fontSize: '0.8rem',
    color: 'var(--text-secondary)',
    marginBottom: '0.3rem',
  }

  return (
    <div
      style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.65)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50, padding: '1rem' }}
      onClick={onClose}
    >
      <div
        style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border)', borderRadius: '12px', padding: '1.5rem', width: '100%', maxWidth: '400px' }}
        onClick={e => e.stopPropagation()}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
          <h2 style={{ fontSize: '1rem', fontWeight: '600', color: 'var(--text-primary)' }}>
            {isEdit ? 'Editar custo' : 'Novo custo'}
          </h2>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: '1rem', lineHeight: 1, padding: '0.2rem' }}>✕</button>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '0.9rem' }}>
          <div>
            <label style={label}>Nome *</label>
            <input
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              required
              placeholder="Ex: Vercel Pro"
              style={field}
            />
          </div>

          <div>
            <label style={label}>Valor (R$) *</label>
            <input
              type="text"
              inputMode="decimal"
              value={value}
              onChange={e => setValue(e.target.value)}
              onBlur={e => {
                const n = parseBRL(e.target.value)
                if (e.target.value !== '' && !isNaN(n)) setValue(formatBRL(n))
              }}
              onFocus={e => {
                const n = parseBRL(e.target.value)
                if (!isNaN(n) && e.target.value !== '') setValue(String(n))
              }}
              required
              placeholder="0,00"
              style={field}
            />
          </div>

          <div>
            <label style={label}>Categoria</label>
            <select value={category} onChange={e => setCategory(e.target.value)} style={field}>
              {CATEGORIES.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>

          <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.25rem' }}>
            {isEdit && (
              <button
                type="button"
                onClick={handleDelete}
                disabled={deleting}
                style={{ flex: 1, padding: '0.65rem', background: 'transparent', border: '1px solid #ef4444', borderRadius: '8px', color: '#ef4444', fontSize: '0.88rem', fontWeight: '500', cursor: deleting ? 'not-allowed' : 'pointer', opacity: deleting ? 0.6 : 1 }}
              >
                {deleting ? 'Excluindo...' : 'Excluir'}
              </button>
            )}
            <button
              type="button"
              onClick={onClose}
              style={{ flex: 1, padding: '0.65rem', background: 'transparent', border: '1px solid var(--border)', borderRadius: '8px', color: 'var(--text-secondary)', fontSize: '0.88rem', cursor: 'pointer' }}
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={saving}
              style={{ flex: 2, padding: '0.65rem', background: saving ? 'var(--border)' : 'var(--accent)', border: 'none', borderRadius: '8px', color: '#fff', fontSize: '0.88rem', fontWeight: '600', cursor: saving ? 'not-allowed' : 'pointer' }}
            >
              {saving ? 'Salvando...' : 'Salvar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
