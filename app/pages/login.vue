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
  <div class="page">
    <form class="card" @submit.prevent="onSubmit">
      <h1>RBrain</h1>
      <p class="sub">Log in om vragen te stellen aan de kennisbank.</p>

      <label>
        Gebruikersnaam
        <input v-model="username" autocomplete="username" autofocus />
      </label>
      <label>
        Wachtwoord
        <input v-model="password" type="password" autocomplete="current-password" />
      </label>

      <p v-if="error" class="error">{{ error }}</p>

      <button type="submit" :disabled="busy">
        {{ busy ? 'Bezig…' : 'Inloggen' }}
      </button>
    </form>
  </div>
</template>

<style scoped>
.page {
  min-height: 100vh;
  display: grid;
  place-items: center;
  background: #0f172a;
  font-family: system-ui, sans-serif;
}
.card {
  width: 320px;
  background: #fff;
  padding: 2rem;
  border-radius: 12px;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.3);
}
h1 {
  margin: 0;
  font-size: 1.5rem;
}
.sub {
  margin: 0 0 0.5rem;
  color: #64748b;
  font-size: 0.9rem;
}
label {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  font-size: 0.85rem;
  color: #334155;
}
input {
  padding: 0.5rem 0.6rem;
  border: 1px solid #cbd5e1;
  border-radius: 6px;
  font-size: 1rem;
}
button {
  margin-top: 0.5rem;
  padding: 0.6rem;
  border: none;
  border-radius: 6px;
  background: #2563eb;
  color: #fff;
  font-size: 1rem;
  cursor: pointer;
}
button:disabled {
  opacity: 0.6;
  cursor: default;
}
.error {
  color: #dc2626;
  font-size: 0.85rem;
  margin: 0;
}
</style>
