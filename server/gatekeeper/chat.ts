import { chatCompletion } from '../rag/ollama'
import { getStore, type ScoredChunk } from '../rag/store'
import { getAllowedBoxes } from './permissions'
import { retrieve } from './retrieve'

export interface Source {
  ref: number
  box: string
  filename: string
  excerpt: string
}

export interface ChatResult {
  answer: string
  sources: Source[]
}

function systemPrompt(username: string): string {
  return `Je bent een behulpzame assistent voor RB Media.
Je praat met de ingelogde gebruiker "${username}". Als de gebruiker "ik", "mij",
"mijn" of "me" gebruikt, bedoelt die zichzelf (${username}). Vragen als
"aan wie moet ik iets vragen?" gaan dus over ${username}.
Beantwoord de vraag ALLEEN op basis van de genummerde bronnen hieronder.
Citeer elke claim met de bijbehorende bron, bijvoorbeeld [1] of [2].
Staat het antwoord niet in de bronnen? Zeg dan expliciet dat je het niet weet.
Verzin niets en gebruik geen kennis buiten de bronnen.`
}

function buildSourcesBlock(chunks: ScoredChunk[]): string {
  return chunks
    .map((c, i) => {
      const heading = c.chunk.heading ? ` — ${c.chunk.heading}` : ''
      return `[${i + 1}] (${c.chunk.filename}${heading})\n${c.chunk.text}`
    })
    .join('\n\n')
}

function toSources(chunks: ScoredChunk[]): Source[] {
  return chunks.map((c, i) => ({
    ref: i + 1,
    box: c.chunk.box,
    filename: c.chunk.filename,
    excerpt: c.chunk.text.slice(0, 240).trim(),
  }))
}

// Orchestrator: rechten → retrieval (ACL-gefilterd) → LLM met bronvermelding.
export async function chat(username: string, question: string): Promise<ChatResult> {
  const store = getStore()
  if (!store.ready) {
    return {
      answer:
        'De kennisindex is nog niet beschikbaar. Controleer of Ollama bereikbaar is ' +
        'en herstart de server.',
      sources: [],
    }
  }

  const allowedBoxes = getAllowedBoxes(username)
  if (allowedBoxes.length === 0) {
    return { answer: 'Je hebt geen toegang tot kennisbanken.', sources: [] }
  }

  // Verrijk de zoekvraag met de username zodat vragen in de ik-vorm ("aan wie
  // moet ik iets vragen?") ook chunks vinden die de naam van de gebruiker
  // bevatten. Het LLM krijgt de originele vraag te zien.
  const retrievalQuery = `${question} (gebruiker: ${username})`
  const chunks = await retrieve(retrievalQuery, allowedBoxes)
  if (chunks.length === 0) {
    return { answer: 'Geen relevante bronnen gevonden.', sources: [] }
  }

  const userPrompt = `Vraag: ${question}\n\nBronnen:\n${buildSourcesBlock(chunks)}`
  const answer = await chatCompletion([
    { role: 'system', content: systemPrompt(username) },
    { role: 'user', content: userPrompt },
  ])

  return { answer: answer.trim(), sources: toSources(chunks) }
}
