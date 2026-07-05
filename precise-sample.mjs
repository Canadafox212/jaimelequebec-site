import sharp from 'sharp'

const SRC = 'N:/0000_DOCUMENTS/0000_PROJETS/JMLQ 2026/2026_REGIONS/carte touristique du quebec.png'
const { data, info } = await sharp(SRC).raw().toBuffer({ resolveWithObject: true })
const { width, height, channels } = info
console.log(`Image: ${width}x${height}`)

function px(x, y) {
  if (x<0||y<0||x>=width||y>=height) return [0,0,0]
  const i = (y * width + x) * channels
  return [data[i], data[i+1], data[i+2]]
}
function hex([r,g,b]) { return '#'+[r,g,b].map(v=>v.toString(16).padStart(2,'0')).join('') }
function avg(pts) {
  const c = pts.map(([x,y])=>px(x,y))
  const s = c.reduce((a,v)=>[a[0]+v[0],a[1]+v[1],a[2]+v[2]],[0,0,0])
  return s.map(v=>Math.round(v/c.length))
}

// Basé sur la carte numéros visible:
// Image 1254x844, display approximatif 630x422 = facteur 2
// Numéros et positions des régions identifiés visuellement
// On prend plusieurs points espacés dans chaque région pour éviter les bordures

const REGIONS = {
  // Région, [liste de points (x,y) dans la région]
  '01-Abitibi':    [[155,495],[140,510],[170,480],[145,525],[165,470]],
  '02-BSL':        [[820,595],[800,580],[840,610],[810,570],[830,615]],
  '03-Cantons':    [[600,790],[580,775],[620,780],[590,795],[610,800]],
  '04-Centre-QC':  [[530,755],[510,740],[550,770],[520,760],[540,745]],
  '05-Charlevoix': [[650,575],[635,560],[665,590],[640,570],[660,585]],
  '06-Chaud-App':  [[695,730],[675,715],[715,745],[680,720],[705,735]],
  '07-Cote-Nord':  [[875,310],[855,295],[895,325],[865,305],[885,315]],
  '08-Gaspesie':   [[970,610],[950,595],[990,625],[960,600],[980,620]],
  '09-IdM':        [[1085,680],[1075,670],[1095,690],[1080,675],[1090,685]],
  '10-Lanaudiere': [[445,740],[425,725],[465,755],[435,730],[455,745]],
  '11-Laurentides':[[335,720],[315,705],[355,735],[325,710],[345,725]],
  '12-Laval':      [[200,810],[195,805],[205,815],[198,808],[202,812]],
  '13-Mauricie':   [[470,560],[450,545],[490,575],[460,550],[480,565]],
  '14-Monteregie': [[415,775],[395,760],[435,785],[405,765],[425,780]],
  '15-Montreal':   [[155,810],[150,815],[160,808],[152,812],[158,818]],
  '16-Nord-QC':    [[340,235],[310,220],[370,250],[330,215],[360,240]],
  '17-Outaouais':  [[170,700],[150,685],[190,715],[160,690],[180,705]],
  '18-QC-CN':      [[600,615],[580,600],[620,630],[590,610],[610,620]],
  '19-Saguenay':   [[525,430],[505,415],[545,445],[515,420],[535,440]],
}

console.log('\nCouleurs par région:')
for (const [name, pts] of Object.entries(REGIONS)) {
  const samples = pts.map(([x,y]) => { const c=px(x,y); return `${hex(c)}` })
  const a = avg(pts)
  console.log(`${name.padEnd(18)} avg=${hex(a)} rgb(${a.join(',')})  samples:[${samples.join(',')}]`)
}
