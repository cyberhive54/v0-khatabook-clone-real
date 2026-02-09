import { getHighlightParts } from "@/lib/search-utils"

interface HighlightedTextProps {
  text: string
  query: string
  className?: string
}

export function HighlightedText({ text, query, className = "" }: HighlightedTextProps) {
  const parts = getHighlightParts(text, query)

  return (
    <span className={className}>
      {parts.map((part, idx) =>
        part.isMatch ? (
          <span key={idx} className="bg-yellow-200 dark:bg-yellow-900 font-semibold">
            {part.text}
          </span>
        ) : (
          <span key={idx}>{part.text}</span>
        )
      )}
    </span>
  )
}
