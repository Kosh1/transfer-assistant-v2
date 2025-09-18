import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { LanguageProvider } from '../hooks/useTranslation'
import { Box } from '@mui/material'
import ThemeProvider from '../components/ThemeProvider'
import Header from '../components/Header'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Transfer Assistant - Vienna Private Transfers',
  description: 'AI-powered private transfer assistant for Vienna. Find the best transfer options with real-time price comparison and analysis.',
  icons: {
    icon: 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><text y=".9em" font-size="90">🚗</text></svg>',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <ThemeProvider>
          <LanguageProvider>
            <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
              <Header />
              {children}
            </Box>
          </LanguageProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
