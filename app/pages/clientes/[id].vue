<template>
  <div class="p-8 max-w-5xl mx-auto space-y-6">
    <div class="flex items-center justify-between">
      <h1 class="text-2xl font-bold text-gray-900">Detalle de Cliente</h1>
      <UButton to="/clientes" color="gray" variant="ghost" icon="i-heroicons-arrow-left" class="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md font-medium flex items-center transition-colors">
        Volver al listado
      </UButton>
    </div>
 
    <div v-if="pending" class="border border-gray-200 rounded-md p-4">
      <p class="text-gray-500">Cargando información del cliente...</p>
    </div>
 
    <template v-else-if="cliente">
      <div class="border border-gray-200 rounded-md p-4">
        <h3 class="text-lg font-semibold text-gray-700 mb-3">Información personal</h3>
        <div class="grid grid-cols-2 gap-3 text-sm text-gray-700">
          <div><strong>RUT:</strong> {{ cliente.rut }}</div>
          <div><strong>Nombre:</strong> {{ cliente.nombres }} {{ cliente.apellidos }}</div>
          <div><strong>Correo:</strong> {{ cliente.email }}</div>
          <div><strong>Teléfono:</strong> {{ cliente.telefono }}</div>
          <div><strong>Dirección:</strong> {{ cliente.direccion }}</div>
          <div><strong>Licencia de conducir:</strong> {{ cliente.licencia_conducir }}</div>
        </div>
      </div>
 
      <div class="border border-gray-200 rounded-md p-4">
        <h3 class="text-lg font-semibold text-gray-700 mb-3">
          Arriendos vigentes ({{ arriendosVigentes.length }})
        </h3>
        <div v-if="!arriendosVigentes.length" class="text-gray-400 italic">
          Este cliente no tiene arriendos vigentes.
        </div>
        <ul v-else class="divide-y divide-gray-100">
          <li v-for="a in arriendosVigentes" :key="a.id" class="py-3 flex justify-between items-center text-sm text-gray-800">
            <div>
              <span class="font-medium">{{ a.vehiculos?.marca }} {{ a.vehiculos?.modelo }}</span>
              ({{ a.vehiculos?.patente }}) &middot; desde {{ formatearFecha(a.fecha_inicio) }} hasta {{ formatearFecha(a.fecha_termino) }}
            </div>
            <NuxtLink :to="`/arriendos/${a.id}`" class="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md font-medium flex items-center transition-colors">Ver detalle</NuxtLink>
          </li>
        </ul>
      </div>
 
      <div class="border border-gray-200 rounded-md p-4">
        <h3 class="text-lg font-semibold text-gray-700 mb-3">
          Arriendos históricos ({{ arriendosHistoricos.length }})
        </h3>
        <div v-if="!arriendosHistoricos.length" class="text-gray-400 italic">
          Este cliente no tiene arriendos finalizados.
        </div>
        <ul v-else class="divide-y divide-gray-100">
          <li v-for="a in arriendosHistoricos" :key="a.id" class="py-3 flex justify-between items-center text-sm text-gray-800">
            <div>
              <span class="font-medium">{{ a.vehiculos?.marca }} {{ a.vehiculos?.modelo }}</span>
              ({{ a.vehiculos?.patente }}) &middot; {{ formatearFecha(a.fecha_inicio) }} - {{ formatearFecha(a.fecha_termino) }}
              &middot; ${{ a.valor_total.toLocaleString('es-CL') }}
            </div>
            <NuxtLink :to="`/arriendos/${a.id}`" class="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md font-medium flex items-center transition-colors">Ver detalle</NuxtLink>
          </li>
        </ul>
      </div>
    </template>
  </div>
</template>
 
<script setup>
const route = useRoute()
const { data: cliente, pending } = await useFetch(`/api/clientes/${route.params.id}`)
 
const arriendosVigentes = computed(() => cliente.value?.arriendos?.filter(a => a.estado === 'vigente') || [])
const arriendosHistoricos = computed(() => cliente.value?.arriendos?.filter(a => a.estado === 'finalizado') || [])
 
function formatearFecha(fecha) {
  return new Date(fecha).toLocaleDateString('es-CL')
}
</script>
