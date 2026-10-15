<script setup>
import { computed, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useCart } from '@/composables/useCart'
import { useUser } from '@/composables/useUser'
import { normalizeSearchKeyword } from '@/utils/search'

const route = useRoute()
const router = useRouter()
const { count } = useCart()
const { user, isLogin } = useUser()
const keyword = ref(typeof route.query.keyword === 'string' ? route.query.keyword : '')

watch(
  () => route.query.keyword,
  (v) => {
    keyword.value = typeof v === 'string' ? v : ''
  },
)

const menus = [
  { path: '/cart', label: '购物车' },
  { path: '/mine', label: '我的' },
]

const isActive = (path) => {
  if (path === '/home') return route.path === '/home'
  return route.path === path || route.path.startsWith(`${path}/`)
}

const onSearch = () => {
  const value = normalizeSearchKeyword(keyword.value)
  if (!value) {
    router.push('/search')
    return
  }
  keyword.value = value
  router.push({ path: '/goods', query: { keyword: value } })
}

const userLabel = computed(() => (isLogin.value ? user.value.name : '登录'))
</script>

<template>
  <header class="pc-header">
    <div class="inner">
      <form class="search" @submit.prevent="onSearch">
        <van-icon name="search" />
        <input v-model="keyword" type="search" placeholder="模糊搜索名称/品牌/型号" />
        <button type="submit">搜索</button>
      </form>

      <nav>
        <router-link
          v-for="item in menus"
          :key="item.path"
          :to="item.path"
          :class="{ active: isActive(item.path) }"
        >
          {{ item.label }}
          <em v-if="item.path === '/cart' && count" class="badge">{{ count }}</em>
        </router-link>
      </nav>

      <router-link class="account" :to="isLogin ? '/mine' : '/login'">
        <van-icon name="user-o" />
        {{ userLabel }}
      </router-link>
    </div>
  </header>
</template>

<style scoped>
.pc-header {
  display: none;
  position: sticky;
  top: 0;
  z-index: 200;
  background: rgba(255, 255, 255, 0.94);
  backdrop-filter: blur(12px);
  border-bottom: 1px solid #e8edf8;
}

.inner {
  width: min(var(--app-max), calc(100% - 48px));
  margin: 0 auto;
  height: var(--header-h);
  display: flex;
  align-items: center;
  gap: 24px;
}

.search {
  flex: 1;
  min-width: 180px;
  max-width: 520px;
  height: 42px;
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 0 6px 0 14px;
  border: 1px solid #d9e2ff;
  border-radius: 999px;
  background: #f7f9ff;
  color: #98a0b3;
}

.search input {
  flex: 1;
  min-width: 0;
  border: 0;
  outline: none;
  background: transparent;
  font-size: 14px;
  color: var(--text-primary);
}

.search button {
  height: 32px;
  padding: 0 16px;
  border: 0;
  border-radius: 999px;
  background: var(--brand-gradient);
  color: #fff;
  cursor: pointer;
}

nav {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-left: auto;
  flex: none;
}

nav a {
  position: relative;
  padding: 8px 12px;
  border-radius: 10px;
  color: #4a5160;
  font-size: 14px;
}

nav a.active,
nav a:hover {
  color: var(--brand-blue);
  background: #eef2ff;
}

.badge {
  position: absolute;
  top: 2px;
  right: 0;
  min-width: 16px;
  height: 16px;
  padding: 0 4px;
  border-radius: 999px;
  background: #ef4444;
  color: #fff;
  font-size: 10px;
  font-style: normal;
  line-height: 16px;
  text-align: center;
}

.account {
  display: flex;
  align-items: center;
  gap: 6px;
  flex: none;
  color: #3d4454;
  font-size: 14px;
}

@media (min-width: 960px) {
  .pc-header {
    display: block;
  }
}
</style>
