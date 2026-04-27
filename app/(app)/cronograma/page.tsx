'use client'

import { useState } from 'react'
import useSWR from 'swr'
import Topbar from '@/components/ui/Topbar'
import WeekView from '@/components/cronograma/WeekView'
import DayView from '@/components/cronograma/DayView'
import EventModal from '@/components/cronograma/EventModal'
import { CalendarEvent } from '@/lib/types'
import { EVENT_CATEGORIES } from '@/lib/constants'
import { getMonday, addDays, toDateString } from '@/lib/utils/date'

type ModalState =
  | { open: false }
  | { open: true; event: Partial<CalendarEvent> | null }

const fetcher = (url: string) =>
  fetch(url).then(r => r.json()).then(d => (d.events ?? []) as CalendarEvent[])

const navBtn: React.CSSProperties = {
  padding: '0.3rem 0.65rem',
  background: 'var(--bg-card)',
  border: '1px solid var(--border)',
  borderRadius: '6px',
  color: 'var(--text-primary)',
  cursor: 'pointer',
  fontSize: '0.95rem',
  lineHeight: 1,
}

const toggleBtn = (active: boolean): React.CSSProperties => ({
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

export default function CronogramaPage() {
  const [weekStart, setWeekStart] = useState(() => getMonday(new Date()))
  const [view, setView] = useState<'week' | 'day'>('week')
  const [selectedDay, setSelectedDay] = useState<Date>(() => new Date())
  const [filterCategories, setFilterCategories] = useState<string[]>([])
  const [modal, setModal] = useState<ModalState>({ open: false })

  const start = toDateString(weekStart)
  const end = toDateString(addDays(weekStart, 6))
  const { data: events = [], mutate } = useSWR<CalendarEvent[]>(
    `/api/events?start=${start}&end=${end}`,
    fetcher
  )

  function openModal(event: Partial<CalendarEvent> | null) {
    setModal({ open: true, event })
  }

  function handleDayClick(day: Date) {
    setSelectedDay(day)
    setView('day')
  }

  function handleSlotClick(day: Date, hour: number) {
    openModal({ date: toDateString(day), start_time: `${String(hour).padStart(2, '0')}:00:00` })
  }

  function handleDaySlotClick(hour: number) {
    openModal({ date: toDateString(selectedDay), start_time: `${String(hour).padStart(2, '0')}:00:00` })
  }

  function toggleFilter(category: string) {
    setFilterCategories(prev =>
      prev.includes(category) ? prev.filter(c => c !== category) : [...prev, category]
    )
  }

  async function handleSave(data: Partial<CalendarEvent>) {
    const isEdit = !!data.id
    await fetch('/api/events', {
      method: isEdit ? 'PUT' : 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })
    mutate()
    setModal({ open: false })
  }

  async function handleDelete(id: string) {
    await fetch(`/api/events?id=${id}`, { method: 'DELETE' })
    mutate()
    setModal({ open: false })
  }

  // Week label
  const weekEnd = addDays(weekStart, 6)
  const fmtDay = (d: Date) =>
    `${d.getDate().toString().padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}`
  const weekLabel = `${fmtDay(weekStart)} – ${fmtDay(weekEnd)}/${weekEnd.getFullYear()}`

  const topbarActions = (
    <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
        <button style={navBtn} onClick={() => setWeekStart(d => addDays(d, -7))}>←</button>
        <span style={{ color: 'var(--text-secondary)', fontSize: '0.82rem', minWidth: '140px', textAlign: 'center' }}>
          {weekLabel}
        </span>
        <button style={navBtn} onClick={() => setWeekStart(d => addDays(d, 7))}>→</button>
      </div>

      <div style={{ display: 'flex', gap: '0.2rem', background: 'var(--bg-card)', borderRadius: '8px', padding: '3px' }}>
        <button style={toggleBtn(view === 'week')} onClick={() => setView('week')}>Semana</button>
        <button
          style={toggleBtn(view === 'day')}
          onClick={() => { setView('day'); setSelectedDay(new Date()) }}
        >
          Dia
        </button>
      </div>

      <button
        onClick={() => openModal(null)}
        style={{ padding: '0.4rem 0.85rem', background: 'var(--accent)', color: '#fff', border: 'none', borderRadius: '8px', fontSize: '0.85rem', fontWeight: '600', cursor: 'pointer' }}
      >
        + Evento
      </button>
    </div>
  )

  return (
    <>
      <Topbar title="Cronograma" actions={topbarActions} />

      {/* Category filter chips */}
      <div style={{ padding: '0.6rem 1.25rem', borderBottom: '1px solid var(--border)', background: 'var(--bg-secondary)', display: 'flex', gap: '0.4rem', flexWrap: 'wrap', flexShrink: 0 }}>
        {Object.entries(EVENT_CATEGORIES).map(([key, cat]) => {
          const isSelected = filterCategories.includes(key)
          const showFilled = filterCategories.length === 0 || isSelected
          return (
            <button
              key={key}
              onClick={() => toggleFilter(key)}
              style={{
                padding: '0.2rem 0.6rem',
                borderRadius: '999px',
                border: `1px solid ${cat.color}`,
                background: showFilled ? cat.color : 'transparent',
                color: showFilled ? cat.textColor : cat.color,
                fontSize: '0.77rem',
                fontWeight: '500',
                cursor: 'pointer',
                opacity: filterCategories.length > 0 && !isSelected ? 0.45 : 1,
                transition: 'all 0.12s',
              }}
            >
              {cat.label}
            </button>
          )
        })}
        {filterCategories.length > 0 && (
          <button
            onClick={() => setFilterCategories([])}
            style={{ padding: '0.2rem 0.6rem', borderRadius: '999px', border: '1px solid var(--border)', background: 'transparent', color: 'var(--text-muted)', fontSize: '0.77rem', cursor: 'pointer' }}
          >
            Limpar
          </button>
        )}
      </div>

      <div style={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
        {view === 'week' ? (
          <WeekView
            events={events}
            weekStart={weekStart}
            filterCategories={filterCategories}
            onDayClick={handleDayClick}
            onEventClick={event => openModal(event)}
            onSlotClick={handleSlotClick}
          />
        ) : (
          <DayView
            events={events}
            day={selectedDay}
            filterCategories={filterCategories}
            onEventEdit={event => openModal(event)}
            onDeleteEvent={handleDelete}
            onSlotClick={handleDaySlotClick}
            onBack={() => setView('week')}
          />
        )}
      </div>

      {modal.open && (
        <EventModal
          event={modal.event}
          onClose={() => setModal({ open: false })}
          onSave={handleSave}
          onDelete={handleDelete}
        />
      )}
    </>
  )
}
