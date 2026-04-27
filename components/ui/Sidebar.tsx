'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase'

const NAV_ITEMS = [
  { href: '/cronograma', label: 'Cronograma', icon: '📅' },
  { href: '/tarefas', label: 'Tarefas', icon: '✅' },
  { href: '/financeiro', label: 'Financeiro', icon: '💰' },
]

export default function Sidebar() {
  const pathname = usePathname()
  const router = useRouter()

  async function handleLogout() {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  return (
    <aside
      style={{
        width: '220px',
        minHeight: '100vh',
        background: 'var(--bg-secondary)',
        borderRight: '1px solid var(--border)',
        display: 'flex',
        flexDirection: 'column',
        padding: '1.5rem 0',
        flexShrink: 0,
      }}
    >
      <div style={{ padding: '0 1.25rem', marginBottom: '2rem' }}>
        <span
          style={{
            fontSize: '1.1rem',
            fontWeight: '700',
            color: 'var(--text-primary)',
            letterSpacing: '-0.01em',
          }}
        >
          HB System
        </span>
      </div>

      <nav style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.25rem', padding: '0 0.75rem' }}>
        {NAV_ITEMS.map(item => {
          const isActive = pathname.startsWith(item.href)
          return (
            <Link
              key={item.href}
              href={item.href}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
                padding: '0.6rem 0.75rem',
                borderRadius: '8px',
                color: isActive ? 'var(--text-primary)' : 'var(--text-secondary)',
                background: isActive ? 'var(--bg-hover)' : 'transparent',
                textDecoration: 'none',
                fontSize: '0.9rem',
                fontWeight: isActive ? '600' : '400',
                transition: 'background 0.1s, color 0.1s',
              }}
            >
              <span>{item.icon}</span>
              <span>{item.label}</span>
            </Link>
          )
        })}
      </nav>

      <div style={{ padding: '0 0.75rem' }}>
        <button
          onClick={handleLogout}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
            width: '100%',
            padding: '0.6rem 0.75rem',
            borderRadius: '8px',
            background: 'transparent',
            border: 'none',
            color: 'var(--text-muted)',
            fontSize: '0.9rem',
            cursor: 'pointer',
            textAlign: 'left',
            transition: 'background 0.1s, color 0.1s',
          }}
          onMouseEnter={e => {
            ;(e.currentTarget as HTMLButtonElement).style.background = 'var(--bg-hover)'
            ;(e.currentTarget as HTMLButtonElement).style.color = 'var(--text-secondary)'
          }}
          onMouseLeave={e => {
            ;(e.currentTarget as HTMLButtonElement).style.background = 'transparent'
            ;(e.currentTarget as HTMLButtonElement).style.color = 'var(--text-muted)'
          }}
        >
          <span>🚪</span>
          <span>Sair</span>
        </button>
      </div>
    </aside>
  )
}
