# AGENTS.md

## Cursor Cloud specific instructions

RBrain is a Nuxt 4 + Nitro prototype: login (`server/config/users.ts`, password `demo`)
→ ACL gatekeeper → in-memory RAG over `data/boxes/**/*.md` → answer with source
citations. It talks to an **Ollama** OpenAI-compatible endpoint for embeddings and
chat completions. There is no database and no Docker.

### Services

- **Nuxt dev server** — `pnpm dev` (http://localhost:3000). The RAG index is built
  once at Nitro startup; watch the log for `[rbrain] Index klaar: …`. Restart the
  server to re-index after editing files under `data/boxes/`.
- **Ollama** — the app requires a reachable OpenAI-compatible endpoint. In the cloud
  VM it runs locally: `ollama serve` (listens on `127.0.0.1:11434`). `.env` points
  `OLLAMA_BASE_URL` at `http://127.0.0.1:11434/v1`. Required models:
  `nomic-embed-text` and `llama3.1:8b` (pull with `ollama pull <model>`).
  systemd is not available, so start `ollama serve` manually (e.g. in a tmux session).

### Critical / non-obvious caveats

- **AMX backend segfaults.** This VM's CPU advertises Intel AMX, so Ollama picks the
  Sapphire Rapids CPU backend, which **segfaults during model warmup**
  (`llama-server process has terminated: signal: segmentation fault`). Fix: remove
  the AMX backend lib so ggml falls back to the AVX-512 (icelake) runner:
  `sudo mv /usr/local/lib/ollama/libggml-cpu-sapphirerapids.so /usr/local/lib/ollama/disabled/`.
  Embeddings still work with AMX present; only chat completions crash — so a built
  index alone does not prove chat works.
- **CPU-only inference is slow.** A single chat response with `llama3.1:8b` takes
  ~30s. This is expected, not a hang.
- The app boots even when Ollama is unreachable; the chat endpoint then returns a
  graceful "index not available" message instead of an answer. Always verify a real
  chat round-trip, not just server startup.

### Lint / test / build

- No lint or test scripts are configured (only `dev`, `build`, `preview`, `postinstall`
  in `package.json`).
- Production build: `pnpm build`; preview a built app with `pnpm preview`.
