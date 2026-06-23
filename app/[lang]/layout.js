import { notFound } from 'next/navigation'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import Mascot from '@/components/Mascot'
import fr from '@/dictionaries/fr'
import en from '@/dictionaries/en'

const dicts = { fr, en }

export async function generateStaticParams() {
  return [{ lang: 'fr' }, { lang: 'en' }]
}

export default async function LangLayout({ children, params }) {
  const { lang } = await params
  if (!dicts[lang]) notFound()
  const t = dicts[lang]

  return (
    <>
      <Header lang={lang} t={t} />
      <main className="flex-1">{children}</main>
      <Footer t={t} />
      <Mascot lang={lang} />
    </>
  )
}
