import { users } from '../../config/users'
import { getAllowedBoxes } from '../../gatekeeper/permissions'

export default defineEventHandler(async (event) => {
  const body = await readBody<{ username?: string; password?: string }>(event)
  const username = body?.username?.trim()
  const password = body?.password

  if (!username || !password) {
    throw createError({ statusCode: 400, statusMessage: 'Gebruikersnaam en wachtwoord vereist' })
  }

  const record = users[username]
  if (!record || record.password !== password) {
    throw createError({ statusCode: 401, statusMessage: 'Ongeldige inloggegevens' })
  }

  const session = await getAppSession(event)
  await session.update({ username })

  return { username, boxes: getAllowedBoxes(username) }
})
