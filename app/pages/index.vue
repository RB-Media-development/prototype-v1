<script setup lang="ts">
// The global auth middleware handles the actual redirect; this is just the
// landing target.
const { user } = useAuth()
await navigateTo(user.value ? '/chat' : '/login')
</script>

<template>
  <div />
</template>
