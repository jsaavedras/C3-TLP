<template>
  <div class="p-6 max-w-7xl mx-auto">
    <div class="flex justify-between items-center mb-6">
      <h1 class="text-2xl font-bold text-gray-900">Directorio de Clientes</h1>
      
      <button 
        @click="abrirParaCrear"
        class="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md font-medium flex items-center transition-colors"
      >
        Nuevo Cliente
      </button>
    </div>
 
    <UCard>
      <UTable 
        :data="clientes || []" 
        :columns="columnas"
        :loading="pending"
      >
        <template #empty-state>
          <div class="flex flex-col items-center justify-center py-6 text-gray-500">
            <p>No hay clientes activos en la base de datos.</p>
          </div>
        </template>
        
        <template #acciones-cell="{ row }">
          <div class="flex gap-3">
            <NuxtLink :to="`/clientes/${row.original.id}`" class="text-green-700 hover:text-gray-900 font-medium">Ver</NuxtLink>
            <button @click="abrirParaEditar(row.original)" class="text-blue-600 hover:text-blue-800 font-medium">Editar</button>
            <button
              @click="solicitarEliminacion(row.original)"
              :disabled="tieneArriendosActivos(row.original)"
              :title="tieneArriendosActivos(row.original) ? 'No se puede eliminar un cliente con arriendos no finalizados' : ''"
              class="font-medium"
              :class="tieneArriendosActivos(row.original)
                ? 'text-gray-400 cursor-not-allowed'
                : 'text-red-600 hover:text-red-800'"
            >
              Eliminar
            </button>
          </div>
        </template>
      </UTable>
    </UCard>
 
    <div v-if="isModalOpen" class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 transition-opacity">
      <div class="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        
        <div class="flex justify-between items-center p-6 border-b border-gray-200">
          <h3 class="text-xl font-bold text-gray-800">
            {{ editandoId ? 'Editar Cliente' : 'Registrar Nuevo Cliente' }}
          </h3>
          <button @click="cerrarModal" class="text-gray-400 hover:text-red-500 text-3xl leading-none">&times;</button>
        </div>
 
        <form @submit.prevent="guardarCliente" class="p-6 space-y-5 text-black">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">RUT *</label>
            <input v-model="formulario.rut" type="text" placeholder="Ej: 12345678-9" class="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" required />
          </div>
          
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Nombres *</label>
              <input v-model="formulario.nombres" type="text" class="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" required />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Apellidos *</label>
              <input v-model="formulario.apellidos" type="text" class="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" required />
            </div>
          </div>
 
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Correo Electrónico *</label>
            <input v-model="formulario.email" type="email" placeholder="correo@ejemplo.com" class="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" required />
          </div>
 
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Teléfono *</label>
              <input v-model="formulario.telefono" type="text" class="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" required />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Licencia de Conducir *</label>
              <input v-model="formulario.licencia_conducir" type="text" class="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" required />
            </div>
          </div>
 
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Dirección *</label>
            <input v-model="formulario.direccion" type="text" class="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" required />
          </div>
 
          <div class="flex justify-end gap-3 mt-8 pt-4 border-t border-gray-200">
            <button type="button" @click="cerrarModal" class="px-5 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 font-medium transition-colors">Cancelar</button>
            <button type="submit" :disabled="guardando" class="px-5 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 font-medium disabled:opacity-50 transition-colors">
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
            ¿Estás seguro de que deseas eliminar a
            <span class="font-semibold">{{ clienteAEliminar?.nombres }} {{ clienteAEliminar?.apellidos }}</span>?
            El historial de arriendos seguirá en el sistema.
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
 
    <div v-if="mostrarExito" class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 transition-opacity">
      <div class="bg-white rounded-lg shadow-xl w-full max-w-md">
        <div class="p-6">
          <h3 class="text-lg font-bold text-gray-900 mb-2">Cliente registrado</h3>
          <p class="text-sm text-gray-600">
            <span class="font-semibold">{{ nombreClienteCreado }}</span> fue registrado exitosamente en el sistema.
          </p>
        </div>
        <div class="flex justify-end gap-3 px-6 py-4 border-t border-gray-200">
          <button
            type="button"
            @click="mostrarExito = false"
            class="px-5 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 font-medium transition-colors"
          >
            Aceptar
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
 
