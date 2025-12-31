import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Messaging Manager - AI-Powered WhatsApp & Messenger',
  description: 'Manage your WhatsApp and Messenger messages with ChatGPT',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
