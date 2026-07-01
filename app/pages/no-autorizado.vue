<template>
  <div class="min-h-screen flex items-center justify-center bg-gray-50 px-4">
    <UCard class="w-full max-w-md text-center">
      <div class="py-6">
        <UIcon name="i-heroicons-shield-exclamation" class="w-16 h-16 text-red-500 mx-auto mb-4" />
        <h1 class="text-2xl font-bold text-gray-900 mb-2">Acceso no autorizado</h1>
        <p class="text-gray-600 mb-6">
          Tu perfil <span class="font-semibold uppercase">{{ user?.perfilNombre }}</span>
          no tiene permiso para acceder a esta sección del sistema.
        </p>

        <div class="flex justify-center gap-3">
          <UButton to="/" color="primary">Volver al Dashboard</UButton>
          <UButton color="gray" variant="ghost" @click="cerrarSesion">Cerrar sesión</UButton>
        </div>
      </div>
    </UCard>
  </div>
</template>

<script setup>
const { user, clear } = useUserSession()

async function cerrarSesion() {
  try {
    await $fetch('/api/auth/logout', { method: 'POST' })
  } finally {
    await clear()
    navigateTo('/login')
  }
}
</script>
