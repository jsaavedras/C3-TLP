<template>
  <div class="p-8 max-w-5xl mx-auto space-y-6">
    <UAlert
      color="gray"
      variant="soft"
      icon="i-heroicons-check-circle"
      title="¡Sesión activa!"
      :ui="{ title: 'text-green-700' , icon: 'text-green-600'}"
    >
      <template #description>
      <span class="font-bold text-green-700">
        Hola {{ user?.nombres }},
        has ingresado correctamente como
        {{ user?.perfilNombre }}</span>.
      </template>
    </UAlert>
 
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      <UCard class="bg-gray-800 text-white p-4 rounded-md font-medium transition-colors">
        <div class="text-3xl font-bold">{{ resumen.vehiculosDisponibles }}</div>
        <div class="text-sm op-90">Vehículos disponibles</div>
      </UCard>
 
      <UCard class="bg-gray-800 text-white p-4 rounded-md font-medium transition-colors">
        <div class="text-3xl font-bold">{{ resumen.arriendosVigentes }}</div>
        <div class="text-sm op-90">Arriendos vigentes</div>
      </UCard>
 
      <UCard class="bg-gray-800 text-white p-4 rounded-md font-medium transition-colors">
        <div class="text-3xl font-bold">{{ resumen.totalClientes }}</div>
        <div class="text-sm op-90">Clientes registrados</div>
      </UCard>
    </div>
 
    <div class="border border-gray-200 rounded-md p-4">
      <h3 class="text-lg font-semibold text-green-700 mb-3">Accesos rápidos</h3>
      <div class="flex flex-wrap gap-3">
        <UButton to="/vehiculos" icon="i-heroicons-truck" color="primary" variant="solid" >Vehiculos</UButton>
        <UButton to="/clientes" icon="i-heroicons-users" color="primary" variant="solid">Clientes</UButton>
        <UButton to="/arriendos" icon="i-heroicons-document-text" color="primary" variant="solid">Arriendos</UButton>
        <UButton
          v-if="user?.perfilNombre === 'administrador'"
          to="/admin/usuarios"
          icon="i-heroicons-user-group"
          color="primary"
          variant="solid"
        >
          Usuarios del Sistema
        </UButton>
        <UButton
          v-if="user?.perfilNombre === 'administrador'"
          to="/admin/tipos"
          icon="i-heroicons-tag"
          color="primary"
          variant="solid"
        >
          Tipos de Vehículo
        </UButton>
      </div>
    </div>
  </div>
</template>
 
<script setup>
const { user } = useUserSession()
 
const { data: vehiculos } = await useFetch('/api/vehiculos')
const { data: arriendos } = await useFetch('/api/arriendos')
const { data: clientes } = await useFetch('/api/clientes')
 
const resumen = computed(() => ({
  vehiculosDisponibles: vehiculos.value?.filter(v => v.estado === 'disponible').length || 0,
  arriendosVigentes: arriendos.value?.filter(a => a.estado === 'vigente').length || 0,
  totalClientes: clientes.value?.length || 0
}))
</script>
