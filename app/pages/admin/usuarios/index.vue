<template>
  <div class="p-8 max-w-6xl mx-auto space-y-6">
    <div class="flex justify-between items-center">
      <h1 class="text-2xl font-bold text-gray-900">Gestión de Usuarios</h1>
      <UButton color="primary" icon="i-heroicons-user-plus" @click="abrirParaCrear" class="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md font-medium flex items-center transition-colors">Nuevo Usuario</UButton>
    </div>
 
    <UCard>
      <div v-if="cargando" class="text-center py-12 text-gray-400">Cargando usuarios...</div>
 
      <div v-else class="overflow-x-auto">
        <table class="min-w-full divide-y divide-gray-200 text-left text-sm">
          <thead class="bg-gray-800 font-semibold text-gray-300 text-xs uppercase tracking-wider">
            <tr>
              <th class="p-4">RUT</th>
              <th class="p-4">Nombre Completo</th>
              <th class="p-4">Email</th>
              <th class="p-4">Rol / Perfil</th>
              <th class="p-4">Estado</th>
              <th class="p-4 text-right">Acciones</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-800">
            <tr v-for="usr in listaUsuarios" :key="usr.id">
              <td class="p-4 font-mono">{{ usr.rut }}</td>
              <td class="p-4 font-medium text-gray-300">{{ usr.nombres }} {{ usr.apellidos }}</td>
              <td class="p-4 text-gray-300">{{ usr.email }}</td>
              <td class="p-4">
                <span class="px-2 py-0.5 text-xs font-semibold rounded bg-blue-100 text-blue-800 uppercase">
                  {{ usr.perfiles?.nombre }}
                </span>
              </td>
              <td class="p-4">
                <span
                  class="px-2 py-0.5 text-xs font-semibold rounded"
                  :class="usr.activo ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'"
                >
                  {{ usr.activo ? 'Activo' : 'Inactivo' }}
                </span>
              </td>
              <td class="p-4 text-right">
                <div class="flex justify-end gap-3">
                  <button class="text-blue-600 hover:text-blue-800 font-medium text-sm" @click="abrirParaEditar(usr)">
                    Editar
                  </button>
                  <button
                    class="font-medium text-sm"
                    :class="[usr.activo ? 'text-red-600 hover:text-red-800' : 'text-green-600 hover:text-green-800', user?.id === usr.id ? 'opacity-30 cursor-not-allowed' : '']"
                    :disabled="user?.id === usr.id"
                    @click="cambiarEstadoUsuario(usr)"
                  >
                    {{ usr.activo ? 'Desactivar' : 'Activar' }}
                  </button>
                  <button
                    class="font-medium text-sm text-red-700 hover:text-red-900"
                    :class="{ 'opacity-30 cursor-not-allowed': user?.id === usr.id }"
                    :disabled="user?.id === usr.id"
                    :title="user?.id === usr.id ? 'No puedes eliminar tu propia cuenta' : 'Eliminar usuario permanentemente'"
                    @click="solicitarEliminacion(usr)"
                  >
                    Eliminar
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </UCard>
 
    <div v-if="isModalOpen" class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div class="bg-white rounded-lg shadow-xl w-full max-w-lg overflow-hidden">
        <div class="flex justify-between items-center p-6 border-b border-gray-200">
          <h3 class="text-xl font-bold text-gray-800">{{ editandoId ? 'Editar Usuario' : 'Nuevo Usuario' }}</h3>
          <button type="button" @click="cerrarModal" class="text-gray-400 hover:text-red-500 text-2xl font-bold leading-none">×</button>
        </div>
 
        <form @submit.prevent="guardarUsuario" class="p-6 space-y-4 text-black">
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">RUT *</label>
              <input v-model="formulario.rut" type="text" class="w-full border border-gray-300 rounded-md px-3 py-2" required />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Perfil *</label>
              <select
                v-model="formulario.perfil_id"
                class="w-full border border-gray-300 rounded-md px-3 py-2 bg-white disabled:bg-gray-100 disabled:text-gray-400"
                :disabled="editandoEsCuentaPropia"
                required
              >
                <option value="" disabled>-- Seleccione --</option>
                <option value="1">Administrador</option>
                <option value="2">Ejecutivo</option>
              </select>
              <p v-if="editandoEsCuentaPropia" class="text-xs text-gray-500 mt-1">
                No puedes cambiar el rol de tu propia cuenta.
              </p>
            </div>
          </div>
 
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Nombres *</label>
              <input v-model="formulario.nombres" type="text" class="w-full border border-gray-300 rounded-md px-3 py-2" required />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Apellidos *</label>
              <input v-model="formulario.apellidos" type="text" class="w-full border border-gray-300 rounded-md px-3 py-2" required />
            </div>
          </div>
 
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Correo Electrónico *</label>
            <input v-model="formulario.email" type="email" class="w-full border border-gray-300 rounded-md px-3 py-2" required />
          </div>
 
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">
              {{ editandoId ? 'Nueva Contraseña (dejar en blanco para no cambiar)' : 'Contraseña *' }}
            </label>
            <input v-model="formulario.password" type="password" minlength="6" class="w-full border border-gray-300 rounded-md px-3 py-2" :required="!editandoId" />
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
            ¿Estás seguro de que deseas eliminar permanentemente a
            <span class="font-semibold">{{ usuarioAEliminar?.nombres }} {{ usuarioAEliminar?.apellidos }}</span>?
            Esta acción no se puede deshacer.
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
import { ref, onMounted, reactive, computed } from 'vue'
 
