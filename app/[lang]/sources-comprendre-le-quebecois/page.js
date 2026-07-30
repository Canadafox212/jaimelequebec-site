import Image from 'next/image'
import { LANGS, getAlternates } from '@/lib/i18n'

export async function generateStaticParams() {
  return LANGS.map(lang => ({ lang }))
}

export async function generateMetadata({ params }) {
  const { lang } = await params
  const isEn = lang === 'en'
  return {
    title: isEn
      ? 'Sources — Understanding Quebec French in Travel'
      : 'Sources — Comprendre le québécois en voyage',
    description: isEn
      ? 'Digital register of the 600 documentary sources cited in the book "Comprendre le québécois en voyage" by Philippe Goupil.'
      : 'Registre numérique des 600 sources documentaires citées dans le livre « Comprendre le québécois en voyage » de Philippe Goupil.',
    alternates: getAlternates('/sources-comprendre-le-quebecois'),
  }
}

export default async function SourcesPage({ params }) {
  const { lang } = await params
  const isEn = lang === 'en'
  return isEn ? <EnVersion /> : <FrVersion />
}

function FrVersion() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-14">
      <div className="flex flex-col sm:flex-row gap-8 items-start mb-10">
        <div className="shrink-0">
          <Image
            src="/livres/comprendre-le-quebecois-couverture.png"
            alt="Couverture — Comprendre le québécois en voyage"
            width={140}
            height={210}
            className="rounded shadow-md"
          />
        </div>
        <div>
          <p className="text-xs font-semibold tracking-widest text-quebec-blue uppercase mb-2">
            Page de sources officielle
          </p>
          <h1 className="text-3xl font-bold text-quebec-navy mb-3 leading-tight">
            Comprendre le québécois en voyage
          </h1>
          <p className="text-gray-600 text-sm leading-relaxed">
            Guide linguistique et culturel à l'intention des visiteurs francophones —
            <strong> 300 mots et expressions</strong>, étymologies, équivalents en français de France,
            commentaires humoristiques et références documentaires.
          </p>
          <p className="text-gray-500 text-xs mt-3">
            Auteur&nbsp;: Philippe Goupil · Publié sur Amazon KDP · Juillet 2026
          </p>
        </div>
      </div>

      <div className="bg-gray-50 border border-gray-200 rounded-xl p-6 mb-10">
        <h2 className="text-lg font-bold text-quebec-navy mb-2">
          Registre numérique des sources
        </h2>
        <p className="text-gray-600 text-sm leading-relaxed mb-5">
          Conformément aux bonnes pratiques éditoriales, les 600&nbsp;sources documentaires
          utilisées pour constituer la base de données linguistique de ce guide sont
          consignées dans le registre ci-dessous. Ce registre comprend dictionnaires,
          corpus linguistiques, ouvrages de référence et ressources en ligne consultés
          pour chaque entrée.
        </p>
        <a
          href="/livres/registre-sources-quebecois.pdf"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 bg-quebec-navy text-white text-sm font-semibold px-5 py-3 rounded-lg hover:bg-quebec-blue transition-colors"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3M3 17V7a2 2 0 012-2h6l2 2h4a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
          </svg>
          Télécharger le registre (PDF)
        </a>
      </div>

      <div className="text-sm text-gray-500 space-y-2 border-t border-gray-100 pt-6">
        <p>
          <strong>Sources principales :</strong> Office québécois de la langue française (OQLF),
          Usito, Dictionnaire historique du français québécois (DHFQ), Centre national de ressources
          textuelles et lexicales (CNRTL), Trésor de la langue française informatisé (TLFi).
        </p>
        <p>
          Questions ou commentaires&nbsp;:{' '}
          <a href="mailto:philippegoupil@jaimelequebec.com" className="text-quebec-blue hover:underline">
            philippegoupil@jaimelequebec.com
          </a>
        </p>
      </div>
    </div>
  )
}

function EnVersion() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-14">
      <div className="flex flex-col sm:flex-row gap-8 items-start mb-10">
        <div className="shrink-0">
          <Image
            src="/livres/comprendre-le-quebecois-couverture.png"
            alt="Cover — Comprendre le québécois en voyage"
            width={140}
            height={210}
            className="rounded shadow-md"
          />
        </div>
        <div>
          <p className="text-xs font-semibold tracking-widest text-quebec-blue uppercase mb-2">
            Official sources page
          </p>
          <h1 className="text-3xl font-bold text-quebec-navy mb-3 leading-tight">
            Comprendre le québécois en voyage
          </h1>
          <p className="text-gray-600 text-sm leading-relaxed">
            A linguistic and cultural guide for French-speaking visitors —
            <strong> 300 Quebec words and expressions</strong>, etymologies, French-France equivalents,
            humorous notes and documentary references.
          </p>
          <p className="text-gray-500 text-xs mt-3">
            Author: Philippe Goupil · Published on Amazon KDP · July 2026
          </p>
        </div>
      </div>

      <div className="bg-gray-50 border border-gray-200 rounded-xl p-6 mb-10">
        <h2 className="text-lg font-bold text-quebec-navy mb-2">
          Digital Register of Sources
        </h2>
        <p className="text-gray-600 text-sm leading-relaxed mb-5">
          In accordance with editorial best practices, the 600&nbsp;documentary sources used
          to compile this guide's linguistic database are recorded in the register below.
          This register includes dictionaries, linguistic corpora, reference works and
          online resources consulted for each entry.
        </p>
        <a
          href="/livres/registre-sources-quebecois.pdf"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 bg-quebec-navy text-white text-sm font-semibold px-5 py-3 rounded-lg hover:bg-quebec-blue transition-colors"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3M3 17V7a2 2 0 012-2h6l2 2h4a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
          </svg>
          Download the register (PDF)
        </a>
      </div>

      <div className="text-sm text-gray-500 space-y-2 border-t border-gray-100 pt-6">
        <p>
          <strong>Main sources:</strong> Office québécois de la langue française (OQLF),
          Usito, Dictionnaire historique du français québécois (DHFQ), Centre national de ressources
          textuelles et lexicales (CNRTL), Trésor de la langue française informatisé (TLFi).
        </p>
        <p>
          Questions or feedback:{' '}
          <a href="mailto:philippegoupil@jaimelequebec.com" className="text-quebec-blue hover:underline">
            philippegoupil@jaimelequebec.com
          </a>
        </p>
      </div>
    </div>
  )
}
