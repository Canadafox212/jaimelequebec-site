import { writeFile, copyFile, mkdir } from 'fs/promises'
import { existsSync } from 'fs'
import { join, extname } from 'path'
import { NextResponse } from 'next/server'

// Uniquement accessible en développement
export async function POST(request) {
  if (process.env.NODE_ENV === 'production') {
    return NextResponse.json({ error: 'Interdit en production' }, { status: 403 })
  }

  const formData = await request.formData()
  const folder   = formData.get('folder')   // 'attractions' | 'fallbacks'
  const filename = formData.get('filename') // slug ou nom du fallback (sans extension)
  const url      = formData.get('url')      // URL web (optionnel)
  const file     = formData.get('file')     // Fichier uploadé (optionnel)

  if (!folder || !filename) {
    return NextResponse.json({ error: 'folder et filename requis' }, { status: 400 })
  }

  const destDir = join(process.cwd(), 'public', 'images', folder)
  if (!existsSync(destDir)) await mkdir(destDir, { recursive: true })

  try {
    if (file && file.size > 0) {
      // Fichier uploadé depuis l'ordinateur
      const ext  = extname(file.name) || '.jpg'
      const dest = join(destDir, `${filename}${ext}`)
      const buf  = Buffer.from(await file.arrayBuffer())
      await writeFile(dest, buf)
      return NextResponse.json({ ok: true, path: `/images/${folder}/${filename}${ext}` })

    } else if (url && url.startsWith('http')) {
      // Téléchargement depuis une URL web
      const res = await fetch(url)
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const contentType = res.headers.get('content-type') ?? ''
      const ext = contentType.includes('png') ? '.png'
        : contentType.includes('gif') ? '.gif'
        : contentType.includes('webp') ? '.webp'
        : '.jpg'
      const dest = join(destDir, `${filename}${ext}`)
      const buf  = Buffer.from(await res.arrayBuffer())
      await writeFile(dest, buf)
      return NextResponse.json({ ok: true, path: `/images/${folder}/${filename}${ext}` })

    } else {
      return NextResponse.json({ error: 'Fournir un fichier ou une URL' }, { status: 400 })
    }
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
