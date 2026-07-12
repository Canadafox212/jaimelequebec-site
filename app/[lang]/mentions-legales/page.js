import { LANGS, getAlternates } from '@/lib/i18n'

export async function generateStaticParams() {
  return LANGS.map(lang => ({ lang }))
}

export async function generateMetadata({ params }) {
  const { lang } = await params
  const isEn = lang === 'en'
  return {
    title: isEn ? 'Legal Notice — J\'aime le Québec' : 'Mentions légales — J\'aime le Québec',
    alternates: getAlternates('/mentions-legales'),
  }
}

function Section({ title, children }) {
  return (
    <section className="mb-8">
      <h2 className="text-lg font-bold text-quebec-navy mb-3 border-b border-gray-200 pb-2">{title}</h2>
      <div className="text-gray-700 space-y-2 text-sm leading-relaxed">{children}</div>
    </section>
  )
}

export default async function MentionsLegalesPage({ params }) {
  const { lang } = await params
  const isEn = lang === 'en'

  if (isEn) return <EnVersion />
  return <FrVersion />
}

function FrVersion() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold text-quebec-navy mb-1">Mentions légales</h1>
      <p className="text-gray-400 text-sm mb-10">Mise à jour : juillet 2026</p>

      <Section title="Éditeur du site">
        <p><strong>Nom :</strong> Philippe Goupil</p>
        <p><strong>Site web :</strong> jaimelequebec.com · jaimelequebec.org</p>
        <p><strong>Courriel :</strong> <a href="mailto:philippegoupil@jaimelequebec.com" className="text-quebec-blue hover:underline">philippegoupil@jaimelequebec.com</a></p>
        <p><strong>Siège social :</strong> Québec, Canada</p>
        <p className="text-gray-500 text-xs mt-2">
          J'aime le Québec est un guide touristique indépendant, non affilié aux gouvernements provincial ou fédéral.
        </p>
      </Section>

      <Section title="Hébergement">
        <p><strong>Prestataire :</strong> Vercel Inc.</p>
        <p><strong>Adresse :</strong> 340 Pine Street, Suite 701, San Francisco, CA 94104, États-Unis</p>
        <p><strong>Site :</strong> vercel.com</p>
      </Section>

      <Section title="Données personnelles & RGPD">
        <p>
          Le site collecte uniquement les données strictement nécessaires au bon fonctionnement des services proposés :
        </p>
        <ul className="list-disc pl-5 space-y-1">
          <li><strong>Formulaire de contact :</strong> adresse courriel, nom, message. Ces données sont utilisées exclusivement pour répondre à votre demande et ne sont pas conservées au-delà de 12 mois.</li>
          <li><strong>Itinéraires road trip :</strong> stockés localement dans votre navigateur (localStorage), jamais transmis à nos serveurs.</li>
          <li><strong>Journaux d'accès :</strong> adresses IP traitées par Vercel à des fins de sécurité uniquement.</li>
        </ul>
        <p>
          Conformément au Règlement général sur la protection des données (RGPD), vous disposez d'un droit d'accès, de rectification et de suppression de vos données.
          Pour exercer ce droit, contactez : <a href="mailto:philippegoupil@jaimelequebec.com" className="text-quebec-blue hover:underline">philippegoupil@jaimelequebec.com</a>.
        </p>
      </Section>

      <Section title="Cookies">
        <p>
          Ce site n'utilise pas de cookies de suivi ou publicitaires. Les seules données stockées localement (localStorage de votre navigateur)
          concernent vos préférences de langue et votre itinéraire road trip. Vous pouvez les effacer à tout moment en vidant les données de votre navigateur.
        </p>
      </Section>

      <Section title="Liens d'affiliation — Déclaration de transparence">
        <p>
          J'aime le Québec participe à des programmes d'affiliation touristique. Certains liens présents sur ce site vers des partenaires
          (Booking.com, GetYourGuide, Viator, DiscoverCars) sont des liens d'affiliation : si vous effectuez une réservation après avoir cliqué sur l'un de ces liens,
          nous percevons une commission de la part du prestataire, <strong>sans aucun coût supplémentaire pour vous</strong>.
        </p>
        <p>
          Cette commission nous permet de maintenir le site gratuitement et de continuer à proposer un contenu éditorial indépendant.
          Nos recommandations sont basées sur la qualité et la pertinence touristique, non sur le taux de commission.
        </p>
        <ul className="list-disc pl-5 space-y-1">
          <li>Booking.com — Programme partenaire Booking.com</li>
          <li>GetYourGuide — Programme d'affiliation GYG</li>
          <li>Viator — Programme partenaire Viator (TripAdvisor)</li>
          <li>DiscoverCars — Programme d'affiliation DiscoverCars</li>
        </ul>
      </Section>

      <Section title="Propriété intellectuelle">
        <p>
          Les textes, photographies et éléments graphiques présents sur ce site sont la propriété de leurs auteurs respectifs.
          Toute reproduction, même partielle, est interdite sans autorisation écrite préalable.
          Les photos d'attraction sont utilisées avec l'autorisation des propriétaires ou sont sous licence libre.
        </p>
      </Section>

      <Section title="Limitation de responsabilité">
        <p>
          Les informations publiées sur ce site sont fournies à titre indicatif. Horaires d'ouverture, tarifs et disponibilités
          peuvent évoluer sans préavis. Nous vous recommandons de vérifier ces informations directement auprès des établissements avant votre visite.
        </p>
        <p>
          J'aime le Québec ne saurait être tenu responsable des dommages résultant de l'utilisation des informations publiées
          sur ce site ou des services de partenaires accessibles via des liens externes.
        </p>
      </Section>

      <Section title="Droit applicable">
        <p>
          Le présent site est soumis au droit canadien et québécois. Tout litige relatif à l'utilisation de ce site sera soumis
          à la compétence des tribunaux du Québec, Canada.
        </p>
      </Section>
    </div>
  )
}

