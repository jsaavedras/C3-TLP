<template>
  <div class="p-8 max-w-7xl mx-auto">

    <div class="flex justify-between items-center mb-6">
      <h1 class="text-2xl font-bold text-gray-900">Gestión de Arriendos</h1>
      <UButton
        color="primary"
        icon="i-heroicons-document-plus"
        @click="abrirModalCrear"
        class="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md font-medium flex items-center transition-colors"
      >
        Registrar Arriendo
      </UButton>
    </div>

    <UCard>
      <UTable
        :data="filasArriendos"
        :columns="columnas"
        :loading="pending"
      >
        <template #empty-state>
          <div class="flex flex-col items-center justify-center py-6 text-gray-500">
            <p>No hay contratos de arriendo registrados en el sistema.</p>
          </div>
        </template>

        <template #estado-cell="{ row }">
          <UBadge
            :color="row.original.estado === 'vigente' ? 'green' : 'gray'"
            variant="subtle"
          >
            {{ row.original.estado.toUpperCase() }}
          </UBadge>
        </template>

        <template #valor_total-cell="{ row }">
          <span class="font-medium text-gray-400">
            ${{ row.original.valor_total.toLocaleString('es-CL') }}
          </span>
        </template>

        <template #acciones-cell="{ row }">
          <div class="flex gap-3 items-center">
            <NuxtLink
              :to="`/arriendos/${row.original.id}`"
              class="text-blue-600 hover:text-blue-800 font-medium text-sm"
            >
              Ver Detalle
            </NuxtLink>

            <NuxtLink
              v-if="row.original.estado === 'vigente'"
              :to="`/arriendos/${row.original.id}/devolucion`"
              class="text-red-600 hover:text-red-800 font-medium text-sm"
            >
              Registrar Devolución
            </NuxtLink>
            <span v-else class="text-xs text-gray-400">Finalizado</span>
          </div>
        </template>
      </UTable>
    </UCard>

    <div v-if="isModalOpen" class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div class="bg-white rounded-lg shadow-xl w-full max-w-lg overflow-hidden max-h-[90vh] overflow-y-auto">

        <div class="flex justify-between items-center p-6 border-b border-gray-200">
          <h3 class="text-xl font-bold text-gray-800">Registrar Contrato de Arriendo</h3>
          <button type="button" @click="cerrarModal" class="text-gray-400 hover:text-red-500 text-2xl font-bold leading-none">×</button>
        </div>

        <form @submit.prevent="guardarArriendo" class="p-6 space-y-4 text-black">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Seleccionar Cliente *</label>
            <select v-model="formulario.cliente_id" class="w-full border border-gray-300 rounded-md px-3 py-2 bg-white" required>
              <option value="" disabled>-- Seleccione un cliente --</option>
              <option v-for="c in listaClientes" :key="c.id" :value="c.id">
                {{ c.nombres }} {{ c.apellidos }} (RUT: {{ c.rut }})
              </option>
            </select>
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Seleccionar Vehículo Disponible *</label>
            <select v-model="formulario.vehiculo_id" class="w-full border border-gray-300 rounded-md px-3 py-2 bg-white" required>
              <option value="" disabled>-- Seleccione un vehículo disponible --</option>
              <option v-for="v in listaVehiculosDisponibles" :key="v.id" :value="v.id">
                {{ v.marca }} {{ v.modelo }} ({{ v.patente }})
              </option>
            </select>
          </div>

          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Fecha de Inicio *</label>
              <input v-model="formulario.fecha_inicio" :min="hoy" type="date" class="w-full border border-gray-300 rounded-md px-3 py-2" required />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Fecha de Término *</label>
              <input v-model="formulario.fecha_termino" :min="formulario.fecha_inicio || hoy" type="date" class="w-full border border-gray-300 rounded-md px-3 py-2" required />
            </div>
          </div>

          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Hora de Entrega *</label>
              <input v-model="formulario.hora_entrega" type="time" class="w-full border border-gray-300 rounded-md px-3 py-2" required />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Fotografía de Entrega *</label>
              <!-- Restricción PDF #11: usar el componente FileUpload de NuxtUI -->
              <UFileUpload
                v-model="archivoEntrega"
                accept="image/*"
                icon="i-heroicons-camera"
                label="Subir foto de entrega"
                description="JPG, PNG (máx. 5MB)"
                class="w-full min-h-24"
              />
            </div>
          </div>

          <div v-if="vehiculoSeleccionado" class="bg-blue-50 p-4 rounded-md border border-blue-200 text-sm text-slate-700">
            <div class="flex justify-between">
              <span>Valor Diario del Vehículo:</span>
              <span class="font-semibold">${{ valorDiario.toLocaleString('es-CL') }}</span>
            </div>
            <div class="flex justify-between text-base font-bold text-blue-700 pt-2 border-t border-blue-200 mt-1">
              <span>Costo Total Estimado ({{ formulario.dias_arriendo }} días):</span>
              <span>${{ costoTotal.toLocaleString('es-CL') }}</span>
            </div>
          </div>

          <UAlert v-if="errorMsg" color="red" variant="soft" :title="errorMsg" />

          <div class="flex justify-end gap-3 mt-6 pt-4 border-t border-gray-200">
            <button type="button" @click="cerrarModal" class="px-4 py-2 bg-gray-200 text-gray-800 rounded-md font-medium">Cancelar</button>
            <button type="submit" :disabled="guardando" class="px-4 py-2 bg-blue-600 text-white rounded-md font-medium disabled:opacity-50">
              {{ guardando ? 'Registrando...' : 'Confirmar Arriendo' }}
            </button>
          </div>
        </form>
      </div>
    </div>

  </div>
