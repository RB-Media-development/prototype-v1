import { embed } from '../rag/ollama'
import { search, type ScoredChunk } from '../rag/store'

// Embed the question, then similarity-search the in-memory index restricted to
// the caller's allowed boxes. ACL enforcement lives in store.search().
export async function retrieve(
  question: string,
  allowedBoxes: string[],
  topK = 5,
): Promise<ScoredChunk[]> {
  const queryEmbedding = await embed(question)
  return search(queryEmbedding, allowedBoxes, topK)
}
