<script setup>
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { filterGoods } from '@/composables/useGoods'
import GoodsCard from '@/components/GoodsCard.vue'

const route = useRoute()
const router = useRouter()

const titleMap = { hot: '热销爆款', new: '新品首发', renew: '焕新推荐' }
const title = computed(() => {
  if (route.query.keyword) return `搜索：${route.query.keyword}`
  if (route.query.category) return route.query.category
  return titleMap[route.query.tag] || '全部商品'
})

const list = computed(() =>
  filterGoods({
    category: route.query.category || '',
    keyword: route.query.keyword || '',
    tag: route.query.tag || '',
  }),
)
</script>

<template>
  <div class="page">
    <van-nav-bar :title="title" left-arrow @click="router.back()" />
    <h2 class="pc-title">{{ title }}</h2>
    <div v-if="list.length" class="grid goods-grid">
      <GoodsCard v-for="item in list" :key="item.id" :goods="item" />
    </div>
    <van-empty v-else description="没有找到相关商品" />
  </div>
</template>

<style scoped>
.page {
  min-height: 100vh;
}

.grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
  padding: 12px;
}

@media (min-width: 640px) {
  .grid {
    grid-template-columns: repeat(3, 1fr);
  }
}

@media (min-width: 960px) {
  .page {
    width: min(var(--app-max), calc(100% - 48px));
    margin: 0 auto;
    padding-bottom: 40px;
  }

  .grid {
    padding: 0 0 24px;
    gap: 16px;
    grid-template-columns: repeat(4, 1fr);
  }
}
</style>