</template>

<script setup>
import { ref, computed, reactive, watch } from 'vue'

const isModalOpen = ref(false)
const guardando = ref(false)
const errorMsg = ref('')
const archivoEntrega = ref(null)

const estadoInicial = {
  cliente_id: '',
  vehiculo_id: '',
  fecha_inicio: '',
  fecha_termino: '',
  hora_entrega: '09:00',
  dias_arriendo: 1
}

const formulario = reactive({ ...estadoInicial })

const columnas = [
  { id: 'id', accessorKey: 'id', header: 'N°' },
  { id: 'cliente_nombre', accessorKey: 'cliente_nombre', header: 'Cliente' },
  { id: 'vehiculo_info', accessorKey: 'vehiculo_info', header: 'Vehículo (Patente)' },
  { id: 'fecha_inicio', accessorKey: 'fecha_inicio', header: 'Inicio' },
  { id: 'fecha_termino', accessorKey: 'fecha_termino', header: 'Término' },
  { id: 'valor_total', accessorKey: 'valor_total', header: 'Total' },
  { id: 'estado', accessorKey: 'estado', header: 'Estado' },
  { id: 'acciones', header: 'Acciones' }
]

const { data: arriendos, pending, refresh: refreshArriendos } = await useFetch('/api/arriendos')
const { data: listaClientes } = await useFetch('/api/clientes')
const { data: listaVehiculos, refresh: refreshVehiculos } = await useFetch('/api/vehiculos')

const hoy = computed(() => {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
})

const listaVehiculosDisponibles = computed(() => {
  if (!listaVehiculos.value) return []
  return listaVehiculos.value.filter(v => v.estado === 'disponible')
})

const filasArriendos = computed(() => {
  if (!arriendos.value) return []
  return arriendos.value.map(arr => ({
    ...arr,
    cliente_nombre: arr.clientes ? `${arr.clientes.nombres} ${arr.clientes.apellidos}` : 'No asignado',
    vehiculo_info: arr.vehiculos ? `${arr.vehiculos.marca} ${arr.vehiculos.modelo} (${arr.vehiculos.patente})` : 'No asignado',
    fecha_inicio: new Date(arr.fecha_inicio).toLocaleDateString('es-CL'),
    fecha_termino: new Date(arr.fecha_termino).toLocaleDateString('es-CL')
  }))
})

const vehiculoSeleccionado = computed(() => {
  if (!formulario.vehiculo_id || !listaVehiculos.value) return null
  return listaVehiculos.value.find(v => v.id === formulario.vehiculo_id)
})

const valorDiario = computed(() => {
  return vehiculoSeleccionado.value?.tipos_vehiculo?.valor_diario || 0
})

const costoTotal = computed(() => {
  return valorDiario.value * (formulario.dias_arriendo || 0)
})

watch(() => [formulario.fecha_inicio, formulario.fecha_termino], ([inicio, termino]) => {
  if (inicio && termino) {
    const f1 = new Date(inicio)
    const f2 = new Date(termino)
    const calculoDias = Math.ceil((f2 - f1) / (1000 * 60 * 60 * 24)) + 1
    formulario.dias_arriendo = calculoDias > 0 ? calculoDias : 1
  }
})

function abrirModalCrear() {
  errorMsg.value = ''
  archivoEntrega.value = null
  Object.assign(formulario, estadoInicial)
  formulario.fecha_inicio = hoy.value
  isModalOpen.value = true
}

function cerrarModal() {
  isModalOpen.value = false
}

async function subirFoto(archivo) {
  const formData = new FormData()
  formData.append('file', archivo)
  const respuesta = await $fetch('/api/upload', { method: 'POST', body: formData })
  return respuesta.url
}

async function guardarArriendo() {
  errorMsg.value = ''

  if (formulario.fecha_inicio < hoy.value) {
    errorMsg.value = 'La fecha de inicio no puede ser menor a la fecha actual.'
    return
  }
  if (formulario.fecha_termino < formulario.fecha_inicio) {
    errorMsg.value = 'La fecha de término no puede ser anterior a la fecha de inicio.'
    return
  }
  if (!archivoEntrega.value) {
    errorMsg.value = 'Es obligatorio adjuntar una fotografía del estado de entrega.'
    return
  }

  guardando.value = true
  try {
    const urlFoto = await subirFoto(archivoEntrega.value)

    await $fetch('/api/arriendos', {
      method: 'POST',
      body: {
        cliente_id: formulario.cliente_id,
        vehiculo_id: formulario.vehiculo_id,
        fecha_inicio: formulario.fecha_inicio,
        fecha_termino: formulario.fecha_termino,
        fecha_hora_entrega: `${formulario.fecha_inicio}T${formulario.hora_entrega}:00`,
        fotos_entrega: [urlFoto]
      }
    })

    cerrarModal()
    await refreshArriendos()
    await refreshVehiculos()
  } catch (error) {
    errorMsg.value = error.data?.statusMessage || 'Error al procesar el arriendo.'
  } finally {
    guardando.value = false
  }
}
</script>
