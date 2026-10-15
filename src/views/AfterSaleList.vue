<script setup>
import { computed, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAfterSales } from '@/composables/useAfterSales'

const router = useRouter()
const { tickets, loadAfterSales } = useAfterSales()
const active = ref('全部')
const tabs = ['全部', '处理中', '已完成', '已取消']

const statusClass = (status) => {
  const s = String(status || '')
  if (s.includes('完成') || s.includes('成功') || s === '已退款') return 'ok'
  if (s.includes('取消') || s.includes('关闭') || s.includes('拒绝')) return 'mute'
  return 'ing'
}

const list = computed(() => {
  const all = tickets.value || []
  if (active.value === '全部') return all
  if (active.value === '处理中') return all.filter((i) => statusClass(i.status) === 'ing')
  if (active.value === '已完成') return all.filter((i) => statusClass(i.status) === 'ok')
  if (active.value === '已取消') return all.filter((i) => statusClass(i.status) === 'mute')
  return all
})

onMounted(() => loadAfterSales({ page: 1, size: 50 }))
</script>

<template>
  <div class="page">
    <van-nav-bar title="退款/售后" left-arrow @click="router.back()" />
    <h2 class="pc-title">退款/售后</h2>
    <van-tabs v-model:active="active" shrink>
      <van-tab v-for="item in tabs" :key="item" :title="item" :name="item" />
    </van-tabs>
    <div v-if="list.length" class="list">
      <article
        v-for="item in list"
        :key="item.id"
        class="card"
        @click="router.push(`/after-sales/${item.id}`)"
      >
        <div class="head">
          <span>{{ item.afterSaleNo }}</span>
          <em :class="statusClass(item.status)">{{ item.status }}</em>
        </div>
        <div v-for="goods in (item.goodsList || [])" :key="`${goods.goodsId}-${goods.spec}`" class="goods">
          <img :src="goods.image" :alt="goods.name" />
          <div>
            <strong>{{ goods.name || ('商品#' + goods.goodsId) }}</strong>
            <p>{{ goods.spec }} x{{ goods.qty }}</p>
          </div>
          <span>¥{{ goods.price }}</span>
        </div>
        <div class="foot">
          <span>{{ item.type }} · {{ item.reason }}</span>
          <strong v-if="item.refundAmount" class="price"><em>¥</em>{{ item.refundAmount }}</strong>
        </div>
      </article>
    </div>
    <van-empty v-else description="暂无售后记录" />
  </div>
</template>

<style scoped>
.page { min-height: 100vh; }
.list { padding: 12px; display: grid; gap: 10px; }
.card { background: #fff; border-radius: 16px; padding: 12px; }
.head, .foot { display: flex; justify-content: space-between; align-items: center; }
.head em { font-style: normal; font-size: 13px; }
.head em.ing { color: #4d7cff; }
.head em.ok { color: #16a34a; }
.head em.mute { color: #98a0b3; }
.goods { display: grid; grid-template-columns: 64px 1fr auto; gap: 10px; padding: 10px 0; }
.goods img { width: 64px; height: 64px; border-radius: 10px; object-fit: cover; background: #eef2ff; }
.goods p { margin: 6px 0 0; color: #98a0b3; font-size: 12px; }
.foot { border-top: 1px solid #f3f5fb; padding-top: 8px; color: #4a5160; font-size: 13px; }
.price { color: #ef4444; }
.price em { font-style: normal; }
</style>
