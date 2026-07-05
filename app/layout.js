import './globals.css'
import 'flag-icons/css/flag-icons.min.css'
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
  title: { default: "J'aime le Québec", template: "%s — J'aime le Québec" },
  description: "Votre guide touristique du Québec — 200 sites incontournables, parcs nationaux, villes historiques et nature sauvage.",
  metadataBase: new URL('https://jaimelequebec.com'),
  openGraph: {
    siteName: "J'aime le Québec",
    type: 'website',
    images: [{ url: '/images/logo.png', width: 320, height: 96, alt: "J'aime le Québec" }],
  },
  twitter: { card: 'summary_large_image' },
  robots: { index: true, follow: true },
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
