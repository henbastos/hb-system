'use client'

import { useState } from 'react'
import { KanbanCard } from '@/lib/types'
import { KANBAN_BOARDS, KanbanBoardKey, EVENT_CATEGORIES } from '@/lib/constants'

const CARD_CATEGORIES = Object.keys(EVENT_CATEGORIES)

const TIME_SLOTS: string[] = Array.from({ length: 38 }, (_, i) => {
  const mins = 5 * 60 + i * 30
  return `${String(Math.floor(mins / 60)).padStart(2, '0')}:${String(mins % 60).padStart(2, '0')}`
})

function initScheduledDate(utcString: string | null | undefined): string {
  if (!utcString) return ''
  const d = new Date(utcString)
  return new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 10)
}

function initScheduledTime(utcString: string | null | undefined): string {
  if (!utcString) return '09:00'
  const d = new Date(utcString)
  const hhmm = new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(11, 16)
  const [h, m] = hhmm.split(':').map(Number)
  return `${String(h).padStart(2, '0')}:${m < 30 ? '00' : '30'}`
}

interface ServiceRow {
  service_type: string
  value: string
  description: string
}

interface CardModalProps {
  card: Partial<KanbanCard> | null
  board: KanbanBoardKey
  onClose: () => void
  onSave: (data: Partial<KanbanCard>) => Promise<void>
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

export default function CardModal({ card, board, onClose, onSave, onDelete }: CardModalProps) {
  const isEdit = !!card?.id
  const columns = KANBAN_BOARDS[board].columns
  const isFunil = board === 'funil'

  const [title, setTitle] = useState(card?.title ?? '')
  const [description, setDescription] = useState(card?.description ?? '')
  const [columnName, setColumnName] = useState(card?.column_name ?? columns[0])
  const [scheduledDate, setScheduledDate] = useState(() => initScheduledDate(card?.scheduled_at))
  const [scheduledTime, setScheduledTime] = useState(() => initScheduledTime(card?.scheduled_at))
  const [tagsInput, setTagsInput] = useState(card?.tags?.join(', ') ?? '')
  const [followup, setFollowup] = useState(card?.followup ?? false)
  const [category, setCategory] = useState(card?.category ?? '')

  // Funil-specific fields
  const [dealName, setDealName] = useState(card?.deal_name ?? '')
  const [companyName, setCompanyName] = useState(card?.company_name ?? '')
  const [contactName, setContactName] = useState(card?.contact_name ?? '')
  const [contactPhone, setContactPhone] = useState(card?.contact_phone ?? '')
  const [services, setServices] = useState<ServiceRow[]>(
    card?.deal_services?.length
      ? card.deal_services.map(s => ({
          service_type: s.service_type,
          value: formatBRL(s.value),
          description: s.description ?? '',
        }))
      : [{ service_type: 'diagnostico', value: '', description: '' }]
  )

  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)

  function addService() {
    setServices(prev => [...prev, { service_type: 'diagnostico', value: '', description: '' }])
  }

  function removeService(i: number) {
    setServices(prev => prev.filter((_, idx) => idx !== i))
  }

  function updateService(i: number, field: keyof ServiceRow, value: string) {
    setServices(prev => prev.map((s, idx) => idx === i ? { ...s, [field]: value } : s))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    const tags = tagsInput.split(',').map(t => t.trim()).filter(Boolean)
    const effectiveTitle = isFunil ? (dealName.trim() || 'Negociação') : title.trim()

    await onSave({
      ...(isEdit ? { id: card!.id } : {}),
      title: effectiveTitle,
      description: description.trim() || null,
      column_name: columnName,
      tags: tags.length > 0 ? tags : null,
      scheduled_at: scheduledDate ? new Date(`${scheduledDate}T${scheduledTime}:00`).toISOString() : null,
      category: scheduledDate && category ? category : null,
      followup,
      value: null,
      service_type: null,
      ...(isFunil ? {
        deal_name: dealName.trim() || null,
        company_name: companyName.trim() || null,
        contact_name: contactName.trim() || null,
        contact_phone: contactPhone.trim() || null,
        deal_services: services
          .filter(s => s.service_type && s.value !== '')
          .map(s => ({
            service_type: s.service_type,
            value: parseBRL(s.value),
            description: s.description || null,
          })),
      } : {}),
    })
    setSaving(false)
  }

