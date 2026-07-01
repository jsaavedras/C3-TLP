<template>
  <div class="min-h-screen bg-gray-50">
    <header v-if="loggedIn" class="bg-white border-b border-gray-200 sticky top-0 z-40">
      <div class="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between gap-4">
        <div class="flex items-center gap-6">
          <NuxtLink to="/" class="font-bold text-gray-900 text-lg whitespace-nowrap">
            RentaCar Central
          </NuxtLink>

          <nav class="hidden md:flex items-center gap-4 text-sm font-medium text-gray-600" >
            <NuxtLink to="/" class="hover:text-blue-600">Dashboard</NuxtLink>
            <NuxtLink to="/vehiculos" class="hover:text-blue-600">Vehículos</NuxtLink>
            <NuxtLink to="/clientes" class="hover:text-blue-600">Clientes</NuxtLink>
            <NuxtLink to="/arriendos" class="hover:text-blue-600">Arriendos</NuxtLink>
            <NuxtLink
              v-if="user?.perfilNombre === 'administrador'"
              to="/admin/usuarios"
              class="hover:text-blue-600"
            >
              Usuarios
            </NuxtLink>
            <NuxtLink
              v-if="user?.perfilNombre === 'administrador'"
              to="/admin/tipos"
              class="hover:text-blue-600"
            >
              Tipos de Vehículo
            </NuxtLink>
          </nav>
        </div>

        <div class="flex items-center gap-3">
          <NuxtLink to="/cuenta" class="text-sm text-right hover:opacity-80">
            <div class="font-medium text-gray-900">{{ user?.nombres }} {{ user?.apellidos }}</div>
            <div class="text-xs uppercase font-semibold text-blue-600">{{ user?.perfilNombre }}</div>
          </NuxtLink>
          <UButton color="gray" variant="ghost" icon="i-heroicons-arrow-left-on-rectangle" @click="cerrarSesion" class="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md font-medium flex items-center transition-colors"">
            Salir
          </UButton>
        </div>
      </div>
    </header>

    <NuxtPage />
  </div>
</template>

<script setup>
const { loggedIn, user, clear } = useUserSession()

async function cerrarSesion() {
  try {
    await $fetch('/api/auth/logout', { method: 'POST' })
  } finally {
    await clear()
    navigateTo('/login')
  }
}
</script>
