import './globals.css'
import 'flag-icons/css/flag-icons.min.css'
import { Inter, Playfair_Display } from 'next/font/google'
import PWARegister from '@/components/PWARegister'

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
  metadataBase: new URL('https://jaimelequebec.org'),
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
    <html lang="fr" className={`${inter.variable} ${playfair.variable}`}>
      <head>
        {/* Empêche Chrome d'auto-traduire — le site gère lui-même FR/EN */}
        <meta name="google" content="notranslate" />
        {/* PWA — meta-tags installation */}
        <meta name="theme-color" content="#003087" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="J'aime le Québec" />
        <meta name="mobile-web-app-capable" content="yes" />
        <link rel="icon" href="/favicon.ico" sizes="any" />
        {/* Capture beforeinstallprompt before React hydrates */}
        <script dangerouslySetInnerHTML={{ __html:
          'window.__bip=null;window.addEventListener("beforeinstallprompt",function(e){e.preventDefault();window.__bip=e;});'
        }} />
      </head>
      <body className="bg-slate-50 min-h-screen flex flex-col font-sans">
        {children}
        <PWARegister />
      </body>
    </html>
  )
}
