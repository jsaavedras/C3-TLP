<template>
  <div class="min-h-screen flex items-center justify-center bg-gray-50 px-4">
    <UCard class="w-full max-w-md shadow-lg">
      <template #header>
        <div class="text-center">
          <h2 class="text-2xl font-bold text-gray-400">RentaCar Central</h2>
          <p class="text-sm text-gray-300 mt-1">Ingresa a tu cuenta para continuar</p>
        </div>
      </template>

      <form @submit.prevent="hacerLogin" class="space-y-4">
        <UFormGroup label="Correo Electrónico" required>
          <UInput 
            v-model="email" 
            type="email" 
            icon="i-heroicons-envelope" 
            placeholder="admin@arriendos.cl"
            required
          />
        </UFormGroup>

        <UFormGroup label="Contraseña" required>
          <UInput 
            v-model="password" 
            type="password" 
            icon="i-heroicons-lock-closed" 
            placeholder="******"
            required
          />
        </UFormGroup>

        <UAlert
          v-if="errorMsg"
          color="red"
          variant="soft"
          icon="i-heroicons-exclamation-triangle"
          :title="errorMsg"
        />

        <UButton 
          type="submit" 
          block 
          color="primary" 
          :loading="cargando"
        >
          Iniciar Sesión
        </UButton>
      </form>
    </UCard>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const email = ref('')
const password = ref('')
const errorMsg = ref('')
const cargando = ref(false)

const { fetch: actualizarSesion } = useUserSession()

async function hacerLogin() {
  cargando.value = true
  errorMsg.value = ''

  try {
    const respuesta = await $fetch('/api/auth/login', {
      method: 'POST',
      body: {
        email: email.value,
        password: password.value
      }
    })

    if (respuesta.ok) {
      await actualizarSesion()
      navigateTo('/')
    }
  } catch (error) {
    errorMsg.value = error.data?.statusMessage || 'Error al conectar con el servidor.'
  } finally {
    cargando.value = false
  }
}
</script>
