export default function Footer({ t }) {
  return (
    <footer className="bg-quebec-navy text-slate-300 mt-auto">
      <div className="max-w-6xl mx-auto px-4 py-12">
        <div className="flex flex-col md:flex-row justify-between gap-8">
          <div>
            <p className="font-display text-2xl font-bold text-white mb-2">
              <span className="text-quebec-red">J'aime</span> le Québec
            </p>
            <p className="text-sm text-slate-400 max-w-xs">{t.footer.tagline}</p>
          </div>
          <div className="flex gap-12 text-sm">
            <div>
              <p className="font-semibold text-white mb-3">Partenaires</p>
              <ul className="space-y-2 text-slate-400">
                <li>Booking.com</li>
                <li>GetYourGuide</li>
                <li>Viator</li>
              </ul>
            </div>
          </div>
        </div>
        <div className="border-t border-white/10 mt-10 pt-6 text-xs text-slate-500 text-center">
          {t.footer.copyright}
        </div>
      </div>
    </footer>
  )
}
