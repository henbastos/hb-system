'use client'

import { Cost } from '@/lib/types'

const CATEGORY_ORDER = ['Infraestrutura', 'Pessoal', 'Ferramentas', 'Clientes']

const formatCurrency = (v: number) =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(v)

interface CostTableProps {
  costs: Cost[]
  onEdit: (cost: Cost) => void
  onAdd: () => void
}

export default function CostTable({ costs, onEdit, onAdd }: CostTableProps) {
  const allCategories = [
    ...CATEGORY_ORDER,
    ...costs.map(c => c.category).filter(cat => !CATEGORY_ORDER.includes(cat)),
  ]
  const usedCategories = allCategories.filter(cat => costs.some(c => c.category === cat))

  const grandTotal = costs.reduce((sum, c) => sum + c.value, 0)

  return (
    <div style={{ maxWidth: 680, margin: '0 auto' }}>
      {/* Header row */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
        <div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.15rem' }}>Total geral</div>
          <div style={{ fontSize: '1.5rem', fontWeight: '700', color: 'var(--text-primary)', lineHeight: 1 }}>
            {formatCurrency(grandTotal)}
          </div>
        </div>
        <button
          onClick={onAdd}
          style={{ padding: '0.55rem 1rem', background: 'var(--accent)', border: 'none', borderRadius: '8px', color: '#fff', fontSize: '0.88rem', fontWeight: '600', cursor: 'pointer' }}
        >
          + Novo custo
        </button>
      </div>

      {costs.length === 0 && (
        <div style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.88rem', padding: '3rem 0' }}>
          Nenhum custo cadastrado ainda.
        </div>
      )}

      {usedCategories.map(cat => {
        const catCosts = costs.filter(c => c.category === cat).sort((a, b) => a.name.localeCompare(b.name))
        const catTotal = catCosts.reduce((sum, c) => sum + c.value, 0)

        return (
          <div key={cat} style={{ marginBottom: '1.25rem' }}>
            {/* Category header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', padding: '0.35rem 0', borderBottom: '1px solid var(--border)', marginBottom: '0.4rem' }}>
              <span style={{ fontSize: '0.78rem', fontWeight: '600', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                {cat}
              </span>
              <span style={{ fontSize: '0.82rem', fontWeight: '600', color: 'var(--text-primary)' }}>
                {formatCurrency(catTotal)}
              </span>
            </div>

            {/* Cost rows */}
            {catCosts.map(cost => (
              <div
                key={cost.id}
                onClick={() => onEdit(cost)}
                style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.55rem 0.6rem', borderRadius: '6px', cursor: 'pointer', transition: 'background 0.1s' }}
                onMouseEnter={e => (e.currentTarget.style.background = 'var(--bg-hover)')}
                onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
              >
                <span style={{ fontSize: '0.88rem', color: 'var(--text-primary)' }}>{cost.name}</span>
                <span style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', fontVariantNumeric: 'tabular-nums' }}>
                  {formatCurrency(cost.value)}
                </span>
              </div>
            ))}
          </div>
        )
      })}
    </div>
  )
}
