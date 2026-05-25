import type { Metadata } from 'next'
import { Inter, Playfair_Display } from 'next/font/google'
import './globals.css'
import { AuthProvider } from './contexts/AuthContext'
import { ScheduleProvider } from './contexts/ScheduleContext'
import Providers from './components/Providers'
import { Toaster } from 'sonner'

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
})

const playfair = Playfair_Display({
  subsets: ['latin'],
  variable: '--font-playfair',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'JadwalSync — FEB Unpad',
  description: 'Smart class scheduling resolution for the Faculty of Economics and Business, Universitas Padjadjaran',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="id" className={`${inter.variable} ${playfair.variable}`}>
      <body className="font-sans bg-surface min-h-screen">
        <Providers>
          <AuthProvider>
            <ScheduleProvider>
              {children}
            </ScheduleProvider>
          </AuthProvider>
        </Providers>
        <Toaster richColors position="top-right" />
      </body>
    </html>
  )
}
