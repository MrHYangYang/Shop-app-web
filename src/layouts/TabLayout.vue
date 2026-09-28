<script setup>
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useCart } from '@/composables/useCart'
import { useBreakpoint } from '@/composables/useBreakpoint'

const route = useRoute()
const router = useRouter()
const { count } = useCart()
const { isPc } = useBreakpoint()

const tabs = [
  { name: 'home', label: '首页', icon: 'home-o', path: '/home' },
  { name: 'category', label: '分类', icon: 'apps-o', path: '/category' },
  { name: 'cart', label: '购物车', icon: 'cart-o', path: '/cart' },
  { name: 'mine', label: '我的', icon: 'user-o', path: '/mine' },
]

const active = computed(() => route.path.replace('/', '') || 'home')

const onChange = (name) => {
  router.replace(`/${name}`)
}
</script>

<template>
  <div class="tab-layout">
    <div class="tab-body">
      <router-view v-slot="{ Component }">
        <keep-alive include="Home,Category,Cart,Mine">
          <component :is="Component" />
        </keep-alive>
      </router-view>
    </div>
    <van-tabbar
      v-if="!isPc"
      :model-value="active"
      fixed
      placeholder
      safe-area-inset-bottom
      @change="onChange"
    >
      <van-tabbar-item
        v-for="tab in tabs"
        :key="tab.name"
        :name="tab.name"
        :icon="tab.icon"
        :badge="tab.name === 'cart' && count ? count : undefined"
      >
        {{ tab.label }}
      </van-tabbar-item>
    </van-tabbar>
  </div>
</template>

<style scoped>
.tab-layout {
  min-height: 100%;
  display: flex;
  flex-direction: column;
}

.tab-body {
  flex: 1;
}

:deep(.van-tabbar) {
  border-top: 1px solid #eef1f8;
}

:deep(.van-tabbar-item--active) {
  color: var(--brand-blue);
}

@media (min-width: 960px) {
  .tab-layout {
    min-height: calc(100vh - var(--header-h));
  }
}
</style>
