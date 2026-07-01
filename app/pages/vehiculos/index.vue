<template>
  <div class="p-8 max-w-7xl mx-auto">
    <div class="flex justify-between items-center mb-6">
      <h1 class="text-2xl font-bold text-gray-900">Directorio de Vehículos</h1>
 
      <button
        v-if="esAdmin"
        @click="abrirParaCrear"
        class="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md font-medium flex items-center transition-colors"
      >
        Nuevo Vehículo
      </button>
    </div>
 
    <UCard>
      <UTable
        :data="filasVehiculos"
        :columns="columnas"
        :loading="pending"
      >
        <template #empty-state>
          <div class="flex flex-col items-center justify-center py-6 text-gray-500">
            <p>No hay vehículos registrados en la base de datos.</p>
          </div>
        </template>
 
        <template #estado-cell="{ row }">
          <select
            :value="row.original.estado"
            :disabled="row.original.estado === 'arrendado'"
            class="text-xs font-semibold rounded px-2 py-1 border"
            :class="colorPorEstadoSelect(row.original.estado)"
            @change="cambiarEstado(row.original, $event.target.value)"
          >
            <option value="disponible">DISPONIBLE</option>
            <option value="en_mantenimiento">EN MANTENIMIENTO</option>
            <option value="de_baja">DE BAJA</option>
            <option value="arrendado" disabled>ARRENDADO</option>
          </select>
        </template>
 
        <template #foto_url-cell="{ row }">
          <a v-if="row.original.foto_url" :href="row.original.foto_url" target="_blank" class="text-blue-500 hover:underline text-sm">
            Ver foto
          </a>
          <span v-else class="text-gray-400 text-sm">Sin imagen</span>
        </template>
 
        <template #acciones-cell="{ row }">
          <div v-if="esAdmin" class="flex gap-3">
            <button @click="abrirParaEditar(row.original)" class="text-blue-600 hover:text-blue-800 font-medium text-sm">Editar</button>
            <button
              @click="solicitarEliminacion(row.original)"
              :disabled="row.original.estado === 'arrendado'"
              :title="row.original.estado === 'arrendado' ? 'No se puede eliminar un vehículo arrendado' : ''"
              class="font-medium text-sm"
              :class="row.original.estado === 'arrendado'
                ? 'text-gray-400 cursor-not-allowed'
                : 'text-red-600 hover:text-red-800'"
            >
              Eliminar
            </button>
          </div>
          <div v-else class="text-gray-400 text-xs">Sin permisos de edición</div>
        </template>
      </UTable>
    </UCard>
 
    <div v-if="isModalOpen && esAdmin" class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 transition-opacity">
      <div class="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
 
        <div class="flex justify-between items-center p-6 border-b border-gray-200">
          <h3 class="text-xl font-bold text-gray-800">
            {{ editandoId ? 'Editar Vehículo' : 'Registrar Nuevo Vehículo' }}
          </h3>
          <button type="button" @click="cerrarModal" class="text-gray-400 hover:text-red-500 text-2xl font-bold leading-none">X</button>
        </div>
 
        <form @submit.prevent="guardarVehiculo" class="p-6 space-y-4 text-black">
 
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Patente *</label>
              <input v-model="formulario.patente" type="text" placeholder="Ej: AB1234" class="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 uppercase" required />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Tipo de Vehículo *</label>
              <select v-model="formulario.tipo_id" class="w-full border border-gray-300 rounded-md px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500" required>
                <option value="" disabled>-- Seleccione el tipo --</option>
                <option v-for="t in listaTipos" :key="t.id" :value="t.id">
                  {{ t.nombre }}
                </option>
              </select>
            </div>
          </div>
 
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Marca *</label>
              <input v-model="formulario.marca" type="text" class="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" required />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Modelo *</label>
              <input v-model="formulario.modelo" type="text" class="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" required />
            </div>
          </div>
 
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Año *</label>
              <input v-model.number="formulario.anio" type="number" min="1990" max="2030" class="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" required />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Color *</label>
              <input v-model="formulario.color" type="text" class="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" required />
            </div>
          </div>
 
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">
              Fotografía del Vehículo {{ editandoId ? '(opcional, deja vacío para mantener la actual)' : '*' }}
            </label>
            <UFileUpload
              v-model="archivoFoto"
              accept="image/*"
              icon="i-heroicons-photo"
              label="Arrastra o haz clic para subir la foto"
              description="JPG, PNG o GIF (máx. 5MB)"
              class="w-full min-h-32"
            />
            <a v-if="editandoId && formulario.foto_url && !archivoFoto" :href="formulario.foto_url" target="_blank" class="text-xs text-blue-500 hover:underline mt-1 inline-block">
              Ver fotografía actual
            </a>
          </div>
 
          <UAlert v-if="errorMsg" color="red" variant="soft" :title="errorMsg" />
 
          <div class="flex justify-end gap-3 mt-8 pt-4 border-t border-gray-200">
            <button type="button" @click="cerrarModal" class="px-5 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 font-medium">Cancelar</button>
            <button type="submit" :disabled="guardando" class="px-5 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 font-medium disabled:opacity-50">
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
            ¿Estás seguro de que deseas eliminar el vehículo
            <span class="font-semibold">{{ vehiculoAEliminar?.patente }} ({{ vehiculoAEliminar?.marca }} {{ vehiculoAEliminar?.modelo }})</span>?
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
import { ref, computed, reactive } from 'vue'
 
