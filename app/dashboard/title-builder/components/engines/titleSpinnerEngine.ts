// app/dashboard/title-builder/components/engines/titleSpinnerEngine.ts
// Converted 1:1 from lib/pages/title_builder/title_spinner_engine.dart

// 🚀 ORIGINAL PRO RULES
const BIND_WORDS  = ['for','with','to','and','in','on','of','-','&','+','fits']
const POWER_WORDS = ['new','genuine','oem','fast','premium','pro','heavy-duty','original','authentic','quality']

// 🚀 GOD-TIER UPGRADE 1: Policy Guard — silent deletion
const BANNED_WORDS = ['free shipping','wow','look','cheap','guaranteed','bonus','gift','sale','hot']

// 🚀 GOD-TIER UPGRADE 2: Space Maximizer — safe fillers to hit 80 chars
const FILLER_WORDS = ['Premium','Quality','USA','Top Rated','Durable','Reliable','Pro','Elite','Best']

// 🚀 GOD-TIER UPGRADE 3: Mini-Thesaurus
const THESAURUS: Record<string, string[]> = {
  'genuine':  ['Authentic','OEM','Original','100% Real'],
  'fast':     ['Quick','Rapid','High-Speed','Swift'],
  'charger':  ['Adapter','Power Supply','Block'],
  'new':      ['Brand New','Unused','Pristine'],
  'strong':   ['Heavy-Duty','Durable','Rugged'],
  'cable':    ['Cord','Wire','Line'],
}

function randBool(): boolean { return Math.random() < 0.5 }
function randInt(max: number): number { return Math.floor(Math.random() * max) }
function shuffle<T>(arr: T[]): T[] {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = randInt(i + 1);
    [a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

export class TitleSpinnerEngine {
  static spin(originalTitle: string, lockCount = 3): string {

    // 1. POLICY GUARD — silent assassination of banned words
    let safeTitle = originalTitle
    for (const banned of BANNED_WORDS) {
      safeTitle = safeTitle.replace(new RegExp(`\\b${banned.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')}\\b`, 'gi'), '')
    }
    // Wipe "L@@K" trick
    safeTitle = safeTitle.replace(/L@@K/gi, '')
    const cleanTitle = safeTitle.trim().replace(/\s+/g, ' ')
    if (!cleanTitle) return ''

    const words = cleanTitle.split(' ')
    if (words.length <= lockCount) return originalTitle

    // 2. SYNONYM SWAPPING & DEDUPLICATION
    const uniqueWords: string[] = []
    const seen = new Set<string>()

    words.forEach((originalWord, i) => {
      let word = originalWord
      let lower = word.toLowerCase()

      // 50% chance to swap synonyms — never swap locked core words
      if (i >= lockCount && THESAURUS[lower]) {
        if (randBool()) {
          const synonyms = THESAURUS[lower]
          word  = synonyms[randInt(synonyms.length)]
          lower = word.toLowerCase()
        }
      }

      if (!seen.has(lower)) {
        seen.add(lower)
        uniqueWords.push(word)
      }
    })

    if (uniqueWords.length <= lockCount) return uniqueWords.join(' ')

    // 3. EXTRACT LOCKED CORE
    const lockedCore      = uniqueWords.slice(0, lockCount)
    const remainingWords  = uniqueWords.slice(lockCount)

    // 4. SMART CHUNKING
    const smartChunks: string[] = []
    let i = 0
    const hasNumber = /\d/

    while (i < remainingWords.length) {
      const currentWord      = remainingWords[i]
      const currentWordLower = currentWord.toLowerCase()

      if ((BIND_WORDS.includes(currentWordLower) || hasNumber.test(currentWord)) && i + 1 < remainingWords.length) {
        smartChunks.push(`${currentWord} ${remainingWords[i + 1]}`)
        i += 2
        continue
      }

      const chunkSize = randInt(2) + 1
      if (i + chunkSize <= remainingWords.length) {
        smartChunks.push(remainingWords.slice(i, i + chunkSize).join(' '))
        i += chunkSize
      } else {
        smartChunks.push(remainingWords.slice(i).join(' '))
        break
      }
    }

    // 5. FRONT-LOAD POWER WORDS
    const powerChunks:  string[] = []
    const normalChunks: string[] = []

    for (const chunk of smartChunks) {
      const hasPower = POWER_WORDS.some(p => chunk.toLowerCase().includes(p))
      if (hasPower) powerChunks.push(chunk)
      else          normalChunks.push(chunk)
    }

    const shuffledPower  = shuffle(powerChunks)
    const shuffledNormal = shuffle(normalChunks)

    // 6. RECOMBINE
    let spunTitle = [...lockedCore, ...shuffledPower, ...shuffledNormal].join(' ')

    // 7. 80-CHARACTER GUARDIAN & AUTO-FILLER
    if (spunTitle.length > 80) {
      // Too long — safely cut down
      let cut       = spunTitle.substring(0, 80)
      const lastSp  = cut.lastIndexOf(' ')
      spunTitle     = lastSp > -1 ? spunTitle.substring(0, lastSp) : cut

      let finalWords = spunTitle.split(' ')
      while (finalWords.length > 0 && BIND_WORDS.includes(finalWords[finalWords.length - 1].toLowerCase())) {
        finalWords.pop()
      }
      spunTitle = finalWords.join(' ')

    } else {
      // 🚀 SPACE MAXIMIZER — inject fillers to boost eBay ranking
      const shuffledFillers = shuffle(FILLER_WORDS)
      for (const filler of shuffledFillers) {
        if (spunTitle.toLowerCase().includes(filler.toLowerCase())) continue
        if (spunTitle.length + 1 + filler.length <= 80) {
          spunTitle += ` ${filler}`
        }
      }
    }

    return spunTitle
  }
}