'use client'

import { CalendarEvent } from '@/lib/types'
import { EVENT_CATEGORIES } from '@/lib/constants'
import { addDays, toDateString, toDayOfWeek, parseTimeToHours } from '@/lib/utils/date'

const HOUR_HEIGHT = 64
const START_HOUR = 5
const HOURS = Array.from({ length: 19 }, (_, i) => i + START_HOUR)
const DAYS_BR = ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom']

interface WeekViewProps {
  events: CalendarEvent[]
  weekStart: Date
  filterCategories: string[]
  onDayClick: (day: Date) => void
  onEventClick: (event: CalendarEvent) => void
  onSlotClick: (day: Date, hour: number) => void
}

function getEventsForDay(events: CalendarEvent[], day: Date): CalendarEvent[] {
  const dateStr = toDateString(day)
  const dow = toDayOfWeek(day)
  return events.filter(e => {
    if (e.date) return e.date === dateStr
    const days = e.recurrence_days ?? (e.day_of_week != null ? [e.day_of_week] : null)
    return days != null && days.includes(dow)
  })
}

export default function WeekView({
  events,
  weekStart,
  filterCategories,
  onDayClick,
  onEventClick,
  onSlotClick,
}: WeekViewProps) {
  const days = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i))
  const todayStr = toDateString(new Date())

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>
      {/* Day headers */}
      <div style={{ display: 'flex', borderBottom: '1px solid var(--border)', background: 'var(--bg-secondary)', flexShrink: 0 }}>
        <div style={{ width: 52, flexShrink: 0 }} />
        {days.map((day, i) => {
          const isToday = toDateString(day) === todayStr
          return (
            <div
              key={i}
              onClick={() => onDayClick(day)}
              style={{
                flex: 1,
                padding: '0.45rem 0.25rem',
                textAlign: 'center',
                cursor: 'pointer',
                borderLeft: '1px solid var(--border)',
                userSelect: 'none',
              }}
            >
              <div style={{ fontSize: '0.72rem', color: isToday ? 'var(--accent)' : 'var(--text-muted)', fontWeight: '500' }}>
                {DAYS_BR[i]}
              </div>
              <div style={{ fontSize: '0.88rem', fontWeight: isToday ? '700' : '500', color: isToday ? 'var(--accent)' : 'var(--text-primary)', marginTop: 2 }}>
                {day.getDate().toString().padStart(2, '0')}/{String(day.getMonth() + 1).padStart(2, '0')}
              </div>
            </div>
          )
        })}
      </div>

      {/* Scrollable grid */}
      <div style={{ flex: 1, overflowY: 'auto' }}>
        <div style={{ display: 'flex' }}>
          {/* Time labels */}
          <div style={{ width: 52, flexShrink: 0 }}>
            {HOURS.map(h => (
              <div
                key={h}
                style={{
                  height: HOUR_HEIGHT,
                  display: 'flex',
                  alignItems: 'flex-start',
                  justifyContent: 'flex-end',
                  paddingTop: 3,
                  paddingRight: 6,
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

          {/* Day columns */}
          {days.map((day, i) => {
            const dayEvents = getEventsForDay(events, day).filter(
              e => filterCategories.length === 0 || filterCategories.includes(e.category)
            )
            const isToday = toDateString(day) === todayStr

            return (
              <div
                key={i}
                style={{
                  flex: 1,
                  position: 'relative',
                  borderLeft: '1px solid var(--border)',
                  height: HOUR_HEIGHT * HOURS.length,
                  background: isToday ? 'rgba(59,130,246,0.03)' : undefined,
                }}
              >
                {/* Clickable hour rows */}
                {HOURS.map(h => (
                  <div
                    key={h}
                    onClick={() => onSlotClick(day, h)}
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

                {/* Event blocks */}
                {dayEvents.map(event => {
                  const startH = parseTimeToHours(event.start_time)
                  const top = (startH - START_HOUR) * HOUR_HEIGHT + 1
                  const height = Math.max(event.duration * HOUR_HEIGHT - 2, 18)
                  const cat = (EVENT_CATEGORIES as Record<string, { color: string; textColor: string }>)[event.category]
                  const bg = cat?.color ?? '#374151'
                  const fg = cat?.textColor ?? '#f9fafb'

                  return (
                    <div
                      key={event.id}
                      onClick={e => { e.stopPropagation(); onEventClick(event) }}
                      style={{
                        position: 'absolute',
                        top,
                        left: 2,
                        right: 2,
                        height,
                        background: bg,
                        borderRadius: 4,
                        padding: '2px 4px',
                        cursor: 'pointer',
                        overflow: 'hidden',
                        zIndex: 1,
                      }}
                    >
                      <div style={{ color: fg, fontSize: '0.7rem', fontWeight: '600', lineHeight: 1.3, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {event.title}
                      </div>
                      {height > 32 && (
                        <div style={{ color: fg, fontSize: '0.65rem', opacity: 0.85 }}>
                          {event.start_time.slice(0, 5)}
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
