/**
 * optimize-images.mjs — Redimensionne et compresse toutes les images pour déploiement
 *
 * Résultat : max 1200px de large, format WebP, qualité 82
 * Supprime l'original non-WebP après conversion
 *
 * Usage : node scripts/optimize-images.mjs
 */

import sharp from 'sharp'
import { readdirSync, statSync, unlinkSync, existsSync } from 'fs'
import { join, extname, basename } from 'path'
import { fileURLToPath } from 'url'
import { dirname } from 'path'

const __dirname = dirname(fileURLToPath(import.meta.url))
const ROOT = join(__dirname, '..')

const DIRS = [
  join(ROOT, 'public', 'images', 'attractions'),
  join(ROOT, 'public', 'images', 'services'),
]

const MAX_PX  = 1200
const QUALITY = 82
const EXTS    = ['.jpg', '.jpeg', '.png', '.webp', '.avif', '.gif']

let totalBefore = 0
let totalAfter  = 0
let count = 0
let errors = 0

async function optimizeFile(filePath) {
  const ext = extname(filePath).toLowerCase()
  if (!EXTS.includes(ext)) return

  const outPath = filePath.replace(/\.[^.]+$/, '.webp')
  const sizeBefore = statSync(filePath).size

  try {
    await sharp(filePath)
      .resize({ width: MAX_PX, height: MAX_PX, fit: 'inside', withoutEnlargement: true })
      .webp({ quality: QUALITY })
      .toFile(outPath + '.tmp')

    // Remplacer l'original si la version WebP est valide
    const sizeAfter = statSync(outPath + '.tmp').size
    if (sizeAfter < 1000) throw new Error('Fichier de sortie trop petit')

    // Supprimer l'ancien fichier s'il n'est pas déjà WebP
    if (filePath !== outPath) {
      unlinkSync(filePath)
    } else {
      unlinkSync(filePath)
    }

    // Renommer le .tmp en .webp
    const { renameSync } = await import('fs')
    renameSync(outPath + '.tmp', outPath)

    totalBefore += sizeBefore
    totalAfter  += sizeAfter
    count++

    const ratio = Math.round((1 - sizeAfter / sizeBefore) * 100)
    const dir = filePath.includes('attractions') ? 'attractions' : 'services'
    process.stdout.write(`\r✓ ${count} fichiers — ${(totalAfter / 1024 / 1024).toFixed(0)} MB (−${ratio}%)   `)

  } catch (e) {
    // Nettoyer le .tmp si erreur
    if (existsSync(outPath + '.tmp')) {
      try { unlinkSync(outPath + '.tmp') } catch {}
    }
    console.error(`\n✗ ${basename(filePath)} : ${e.message}`)
    errors++
  }
}

console.log('\n🔧  Optimisation des images pour déploiement Vercel\n')
console.log(`   Max : ${MAX_PX}px · Format : WebP · Qualité : ${QUALITY}\n`)

for (const dir of DIRS) {
  if (!existsSync(dir)) continue
  const files = readdirSync(dir).map(f => join(dir, f))
  const label = dir.includes('attractions') ? 'attractions' : 'services'
  console.log(`📁  ${label} : ${files.length} fichiers`)
  for (const f of files) {
    await optimizeFile(f)
  }
  console.log()
}

const before = (totalBefore / 1024 / 1024).toFixed(0)
const after  = (totalAfter  / 1024 / 1024).toFixed(0)
const saving = Math.round((1 - totalAfter / totalBefore) * 100)

console.log(`\n✅  Terminé !`)
console.log(`   Avant  : ${before} MB`)
console.log(`   Après  : ${after} MB`)
console.log(`   Gain   : −${saving}%`)
if (errors > 0) console.log(`   Erreurs: ${errors} fichiers ignorés`)