definePageMeta({ middleware: 'admin' })
 
const { user } = useUserSession()
 
const listaUsuarios = ref([])
const cargando = ref(true)
 
const isModalOpen = ref(false)
const guardando = ref(false)
const editandoId = ref(null)
const errorMsg = ref('')
 
const mostrarConfirmacion = ref(false)
const usuarioAEliminar = ref(null)
const eliminando = ref(false)
 
const estadoInicial = { rut: '', nombres: '', apellidos: '', email: '', perfil_id: '', password: '' }
const formulario = reactive({ ...estadoInicial })
 
const editandoEsCuentaPropia = computed(() => editandoId.value !== null && editandoId.value === user.value?.id)
 
async function obtenerUsuarios() {
  cargando.value = true
  try {
    listaUsuarios.value = await $fetch('/api/usuarios')
  } catch (error) {
    console.error('Error al cargar usuarios:', error)
  } finally {
    cargando.value = false
  }
}
 
function abrirParaCrear() {
  editandoId.value = null
  errorMsg.value = ''
  Object.assign(formulario, estadoInicial)
  isModalOpen.value = true
}
 
function abrirParaEditar(usr) {
  editandoId.value = usr.id
  errorMsg.value = ''
  Object.assign(formulario, {
    rut: usr.rut,
    nombres: usr.nombres,
    apellidos: usr.apellidos,
    email: usr.email,
    perfil_id: usr.perfiles?.nombre === 'administrador' ? '1' : '2',
    password: ''
  })
  isModalOpen.value = true
}
 
function cerrarModal() {
  isModalOpen.value = false
  editandoId.value = null
}
 
async function guardarUsuario() {
  if (!formulario.rut || !formulario.nombres || !formulario.apellidos || !formulario.email || !formulario.perfil_id) {
    errorMsg.value = 'Complete todos los campos obligatorios.'
    return
  }
  if (!editandoId.value && !formulario.password) {
    errorMsg.value = 'La contraseña es obligatoria al crear un usuario.'
    return
  }
 
  if (editandoEsCuentaPropia.value) {
    formulario.perfil_id = '1'
  }
 
  guardando.value = true
  errorMsg.value = ''
  try {
    const endpoint = editandoId.value ? `/api/usuarios/${editandoId.value}` : '/api/usuarios'
    const method = editandoId.value ? 'PUT' : 'POST'
    const body = { ...formulario }
    if (editandoId.value && !body.password) delete body.password
 
    await $fetch(endpoint, { method, body })
    cerrarModal()
    await obtenerUsuarios()
  } catch (error) {
    errorMsg.value = error.data?.statusMessage || 'Error al guardar el usuario'
  } finally {
    guardando.value = false
  }
}
 
async function cambiarEstadoUsuario(usr) {
  try {
    if (usr.activo) {
      await $fetch(`/api/usuarios/${usr.id}`, { method: 'DELETE' })
    } else {
      await $fetch(`/api/usuarios/${usr.id}`, { method: 'PUT', body: { activo: true } })
    }
    await obtenerUsuarios()
  } catch (error) {
    alert(error.data?.statusMessage || 'Error al cambiar el estado del usuario')
  }
}
 
function solicitarEliminacion(usr) {
  if (user.value?.id === usr.id) return
  usuarioAEliminar.value = usr
  mostrarConfirmacion.value = true
}
 
function cancelarEliminacion() {
  mostrarConfirmacion.value = false
  usuarioAEliminar.value = null
}
 
async function confirmarEliminacion() {
  if (!usuarioAEliminar.value) return
  eliminando.value = true
  try {
    await $fetch(`/api/usuarios/${usuarioAEliminar.value.id}/eliminar`, { method: 'DELETE' })
    mostrarConfirmacion.value = false
    usuarioAEliminar.value = null
    await obtenerUsuarios()
  } catch (error) {
    alert(error.data?.statusMessage || 'Error al eliminar el usuario')
  } finally {
    eliminando.value = false
  }
}
 
onMounted(() => {
  obtenerUsuarios()
})
</script>
