<template>
  <div class="p-8 max-w-2xl mx-auto space-y-6">
    <div class="flex items-center justify-between">
      <h1 class="text-2xl font-bold text-gray-900">Devolución de Arriendo N° {{ arriendo?.id }}</h1>
      <UButton :to="`/arriendos/${route.params.id}`" color="gray" variant="ghost" icon="i-heroicons-arrow-left" class="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md font-medium flex items-center transition-colors">
        Volver al detalle
      </UButton>
    </div>
 
    <UCard v-if="pending">
      <p class="text-gray-500">Cargando información del arriendo...</p>
    </UCard>
 
    <UCard v-else-if="!arriendo">
      <p class="text-red-600">Arriendo no encontrado.</p>
    </UCard>
 
    <UAlert
      v-else-if="arriendo.estado !== 'vigente'"
      color="amber"
      variant="soft"
      title="Este arriendo ya fue finalizado y no admite una nueva devolución."
    />
 
    <UCard v-else>
      <template #header>
        <h3 class="text-lg font-semibold text-gray-300">
          {{ arriendo.vehiculos?.marca }} {{ arriendo.vehiculos?.modelo }} ({{ arriendo.vehiculos?.patente }})
          &middot; Cliente: {{ arriendo.clientes?.nombres }} {{ arriendo.clientes?.apellidos }}
        </h3>
      </template>
 
      <form @submit.prevent="guardarDevolucion" class="space-y-4">
        <div>
          <label class="block text-sm font-medium text-gray-300 mb-1">Estado Final del Vehículo *</label>
          <select v-model="formulario.estado_vehiculo_final" class="w-full border border-gray-300 rounded-md px-3 py-2 bg-white text-gray-800 font-medium "required>
            <option value="disponible">Disponible (buen estado)</option>
            <option value="en_mantenimiento">En mantenimiento (requiere revisión)</option>
          </select>
        </div>
 
        <div>
          <label class="block text-sm font-medium text-gray-300 mb-1">Fotografía de Recepción *</label>
          <!-- Restricción PDF #11: usar el componente FileUpload de NuxtUI -->
          <UFileUpload
            v-model="archivoRecepcion"
            accept="image/*"
            icon="i-heroicons-camera"
            label="Subir foto de recepción"
            description="JPG, PNG (máx. 5MB)"
            class="w-full min-h-32"
          />
        </div>
 
        <UAlert v-if="errorMsg" color="red" variant="soft" :title="errorMsg" />
 
        <div class="flex justify-end gap-3 pt-4 border-t border-gray-200">
          <UButton to="/arriendos" color="gray" variant="ghost" class="bg-red-400 hover:bg-red-600 text-white px-4 py-2 rounded-md font-medium flex items-center transition-colors">Cancelar</UButton>
          <UButton type="submit" color="red" :loading="guardando" class="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md font-medium flex items-center transition-colors">Finalizar Arriendo</UButton>
        </div>
      </form>
    </UCard>
  </div>
</template>
 
<script setup>
import { reactive, ref } from 'vue'
 
const route = useRoute()
const { data: arriendo, pending } = await useFetch(`/api/arriendos/${route.params.id}`)
 
const guardando = ref(false)
const errorMsg = ref('')
const archivoRecepcion = ref(null)
 
const formulario = reactive({
  estado_vehiculo_final: 'disponible'
})
 
async function subirFoto(archivo) {
  const formData = new FormData()
  formData.append('file', archivo)
  const respuesta = await $fetch('/api/upload', { method: 'POST', body: formData })
  return respuesta.url
}
 
async function guardarDevolucion() {
  errorMsg.value = ''
 
  if (!archivoRecepcion.value) {
    errorMsg.value = 'Debe cargar la fotografía del estado actual del vehículo devuelto.'
    return
  }
 
  guardando.value = true
  try {
    const urlFoto = await subirFoto(archivoRecepcion.value)
 
    await $fetch(`/api/arriendos/${route.params.id}/devolucion`, {
      method: 'POST',
      body: {
        estado_vehiculo_final: formulario.estado_vehiculo_final,
        fotos_recepcion: [urlFoto]
      }
    })
 
    navigateTo(`/arriendos/${route.params.id}`)
  } catch (error) {
    errorMsg.value = error.data?.statusMessage || 'Ocurrió un error en la devolución.'
  } finally {
    guardando.value = false
  }
}
</script>

