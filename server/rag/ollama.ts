// Thin client for the Ollama OpenAI-compatible endpoint on the GPU server.
// OLLAMA_BASE_URL already includes the trailing /v1, so we append the
// standard OpenAI paths (/embeddings, /chat/completions).

interface EmbeddingResponse {
  data: { embedding: number[] }[]
}

interface ChatMessage {
  role: 'system' | 'user' | 'assistant'
  content: string
}

interface ChatResponse {
  choices: { message: { content: string } }[]
}

export async function embed(text: string): Promise<number[]> {
  const config = useRuntimeConfig()
  const res = await $fetch<EmbeddingResponse>(`${config.ollamaBaseUrl}/embeddings`, {
    method: 'POST',
    body: { model: config.ollamaEmbedModel, input: text },
  })
  const embedding = res?.data?.[0]?.embedding
  if (!embedding) throw new Error('Ollama returned no embedding')
  return embedding
}

export async function chatCompletion(messages: ChatMessage[]): Promise<string> {
  const config = useRuntimeConfig()
  console.log(config.ollamaBaseUrl)
  const res = await $fetch<ChatResponse>(`${config.ollamaBaseUrl}/chat/completions`, {
    method: 'POST',
    body: {
      model: config.ollamaChatModel,
      messages,
      temperature: 0.1,
      "stream": false
    },
  })
  const content = res?.choices?.[0]?.message?.content
  if (!content) throw new Error('Ollama returned no completion')
  return content
}
