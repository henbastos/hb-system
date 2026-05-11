'use client'

import { useState } from 'react'
import { CalendarEvent } from '@/lib/types'
import { EVENT_CATEGORIES } from '@/lib/constants'

const DURATION_OPTIONS = [
  { value: 0.5, label: '30 min' },
  { value: 1, label: '1 hora' },
  { value: 1.5, label: '1h30' },
  { value: 2, label: '2 horas' },
  { value: 2.5, label: '2h30' },
  { value: 3, label: '3 horas' },
  { value: 4, label: '4 horas' },
  { value: 5, label: '5 horas' },
  { value: 6, label: '6 horas' },
  { value: 8, label: '8 horas' },
]

const DAY_CHIPS = ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom']

const PRESETS = [
  { label: 'Todo dia', days: [0, 1, 2, 3, 4, 5, 6] },
  { label: 'Seg a Sex', days: [0, 1, 2, 3, 4] },
  { label: 'Seg/Qua/Sex', days: [0, 2, 4] },
  { label: 'Ter/Qui', days: [1, 3] },
]

function initRecurrenceDays(event: Partial<CalendarEvent> | null): number[] {
  if (event?.recurrence_days?.length) return event.recurrence_days
  if (event?.day_of_week != null) return [event.day_of_week]
  return [0]
}

interface EventModalProps {
  event: Partial<CalendarEvent> | null
  onClose: () => void
  onSave: (data: Partial<CalendarEvent>) => Promise<void>
  onDelete: (id: string) => Promise<void>
}

