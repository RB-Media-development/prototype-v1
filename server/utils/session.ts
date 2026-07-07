import type { H3Event } from 'h3'

export interface SessionData {
  username?: string
}

// Sealed, httpOnly session cookie. Auto-imported across server code
// (files in server/utils are auto-imported by Nitro).
export function getAppSession(event: H3Event) {
  const config = useRuntimeConfig(event)
  return useSession<SessionData>(event, {
    password: config.sessionSecret,
    name: 'rbrain-session',
  })
}
