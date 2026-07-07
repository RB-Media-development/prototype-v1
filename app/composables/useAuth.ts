export interface AuthUser {
  username: string
  boxes: string[]
}

export function useAuth() {
  const user = useState<AuthUser | null>('auth-user', () => null)
  const loaded = useState<boolean>('auth-loaded', () => false)

  // useRequestFetch forwards the session cookie during SSR; on the client it
  // is just $fetch.
  async function refresh() {
    const request = useRequestFetch()
    try {
      user.value = await request<AuthUser>('/api/auth/me')
    } catch {
      user.value = null
    }
    loaded.value = true
  }

  async function login(username: string, password: string) {
    user.value = await $fetch<AuthUser>('/api/auth/login', {
      method: 'POST',
      body: { username, password },
    })
    loaded.value = true
  }

  async function logout() {
    await $fetch('/api/auth/logout', { method: 'POST' })
    user.value = null
  }

  return { user, loaded, refresh, login, logout }
}
