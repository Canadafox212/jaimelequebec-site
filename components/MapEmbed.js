// Carte Google intégrée (sans clé API) — centrée sur `query` (coordonnées ou adresse).
export default function MapEmbed({ query, title, label, lang = 'fr' }) {
  if (!query) return null
  const hl = lang === 'en' ? 'en' : 'fr'
  const src = `https://maps.google.com/maps?q=${encodeURIComponent(query)}&z=15&hl=${hl}&output=embed`
  return (
    <section className="mb-10">
      <h2 className="flex items-center gap-2 font-display text-xl font-bold text-gray-900 mb-4 pb-3 border-b border-gray-100">
        <span>🗺️</span> {label}
      </h2>
      <div className="rounded-2xl overflow-hidden border border-gray-100 shadow-card">
        <iframe
          src={src}
          title={`Carte — ${title}`}
          width="100%"
          height="320"
          style={{ border: 0 }}
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
          allowFullScreen
        />
      </div>
    </section>
  )
}
