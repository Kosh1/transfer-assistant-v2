import { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Vienna Private Transfer Service | Rational Transfer',
    short_name: 'Rational Transfer',
    description: 'AI-powered private transfer assistant for Vienna with real-time price comparison and instant booking',
    start_url: '/',
    display: 'standalone',
    background_color: '#ffffff',
    theme_color: '#1976d2',
    icons: [
      {
        src: '/favicon.ico',
        sizes: 'any',
        type: 'image/x-icon',
      },
      {
        src: '/icon-192.png',
        sizes: '192x192',
        type: 'image/png',
      },
      {
        src: '/icon-512.png',
        sizes: '512x512',
        type: 'image/png',
      },
    ],
  }
}
