<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { getGoodsById } from '@/composables/useGoods'

const route = useRoute()

const menus = [
  { key: 'all', label: '首页', icon: 'home-o', to: '/home' },
  { key: '手机', label: '手机', icon: 'phone-o', to: { path: '/category', query: { name: '手机' } } },
  { key: '笔记本电脑', label: '笔记本', icon: 'desktop-o', to: { path: '/category', query: { name: '笔记本电脑' } } },
  { key: '耳机', label: '耳机', icon: 'service-o', to: { path: '/category', query: { name: '耳机' } } },
  { key: '相机', label: '相机', icon: 'photograph', to: { path: '/category', query: { name: '相机' } } },
  { key: '智能穿戴', label: '智能手表', icon: 'clock-o', to: { path: '/category', query: { name: '智能穿戴' } } },
  { key: '配件', label: '配件', icon: 'gift-o', to: { path: '/category', query: { name: '配件' } } },
]

const activeKey = computed(() => {
  if (route.path.startsWith('/goods/')) {
    return getGoodsById(route.params.id)?.category || ''
  }
  const category = route.query.category || route.query.name
  if (category) return String(category)
  if (route.path === '/home') return 'all'
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
