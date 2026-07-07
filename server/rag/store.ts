// In-memory vector index (v0). One process-wide singleton, populated at startup
// by ingest.ts. In v1 this is replaced by Qdrant (filter in query instead of
// post-filter in memory).

export interface Chunk {
  id: string
  box: string // folder name under data/boxes/ = the ACL slug
  filename: string
  path: string
  heading?: string
  text: string
  embedding: number[]
}

export interface ScoredChunk {
  chunk: Chunk
  score: number
}

interface Store {
  chunks: Chunk[]
  ready: boolean
  error: string | null
}

// Module-level singleton — survives across requests within one server process.
const store: Store = { chunks: [], ready: false, error: null }

export function getStore(): Store {
  return store
}

export function resetStore() {
  store.chunks = []
  store.ready = false
  store.error = null
}

function cosineSimilarity(a: number[], b: number[]): number {
  let dot = 0
  let normA = 0
  let normB = 0
  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i]
    normA += a[i] * a[i]
    normB += b[i] * b[i]
  }
  const denom = Math.sqrt(normA) * Math.sqrt(normB)
  return denom === 0 ? 0 : dot / denom
}

// ACL is enforced HERE: only chunks whose box is in allowedBoxes are ever
// considered. Chunks from other boxes cannot reach the prompt.
export function search(
  queryEmbedding: number[],
  allowedBoxes: string[],
  topK = 5,
): ScoredChunk[] {
  const allowed = new Set(allowedBoxes)
  return store.chunks
    .filter((c) => allowed.has(c.box))
    .map((chunk) => ({ chunk, score: cosineSimilarity(queryEmbedding, chunk.embedding) }))
    .sort((a, b) => b.score - a.score)
    .slice(0, topK)
}
