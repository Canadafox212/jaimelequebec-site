import './globals.css'
import { Inter, Playfair_Display } from 'next/font/google'

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-sans',
  display: 'swap',
})

const playfair = Playfair_Display({
  subsets: ['latin'],
  variable: '--font-display',
  display: 'swap',
})

export const metadata = {
  title: "J'aime le Québec",
  description: "Votre guide touristique du Québec — 200 sites incontournables",
}

export default function RootLayout({ children }) {
  return (
    <html className={`${inter.variable} ${playfair.variable}`}>
      <body className="bg-slate-50 min-h-screen flex flex-col font-sans">
        {children}
      </body>
    </html>
  )
}
