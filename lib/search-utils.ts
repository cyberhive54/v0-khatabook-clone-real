export interface SearchResult<T> {
  item: T
  score: number
  matchedField?: string
}

export function smartSearch<T extends Record<string, any>>(
  items: T[],
  query: string,
  searchFields: (keyof T)[]
): SearchResult<T>[] {
  if (!query.trim()) return items.map((item) => ({ item, score: 0 }))

  const results: SearchResult<T>[] = []
  const lowerQuery = query.toLowerCase()

  items.forEach((item) => {
    let bestScore = -1
    let matchedField: string | undefined

    searchFields.forEach((field) => {
      const value = String(item[field]).toLowerCase()

      // Exact start match (highest priority)
      if (value.startsWith(lowerQuery)) {
        const score = 1000 + (100 - value.length) // Prefer shorter names
        if (score > bestScore) {
          bestScore = score
          matchedField = String(field)
        }
      }
      // Contains match (medium priority)
      else if (value.includes(lowerQuery)) {
        const indexOfMatch = value.indexOf(lowerQuery)
        const score = 500 - indexOfMatch // Earlier matches score higher
        if (score > bestScore) {
          bestScore = score
          matchedField = String(field)
        }
      }
    })

    if (bestScore >= 0) {
      results.push({ item, score: bestScore, matchedField })
    }
  })

  // Sort by score (descending)
  return results.sort((a, b) => b.score - a.score)
}

export function getHighlightParts(text: string, query: string): Array<{ text: string; isMatch: boolean }> {
  if (!query.trim()) return [{ text, isMatch: false }]

  const parts: Array<{ text: string; isMatch: boolean }> = []
  const lowerQuery = query.toLowerCase()
  const lowerText = text.toLowerCase()

  let lastIndex = 0
  let currentIndex = 0

  while (currentIndex < lowerText.length) {
    const matchIndex = lowerText.indexOf(lowerQuery, currentIndex)

    if (matchIndex === -1) {
      if (lastIndex < text.length) {
        parts.push({ text: text.substring(lastIndex), isMatch: false })
      }
      break
    }

    // Add text before match
    if (matchIndex > lastIndex) {
      parts.push({ text: text.substring(lastIndex, matchIndex), isMatch: false })
    }

    // Add highlighted match
    parts.push({ text: text.substring(matchIndex, matchIndex + query.length), isMatch: true })

    lastIndex = matchIndex + query.length
    currentIndex = lastIndex
  }

  return parts
}

export function highlightText(text: string, query: string): string {
  if (!query.trim()) return text

  const lowerQuery = query.toLowerCase()
  const lowerText = text.toLowerCase()
  const parts: string[] = []

  let lastIndex = 0
  let currentIndex = 0

  while (currentIndex < lowerText.length) {
    const matchIndex = lowerText.indexOf(lowerQuery, currentIndex)

    if (matchIndex === -1) {
      if (lastIndex < text.length) {
        parts.push(text.substring(lastIndex))
      }
      break
    }

    // Add text before match
    if (matchIndex > lastIndex) {
      parts.push(text.substring(lastIndex, matchIndex))
    }

    // Add match with markers (will be replaced in JSX)
    parts.push(`**${text.substring(matchIndex, matchIndex + query.length)}**`)

    lastIndex = matchIndex + query.length
    currentIndex = lastIndex
  }

  return parts.join("")
}

export function sortContacts<T extends Record<string, any>>(
  items: T[],
  sortBy: string,
  getBalance?: (item: T) => number,
  getTransactionCount?: (item: T) => number
): T[] {
  const sorted = [...items]

  switch (sortBy) {
    case "name-az":
      return sorted.sort((a, b) => String(a.name).localeCompare(String(b.name)))
    case "name-za":
      return sorted.sort((a, b) => String(b.name).localeCompare(String(a.name)))
    case "added-latest":
      return sorted.sort((a, b) => new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime())
    case "added-oldest":
      return sorted.sort((a, b) => new Date(a.created_at || 0).getTime() - new Date(b.created_at || 0).getTime())
    case "balance-highest":
      return sorted.sort((a, b) => (getBalance?.(b) || 0) - (getBalance?.(a) || 0))
    case "balance-lowest":
      return sorted.sort((a, b) => (getBalance?.(a) || 0) - (getBalance?.(b) || 0))
    case "transaction-latest":
      return sorted.sort((a, b) => (getTransactionCount?.(b) || 0) - (getTransactionCount?.(a) || 0))
    case "transaction-oldest":
      return sorted.sort((a, b) => (getTransactionCount?.(a) || 0) - (getTransactionCount?.(b) || 0))
    default:
      return sorted
  }
}
