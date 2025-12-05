import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import Script from 'next/script'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
    title: 'Polymarket Bot',
    description: 'Trading Bot Dashboard',
}

export default function RootLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <html lang="en">
            <head>
                <Script src="https://telegram.org/js/telegram-web-app.js" strategy="beforeInteractive" />
            </head>
            <body className={inter.className}>
                <div className="min-h-screen bg-gray-900 text-white">
                    {children}
                </div>
            </body>
        </html>
    )
}
