import { ClerkProvider } from '@clerk/nextjs'
import { Providers } from '@/components/providers'
import { Geist, Geist_Mono } from 'next/font/google'
import './globals.css'

const geistSans = Geist({
  subsets: ['latin'],
  variable: '--font-geist-sans'
})

const geistMono = Geist_Mono({
  subsets: ['latin'],
  variable: '--font-geist-mono'
})

export const metadata = {
  title: 'Guardrail — AI Cost Enforcement',
  description: 'Track per-user OpenAI costs, enforce spending limits, and get real-time alerts.'
}

export default function RootLayout({
  children
}: {
  children: React.ReactNode
}) {
  return (
    // @ts-ignore
    <ClerkProvider>
      <html lang="en" className="dark">
        <body className={`${geistSans.variable} ${geistMono.variable} antialiased bg-[#0A0A0A] text-white`}>
          <Providers>
            {children}
          </Providers>
        </body>
      </html>
    </ClerkProvider>
  )
}