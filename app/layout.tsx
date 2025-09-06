import type { Metadata } from 'next'
import './globals.css'
import { ChatProvider } from '../contexts/chat-context'

export const metadata: Metadata = {
  title: 'TCAI',
  description: 'TCAI - Your Cognitive AI Assistant',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body>
        <ChatProvider>
          {children}
        </ChatProvider>
      </body>
    </html>
  )
}
