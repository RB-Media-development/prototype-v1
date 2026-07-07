// Hardcoded users for the prototype. In v1 this moves to Postgres + admin UI.
// `boxes` = the slugs (= folder names under data/boxes/) the user may query.
export interface UserRecord {
  password: string
  boxes: string[]
}

export const users: Record<string, UserRecord> = {
  alice: { password: 'demo', boxes: ['hr'] },
  bob: { password: 'demo', boxes: ['engineering'] },
  admin: { password: 'demo', boxes: ['hr', 'engineering'] },
}
