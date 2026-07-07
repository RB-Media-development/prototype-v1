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
  <div v-if="sources.length" class="sources">
    <h4>Bronnen</h4>
    <ol>
      <li v-for="s in sources" :key="s.ref">
        <span class="meta">
          <span class="box">{{ s.box }}</span>
          <span class="file">{{ s.filename }}</span>
        </span>
        <span class="excerpt">{{ s.excerpt }}…</span>
      </li>
    </ol>
  </div>
</template>

<style scoped>
.sources {
  margin-top: 0.75rem;
  border-top: 1px solid #e2e8f0;
  padding-top: 0.5rem;
}
h4 {
  margin: 0 0 0.4rem;
  font-size: 0.75rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: #94a3b8;
}
ol {
  margin: 0;
  padding-left: 1.2rem;
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
}
li {
  font-size: 0.8rem;
  color: #475569;
}
.meta {
  display: inline-flex;
  gap: 0.4rem;
  align-items: center;
  margin-right: 0.4rem;
}
.box {
  background: #dbeafe;
  color: #1e40af;
  padding: 0 0.4rem;
  border-radius: 999px;
  font-size: 0.7rem;
}
.file {
  font-family: ui-monospace, monospace;
  color: #0f172a;
}
.excerpt {
  color: #64748b;
}
</style>
