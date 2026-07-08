<script setup lang="ts">
const { login } = useAuth()

const username = ref('')
const password = ref('')
const error = ref('')
const busy = ref(false)

async function onSubmit() {
  error.value = ''
  busy.value = true
  try {
    await login(username.value, password.value)
    await navigateTo('/chat')
  } catch (e: any) {
    error.value = e?.data?.statusMessage || e?.statusMessage || 'Inloggen mislukt'
  } finally {
    busy.value = false
  }
}
</script>

<template>
  <div class="min-h-screen flex items-center justify-center bg-neutral-950 p-4">
    <UCard class="w-full max-w-sm">
      <form class="flex flex-col gap-4" @submit.prevent="onSubmit">
        <div>
          <h1 class="text-2xl font-semibold">
            RBrain
          </h1>
          <p class="text-muted text-sm mt-1">
            Log in om vragen te stellen aan de kennisbank.
          </p>
        </div>

        <UFormField label="Gebruikersnaam">
          <UInput v-model="username" autocomplete="username" autofocus />
        </UFormField>

        <UFormField label="Wachtwoord">
          <UInput v-model="password" type="password" autocomplete="current-password" />
        </UFormField>

        <UAlert v-if="error" color="error" variant="subtle" :title="error" />

        <UButton type="submit" block :loading="busy">
          Inloggen
        </UButton>

        <p class="text-muted text-xs text-center">
          Demo: alice / bob / admin — wachtwoord <UKbd>demo</UKbd>
        </p>
      </form>
    </UCard>
  </div>
</template>
