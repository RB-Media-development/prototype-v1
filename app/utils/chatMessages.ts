export interface Source {
  ref: number
  box: string
  filename: string
  excerpt: string
}

export interface Turn {
  question: string
  answer: string
  sources: Source[]
}

export interface ChatMessage {
  id: string
  role: 'user' | 'assistant'
  parts: Array<{ type: 'text'; text: string }>
  metadata?: { sources: Source[] }
}

export function turnsToMessages(turns: Turn[]): ChatMessage[] {
  return turns.flatMap((turn, i) => [
    {
      id: `q-${i}`,
      role: 'user' as const,
      parts: [{ type: 'text' as const, text: turn.question }],
    },
    {
      id: `a-${i}`,
      role: 'assistant' as const,
      parts: [{ type: 'text' as const, text: turn.answer }],
      metadata: { sources: turn.sources },
    },
  ])
}
