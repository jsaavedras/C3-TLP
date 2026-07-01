<template>
  <div class="p-8 max-w-4xl mx-auto space-y-6">
    <div class="flex items-center justify-between">
      <h1 class="text-2xl font-bold text-gray-900">
        Detalle del Arriendo N° {{ arriendo?.id }}
      </h1>
      <UButton to="/arriendos" color="gray" variant="ghost" icon="i-heroicons-arrow-left" class="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md font-medium flex items-center transition-colors">
        Volver al listado
      </UButton>
    </div>

    <UCard v-if="pending">
      <p class="text-gray-500">Cargando información del arriendo...</p>
    </UCard>

    <template v-else-if="arriendo">
      <UCard>
        <div class="grid grid-cols-2 gap-4 text-sm text-gray-400">
          <div>
            <strong>Cliente:</strong>
            <NuxtLink :to="`/clientes/${arriendo.cliente_id}`" class="text-gray-300 hover:underline ml-1">
              {{ arriendo.clientes?.nombres }} {{ arriendo.clientes?.apellidos }}
            </NuxtLink>
          </div>
          <div><strong>Vehículo:</strong> {{ arriendo.vehiculos?.marca }} {{ arriendo.vehiculos?.modelo }} ({{ arriendo.vehiculos?.patente }})</div>
          <div><strong>Fecha de Inicio:</strong> {{ formatearFecha(arriendo.fecha_inicio) }}</div>
          <div><strong>Fecha de Término:</strong> {{ formatearFecha(arriendo.fecha_termino) }}</div>
          <div><strong>Días de arriendo:</strong> {{ arriendo.dias_arriendo }}</div>
          <div><strong>Valor diario aplicado:</strong> ${{ arriendo.valor_diario_aplicado.toLocaleString('es-CL') }}</div>
          <div><strong>Valor total:</strong> ${{ arriendo.valor_total.toLocaleString('es-CL') }}</div>
          <div>
            <strong>Estado:</strong>
            <UBadge :color="arriendo.estado === 'vigente' ? 'green' : 'gray'" variant="subtle" class="ml-1">
              {{ arriendo.estado.toUpperCase() }}
            </UBadge>
          </div>
          <div><strong>Atendido por:</strong> {{ arriendo.usuarios?.nombres }} {{ arriendo.usuarios?.apellidos }}</div>
          <div><strong>Fecha/hora de entrega:</strong> {{ formatearFechaHora(arriendo.fecha_hora_entrega) }}</div>
          <div v-if="arriendo.fecha_hora_recepcion">
            <strong>Fecha/hora de recepción:</strong> {{ formatearFechaHora(arriendo.fecha_hora_recepcion) }}
          </div>
        </div>
      </UCard>

      <UCard>
        <template #header>
          <h3 class="text-lg font-semibold text-gray-400">Fotografías de Entrega</h3>
        </template>
        <div v-if="fotosEntrega.length" class="grid grid-cols-2 sm:grid-cols-3 gap-3">
          <img v-for="(img, idx) in fotosEntrega" :key="idx" :src="img" alt="Foto de entrega" class="w-full h-40 object-cover rounded-md border border-gray-200" />
        </div>
        <p v-else class="text-gray-400 italic">No se registraron fotografías de entrega.</p>
      </UCard>

      <UCard>
        <template #header>
          <h3 class="text-lg font-semibold text-gray-400">Fotografías de Recepción</h3>
        </template>
        <div v-if="fotosRecepcion.length" class="grid grid-cols-2 sm:grid-cols-3 gap-3">
          <img v-for="(img, idx) in fotosRecepcion" :key="idx" :src="img" alt="Foto de recepción" class="w-full h-40 object-cover rounded-md border border-gray-200" />
        </div>
        <div v-else class="bg-amber-50 border border-amber-200 p-3 rounded text-amber-800 italic">
          El vehículo aún no ha sido devuelto.
        </div>
      </UCard>

      <div v-if="arriendo.estado === 'vigente'" class="flex justify-end">
        <UButton :to="`/arriendos/${arriendo.id}/devolucion`" color="red" icon="i-heroicons-arrow-uturn-left" class="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md font-medium flex items-center transition-colors">
          Registrar Devolución
        </UButton>
      </div>
    </template>
  </div>
</template>

<script setup>
const route = useRoute()
const { data: arriendo, pending } = await useFetch(`/api/arriendos/${route.params.id}`)

function parseFotos(campo) {
  if (!campo) return []
  if (Array.isArray(campo)) return campo
  try {
    const parsed = JSON.parse(campo)
    return Array.isArray(parsed) ? parsed : [parsed]
  } catch {
    return [campo]
  }
}

const fotosEntrega = computed(() => parseFotos(arriendo.value?.fotos_entrega))
const fotosRecepcion = computed(() => parseFotos(arriendo.value?.fotos_recepcion))

function formatearFecha(fecha) {
  return new Date(fecha).toLocaleDateString('es-CL')
}
function formatearFechaHora(fecha) {
  return new Date(fecha).toLocaleString('es-CL')
}
</script>
