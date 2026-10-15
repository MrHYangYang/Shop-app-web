<script setup>
import { computed, onMounted, watch } from 'vue'
import { useRoute } from 'vue-router'
import AppHeader from '@/components/AppHeader.vue'
import PcSidebar from '@/components/PcSidebar.vue'
import { loadCart } from '@/composables/useCart'
import { useUser } from '@/composables/useUser'
import { getToken } from '@/utils/request'

const route = useRoute()
const { isLogin } = useUser()
const isAuthPage = computed(() => ['/login', '/register'].includes(route.path))

async function syncCartBadge() {
  try {
    await loadCart()
  } catch (e) {
    /* badge sync should not block page */
  }
}

onMounted(() => {
  if (getToken()) syncCartBadge()
})

watch(isLogin, () => {
  syncCartBadge()
})
</script>

<template>
  <div class="app-shell" :class="{ 'auth-mode': isAuthPage }">
    <PcSidebar v-if="!isAuthPage" />
    <div class="app-content">
      <AppHeader v-if="!isAuthPage" />
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

  .auth-mode {
    grid-template-columns: 1fr;
  }
}
</style>
