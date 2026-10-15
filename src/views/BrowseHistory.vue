<script setup>
import { onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { showConfirmDialog, showToast } from 'vant'
import * as api from '@/api'

const router = useRouter()
const list = ref([])
const loading = ref(false)

const load = async () => {
  loading.value = true
  try {
    const data = await api.browseHistory({ page: 1, size: 50 })
    list.value = data?.records || data || []
  } finally {
    loading.value = false
  }
}

const clearAll = async () => {
  await showConfirmDialog({ title: '清空浏览记录', message: '确定清空全部浏览记录吗？' })
  await api.clearBrowse()
  list.value = []
  showToast('已清空')
}

const openGoods = (row) => {
  if (row.goodsId) router.push('/goods/' + row.goodsId)
}

onMounted(load)
</script>

<template>
  <div class="page">
    <van-nav-bar title="浏览记录" left-arrow @click="router.back()">
      <template #right>
        <span v-if="list.length" class="clear" @click="clearAll">清空</span>
      </template>
    </van-nav-bar>

    <van-pull-refresh v-model="loading" @refresh="load">
      <div v-if="list.length" class="list">
        <div v-for="item in list" :key="item.id" class="card" @click="openGoods(item)">
          <img :src="item.coverImage || 'https://via.placeholder.com/80'" :alt="item.goodsName" />
          <div class="info">
            <strong>{{ item.goodsName || ('商品#' + item.goodsId) }}</strong>
            <p class="price" v-if="item.salePrice != null"><em>¥</em>{{ item.salePrice }}</p>
            <p class="time">{{ item.createdAt }}</p>
          </div>
          <van-icon name="arrow" />
        </div>
      </div>
      <van-empty v-else description="暂无浏览记录" />
    </van-pull-refresh>
  </div>
</template>

<style scoped>
.page { min-height: 100vh; background: #f5f7fb; }
.clear { color: #4d7cff; font-size: 13px; }
.list { padding: 12px; display: grid; gap: 10px; }
.card {
  display: grid; grid-template-columns: 72px 1fr auto; gap: 10px; align-items: center;
  background: #fff; border-radius: 14px; padding: 12px;
}
.card img { width: 72px; height: 72px; border-radius: 10px; object-fit: cover; background: #eef2ff; }
.info strong { display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; font-size: 14px; }
.price { margin: 6px 0 0; color: #ef4444; }
.time { margin: 4px 0 0; color: #98a0b3; font-size: 12px; }
@media (min-width: 960px) {
  .page { width: min(800px, calc(100% - 48px)); margin: 24px auto; border-radius: 16px; overflow: hidden; }
}
</style>
