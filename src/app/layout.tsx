import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { LanguageProvider } from '../hooks/useTranslation'
import { ThemeProvider } from '@mui/material/styles'
import { CssBaseline, Box } from '@mui/material'
import theme from '../theme'
import Header from '../components/Header'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Transfer Assistant - Vienna Private Transfers',
  description: 'AI-powered private transfer assistant for Vienna. Find the best transfer options with real-time price comparison and analysis.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <ThemeProvider theme={theme}>
          <CssBaseline />
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
