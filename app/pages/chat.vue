<script setup lang="ts">
interface Source {
  ref: number
  box: string
  filename: string
  excerpt: string
}
interface Turn {
  question: string
  answer: string
  sources: Source[]
}

const { user, logout } = useAuth()

const question = ref('')
const busy = ref(false)
const error = ref('')
const turns = ref<Turn[]>([])

async function ask() {
  const q = question.value.trim()
  if (!q || busy.value) return
  error.value = ''
  busy.value = true
  question.value = ''
  try {
    const res = await $fetch<{ answer: string; sources: Source[] }>('/api/chat', {
      method: 'POST',
      body: { question: q },
    })
    turns.value.push({ question: q, answer: res.answer, sources: res.sources })
  } catch (e: any) {
    error.value = e?.data?.statusMessage || 'Er ging iets mis'
    question.value = q
  } finally {
    busy.value = false
  }
}

async function onLogout() {
  await logout()
  await navigateTo('/login')
}
</script>

<template>
  <div class="shell">
    <header>
      <div>
        <strong>RBrain</strong>
        <span class="boxes">
          toegang: {{ user?.boxes.join(', ') || 'geen' }}
        </span>
      </div>
      <div class="user">
        <span>{{ user?.username }}</span>
        <button class="link" @click="onLogout">Uitloggen</button>
      </div>
    </header>

    <main>
      <p v-if="!turns.length" class="empty">
        Stel een vraag over je kennisbanken.
      </p>

      <div v-for="(turn, i) in turns" :key="i" class="turn">
        <div class="q">{{ turn.question }}</div>
        <div class="a">
          <p class="answer">{{ turn.answer }}</p>
          <SourceList :sources="turn.sources" />
        </div>
      </div>

      <p v-if="busy" class="thinking">RBrain denkt na…</p>
      <p v-if="error" class="error">{{ error }}</p>
    </main>

    <footer>
      <form @submit.prevent="ask">
        <textarea
          v-model="question"
          placeholder="Typ je vraag… (Enter = versturen)"
          rows="2"
          :disabled="busy"
          @keydown.enter.exact.prevent="ask"
        />
        <button type="submit" :disabled="busy || !question.trim()">Verstuur</button>
      </form>
    </footer>
  </div>
</template>

<style scoped>
.shell {
  max-width: 760px;
  margin: 0 auto;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  font-family: system-ui, sans-serif;
  color: #0f172a;
}
header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.9rem 1rem;
  border-bottom: 1px solid #e2e8f0;
}
.boxes {
  margin-left: 0.6rem;
  font-size: 0.75rem;
  color: #94a3b8;
}
.user {
  display: flex;
  gap: 0.6rem;
  align-items: center;
  font-size: 0.85rem;
}
.link {
  background: none;
  border: none;
  color: #2563eb;
  cursor: pointer;
  font-size: 0.85rem;
}
main {
  flex: 1;
  padding: 1rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}
.empty {
  color: #94a3b8;
  text-align: center;
  margin-top: 3rem;
}
.turn {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}
.q {
  align-self: flex-end;
  background: #2563eb;
  color: #fff;
  padding: 0.5rem 0.8rem;
  border-radius: 12px 12px 2px 12px;
  max-width: 80%;
}
.a {
  align-self: flex-start;
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  padding: 0.7rem 0.9rem;
  border-radius: 12px 12px 12px 2px;
  max-width: 90%;
}
.answer {
  margin: 0;
  white-space: pre-wrap;
  line-height: 1.5;
}
.thinking {
  color: #94a3b8;
  font-style: italic;
}
.error {
  color: #dc2626;
}
footer {
  border-top: 1px solid #e2e8f0;
  padding: 0.75rem 1rem;
  position: sticky;
  bottom: 0;
  background: #fff;
}
form {
  display: flex;
  gap: 0.5rem;
}
textarea {
  flex: 1;
  resize: none;
  padding: 0.5rem 0.6rem;
  border: 1px solid #cbd5e1;
  border-radius: 8px;
  font: inherit;
}
button[type='submit'] {
  padding: 0 1.1rem;
  border: none;
  border-radius: 8px;
  background: #2563eb;
  color: #fff;
  cursor: pointer;
}
button:disabled {
  opacity: 0.6;
  cursor: default;
}
</style>
