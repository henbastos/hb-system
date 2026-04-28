'use client'

import { useState } from 'react'
import { CalendarEvent } from '@/lib/types'
import { EVENT_CATEGORIES } from '@/lib/constants'
import { toDateString, toDayOfWeek, parseTimeToHours } from '@/lib/utils/date'

const HOUR_HEIGHT = 64
const START_HOUR = 5
const HOURS = Array.from({ length: 19 }, (_, i) => i + START_HOUR)

interface DayViewProps {
  events: CalendarEvent[]
  day: Date
  filterCategories: string[]
  onEventEdit: (event: CalendarEvent) => void
  onDeleteEvent: (id: string) => void
  onSlotClick: (hour: number) => void
  onBack: () => void
}

export default function DayView({
  events,
  day,
  filterCategories,
  onEventEdit,
  onDeleteEvent,
  onSlotClick,
  onBack,
}: DayViewProps) {
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [hoveredId, setHoveredId] = useState<string | null>(null)

  const dateStr = toDateString(day)
  const dow = toDayOfWeek(day)

  const dayEvents = events.filter(e => {
    const days = e.recurrence_days ?? (e.day_of_week != null ? [e.day_of_week] : null)
    const matchDay = e.date ? e.date === dateStr : (days != null && days.includes(dow))
    const matchFilter = filterCategories.length === 0 || filterCategories.includes(e.category)
    return matchDay && matchFilter
  })

  const dayLabel = day.toLocaleDateString('pt-BR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>
      {/* Day sub-header */}
      <div style={{ padding: '0.6rem 1.25rem', borderBottom: '1px solid var(--border)', background: 'var(--bg-secondary)', display: 'flex', alignItems: 'center', gap: '1rem', flexShrink: 0 }}>
        <button
          onClick={onBack}
          style={{ background: 'transparent', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', fontSize: '0.88rem', padding: '0.2rem 0.4rem', borderRadius: '5px' }}
        >
          ← Semana
        </button>
        <span style={{ color: 'var(--text-primary)', fontWeight: '600', fontSize: '0.92rem', textTransform: 'capitalize' }}>
          {dayLabel}
        </span>
      </div>

      {/* Timeline */}
      <div style={{ flex: 1, overflowY: 'auto' }}>
        <div style={{ display: 'flex' }}>
          {/* Time labels */}
          <div style={{ width: 60, flexShrink: 0 }}>
            {HOURS.map(h => (
              <div
                key={h}
                style={{
                  height: HOUR_HEIGHT,
                  display: 'flex',
                  alignItems: 'flex-start',
                  justifyContent: 'flex-end',
                  paddingTop: 3,
                  paddingRight: 8,
                  fontSize: '0.68rem',
                  color: 'var(--text-muted)',
                  borderTop: '1px solid var(--border)',
                  boxSizing: 'border-box',
                }}
              >
                {String(h).padStart(2, '0')}:00
              </div>
            ))}
          </div>

          {/* Single day column */}
          <div style={{ flex: 1, position: 'relative', borderLeft: '1px solid var(--border)', height: HOUR_HEIGHT * HOURS.length }}>
            {/* Clickable hour rows */}
            {HOURS.map(h => (
              <div
                key={h}
                onClick={() => onSlotClick(h)}
                style={{
                  position: 'absolute',
                  top: (h - START_HOUR) * HOUR_HEIGHT,
                  left: 0,
                  right: 0,
                  height: HOUR_HEIGHT,
                  borderTop: '1px solid var(--border)',
                  cursor: 'crosshair',
                }}
              />
            ))}

            {/* Events */}
            {dayEvents.map(event => {
              const startH = parseTimeToHours(event.start_time)
              const top = (startH - START_HOUR) * HOUR_HEIGHT + 1
              const baseHeight = Math.max(event.duration * HOUR_HEIGHT - 2, 24)
              const isExpanded = expandedId === event.id
              const isHovered = hoveredId === event.id
              const cat = (EVENT_CATEGORIES as Record<string, { color: string; textColor: string }>)[event.category]
              const bg = cat?.color ?? '#374151'
              const fg = cat?.textColor ?? '#f9fafb'

              return (
                <div
                  key={event.id}
                  onClick={e => { e.stopPropagation(); setExpandedId(isExpanded ? null : event.id) }}
                  onMouseEnter={() => setHoveredId(event.id)}
                  onMouseLeave={() => setHoveredId(null)}
                  style={{
                    position: 'absolute',
                    top,
                    left: 12,
                    right: 12,
                    minHeight: baseHeight,
                    background: bg,
                    borderRadius: 6,
                    padding: '6px 10px',
                    cursor: 'pointer',
                    zIndex: isExpanded ? 10 : 1,
                    transition: 'box-shadow 0.1s',
                    boxShadow: isExpanded ? '0 4px 16px rgba(0,0,0,0.4)' : undefined,
                  }}
                >
                  {/* Header row */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8 }}>
                    <div style={{ flex: 1, overflow: 'hidden' }}>
                      <div style={{ color: fg, fontSize: '0.88rem', fontWeight: '600', lineHeight: 1.3, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: isExpanded ? 'normal' : 'nowrap' }}>
                        {event.title}
                      </div>
                      <div style={{ color: fg, fontSize: '0.73rem', opacity: 0.8, marginTop: 2 }}>
                        {event.start_time.slice(0, 5)} · {event.duration < 1 ? '30 min' : `${event.duration}h`}
                      </div>
                    </div>

                    {/* Action buttons on hover */}
                    {isHovered && (
                      <div style={{ display: 'flex', gap: 4, flexShrink: 0 }}>
                        <button
                          onClick={e => { e.stopPropagation(); onEventEdit(event) }}
                          style={{ background: 'rgba(0,0,0,0.25)', border: 'none', color: fg, borderRadius: 4, width: 22, height: 22, cursor: 'pointer', fontSize: '0.7rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                          title="Editar"
                        >
                          ✏
                        </button>
                        <button
                          onClick={e => { e.stopPropagation(); onDeleteEvent(event.id) }}
                          style={{ background: 'rgba(0,0,0,0.25)', border: 'none', color: fg, borderRadius: 4, width: 22, height: 22, cursor: 'pointer', fontSize: '0.7rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                          title="Excluir"
                        >
                          ✕
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Expanded content */}
                  {isExpanded && (
                    <div style={{ marginTop: 8 }}>
                      {event.description && (
                        <p style={{ color: fg, fontSize: '0.8rem', opacity: 0.9, lineHeight: 1.5, marginBottom: event.meet_link ? 8 : 0 }}>
                          {event.description}
                        </p>
                      )}
                      {event.meet_link && (
                        <a
                          href={event.meet_link}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={e => e.stopPropagation()}
                          style={{ display: 'inline-flex', alignItems: 'center', gap: 4, color: fg, fontSize: '0.78rem', background: 'rgba(0,0,0,0.2)', padding: '3px 8px', borderRadius: 4, textDecoration: 'none', fontWeight: '500' }}
                        >
                          🔗 Abrir link da reunião
                        </a>
                      )}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}
