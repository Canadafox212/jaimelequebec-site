import { notFound } from 'next/navigation'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import Mascot from '@/components/Mascot'
import InstallPrompt from '@/components/InstallPrompt'
import { LANGS, getDictionary } from '@/lib/i18n'

// Manifest par langue — FR par défaut pour les autres langues
const MANIFESTS = { fr: '/manifest.json', en: '/manifest-en.json' }

export async function generateStaticParams() {
  return LANGS.map((lang) => ({ lang }))
}

export async function generateMetadata({ params }) {
  const { lang } = await params
  return {
    manifest: MANIFESTS[lang] ?? MANIFESTS.fr,
  }
}

export default async function LangLayout({ children, params }) {
  const { lang } = await params
  const t = getDictionary(lang)
  if (!t) notFound()

  return (
    <>
      <Header lang={lang} t={t} />
      <main className="flex-1">{children}</main>
      <Footer t={t} lang={lang} />
      <Mascot lang={lang} />
      <InstallPrompt lang={lang} />
    </>
  )
}
