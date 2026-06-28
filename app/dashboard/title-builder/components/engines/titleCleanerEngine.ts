// app/dashboard/title-builder/components/engines/titleCleanerEngine.ts
// Converted 1:1 from lib/pages/title_builder/title_cleaner_engine.dart

// ðŸš€ RULE 1: Grammar Dictionary â€” forced lowercase
const LOWER_CASE_WORDS = ['a','an','the','and','but','or','for','nor','on','at','to','from','by','with','in','of']

// ðŸš€ RULE 2: Tech Acronyms â€” forced uppercase
const FORCE_UPPER = ['USB','USB-C','HDMI','OEM','LED','LCD','HD','4K','8K','5G','WIFI','SSD','HDD','RAM','PC','MAC','TV','NFC','GPS']

// ðŸš€ RULE 3: Brand Protectors â€” forced CamelCase
const BRAND_CASES: Record<string, string> = {
  'iphone':  'iPhone',
  'ipad':    'iPad',
  'macbook': 'MacBook',
  'imac':    'iMac',
  'ios':     'iOS',
}

export class TitleCleanerEngine {
  static clean(messyTitle: string): string {
    if (!messyTitle) return ''

    // 1. Punctuation & emoji purge â€” keep letters, numbers, spaces, - / & . "
    let scrubbed = messyTitle.replace(/[^a-zA-Z0-9\s\-\/&\."']/g, ' ')

    // Remove double/triple spaces
    scrubbed = scrubbed.replace(/\s+/g, ' ').trim()

    if (!scrubbed) return ''

    const words = scrubbed.split(' ')
    const cleaned: string[] = []

    words.forEach((word, i) => {
      if (!word) return
      const lower = word.toLowerCase()

      // 2. Brand fixer (iphone â†’ iPhone)
      if (BRAND_CASES[lower]) {
        cleaned.push(BRAND_CASES[lower])
      }
      // 3. Tech acronym fixer (hdmi â†’ HDMI)
      else if (FORCE_UPPER.includes(word.toUpperCase())) {
        cleaned.push(word.toUpperCase())
      }
      // 4. Model/wattage fixer â€” has both digits and letters â†’ uppercase (140w â†’ 140W)
      else if (/\d/.test(word) && /[a-zA-Z]/.test(word)) {
        cleaned.push(word.toUpperCase())
      }
      // 5. Grammar fixer â€” lowercase small words UNLESS first word
      else if (LOWER_CASE_WORDS.includes(lower) && i !== 0) {
        cleaned.push(lower)
      }
      // 6. Standard title case
      else {
        if (word.length > 1) {
          cleaned.push(word[0].toUpperCase() + lower.slice(1))
        } else {
          cleaned.push(word.toUpperCase())
        }
      }
    })

    return cleaned.join(' ')
  }
}
