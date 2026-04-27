'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)

    const supabase = createClient()
    const { error } = await supabase.auth.signInWithPassword({ email, password })

    if (error) {
      setError('Email ou senha incorretos.')
      setLoading(false)
      return
    }

    router.push('/cronograma')
    router.refresh()
  }

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'var(--bg-primary)',
        padding: '1rem',
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: '400px',
          background: 'var(--bg-secondary)',
          border: '1px solid var(--border)',
          borderRadius: '12px',
          padding: '2rem',
        }}
      >
        <div style={{ marginBottom: '2rem', textAlign: 'center' }}>
          <h1
            style={{
              fontSize: '1.75rem',
              fontWeight: '700',
              color: 'var(--text-primary)',
              letterSpacing: '-0.02em',
            }}
          >
            HB System
          </h1>
          <p style={{ color: 'var(--text-secondary)', marginTop: '0.5rem', fontSize: '0.9rem' }}>
            Sistema pessoal de produtividade
          </p>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div>
            <label
              htmlFor="email"
              style={{
                display: 'block',
                fontSize: '0.85rem',
                color: 'var(--text-secondary)',
                marginBottom: '0.4rem',
              }}
            >
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              autoComplete="email"
              style={{
                width: '100%',
                padding: '0.65rem 0.85rem',
                background: 'var(--bg-card)',
                border: '1px solid var(--border)',
                borderRadius: '8px',
                color: 'var(--text-primary)',
                fontSize: '0.95rem',
                outline: 'none',
              }}
              onFocus={e => (e.target.style.borderColor = 'var(--accent)')}
              onBlur={e => (e.target.style.borderColor = 'var(--border)')}
            />
          </div>

          <div>
            <label
              htmlFor="password"
              style={{
                display: 'block',
                fontSize: '0.85rem',
                color: 'var(--text-secondary)',
                marginBottom: '0.4rem',
              }}
            >
              Senha
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              autoComplete="current-password"
              style={{
                width: '100%',
                padding: '0.65rem 0.85rem',
                background: 'var(--bg-card)',
                border: '1px solid var(--border)',
                borderRadius: '8px',
                color: 'var(--text-primary)',
                fontSize: '0.95rem',
                outline: 'none',
              }}
              onFocus={e => (e.target.style.borderColor = 'var(--accent)')}
              onBlur={e => (e.target.style.borderColor = 'var(--border)')}
            />
          </div>

          {error && (
            <p style={{ color: '#f87171', fontSize: '0.85rem', textAlign: 'center' }}>{error}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            style={{
              width: '100%',
              padding: '0.75rem',
              background: loading ? 'var(--border)' : 'var(--accent)',
              color: '#fff',
              border: 'none',
              borderRadius: '8px',
              fontSize: '0.95rem',
              fontWeight: '600',
              cursor: loading ? 'not-allowed' : 'pointer',
              marginTop: '0.5rem',
              transition: 'background 0.15s',
            }}
          >
            {loading ? 'Entrando...' : 'Entrar'}
          </button>
        </form>
      </div>
    </div>
  )
}
