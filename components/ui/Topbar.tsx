'use client'

interface TopbarProps {
  title: string
  actions?: React.ReactNode
}

export default function Topbar({ title, actions }: TopbarProps) {
  return (
    <header
      style={{
        height: '56px',
        borderBottom: '1px solid var(--border)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 1.5rem',
        background: 'var(--bg-secondary)',
        flexShrink: 0,
      }}
    >
      <h1
        style={{
          fontSize: '1rem',
          fontWeight: '600',
          color: 'var(--text-primary)',
        }}
      >
        {title}
      </h1>
      {actions && <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>{actions}</div>}
    </header>
  )
}
