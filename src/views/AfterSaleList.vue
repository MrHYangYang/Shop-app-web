<script setup>
import { computed, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAfterSales } from '@/composables/useAfterSales'

const route = useRoute()
const router = useRouter()
const { tickets } = useAfterSales()
const tabs = ['全部', '待审核', '待退货', '处理中', '已完成', '已拒绝', '已取消']
const active = ref(route.query.status || '全部')

watch(
  () => route.query.status,
  (status) => {
    active.value = status || '全部'
  },
)

const list = computed(() => {
  if (active.value === '全部') return tickets.value
  return tickets.value.filter((item) => item.status === active.value)
})

const onTab = (name) => {
  router.replace({ path: '/after-sales', query: name === '全部' ? {} : { status: name } })
}

const statusClass = (status) => {
  if (status === '已完成') return 'ok'
  if (status === '已拒绝' || status === '已取消') return 'mute'
  return 'ing'
}
</script>

<template>
  <div class="page">
    <van-nav-bar title="退款/售后" left-arrow @click="router.back()" />
    <h2 class="pc-title">退款/售后</h2>
    <van-tabs v-model:active="active" shrink @change="onTab">
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
        <div v-for="goods in item.goodsList" :key="`${goods.goodsId}-${goods.spec}`" class="goods">
          <img :src="goods.image" :alt="goods.name" />
          <div>
            <strong>{{ goods.name }}</strong>
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
.page {
  min-height: 100vh;
}

.list {
  padding: 12px;
  display: grid;
  gap: 10px;
}

.card {
  background: #fff;
  border-radius: 16px;
  padding: 12px;
}

.head,
.foot {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.head em {
  font-style: normal;
  font-size: 13px;
}

.head em.ing {
  color: var(--brand-blue);
}

.head em.ok {
  color: #22c55e;
}

.head em.mute {
  color: var(--text-secondary);
}

.goods {
  display: grid;
  grid-template-columns: 64px 1fr auto;
  gap: 10px;
  align-items: center;
  padding: 10px 0;
}

.goods img {
  width: 64px;
  height: 64px;
  border-radius: 10px;
  object-fit: cover;
}

.goods p {
  margin: 6px 0 0;
  color: var(--text-secondary);
  font-size: 12px;
}

.foot {
  padding-top: 8px;
  border-top: 1px solid #f3f5fb;
  color: var(--text-secondary);
  font-size: 13px;
}

@media (min-width: 960px) {
  .page {
    width: min(var(--app-max), calc(100% - 48px));
    margin: 0 auto;
    padding-bottom: 40px;
  }

  .list {
    padding: 8px 0 24px;
    gap: 16px;
  }

  .card {
    padding: 16px 20px;
  }

  .goods img {
    width: 80px;
    height: 80px;
  }
}
</style>
