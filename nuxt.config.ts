// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-01',
  devtools: { enabled: false },

  vite: {
    server: {
      hmr: process.env.NUXT_VITE_HMR_HOST
        ? {
            protocol: 'ws',
            host: process.env.NUXT_VITE_HMR_HOST,
            clientPort: Number(process.env.NUXT_VITE_HMR_CLIENT_PORT || 80),
          }
        : undefined,
    },
  },

  // Server-only config. Values are read from .env at startup.
  // NB: these are NOT exposed to the client (not under `public`).
  runtimeConfig: {
    sessionSecret:
      process.env.SESSION_SECRET || 'dev-only-secret-change-me-please-32-plus-chars',
    ollamaBaseUrl: process.env.OLLAMA_BASE_URL || 'http://192.168.x.x:11434/v1',
    ollamaEmbedModel: process.env.OLLAMA_EMBED_MODEL || 'nomic-embed-text',
    ollamaChatModel: process.env.OLLAMA_CHAT_MODEL || 'llama3.1:8b',
  },
})
