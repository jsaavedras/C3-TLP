<template>
  <div class="p-8 max-w-5xl mx-auto">
    <div class="flex justify-between items-center mb-6">
      <h1 class="text-2xl font-bold text-gray-900">Tipos de Vehículos</h1>
      <UButton color="primary" icon="i-heroicons-plus" @click="abrirParaCrear" class="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md font-medium flex items-center transition-colors">Nuevo Tipo</UButton>
    </div>
 
    <UCard>
      <UTable :data="tipos || []" :columns="columnas" :loading="pending">
        <template #empty-state>
          <div class="flex flex-col items-center justify-center py-6 text-gray-500">
            <p>No hay tipos de vehículo registrados.</p>
          </div>
        </template>
 
        <template #valor_diario-cell="{ row }">
          <span class="font-medium text-gray-400">${{ row.original.valor_diario.toLocaleString('es-CL') }}</span>
        </template>
 
        <template #acciones-cell="{ row }">
          <div class="flex gap-3">
            <button @click="abrirParaEditar(row.original)" class="text-blue-600 hover:text-blue-800 font-medium text-sm">Editar</button>
            <button @click="solicitarEliminacion(row.original)" class="text-red-600 hover:text-red-800 font-medium text-sm">Eliminar</button>
          </div>
        </template>
      </UTable>
    </UCard>
 
    <div v-if="isModalOpen" class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div class="bg-white rounded-lg shadow-xl w-full max-w-lg overflow-hidden">
        <div class="flex justify-between items-center p-6 border-b border-gray-200">
          <h3 class="text-xl font-bold text-gray-800">{{ editandoId ? 'Editar Tipo' : 'Nuevo Tipo de Vehículo' }}</h3>
          <button type="button" @click="cerrarModal" class="text-gray-400 hover:text-red-500 text-2xl font-bold leading-none">×</button>
        </div>
 
        <form @submit.prevent="guardarTipo" class="p-6 space-y-4 text-black">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Nombre *</label>
            <input v-model="formulario.nombre" type="text" placeholder="Ej: Sedán, SUV, Moto..." class="w-full border border-gray-300 rounded-md px-3 py-2" required />
          </div>
 
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Descripción *</label>
            <textarea v-model="formulario.descripcion" rows="3" class="w-full border border-gray-300 rounded-md px-3 py-2" required></textarea>
          </div>
 
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Valor Diario ($) *</label>
            <input v-model.number="formulario.valor_diario" type="number" min="1" step="1" class="w-full border border-gray-300 rounded-md px-3 py-2" required />
          </div>
 
          <UAlert v-if="errorMsg" color="red" variant="soft" :title="errorMsg" />
 
          <div class="flex justify-end gap-3 mt-6 pt-4 border-t border-gray-200">
            <button type="button" @click="cerrarModal" class="px-4 py-2 bg-gray-200 text-gray-800 rounded-md font-medium">Cancelar</button>
            <button type="submit" :disabled="guardando" class="px-4 py-2 bg-blue-600 text-white rounded-md font-medium disabled:opacity-50">
              {{ guardando ? 'Guardando...' : 'Guardar' }}
            </button>
          </div>
        </form>
      </div>
    </div>
 
    <div v-if="mostrarConfirmacion" class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 transition-opacity">
      <div class="bg-white rounded-lg shadow-xl w-full max-w-md">
        <div class="p-6">
          <h3 class="text-lg font-bold text-gray-900 mb-2">Confirmar eliminación</h3>
          <p class="text-sm text-gray-600">
            ¿Estás seguro de que deseas eliminar el tipo
            <span class="font-semibold">{{ tipoAEliminar?.nombre }}</span>?
            Los vehículos asociados no se verán afectados.
          </p>
        </div>
        <div class="flex justify-end gap-3 px-6 py-4 border-t border-gray-200">
          <button
            type="button"
            @click="cancelarEliminacion"
            class="px-5 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 font-medium transition-colors"
          >
            Cancelar
          </button>
          <button
            type="button"
            @click="confirmarEliminacion"
            :disabled="eliminando"
            class="px-5 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 font-medium disabled:opacity-50 transition-colors"
          >
            {{ eliminando ? 'Eliminando...' : 'Eliminar' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
 
<script setup>
import { ref, reactive } from 'vue'
 
 
definePageMeta({ middleware: 'admin' })
 
const columnas = [
  { accessorKey: 'id', header: 'ID' },
  { accessorKey: 'nombre', header: 'Nombre' },
  { accessorKey: 'descripcion', header: 'Descripción' },
  { id: 'valor_diario', accessorKey: 'valor_diario', header: 'Valor Diario ($)' },
  { id: 'acciones', header: 'Acciones' }
]
 
const { data: tipos, pending, refresh } = await useFetch('/api/tipos')
 
const isModalOpen = ref(false)
const guardando = ref(false)
const editandoId = ref(null)
const errorMsg = ref('')
 
const mostrarConfirmacion = ref(false)
const tipoAEliminar = ref(null)
const eliminando = ref(false)
 
const estadoInicial = { nombre: '', descripcion: '', valor_diario: null }
const formulario = reactive({ ...estadoInicial })
 
function abrirParaCrear() {
  editandoId.value = null
  errorMsg.value = ''
  Object.assign(formulario, estadoInicial)
  isModalOpen.value = true
}
 
function abrirParaEditar(tipo) {
  editandoId.value = tipo.id
  errorMsg.value = ''
  Object.assign(formulario, tipo)
  isModalOpen.value = true
}
 
function cerrarModal() {
  isModalOpen.value = false
  editandoId.value = null
}
 
async function guardarTipo() {
  if (!formulario.nombre || !formulario.descripcion || !formulario.valor_diario || formulario.valor_diario <= 0) {
    errorMsg.value = 'Complete todos los campos. El valor diario debe ser mayor a cero.'
    return
  }
 
  guardando.value = true
  errorMsg.value = ''
  try {
    const endpoint = editandoId.value ? `/api/tipos/${editandoId.value}` : '/api/tipos'
    const method = editandoId.value ? 'PUT' : 'POST'
    await $fetch(endpoint, { method, body: formulario })
    cerrarModal()
    await refresh()
  } catch (error) {
    errorMsg.value = error.data?.statusMessage || 'Error al guardar el tipo de vehículo'
  } finally {
    guardando.value = false
  }
}
 
function solicitarEliminacion(tipo) {
  tipoAEliminar.value = tipo
  mostrarConfirmacion.value = true
}
 
function cancelarEliminacion() {
  mostrarConfirmacion.value = false
  tipoAEliminar.value = null
}
 
async function confirmarEliminacion() {
  if (!tipoAEliminar.value) return
  eliminando.value = true
  try {
    await $fetch(`/api/tipos/${tipoAEliminar.value.id}`, { method: 'DELETE' })
    mostrarConfirmacion.value = false
    tipoAEliminar.value = null
    await refresh()
  } catch (error) {
    alert(error.data?.statusMessage || 'No se pudo eliminar el tipo')
  } finally {
    eliminando.value = false
  }
}
</script>
