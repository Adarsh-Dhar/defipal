import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { Header } from "@/components/Header"
import { Providers } from './providers';

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "DeFiPal - AI-Powered Sonic DeFi Assistant",
  description: "Your intelligent assistant for Sonic DeFi operations",
  generator: 'v0.dev',
  icons: {
    icon: '/favicon.svg',
    shortcut: '/favicon.svg',
    apple: '/favicon.svg',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className} suppressHydrationWarning>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
          <Providers>
          <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-blue-900">
            <Header />
            <main className="container mx-auto px-4 py-8">{children}</main>
          </div>
          </Providers>
        </ThemeProvider>
      </body>
    </html>
  )
}
