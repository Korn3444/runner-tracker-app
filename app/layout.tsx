import type { Metadata } from 'next'
import React from 'react'
import '@/app/globals.css'

export const metadata: Metadata = {
  title: 'Runner Tracker - Track your running goals',
  description: 'Production-ready running metrics and photo logging application',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className="antialiased min-h-screen bg-slate-50 text-slate-900">
        {children}
      </body>
    </html>
  )
}