export default function EventModal({ event, onClose, onSave, onDelete }: EventModalProps) {
  const isEdit = !!event?.id
  const initRecurring = !!(event?.day_of_week != null || event?.recurrence_days?.length)

  const [title, setTitle] = useState(event?.title ?? '')
  const [category, setCategory] = useState(event?.category ?? 'Trabalho')
  const [recurring, setRecurring] = useState(initRecurring)
  const [date, setDate] = useState(event?.date ?? '')
  const [recurrenceDays, setRecurrenceDays] = useState<number[]>(() => initRecurrenceDays(event))
  const [startTime, setStartTime] = useState(event?.start_time?.slice(0, 5) ?? '09:00')
  const [duration, setDuration] = useState<number>(event?.duration ?? 1)
  const [description, setDescription] = useState(event?.description ?? '')
  const [meetLink, setMeetLink] = useState(event?.meet_link ?? '')
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)

  function toggleDay(idx: number) {
    setRecurrenceDays(prev => {
      if (prev.includes(idx)) {
        if (prev.length === 1) return prev
        return prev.filter(d => d !== idx)
      }
      return [...prev, idx].sort((a, b) => a - b)
    })
  }

  function isPresetActive(days: number[]): boolean {
    return days.length === recurrenceDays.length && days.every(d => recurrenceDays.includes(d))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    const time = startTime.length === 5 ? `${startTime}:00` : startTime
    await onSave({
      ...(isEdit ? { id: event!.id } : {}),
      title: title.trim(),
      category,
      start_time: time,
      duration,
      description: description.trim() || null,
      meet_link: meetLink.trim() || null,
      ...(recurring
        ? { day_of_week: null, date: null, recurrence_days: recurrenceDays }
        : { date: date || null, day_of_week: null, recurrence_days: null }),
    })
    setSaving(false)
  }

  async function handleDelete() {
    if (!event?.id) return
    setDeleting(true)
    await onDelete(event.id)
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
        style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border)', borderRadius: '12px', padding: '1.5rem', width: '100%', maxWidth: '460px', maxHeight: '92vh', overflowY: 'auto' }}
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
          <h2 style={{ fontSize: '1rem', fontWeight: '600', color: 'var(--text-primary)' }}>
            {isEdit ? 'Editar evento' : 'Novo evento'}
          </h2>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: '1rem', lineHeight: 1, padding: '0.2rem' }}>✕</button>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '0.9rem' }}>
          {/* Título */}
          <div>
            <label style={label}>Título *</label>
            <input type="text" value={title} onChange={e => setTitle(e.target.value)} required placeholder="Ex: Reunião com cliente" style={field} />
          </div>

          {/* Categoria */}
          <div>
            <label style={label}>Categoria *</label>
            <select value={category} onChange={e => setCategory(e.target.value)} style={field}>
              {Object.keys(EVENT_CATEGORIES).map(k => (
                <option key={k} value={k}>{k}</option>
              ))}
            </select>
          </div>

          {/* Recorrente */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <input
              type="checkbox"
              id="recurring"
              checked={recurring}
              onChange={e => setRecurring(e.target.checked)}
              style={{ width: 15, height: 15, accentColor: 'var(--accent)', cursor: 'pointer' }}
            />
            <label htmlFor="recurring" style={{ ...label, marginBottom: 0, cursor: 'pointer' }}>
              Repetir toda semana
            </label>
          </div>

          {/* Data ou recorrência */}
          {recurring ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
              {/* Presets */}
              <div>
                <label style={label}>Presets</label>
                <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
                  {PRESETS.map(preset => (
                    <button
                      key={preset.label}
                      type="button"
                      onClick={() => setRecurrenceDays(preset.days)}
                      style={{
                        padding: '0.3rem 0.65rem',
                        borderRadius: '6px',
                        border: '1px solid',
                        borderColor: isPresetActive(preset.days) ? 'var(--accent)' : 'var(--border)',
                        background: isPresetActive(preset.days) ? 'var(--accent)' : 'var(--bg-card)',
                        color: isPresetActive(preset.days) ? '#fff' : 'var(--text-secondary)',
                        fontSize: '0.8rem',
                        cursor: 'pointer',
                        fontFamily: 'inherit',
                        transition: 'all 0.1s',
                      }}
                    >
                      {preset.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Day chips */}
              <div>
                <label style={label}>Dias</label>
                <div style={{ display: 'flex', gap: '0.35rem' }}>
                  {DAY_CHIPS.map((dayLabel, idx) => {
                    const active = recurrenceDays.includes(idx)
                    return (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => toggleDay(idx)}
                        style={{
                          flex: 1,
                          padding: '0.4rem 0',
                          borderRadius: '6px',
                          border: '1px solid',
                          borderColor: active ? 'var(--accent)' : 'var(--border)',
                          background: active ? 'var(--accent)' : 'var(--bg-card)',
                          color: active ? '#fff' : 'var(--text-muted)',
                          fontSize: '0.75rem',
                          fontWeight: active ? '600' : '400',
                          cursor: 'pointer',
                          fontFamily: 'inherit',
                          transition: 'all 0.1s',
                        }}
                      >
                        {dayLabel}
                      </button>
                    )
                  })}
                </div>
              </div>
            </div>
          ) : (
            <div>
              <label style={label}>Data *</label>
              <input type="date" value={date ?? ''} onChange={e => setDate(e.target.value)} required={!recurring} style={{ ...field, colorScheme: 'dark' }} />
            </div>
          )}

          {/* Início + Duração */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
            <div>
              <label style={label}>Início *</label>
              <input type="time" value={startTime} onChange={e => setStartTime(e.target.value)} required style={{ ...field, colorScheme: 'dark' }} />
            </div>
            <div>
              <label style={label}>Duração *</label>
              <select value={duration} onChange={e => setDuration(Number(e.target.value))} style={field}>
                {DURATION_OPTIONS.map(d => <option key={d.value} value={d.value}>{d.label}</option>)}
              </select>
            </div>
          </div>

          {/* Descrição */}
          <div>
            <label style={label}>Descrição</label>
            <textarea value={description ?? ''} onChange={e => setDescription(e.target.value)} placeholder="Opcional" rows={3} style={{ ...field, resize: 'vertical', lineHeight: 1.5 }} />
          </div>

          {/* Link */}
          <div>
            <label style={label}>Link de reunião</label>
            <input type="url" value={meetLink ?? ''} onChange={e => setMeetLink(e.target.value)} placeholder="https://meet.google.com/..." style={field} />
          </div>

          {/* Botões */}
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
