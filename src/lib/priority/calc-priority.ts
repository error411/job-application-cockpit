export function calculatePriority({
  score,
  status,
  followUp1,
  followUp2,
}: {
  score: number | null
  status: string
  followUp1: string | null
  followUp2: string | null
}) {
  let priority = 0

  // Fit score weight (0–60)
  if (score !== null) {
    priority += Math.min(score, 100) * 0.6
  }

  // Status weight
  if (status === 'ready') priority += 15
  if (status === 'applied') priority += 10
  if (status === 'interviewing') priority += 25

  // Urgency (follow-ups)
  const now = new Date()

  function daysDiff(dateStr: string | null) {
    if (!dateStr) return null
    const d = new Date(dateStr)
    return (d.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
  }

  const f1 = daysDiff(followUp1)
  const f2 = daysDiff(followUp2)

  if (f1 !== null && f1 <= 0) priority += 30
  if (f2 !== null && f2 <= 0) priority += 30

  return Math.round(priority)
}