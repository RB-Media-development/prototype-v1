import { readdir, readFile } from 'node:fs/promises'
import { join } from 'node:path'
import { embed } from './ollama'
import { getStore, resetStore, type Chunk } from './store'

const BOXES_DIR = join(process.cwd(), 'data', 'boxes')
const MAX_WORDS_PER_CHUNK = 500

interface RawChunk {
  heading?: string
  text: string
}

// Split Markdown on headings. Sections longer than MAX_WORDS_PER_CHUNK are
// further split into word-bounded pieces so embeddings stay focused.
function chunkMarkdown(content: string): RawChunk[] {
  const lines = content.split('\n')
  const sections: RawChunk[] = []
  let heading: string | undefined
  let buffer: string[] = []

  const flush = () => {
    const text = buffer.join('\n').trim()
    if (text) sections.push({ heading, text })
    buffer = []
  }

  for (const line of lines) {
    if (/^#{1,6}\s/.test(line)) {
      flush()
      heading = line.replace(/^#{1,6}\s+/, '').trim()
      buffer.push(line)
    } else {
      buffer.push(line)
    }
  }
  flush()

  // Second pass: cap section length by word count.
  const result: RawChunk[] = []
  for (const section of sections) {
    const words = section.text.split(/\s+/)
    if (words.length <= MAX_WORDS_PER_CHUNK) {
      result.push(section)
      continue
    }
    for (let i = 0; i < words.length; i += MAX_WORDS_PER_CHUNK) {
      result.push({
        heading: section.heading,
        text: words.slice(i, i + MAX_WORDS_PER_CHUNK).join(' '),
      })
    }
  }
  return result
}

async function listMarkdownFiles(box: string): Promise<string[]> {
  const dir = join(BOXES_DIR, box)
  const entries = await readdir(dir, { withFileTypes: true })
  return entries
    .filter((e) => e.isFile() && e.name.endsWith('.md'))
    .map((e) => e.name)
}

// Scan data/boxes/<box>/*.md, chunk, embed, and fill the in-memory store.
// Throws on failure (e.g. Ollama unreachable); the caller decides how to react.
export async function ingest(): Promise<{ boxes: string[]; files: number; chunks: number }> {
  resetStore()
  const store = getStore()

  let boxes: string[]
  try {
    const entries = await readdir(BOXES_DIR, { withFileTypes: true })
    boxes = entries.filter((e) => e.isDirectory()).map((e) => e.name)
  } catch {
    throw new Error(`Kon data/boxes/ niet lezen op ${BOXES_DIR}`)
  }

  let fileCount = 0
  const chunks: Chunk[] = []

  for (const box of boxes) {
    const files = await listMarkdownFiles(box)
    for (const filename of files) {
      fileCount++
      const path = join('data', 'boxes', box, filename)
      const content = await readFile(join(BOXES_DIR, box, filename), 'utf-8')
      const rawChunks = chunkMarkdown(content)
      for (let i = 0; i < rawChunks.length; i++) {
        const raw = rawChunks[i]
        const embedding = await embed(raw.text)
        chunks.push({
          id: `${box}/${filename}#${i}`,
          box,
          filename,
          path,
          heading: raw.heading,
          text: raw.text,
          embedding,
        })
      }
    }
  }

  store.chunks = chunks
  store.ready = true
  store.error = null
  return { boxes, files: fileCount, chunks: chunks.length }
}
