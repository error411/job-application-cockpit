type ScoreResult = {
  score: number
  matchedSkills: string[]
  missingSkills: string[]
  reasons: string[]
}

const CORE_SKILLS = [
  'wordpress',
  'woocommerce',
  'php',
  'mysql',
  'javascript',
  'react',
  'accessibility',
  'custom themes',
  'custom theme',
  'custom plugins',
  'custom plugin',
  'rest api',
  'api integration',
]

const TITLE_KEYWORDS = [
  'wordpress developer',
  'woocommerce developer',
  'frontend developer',
  'front-end developer',
  'web developer',
  'full stack developer',
  'php developer',
]

const PREFERRED_LOCATIONS = ['remote']

export function scoreJob(input: {
  title: string
  location?: string | null
  descriptionRaw: string
}): ScoreResult {
  const title = input.title.toLowerCase()
  const location = (input.location || '').toLowerCase()
  const description = input.descriptionRaw.toLowerCase()

  let score = 0
  const matchedSkills: string[] = []
  const missingSkills: string[] = []
  const reasons: string[] = []

  // Title match: max 25
  const titleMatch = TITLE_KEYWORDS.some((keyword) => title.includes(keyword))
  if (titleMatch) {
    score += 25
    reasons.push('Title strongly matches target roles.')
  } else if (
    title.includes('developer') ||
    title.includes('engineer') ||
    title.includes('web')
  ) {
    score += 10
    reasons.push('Title is adjacent to target roles.')
  } else {
    reasons.push('Title is a weaker match.')
  }

  // Core skills match: max 50
  const uniqueCoreSkills = [...new Set(CORE_SKILLS)]
  const matchedCore = uniqueCoreSkills.filter(
    (skill) => description.includes(skill) || title.includes(skill)
  )

  matchedCore.forEach((skill) => matchedSkills.push(skill))

  const skillPoints = Math.min(50, matchedCore.length * 6)
  score += skillPoints

  if (matchedCore.length > 0) {
    reasons.push(`Matched ${matchedCore.length} core skills.`)
  } else {
    reasons.push('No core skills matched.')
  }

  uniqueCoreSkills.forEach((skill) => {
    if (!matchedCore.includes(skill)) {
      missingSkills.push(skill)
    }
  })

  // Location fit: max 15
  if (PREFERRED_LOCATIONS.some((pref) => location.includes(pref))) {
    score += 15
    reasons.push('Location matches remote preference.')
  } else if (!location) {
    score += 5
    reasons.push('No location provided.')
  } else {
    reasons.push('Location may not fit remote preference.')
  }

  // Bonus for accessibility / WordPress / WooCommerce emphasis: max 10
  const strategicKeywords = ['wordpress', 'woocommerce', 'accessibility']
  const strategicMatches = strategicKeywords.filter(
    (skill) => description.includes(skill) || title.includes(skill)
  )

  if (strategicMatches.length >= 2) {
    score += 10
    reasons.push('Strong strategic alignment with your core niche.')
  } else if (strategicMatches.length === 1) {
    score += 5
    reasons.push('Some strategic alignment with your niche.')
  }

  return {
    score: Math.min(100, score),
    matchedSkills: [...new Set(matchedSkills)],
    missingSkills,
    reasons,
  }
}