const { user } = useUserSession()
const esAdmin = computed(() => user.value?.perfilNombre === 'administrador')
 
const isModalOpen = ref(false)
const guardando = ref(false)
const editandoId = ref(null)
const errorMsg = ref('')
const archivoFoto = ref(null)
 
const mostrarConfirmacion = ref(false)
const vehiculoAEliminar = ref(null)
const eliminando = ref(false)
 
const columnas = [
  { id: 'patente', accessorKey: 'patente', header: 'Patente' },
  { id: 'tipo_nombre', accessorKey: 'tipo_nombre', header: 'Tipo' },
  { id: 'marca', accessorKey: 'marca', header: 'Marca' },
  { id: 'modelo', accessorKey: 'modelo', header: 'Modelo' },
  { id: 'anio', accessorKey: 'anio', header: 'Año' },
  { id: 'color', accessorKey: 'color', header: 'Color' },
  { id: 'estado', accessorKey: 'estado', header: 'Estado' },
  { id: 'foto_url', accessorKey: 'foto_url', header: 'Fotografía' },
  { id: 'acciones', header: 'Acciones' }
]
 
const { data: vehiculos, pending, refresh } = await useFetch('/api/vehiculos')
const { data: listaTipos } = await useFetch('/api/tipos')
 
const filasVehiculos = computed(() => {
  if (!vehiculos.value) return []
  return vehiculos.value.map(v => ({
    ...v,
    tipo_nombre: v.tipos_vehiculo ? v.tipos_vehiculo.nombre : 'Sin tipo'
  }))
})
 
function colorPorEstadoSelect(estado) {
  const colores = {
    disponible: 'bg-green-100 text-green-800 border-green-300',
    arrendado: 'bg-blue-100 text-blue-800 border-blue-300',
    en_mantenimiento: 'bg-orange-100 text-orange-800 border-orange-300',
    de_baja: 'bg-red-100 text-red-800 border-red-300'
  }
  return colores[estado] || 'bg-gray-100 text-gray-800 border-gray-300'
}
 
async function cambiarEstado(vehiculo, nuevoEstado) {
  if (nuevoEstado === vehiculo.estado) return
  try {
    await $fetch(`/api/vehiculos/${vehiculo.id}/estado`, {
      method: 'PATCH',
      body: { estado: nuevoEstado }
    })
    await refresh()
  } catch (error) {
    alert(error.data?.statusMessage || 'No se pudo cambiar el estado del vehículo')
    await refresh()
  }
}
 
const estadoInicial = {
  patente: '',
  marca: '',
  modelo: '',
  anio: new Date().getFullYear(),
  color: '',
  tipo_id: '',
  foto_url: ''
}
 
const formulario = reactive({ ...estadoInicial })
 
function abrirParaCrear() {
  editandoId.value = null
  errorMsg.value = ''
  archivoFoto.value = null
  Object.assign(formulario, estadoInicial)
  isModalOpen.value = true
}
 
function abrirParaEditar(vehiculo) {
  editandoId.value = vehiculo.id
  errorMsg.value = ''
  archivoFoto.value = null
  Object.assign(formulario, vehiculo)
  isModalOpen.value = true
}
 
function cerrarModal() {
  isModalOpen.value = false
  editandoId.value = null
}
 
async function subirFoto(archivo) {
  const formData = new FormData()
  formData.append('file', archivo)
  const respuesta = await $fetch('/api/upload', { method: 'POST', body: formData })
  return respuesta.url
}
 
async function guardarVehiculo() {
  if (!formulario.patente || !formulario.marca || !formulario.modelo || !formulario.anio || !formulario.color || !formulario.tipo_id) {
    errorMsg.value = 'Complete todos los campos obligatorios.'
    return
  }
  if (!editandoId.value && !archivoFoto.value) {
    errorMsg.value = 'Debe adjuntar una fotografía del vehículo.'
    return
  }
 
  guardando.value = true
  errorMsg.value = ''
  try {
    let foto_url = formulario.foto_url
    if (archivoFoto.value) {
      foto_url = await subirFoto(archivoFoto.value)
    }
 
    const endpoint = editandoId.value ? `/api/vehiculos/${editandoId.value}` : '/api/vehiculos'
    const method = editandoId.value ? 'PUT' : 'POST'
 
    await $fetch(endpoint, {
      method,
      body: { ...formulario, foto_url }
    })
 
    cerrarModal()
    await refresh()
 
  } catch (error) {
    console.error(error)
    errorMsg.value = error.data?.statusMessage || 'Hubo un error al procesar la solicitud.'
  } finally {
    guardando.value = false
  }
}
 
function solicitarEliminacion(vehiculo) {
  if (vehiculo.estado === 'arrendado') return
  vehiculoAEliminar.value = vehiculo
  mostrarConfirmacion.value = true
}
 
function cancelarEliminacion() {
  mostrarConfirmacion.value = false
  vehiculoAEliminar.value = null
}
 
async function confirmarEliminacion() {
  if (!vehiculoAEliminar.value) return
  eliminando.value = true
  try {
    await $fetch(`/api/vehiculos/${vehiculoAEliminar.value.id}`, { method: 'DELETE' })
    mostrarConfirmacion.value = false
    vehiculoAEliminar.value = null
    await refresh()
  } catch (error) {
    alert(error.data?.statusMessage || 'No se pudo eliminar el vehículo.')
  } finally {
    eliminando.value = false
  }
}
</script>
