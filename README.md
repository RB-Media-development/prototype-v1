# RBrain — Prototype (v0)

Minimaal werkend prototype van de kernflow:

> Gebruiker vraagt → gatekeeper checkt rechten → RAG uit `.md` files → AI-antwoord met bronvermelding

Nuxt 4 + Nitro gatekeeper, in-memory RAG, Ollama (OpenAI-compatible) op de GPU-server.
Geen database, geen Docker, geen persistente vector store — dat komt in v1.

## Aan de slag

```bash
pnpm install
cp .env.example .env      # vul OLLAMA_BASE_URL en SESSION_SECRET in
pnpm dev                  # → http://localhost:3000
```

Ollama moet bereikbaar zijn op `OLLAMA_BASE_URL` en de modellen
(`nomic-embed-text`, `llama3.1:8b`) moeten daar beschikbaar zijn. De index wordt
bij het opstarten gebouwd; zie de console voor `[rbrain] Index klaar: …`.

## Demo-gebruikers

Hardcoded in [`server/config/users.ts`](server/config/users.ts) (wachtwoord `demo`):

| Gebruiker | Toegang tot boxen |
| --------- | ----------------- |
| `alice`   | `hr`              |
| `bob`     | `engineering`     |
| `admin`   | `hr`, `engineering` |

## Kennisbanken = mappen

Elke submap in `data/boxes/` is een box; de mapnaam is de ACL-slug en de
bestandsnaam de bronvermelding.

```
data/boxes/
├── hr/onboarding.md
└── engineering/architecture.md
```

Bestanden toevoegen of wijzigen? Herstart de server om opnieuw te indexeren.

## Architectuur

- `server/plugins/ingest-on-start.ts` — bouwt de index bij boot
- `server/rag/` — Ollama-client (`ollama.ts`), chunking + embedden (`ingest.ts`),
  in-memory store + cosine search met ACL-filter (`store.ts`)
- `server/gatekeeper/` — `permissions.ts` (user → boxen), `retrieve.ts`
  (ACL-gefilterde retrieval), `chat.ts` (orchestrator + bronvermelding)
- `server/api/` — auth (`login`/`logout`/`me`) en `chat.post.ts`
- `app/` — login- en chatpagina, `useAuth` composable, global auth-middleware

**ACL-garantie:** de client stuurt nooit box-slugs mee. De gatekeeper leidt de
toegestane boxen af uit de sessie, en `store.search()` filtert daarop vóór de
similarity-ranking. Chunks uit andere boxen bereiken de prompt nooit.

## Wat volgt in v1

Postgres + Drizzle, Qdrant, Docker Compose, admin-UI, Obsidian-sync,
her-indexeren zonder restart, streaming antwoorden, rate limiting + audit log.
