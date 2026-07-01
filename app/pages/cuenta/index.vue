<template>
  <div class="p-8 max-w-2xl mx-auto space-y-6">
    <h1 class="text-2xl font-bold text-gray-900">Información de Cuenta</h1>
 
    <div class="border border-gray-200 rounded-md p-4">
      <h3 class="text-lg font-semibold text-gray-700">Datos del usuario conectado</h3>
      <p class="text-sm text-gray-500 mb-3">Información personal asociada a tu cuenta.</p>
      <div class="grid grid-cols-2 gap-3 text-sm text-gray-700">
        <div><strong>RUT:</strong> {{ user?.rut }}</div>
        <div><strong>Perfil:</strong> <span class="uppercase font-semibold">{{ user?.perfilNombre }}</span></div>
        <div><strong>Nombre:</strong> {{ user?.nombres }} {{ user?.apellidos }}</div>
        <div><strong>Correo:</strong> {{ user?.email }}</div>
      </div>
    </div>
 
    <div class="border border-gray-200 rounded-md p-4 ">
      <h3 class="text-lg font-semibold text-gray-700">Cambiar contraseña</h3>
      <p class="text-sm text-gray-500 mb-3">Actualiza la contraseña con la que accedes al sistema.</p>
 
     <form @submit.prevent="guardarPassword" class="space-y-4">
        <UFormGroup label="Contraseña actual" required>
          <UInput 
            v-model="formulario.passwordActual" 
            type="password" 
            required 
            placeholder="Contraseña actual"
            :ui="{ base: 'bg-transparent text-gray-900 dark:text-gray-900 font-medium' }"
          />
        </UFormGroup>
 
        <UFormGroup label="Nueva contraseña" required help="Mínimo 6 caracteres">
          <UInput 
            v-model="formulario.passwordNueva" 
            type="password" 
            required 
            minlength="6" 
            placeholder="Nueva contraseña"
            :ui="{ base: 'bg-transparent text-gray-900 dark:text-gray-900 font-medium' }"
          />
        </UFormGroup>
 
        <UFormGroup label="Confirmar nueva contraseña" required>
          <UInput 
            v-model="formulario.passwordNuevaConfirmacion" 
            type="password" 
            required 
            minlength="6" 
            placeholder="Confirmar nueva contraseña"
            :ui="{ base: 'bg-transparent text-gray-900 dark:text-gray-900 font-medium' }"
          />
        </UFormGroup>
 
        <div class="min-h-[64px] flex flex-col justify-center">
          <UAlert 
            v-if="mensajeError" 
            color="red" 
            variant="soft" 
            :title="mensajeError" 
            :ui="{ title: 'text-red-950 dark:text-red-900 font-bold' }"
          />
          <UAlert 
            v-if="mensajeExito" 
            color="green" 
            variant="soft" 
            :title="mensajeExito" 
            :ui="{ title: 'text-green-700 dark:text-green-800 font-bold' }"
          />
        </div>
 
        <div class="flex justify-end pt-4">
          <UButton type="submit" color="primary" class="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md font-medium flex items-center transition-colors" :loading="guardando">
            Actualizar contraseña
          </UButton>
        </div>
      </form>
    </div>
 
    <div class="border border-gray-200 rounded-md p-4">
      <h3 class="text-lg font-semibold text-gray-700">Cerrar sesión</h3>
      <p class="text-sm text-gray-500 mb-3">Finaliza tu sesión actual en el sistema.</p>
      <div class="flex justify-end">
        <UButton color="red" variant="soft" icon="i-heroicons-arrow-left-on-rectangle" @click="cerrarSesion" class="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md font-medium flex items-center transition-colors">
          Cerrar sesión
        </UButton>
      </div>
    </div>
  </div>
</template>

<script setup>
import { reactive, ref } from 'vue'
 
const { user, clear } = useUserSession()
 
const guardando = ref(false)
const mensajeError = ref('')
const mensajeExito = ref('')
 
const formulario = reactive({
  passwordActual: '',
  passwordNueva: '',
  passwordNuevaConfirmacion: ''
})
 
async function guardarPassword() {
  mensajeError.value = ''
  mensajeExito.value = ''
 
  if (formulario.passwordNueva !== formulario.passwordNuevaConfirmacion) {
    mensajeError.value = 'La confirmación de la nueva contraseña no coincide'
    return
  }
 
  guardando.value = true
  try {
    await $fetch('/api/cuenta/password', {
      method: 'PUT',
      body: { ...formulario }
    })
    mensajeExito.value = 'Contraseña actualizada correctamente'
    formulario.passwordActual = ''
    formulario.passwordNueva = ''
    formulario.passwordNuevaConfirmacion = ''
  } catch (error) {
    mensajeError.value = error.data?.statusMessage || 'No se pudo actualizar la contraseña'
  } finally {
    guardando.value = false
  }
}
 
async function cerrarSesion() {
  try {
    await $fetch('/api/auth/logout', { method: 'POST' })
  } finally {
    await clear()
    navigateTo('/login')
  }
}
</script>