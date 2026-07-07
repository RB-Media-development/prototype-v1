# Systeemarchitectuur

## Overzicht

Het platform bestaat uit een Nuxt-frontend, een Nitro-server als gatekeeper en
een RAG-laag die kennis uit Markdown-bestanden ontsluit. De AI-inferentie draait
op een dedicated GPU-server via Ollama.

## Gatekeeper

Alle chatverzoeken lopen via de gatekeeper. De gatekeeper bepaalt op basis van de
sessie tot welke kennisbanken (boxen) een gebruiker toegang heeft. De client
stuurt nooit zelf box-namen mee; de server leidt de rechten af uit de sessie.

## Retrieval

Bij een vraag wordt eerst een embedding van de vraag berekend. Vervolgens zoekt
het systeem de meest relevante chunks, gefilterd op de boxen waartoe de gebruiker
toegang heeft. Alleen die chunks belanden in de prompt.

## Inferentie

Antwoorden worden gegenereerd door een chatmodel op de GPU-server. Het model
krijgt uitsluitend de opgehaalde bronnen mee en wordt geïnstrueerd om claims te
onderbouwen met bronverwijzingen.
