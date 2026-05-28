import type { Metadata, Viewport } from 'next'
import type { ReactNode } from 'react'
import './globals.css'
import { Geist } from 'next/font/google'
import { cn } from '@/lib/utils'
import { Providers } from './providers'

const geist = Geist({subsets:['latin'],variable:'--font-sans'});

const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL ??
  (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'http://localhost:3000')

const metadataBase = new URL(siteUrl)

export const metadata: Metadata = {
  metadataBase,
  title: 'Palette Studio • Make colors accessible',
  description:
    'Use LCH color space to come up with predictable and accessible color palettes',
  manifest: '/manifest.json',
  openGraph: {
    type: 'website',
    siteName: 'Palette Studio',
    title: 'Palette Studio • Make colors accessible',
    description:
      'Use LCH color space to come up with predictable and accessible color palettes',
    locale: 'en_EN',
    images: [
      {
        url: '/cover.png',
        width: 1280,
        height: 640,
        alt: 'Palette Studio',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Palette Studio • Make colors accessible',
    description:
      'Use LCH color space to come up with predictable and accessible color palettes',
    images: ['/cover.png'],
  },
}

export const viewport: Viewport = {
  themeColor: '#000000',
}

export default function RootLayout({
  children,
}: Readonly<{ children: ReactNode }>) {
  return (
    <html lang="en" suppressHydrationWarning className={cn("h-full", "font-sans", geist.variable)}>
      <body className="flex min-h-screen flex-col">
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}
