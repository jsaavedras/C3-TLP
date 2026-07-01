// Middleware global: exige sesión iniciada para usar el sistema.
// Requisito PDF #9: "Solo los usuarios autenticados podrán utilizar el sistema."
export default defineNuxtRouteMiddleware((to) => {
  const { loggedIn } = useUserSession()

  const rutasPublicas = ['/login']

  if (!loggedIn.value && !rutasPublicas.includes(to.path)) {
    return navigateTo('/login')
  }

  // Si ya inició sesión y trata de volver al login, lo enviamos al dashboard.
  if (loggedIn.value && to.path === '/login') {
    return navigateTo('/')
  }
})
