<script setup lang="ts">
import type { Turn } from '~/utils/chatMessages'
import { turnsToMessages } from '~/utils/chatMessages'

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
    const res = await $fetch<{ answer: string; sources: Turn['sources'] }>('/api/chat', {
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
  <div class="max-w-3xl mx-auto min-h-screen flex flex-col">
    <header class="flex justify-between items-center px-4 py-3 border-b border-default">
      <div class="flex items-center gap-2 flex-wrap">
        <strong>RBrain</strong>
        <UBadge
          v-for="box in user?.boxes ?? []"
          :key="box"
          color="primary"
          variant="subtle"
          size="sm"
        >
          {{ box }}
        </UBadge>
        <span v-if="!user?.boxes.length" class="text-muted text-xs">
          geen toegang
        </span>
      </div>
      <div class="flex items-center gap-2 text-sm shrink-0">
        <span>{{ user?.username }}</span>
        <UButton variant="link" @click="onLogout">
          Uitloggen
        </UButton>
      </div>
    </header>

    <main class="flex-1 p-4 flex flex-col gap-4">
      <p v-if="!turns.length" class="text-muted text-center mt-12">
        Stel een vraag over je kennisbanken.
      </p>

      <UChatMessages
        v-if="turns.length"
        :messages="turnsToMessages(turns)"
        :status="busy ? 'submitted' : undefined"
      >
        <template #content="{ message }">
          <p class="whitespace-pre-wrap">
            {{ message.parts[0]?.text }}
          </p>
          <SourceList
            v-if="message.role === 'assistant'"
            :sources="message.metadata?.sources ?? []"
          />
        </template>
      </UChatMessages>

      <UAlert v-if="error" color="error" :title="error" />
    </main>

    <footer class="sticky bottom-0 border-t border-default bg-default p-3">
      <UChatPrompt
        v-model="question"
        placeholder="Typ je vraag… (Enter = versturen)"
        :disabled="busy"
        @submit="ask"
      >
        <UChatPromptSubmit :disabled="busy || !question.trim()" />
      </UChatPrompt>
    </footer>
  </div>
</template>
