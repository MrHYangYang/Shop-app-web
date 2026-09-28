<script setup>
import AppHeader from '@/components/AppHeader.vue'
import PcSidebar from '@/components/PcSidebar.vue'
</script>

<template>
  <div class="app-shell">
    <PcSidebar />
    <div class="app-content">
      <AppHeader />
      <main class="app-main">
        <router-view />
      </main>
    </div>
  </div>
</template>

<style scoped>
.app-shell {
  min-height: 100vh;
}

.app-content,
.app-main {
  min-height: 100vh;
}

@media (min-width: 960px) {
  .app-shell {
    display: grid;
    grid-template-columns: var(--sidebar-w) minmax(0, 1fr);
  }

  .app-content,
  .app-main {
    min-height: calc(100vh - var(--header-h));
  }

  .app-content {
    min-height: 100vh;
    min-width: 0;
  }
}
</style>
