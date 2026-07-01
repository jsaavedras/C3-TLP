<template>
  <div class="p-8 max-w-2xl mx-auto">
    <h1 class="text-2xl font-bold mb-6">Agregar Nuevo Vehículo</h1>

    <UCard>
      <form @submit.prevent="guardarVehiculo" class="space-y-4">
        
        <div class="grid grid-cols-2 gap-4">
          <UFormGroup label="Patente" required>
            <UInput v-model="formulario.patente" placeholder="AB1234" />
          </UFormGroup>
          <UFormGroup label="Tipo de Vehículo (ID)" required>
            <UInput v-model="formulario.tipo_id" type="number" />
          </UFormGroup>
          <UFormGroup label="Marca" required>
            <UInput v-model="formulario.marca" />
          </UFormGroup>
          <UFormGroup label="Modelo" required>
            <UInput v-model="formulario.modelo" />
          </UFormGroup>
          <UFormGroup label="Año" required>
            <UInput v-model="formulario.anio" type="number" />
          </UFormGroup>
          <UFormGroup label="Color" required>
            <UInput v-model="formulario.color" />
          </UFormGroup>
        </div>

        <UFormGroup label="Fotografía del Vehículo" required>
          <UInput 
            type="file" 
            accept="image/*" 
            icon="i-heroicons-photo" 
            @change="alSeleccionarArchivo" 
          />
        </UFormGroup>

        <UAlert v-if="errorMsg" color="red" variant="soft" :title="errorMsg" class="mt-4" />

        <div class="flex justify-end gap-3 mt-6">
          <UButton to="/vehiculos" color="gray" variant="ghost">Cancelar</UButton>
          <UButton type="submit" color="primary" :loading="cargando">Guardar Vehículo</UButton>
        </div>
      </form>
    </UCard>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'

const cargando = ref(false)
const errorMsg = ref('')
const archivoImagen = ref(null)

const formulario = reactive({
  patente: '',
  marca: '',
  modelo: '',
  anio: new Date().getFullYear(),
  color: '',
  tipo_id: 1
})

const alSeleccionarArchivo = (evento) => {
  archivoImagen.value = evento.target.files[0]
}

async function guardarVehiculo() {
  if (!archivoImagen.value) {
    errorMsg.value = 'Debes adjuntar una fotografía del vehículo.'
    return
  }

  cargando.value = true
  errorMsg.value = ''

  try {
    const formData = new FormData()
    formData.append('file', archivoImagen.value)

    const respuestaSubida = await $fetch('/api/upload', {
      method: 'POST',
      body: formData
    })

    await $fetch('/api/vehiculos', {
      method: 'POST',
      body: {
        patente: formulario.patente,
        marca: formulario.marca,
        modelo: formulario.modelo,
        anio: formulario.anio,
        color: formulario.color,
        tipo_id: formulario.tipo_id,
        foto_url: respuestaSubida.url
      }
    })

    navigateTo('/admin/vehiculos')
    
  } catch (error) {
    errorMsg.value = error.data?.statusMessage || 'Ocurrió un error al guardar el vehículo'
  } finally {
    cargando.value = false
  }
}
</script>