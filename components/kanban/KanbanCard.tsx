'use client'

import { KanbanCard as KanbanCardType } from '@/lib/types'
import { KanbanBoardKey } from '@/lib/constants'

const SERVICE_TYPE_LABELS: Record<string, string> = {
  diagnostico: 'Diagnóstico',
  construcao:  'Construção',
  retainer:    'Retainer',
  parceria:    'Parceria',
}

const formatCurrency = (v: number) =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(v)

interface KanbanCardProps {
  card: KanbanCardType
  board: KanbanBoardKey
  onClick: () => void
}

export default function KanbanCard({ card, board, onClick }: KanbanCardProps) {
  const isFunil = board === 'funil'

  const scheduledDate = card.scheduled_at
    ? new Date(card.scheduled_at).toLocaleString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
      })
    : null

  // Funil: total value from deal_services
  const totalValue = isFunil && card.deal_services?.length
    ? card.deal_services.reduce((sum, s) => sum + s.value, 0)
    : null
  const formattedTotal = totalValue != null && totalValue > 0 ? formatCurrency(totalValue) : null

  // Funil: unique service type chips
  const serviceTypes = isFunil
    ? [...new Set(card.deal_services?.map(s => s.service_type) ?? [])]
    : []

  // Non-funil: legacy value field
  const formattedValue = !isFunil && card.value != null ? formatCurrency(card.value) : null

  const hasChips =
    formattedTotal != null ||
    formattedValue != null ||
    serviceTypes.length > 0 ||
    (!isFunil && card.service_type != null) ||
    (card.tags && card.tags.length > 0)

  return (
    <div
      onClick={onClick}
      style={{
        background: 'var(--bg-card)',
        border: '1px solid var(--border)',
        borderRadius: '8px',
        padding: '0.65rem 0.75rem',
        cursor: 'pointer',
        marginBottom: '0.5rem',
      }}
    >
      {card.followup && (
        <span style={{
          display: 'inline-block',
          background: '#b45309',
          color: '#fde68a',
          fontSize: '0.68rem',
          fontWeight: '600',
          padding: '1px 7px',
          borderRadius: '4px',
          marginBottom: '0.35rem',
        }}>
          follow-up
        </span>
      )}

      <div style={{ color: 'var(--text-primary)', fontSize: '0.875rem', fontWeight: '500', lineHeight: 1.4 }}>
        {isFunil ? (card.deal_name || card.title) : card.title}
      </div>

      {isFunil && card.company_name && (
        <div style={{ color: 'var(--text-secondary)', fontSize: '0.75rem', marginTop: '0.2rem' }}>
          {card.company_name}
        </div>
      )}

      {isFunil && card.contact_name && (
        <div style={{ color: 'var(--text-muted)', fontSize: '0.72rem', marginTop: '0.1rem' }}>
          {card.contact_name}
        </div>
      )}

      {scheduledDate && (
        <div style={{ color: 'var(--text-muted)', fontSize: '0.73rem', marginTop: '0.3rem' }}>
          {scheduledDate}
        </div>
      )}

      {hasChips && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.25rem', marginTop: '0.4rem' }}>
          {(formattedTotal ?? formattedValue) && (
            <span style={{
              background: 'rgba(34,197,94,0.12)',
              border: '1px solid rgba(34,197,94,0.3)',
              color: '#86efac',
              fontSize: '0.68rem',
              fontWeight: '600',
              padding: '1px 6px',
              borderRadius: '4px',
            }}>
              {formattedTotal ?? formattedValue}
            </span>
          )}
          {serviceTypes.filter(t => SERVICE_TYPE_LABELS[t]).map(t => (
            <span key={t} style={{
              background: 'rgba(59,130,246,0.12)',
              border: '1px solid rgba(59,130,246,0.3)',
              color: '#93c5fd',
              fontSize: '0.68rem',
              fontWeight: '500',
              padding: '1px 6px',
              borderRadius: '4px',
            }}>
              {SERVICE_TYPE_LABELS[t]}
            </span>
          ))}
          {!isFunil && card.service_type && SERVICE_TYPE_LABELS[card.service_type] && (
            <span style={{
              background: 'rgba(59,130,246,0.12)',
              border: '1px solid rgba(59,130,246,0.3)',
              color: '#93c5fd',
              fontSize: '0.68rem',
              fontWeight: '500',
              padding: '1px 6px',
              borderRadius: '4px',
            }}>
              {SERVICE_TYPE_LABELS[card.service_type]}
            </span>
          )}
          {card.tags?.map(tag => (
            <span
              key={tag}
              style={{
                background: 'var(--bg-secondary)',
                border: '1px solid var(--border)',
                color: 'var(--text-secondary)',
                fontSize: '0.68rem',
                padding: '1px 6px',
                borderRadius: '4px',
              }}
            >
              {tag}
            </span>
          ))}
        </div>
      )}
    </div>
  )
}