function EnVersion() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold text-quebec-navy mb-1">Legal Notice</h1>
      <p className="text-gray-400 text-sm mb-10">Last updated: July 2026</p>

      <Section title="Publisher">
        <p><strong>Name:</strong> Philippe Goupil</p>
        <p><strong>Website:</strong> jaimelequebec.com · jaimelequebec.org</p>
        <p><strong>Email:</strong> <a href="mailto:philippegoupil@jaimelequebec.com" className="text-quebec-blue hover:underline">philippegoupil@jaimelequebec.com</a></p>
        <p><strong>Location:</strong> Québec, Canada</p>
        <p className="text-gray-500 text-xs mt-2">
          J'aime le Québec is an independent tourism guide, not affiliated with provincial or federal governments.
        </p>
      </Section>

      <Section title="Hosting">
        <p><strong>Provider:</strong> Vercel Inc.</p>
        <p><strong>Address:</strong> 340 Pine Street, Suite 701, San Francisco, CA 94104, United States</p>
        <p><strong>Website:</strong> vercel.com</p>
      </Section>

      <Section title="Personal Data & GDPR">
        <p>This site collects only data strictly necessary for its services:</p>
        <ul className="list-disc pl-5 space-y-1">
          <li><strong>Contact form:</strong> email address, name, message — used solely to respond to your inquiry, retained for no more than 12 months.</li>
          <li><strong>Road trip itineraries:</strong> stored locally in your browser (localStorage), never transmitted to our servers.</li>
          <li><strong>Access logs:</strong> IP addresses processed by Vercel for security purposes only.</li>
        </ul>
        <p>
          Under GDPR, you have the right to access, correct and delete your personal data.
          To exercise this right, contact: <a href="mailto:philippegoupil@jaimelequebec.com" className="text-quebec-blue hover:underline">philippegoupil@jaimelequebec.com</a>.
        </p>
      </Section>

      <Section title="Cookies">
        <p>
          This site does not use tracking or advertising cookies. The only data stored locally (browser localStorage)
          relates to your language preference and road trip itinerary. You can clear this data at any time through your browser settings.
        </p>
      </Section>

      <Section title="Affiliate Links — Transparency Disclosure">
        <p>
          J'aime le Québec participates in tourism affiliate programs. Some links on this site to partners
          (Booking.com, GetYourGuide, Viator, DiscoverCars) are affiliate links: if you make a booking after clicking one of these links,
          we may receive a commission from the provider, <strong>at no additional cost to you</strong>.
        </p>
        <p>
          This commission helps us maintain the site free of charge and continue producing independent editorial content.
          Our recommendations are based on quality and tourist relevance, not commission rates.
        </p>
        <ul className="list-disc pl-5 space-y-1">
          <li>Booking.com — Booking.com Partner Program</li>
          <li>GetYourGuide — GYG Affiliate Program</li>
          <li>Viator — Viator Partner Program (TripAdvisor)</li>
          <li>DiscoverCars — DiscoverCars Affiliate Program</li>
        </ul>
      </Section>

      <Section title="Intellectual Property">
        <p>
          All texts, photographs and graphic elements on this site are the property of their respective authors.
          Any reproduction, even partial, is prohibited without prior written consent.
        </p>
      </Section>

      <Section title="Limitation of Liability">
        <p>
          Information published on this site is provided for informational purposes only. Opening hours, prices and availability
          may change without notice. We recommend verifying this information directly with establishments before your visit.
        </p>
      </Section>

      <Section title="Applicable Law">
        <p>
          This site is governed by Canadian and Quebec law. Any dispute relating to the use of this site will be subject
          to the jurisdiction of Quebec courts, Canada.
        </p>
      </Section>
    </div>
  )
}
