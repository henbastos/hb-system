import type { Metadata, Viewport } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'HB System',
  description: 'Sistema pessoal de produtividade',
  manifest: '/manifest.json',
}

export const viewport: Viewport = {
  themeColor: '#0f0f0f',
  width: 'device-width',
  initialScale: 1,
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <body>{children}</body>
    </html>
  )
}
