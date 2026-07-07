import { ingest } from '../rag/ingest'
import { getStore } from '../rag/store'

// Build the in-memory index once, at Nitro startup. If Ollama is unreachable
// (e.g. the placeholder OLLAMA_BASE_URL is still set) we log a warning and let
// the app boot anyway — the chat endpoint reports the situation gracefully.
export default defineNitroPlugin(async () => {
  try {
    const result = await ingest()
    console.info(
      `[rbrain] Index klaar: ${result.chunks} chunks uit ${result.files} bestanden ` +
        `(boxen: ${result.boxes.join(', ')})`,
    )
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err)
    getStore().error = message
    console.warn(
      `[rbrain] Indexeren mislukt — is Ollama bereikbaar op OLLAMA_BASE_URL? ` +
        `Detail: ${message}`,
    )
  }
})