  async function handleDelete() {
    if (!card?.id) return
    setDeleting(true)
    await onDelete(card.id)
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
        style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border)', borderRadius: '12px', padding: '1.5rem', width: '100%', maxWidth: '480px', maxHeight: '92vh', overflowY: 'auto' }}
        onClick={e => e.stopPropagation()}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
          <h2 style={{ fontSize: '1rem', fontWeight: '600', color: 'var(--text-primary)' }}>
            {isEdit ? 'Editar card' : 'Novo card'}
          </h2>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: '1rem', lineHeight: 1, padding: '0.2rem' }}>✕</button>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '0.9rem' }}>

          {/* Title — non-funil only */}
          {!isFunil && (
            <div>
              <label style={label}>Título *</label>
              <input type="text" value={title} onChange={e => setTitle(e.target.value)} required placeholder="Ex: Ligar para cliente" style={field} />
            </div>
          )}

          {/* Funil deal fields */}
          {isFunil && (
            <>
              <div>
                <label style={label}>Nome da negociação *</label>
                <input type="text" value={dealName} onChange={e => setDealName(e.target.value)} required placeholder="Ex: Empresa ABC — Retainer" style={field} />
              </div>

              {isEdit && card?.created_at && (
                <div>
                  <label style={label}>Criado em</label>
                  <p style={{ ...field, margin: 0, color: 'var(--text-muted)', cursor: 'default' }}>
                    {new Date(card.created_at).toLocaleString('pt-BR', {
                      day: '2-digit', month: '2-digit', year: 'numeric',
                      hour: '2-digit', minute: '2-digit',
                      timeZone: 'America/Sao_Paulo',
                    })}
                  </p>
                </div>
              )}

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                <div>
                  <label style={label}>Empresa</label>
                  <input type="text" value={companyName} onChange={e => setCompanyName(e.target.value)} placeholder="Nome da empresa" style={field} />
                </div>
                <div>
                  <label style={label}>Contato</label>
                  <input type="text" value={contactName} onChange={e => setContactName(e.target.value)} placeholder="Nome do contato" style={field} />
                </div>
              </div>
              <div>
                <label style={label}>Telefone</label>
                <input type="text" value={contactPhone} onChange={e => setContactPhone(e.target.value)} placeholder="+55 62 9 9999-9999" style={field} />
              </div>
            </>
          )}

          <div>
            <label style={label}>Coluna</label>
            <select value={columnName} onChange={e => setColumnName(e.target.value)} style={field}>
              {columns.map(col => (
                <option key={col} value={col}>{col}</option>
              ))}
            </select>
          </div>

          <div>
            <label style={label}>Data e hora</label>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
              <input
                type="date"
                value={scheduledDate}
                onChange={e => setScheduledDate(e.target.value)}
                style={{ ...field, colorScheme: 'dark' }}
              />
              <select
                value={scheduledTime}
                onChange={e => setScheduledTime(e.target.value)}
                disabled={!scheduledDate}
                style={{ ...field, opacity: scheduledDate ? 1 : 0.4 }}
              >
                {TIME_SLOTS.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
          </div>

          {/* Category — only when date is set */}
          {scheduledDate && (
            <div>
              <label style={label}>Categoria no cronograma</label>
              <select value={category} onChange={e => setCategory(e.target.value)} style={field}>
                <option value="">Sem categoria (não aparece no cronograma)</option>
                {CARD_CATEGORIES.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>
          )}

          <div>
            <label style={label}>Descrição</label>
            <textarea
              value={description ?? ''}
              onChange={e => setDescription(e.target.value)}
              placeholder="Opcional"
              rows={3}
              style={{ ...field, resize: 'vertical', lineHeight: 1.5 }}
            />
          </div>

          <div>
            <label style={label}>Tags (separadas por vírgula)</label>
            <input
              type="text"
              value={tagsInput}
              onChange={e => setTagsInput(e.target.value)}
              placeholder="Ex: urgente, cliente, reunião"
              style={field}
            />
          </div>

          {/* Services — funil only */}
          {isFunil && (
            <div>
              <label style={{ ...label, marginBottom: '0.5rem' }}>Serviços</label>
              {services.map((svc, i) => (
                <div
                  key={i}
                  style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '8px', padding: '0.6rem', marginBottom: '0.5rem' }}
                >
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr auto', gap: '0.5rem', alignItems: 'center', marginBottom: '0.4rem' }}>
                    <select
                      value={svc.service_type}
                      onChange={e => updateService(i, 'service_type', e.target.value)}
                      style={{ ...field, fontSize: '0.85rem' }}
                    >
                      <option value="diagnostico">Diagnóstico</option>
                      <option value="construcao">Construção</option>
                      <option value="retainer">Retainer</option>
                      <option value="parceria">Parceria</option>
                    </select>
                    <input
                      type="text"
                      inputMode="decimal"
                      value={svc.value}
                      onChange={e => updateService(i, 'value', e.target.value)}
                      onBlur={e => {
                        const n = parseBRL(e.target.value)
                        if (e.target.value !== '' && !isNaN(n)) {
                          updateService(i, 'value', formatBRL(n))
                        }
                      }}
                      onFocus={e => {
                        const n = parseBRL(e.target.value)
                        if (!isNaN(n) && e.target.value !== '') {
                          updateService(i, 'value', String(n))
                        }
                      }}
                      placeholder="0,00"
                      style={{ ...field, fontSize: '0.85rem' }}
                    />
                    <button
                      type="button"
                      onClick={() => removeService(i)}
                      disabled={services.length === 1}
                      style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: services.length === 1 ? 'default' : 'pointer', opacity: services.length === 1 ? 0.3 : 1, fontSize: '1rem', padding: '0.2rem 0.3rem', lineHeight: 1 }}
                    >
                      ✕
                    </button>
                  </div>
                  <input
                    type="text"
                    value={svc.description}
                    onChange={e => updateService(i, 'description', e.target.value)}
                    placeholder="Descrição (opcional)"
                    style={{ ...field, fontSize: '0.82rem' }}
                  />
                </div>
              ))}
              <button
                type="button"
                onClick={addService}
                style={{ background: 'none', border: '1px dashed var(--border)', borderRadius: '6px', color: 'var(--text-muted)', fontSize: '0.8rem', cursor: 'pointer', width: '100%', padding: '0.4rem', fontFamily: 'inherit' }}
              >
                + Adicionar serviço
              </button>
            </div>
          )}

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <input
              type="checkbox"
              id="followup"
              checked={followup}
              onChange={e => setFollowup(e.target.checked)}
              style={{ width: 15, height: 15, accentColor: '#b45309', cursor: 'pointer' }}
            />
            <label htmlFor="followup" style={{ ...label, marginBottom: 0, cursor: 'pointer' }}>
              Follow-up
            </label>
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
