import type { Metadata } from 'next'
import { Montserrat } from 'next/font/google'
import './globals.css'
import { Providers } from './providers'

const montserrat = Montserrat({ 
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'],
  variable: '--font-montserrat',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'RED Metrics | Sistema Interno',
  description: 'RED Agency - Gestão de Objetivos Mínimos e Performance por Departamento',
  icons: {
    icon: '/r.png',
    shortcut: '/r.png',
    apple: '/r.png',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="pt-BR" className={montserrat.variable}>
      <body className={montserrat.className}>
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}