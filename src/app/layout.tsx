import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'YT Downloader',
  description: 'Baixe vídeos do YouTube escolhendo o formato e a qualidade.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <body>{children}</body>
    </html>
  )
}
