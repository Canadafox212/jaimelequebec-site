import sharp from 'sharp'

const SRC = 'N:/0000_DOCUMENTS/0000_PROJETS/JMLQ 2026/2026_REGIONS/carte touristique du quebec.png'
const { data, info } = await sharp(SRC).raw().toBuffer({ resolveWithObject: true })
const { width, height, channels } = info
console.log(`Image: ${width}x${height}, channels:${channels}`)

function px(x, y) {
  const i = (y * width + x) * channels
  return [data[i], data[i+1], data[i+2]]
}
function avg(coords) {
  const c = coords.map(([x,y]) => px(x,y))
  const s = c.reduce((a,v) => [a[0]+v[0],a[1]+v[1],a[2]+v[2]], [0,0,0])
  return s.map(v => Math.round(v/c.length))
}
function hex([r,g,b]) { return '#'+[r,g,b].map(v=>v.toString(16).padStart(2,'0')).join('') }

const SAMPLES = {
  'Abitibi(1)':     [[105,395],[115,380],[90,410],[125,370]],
  'BSL(2)':         [[665,358],[650,368],[678,348],[655,375]],
  'Cantons(3)':     [[418,557],[405,565],[432,548],[410,570]],
  'Centre-QC(4)':   [[378,512],[365,520],[392,505],[370,530]],
  'Charlevoix(5)':  [[538,382],[525,370],[550,393],[530,395]],
  'Chaud-App(6)':   [[452,480],[440,490],[465,472],[458,495]],
  'Cote-Nord(7)':   [[745,228],[720,215],[775,242],[760,210]],
  'Gaspesie(8)':    [[888,382],[870,395],[905,370],[875,382]],
  'IdM(9)':         [[1010,422],[1006,418],[1014,428],[1012,415]],
  'Lanaudiere(10)': [[328,512],[315,522],[342,503],[320,525]],
  'Laurentides(11)':[[268,502],[252,514],[283,492],[260,510]],
  'Laval(12)':      [[238,578],[233,573],[244,582],[240,575]],
  'Mauricie(13)':   [[358,392],[343,402],[372,382],[360,400]],
  'Monteregie(14)': [[293,572],[278,580],[308,564],[285,577]],
  'Montreal(15)':   [[226,590],[220,585],[233,595],[228,587]],
  'Nord-QC(16)':    [[178,162],[158,182],[198,145],[175,175]],
  'Outaouais(17)':  [[168,532],[152,547],[183,520],[160,540]],
  'Quebec-CN(18)':  [[448,422],[432,432],[463,413],[445,430]],
  'Saguenay(19)':   [[478,282],[463,297],[493,270],[475,290]],
}

for (const [name, coords] of Object.entries(SAMPLES)) {
  const a = avg(coords)
  const samples = coords.map(([x,y]) => `rgb(${px(x,y).join(',')})`)
  console.log(`${name.padEnd(18)} avg=${hex(a)} rgb(${a.join(',')})  | ${samples.join('  ')}`)
}
