const ACK = {
  fr: { subject: "Merci de nous avoir contactés — J'aime le Québec", greeting: 'Bonjour', body: "Nous avons bien reçu votre message et vous répondrons dans les meilleurs délais.\n\nL'équipe J'aime le Québec\njaimelequebec.org" },
  en: { subject: "Thank you for contacting us — J'aime le Québec", greeting: 'Hello', body: "We have received your message and will get back to you as soon as possible.\n\nThe J'aime le Québec team\njaimelequebec.org" },
  es: { subject: "Gracias por contactarnos — J'aime le Québec", greeting: 'Hola', body: "Hemos recibido su mensaje y le responderemos a la brevedad.\n\nEl equipo de J'aime le Québec\njaimelequebec.org" },
  de: { subject: "Vielen Dank für Ihre Nachricht — J'aime le Québec", greeting: 'Hallo', body: "Wir haben Ihre Nachricht erhalten und werden uns so schnell wie möglich bei Ihnen melden.\n\nDas Team von J'aime le Québec\njaimelequebec.org" },
  pt: { subject: "Obrigado pelo seu contacto — J'aime le Québec", greeting: 'Olá', body: "Recebemos a sua mensagem e responderemos o mais brevemente possível.\n\nA equipa de J'aime le Québec\njaimelequebec.org" },
  ru: { subject: "Спасибо за обращение — J'aime le Québec", greeting: 'Здравствуйте', body: "Мы получили ваше сообщение и ответим вам как можно скорее.\n\nКоманда J'aime le Québec\njaimelequebec.org" },
  zh: { subject: "感谢您联系我们 — J'aime le Québec", greeting: '您好', body: "我们已收到您的留言，将尽快回复您。\n\nJ'aime le Québec 团队\njaimelequebec.org" },
  hi: { subject: "हमसे संपर्क करने के लिए धन्यवाद — J'aime le Québec", greeting: 'नमस्ते', body: "हमें आपका संदेश मिल गया है और हम जल्द से जल्द आपसे संपर्क करेंगे।\n\nJ'aime le Québec टीम\njaimelequebec.org" },
}

export async function POST(request) {
  try {
    const { nom, ville, pays, email, objet, message, lang, _hp, _ts } = await request.json()

    if (!nom || !email) {
      return Response.json({ ok: false, error: 'Missing required fields' }, { status: 400 })
    }

    // Anti-bot : champ honeypot rempli ou soumission trop rapide (< 3s)
    if (_hp || (_ts !== undefined && _ts < 3000)) {
      return Response.json({ ok: true }) // fausse réussite pour ne pas alerter le bot
    }

    const apiKey = process.env.RENVOYER_JMLQ
    if (apiKey) {
      const notifHtml = `
        <h2 style="font-family:sans-serif">Nouveau message — J'aime le Québec</h2>
        <table cellpadding="8" style="font-family:sans-serif;font-size:14px">
          <tr><td><strong>Nom</strong></td><td>${nom}</td></tr>
          <tr><td><strong>Courriel</strong></td><td>${email}</td></tr>
          ${ville ? `<tr><td><strong>Ville</strong></td><td>${ville}</td></tr>` : ''}
          ${pays ? `<tr><td><strong>Pays</strong></td><td>${pays}</td></tr>` : ''}
          ${objet ? `<tr><td><strong>Objet</strong></td><td>${objet}</td></tr>` : ''}
          <tr><td><strong>Message</strong></td><td style="white-space:pre-wrap">${message || '(vide)'}</td></tr>
        </table>
      `

      const ack = ACK[lang] ?? ACK.fr
      const ackHtml = `
        <p style="font-family:sans-serif;font-size:15px">${ack.greeting} ${nom},</p>
        <p style="font-family:sans-serif;font-size:15px;white-space:pre-line">${ack.body}</p>
      `

      await Promise.all([
        // Notification à l'administrateur
        fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
          body: JSON.stringify({
            from: 'contact@jaimelequebec.com',
            to: 'philippegoupil@jaimelequebec.com',
            reply_to: email,
            subject: `[Contact JMLQ] ${objet || 'Sans objet'} — ${nom}`,
            html: notifHtml,
          }),
        }),
        // Accusé de réception au visiteur
        fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
          body: JSON.stringify({
            from: 'contact@jaimelequebec.com',
            to: email,
            subject: ack.subject,
            html: ackHtml,
          }),
        }),
      ])
    }

    return Response.json({ ok: true })
  } catch (err) {
    console.error('[contact route]', err)
    return Response.json({ ok: false }, { status: 500 })
  }
}
