import { chat } from '../gatekeeper/chat'

// Thin wrapper: authenticate from session, delegate to the gatekeeper.
// The client sends only the question — never a username or box slug.
export default defineEventHandler(async (event) => {
  const session = await getAppSession(event)
  const username = session.data.username
  if (!username) {
    throw createError({ statusCode: 401, statusMessage: 'Niet ingelogd' })
  }

  const body = await readBody<{ question?: string }>(event)
  const question = body?.question?.trim()
  if (!question) {
    throw createError({ statusCode: 400, statusMessage: 'Vraag ontbreekt' })
  }

  return await chat(username, question)
})
