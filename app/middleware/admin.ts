// Middleware de rol: solo permite el acceso a usuarios con perfil "administrador".
// Requisito PDF #10: "Usuarios de perfil ejecutivo no pueden acceder a las
// funcionalidades exclusivas del perfil administrador."
// Uso: definePageMeta({ middleware: 'admin' })
export default defineNuxtRouteMiddleware(() => {
  const { user } = useUserSession()

  if (user.value?.perfilNombre !== 'administrador') {
    return navigateTo('/no-autorizado')
  }
})
