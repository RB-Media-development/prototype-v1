import { getAllowedBoxes } from '../../gatekeeper/permissions'

export default defineEventHandler(async (event) => {
  const session = await getAppSession(event)
  const username = session.data.username
  if (!username) {
    throw createError({ statusCode: 401, statusMessage: 'Niet ingelogd' })
  }
  return { username, boxes: getAllowedBoxes(username) }
})
