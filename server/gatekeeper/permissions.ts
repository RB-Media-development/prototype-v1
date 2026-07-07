import { users } from '../config/users'

// Resolve a username to the box slugs they may query. This is the ONLY source
// of truth for access — the client never sends box slugs.
export function getAllowedBoxes(username: string): string[] {
  return users[username]?.boxes ?? []
}
