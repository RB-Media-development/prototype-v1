<script setup lang="ts">
interface Source {
  ref: number
  box: string
  filename: string
  excerpt: string
}
defineProps<{ sources: Source[] }>()
</script>

<template>
  <div v-if="sources.length" class="mt-3">
    <USeparator label="Bronnen" />
    <ol class="mt-2 pl-5 flex flex-col gap-2 list-decimal">
      <li v-for="s in sources" :key="s.ref" class="text-sm">
        <span class="inline-flex gap-2 items-center mr-2 flex-wrap">
          <UBadge color="primary" variant="subtle" size="sm">
            {{ s.box }}
          </UBadge>
          <span class="font-mono text-sm text-default">
            {{ s.filename }}
          </span>
        </span>
        <span class="text-muted text-sm">
          {{ s.excerpt }}…
        </span>
      </li>
    </ol>
  </div>
</template>
