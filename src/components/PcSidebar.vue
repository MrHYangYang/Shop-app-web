<script setup>
import { computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { categories, getGoodsById, loadCategories } from '@/composables/useGoods'

const route = useRoute()

const ICON_MAP = {
  Iphone: 'phone-o',
  Monitor: 'desktop-o',
  Headset: 'service-o',
  Camera: 'photograph',
  Watch: 'clock-o',
  House: 'wap-home-o',
  SetUp: 'notes-o',
  Box: 'gift-o',
}

onMounted(() => {
  loadCategories().catch(() => {})
})

const menus = computed(() => {
  const home = { key: 'all', label: '首页', icon: 'home-o', to: '/home' }
  const cats = (categories.value || []).map((c) => ({
    key: String(c.id),
    label: c.name,
    icon: ICON_MAP[c.icon] || 'apps-o',
    to: { path: '/category', query: { name: c.name, categoryId: String(c.id) } },
  }))
  return [home, ...cats]
})

const activeKey = computed(() => {
  if (route.path === '/home') return 'all'
  if (route.path.startsWith('/goods/')) {
    const goods = getGoodsById(route.params.id)
    if (goods?.categoryId != null) {
      const byId = categories.value.find((c) => String(c.id) === String(goods.categoryId))
      if (byId) return String(byId.id)
      // goods may be leaf category; match level-2 parent via name if present
    }
    if (goods?.category) {
      const byName = categories.value.find((c) => c.name === goods.category)
      if (byName) return String(byName.id)
    }
    return ''
  }
  if (route.path.startsWith('/category')) {
    if (route.query.categoryId) {
      return String(route.query.categoryId)
    }
    const name = route.query.name || route.query.category
    if (name) {
      const hit = categories.value.find((c) => c.name === String(name))
      if (hit) return String(hit.id)
    }
  }
  return ''
})
</script>

<template>
  <aside class="pc-sidebar">
    <router-link class="brand" to="/home">
      <div class="brand-row">
        <img src="/favicon.svg" alt="数码优选" />
        <span>数码优选</span>
      </div>
      <strong>数码优选</strong>
      <em>用户商城</em>
    </router-link>

    <nav>
      <router-link
        v-for="item in menus"
        :key="item.key"
        class="menu-item"
        :class="{ active: activeKey === item.key }"
        active-class=""
        exact-active-class=""
        :to="item.to"
      >
        <van-icon :name="item.icon" />
        <span>{{ item.label }}</span>
      </router-link>
    </nav>
  </aside>
</template>

<style scoped>
.pc-sidebar {
  display: none;
}

@media (min-width: 960px) {
  .pc-sidebar {
    display: flex;
    flex-direction: column;
    position: sticky;
    top: 0;
    height: 100vh;
    width: var(--sidebar-w);
    padding: 28px 18px 32px;
    background:
      radial-gradient(circle at left 88%, rgba(124, 110, 246, 0.16), transparent 42%),
      linear-gradient(180deg, #fbfcff 0%, #f5f7ff 52%, #eef2ff 100%);
    overflow: auto;
  }
}

.brand {
  display: block;
  padding: 0 10px 22px;
  border-bottom: 1px solid #e6e9f5;
  margin-bottom: 18px;
}

.brand-row {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 22px;
  color: #2b3140;
  font-size: 18px;
  font-weight: 700;
}

.brand-row img {
  width: 28px;
  height: 28px;
}

.brand strong {
  display: block;
  color: #6d6ef6;
  font-size: 28px;
  line-height: 1.2;
}

.brand em {
  display: block;
  margin-top: 4px;
  color: #1f2430;
  font-size: 28px;
  font-style: normal;
  font-weight: 800;
  letter-spacing: 0.5px;
}

nav {
  display: grid;
  gap: 6px;
}

.menu-item {
  display: flex;
  align-items: center;
  gap: 12px;
  height: 48px;
  padding: 0 16px;
  border-radius: 16px;
  color: #3d4454;
  font-size: 15px;
}

.menu-item :deep(.van-icon) {
  font-size: 20px;
  color: #7b74f2;
}

.menu-item:hover {
  background: rgba(109, 110, 246, 0.08);
}

.menu-item.active {
  background: linear-gradient(135deg, #6b74f8 0%, #7a6cf6 100%);
  color: #fff;
  font-weight: 600;
  box-shadow: 0 8px 18px rgba(109, 110, 246, 0.28);
}

.menu-item.active :deep(.van-icon) {
  color: #fff;
}
</style>