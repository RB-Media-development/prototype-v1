// Redirect unauthenticated users to /login, and authenticated users away from
// /login. Runs on every navigation (SSR + client).
export default defineNuxtRouteMiddleware(async (to) => {
  const { user, loaded, refresh } = useAuth()

  // Resolve the session once per page load.
  if (!loaded.value) {
    await refresh()
  }

  const isLoginPage = to.path === '/login'

  if (!user.value && !isLoginPage) {
    return navigateTo('/login')
  }
  if (user.value && isLoginPage) {
    return navigateTo('/chat')
  }
})