<script setup>
import { ref, reactive } from 'vue'
 
const isModalOpen = ref(false)
const guardando = ref(false)
const editandoId = ref(null)
 
const mostrarConfirmacion = ref(false)
const clienteAEliminar = ref(null)
const eliminando = ref(false)
 
const mostrarExito = ref(false)
const nombreClienteCreado = ref('')
 
const columnas = [
  { id: 'rut', accessorKey: 'rut', header: 'RUT' },
  { id: 'nombres', accessorKey: 'nombres', header: 'Nombres' },
  { id: 'apellidos', accessorKey: 'apellidos', header: 'Apellidos' },
  { id: 'email', accessorKey: 'email', header: 'Correo' },
  { id: 'telefono', accessorKey: 'telefono', header: 'Teléfono' },
  { id: 'licencia_conducir', accessorKey: 'licencia_conducir', header: 'Licencia' },
  { id: 'direccion', accessorKey: 'direccion', header: 'Dirección' },
  { id: 'acciones', header: 'Acciones' }
]
 
const { data: clientes, pending, refresh } = await useFetch('/api/clientes')
 
const estadoInicial = {
  rut: '',
  nombres: '',
  apellidos: '',
  email: '',
  telefono: '',
  direccion: '',
  licencia_conducir: ''
}
 
const formulario = reactive({ ...estadoInicial })
 
function abrirParaCrear() {
  editandoId.value = null
  Object.assign(formulario, estadoInicial)
  isModalOpen.value = true
}
 
function abrirParaEditar(cliente) {
  editandoId.value = cliente.id
  Object.assign(formulario, cliente)
  isModalOpen.value = true
}
 
function cerrarModal() {
  isModalOpen.value = false
  Object.assign(formulario, estadoInicial)
  editandoId.value = null
}
 
async function guardarCliente() {
  if (!formulario.rut || !formulario.nombres || !formulario.apellidos || !formulario.email || !formulario.telefono || !formulario.direccion || !formulario.licencia_conducir) {
    alert('Por favor complete todos los campos obligatorios.')
    return
  }
 
  guardando.value = true
  try {
    const endpoint = editandoId.value ? `/api/clientes/${editandoId.value}` : '/api/clientes'
    const method = editandoId.value ? 'PUT' : 'POST'
 
    await $fetch(endpoint, {
      method: method,
      body: formulario
    })
    
    if (editandoId.value) {
      alert('Cliente actualizado correctamente.')
    } else {
      nombreClienteCreado.value = `${formulario.nombres} ${formulario.apellidos}`
      mostrarExito.value = true
    }
    cerrarModal()
    await refresh()
    
  } catch (error) {
    console.error(error)
    alert(error.data?.statusMessage || 'Hubo un error al procesar la solicitud.')
  } finally {
    guardando.value = false
  }
}
 
function tieneArriendosActivos(cliente) {
  return Array.isArray(cliente.arriendos) && cliente.arriendos.length > 0
}
 
function solicitarEliminacion(cliente) {
  if (tieneArriendosActivos(cliente)) return
  clienteAEliminar.value = cliente
  mostrarConfirmacion.value = true
}
 
function cancelarEliminacion() {
  mostrarConfirmacion.value = false
  clienteAEliminar.value = null
}
 
async function confirmarEliminacion() {
  if (!clienteAEliminar.value) return
  eliminando.value = true
  try {
    await $fetch(`/api/clientes/${clienteAEliminar.value.id}`, { method: 'DELETE' })
    mostrarConfirmacion.value = false
    clienteAEliminar.value = null
    await refresh()
  } catch (error) {
    alert(error.data?.statusMessage || 'No se pudo desactivar el cliente.')
  } finally {
    eliminando.value = false
  }
}
</script>

