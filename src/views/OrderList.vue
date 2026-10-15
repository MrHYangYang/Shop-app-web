<script setup>
import { onMounted, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { showConfirmDialog, showToast } from 'vant'
import { cancelOrder, canApplyAfterSale, payOrder, fetchOrders } from '@/composables/useOrders'
import { getActiveAfterSale, loadAfterSales } from '@/composables/useAfterSales'
import { getOrderPendingItems, loadMyReviews } from '@/composables/useReviews'

const route = useRoute()
const router = useRouter()
const tabs = ['全部', '待付款', '待发货', '待收货', '已完成', '已取消', '售后中']
const active = ref(route.query.status || '全部')
const list = ref([])
const page = ref(1)
const pageSize = 10
const loading = ref(false)
const finished = ref(false)
const listKey = ref(0)

const statusParam = () => (active.value === '全部' ? undefined : active.value)

const onLoad = async () => {
  if (finished.value) {
    loading.value = false
    return
  }
  loading.value = true
  try {
    const cur = page.value
    const data = await fetchOrders({
      page: cur,
      size: pageSize,
      status: statusParam(),
    })
    const records = data.records || []
    if (cur <= 1) {
      list.value = records
    } else {
      const seen = new Set(list.value.map((o) => String(o.id)))
      for (const o of records) {
        if (!seen.has(String(o.id))) {
          seen.add(String(o.id))
          list.value.push(o)
        }
      }
    }
    const total = Number(data.total || 0)
    if (!records.length || list.value.length >= total) {
      finished.value = true
    } else {
      page.value = cur + 1
    }
  } catch (e) {
    finished.value = true
  } finally {
    loading.value = false
  }
}

const resetAndLoad = async () => {
  list.value = []
  page.value = 1
  finished.value = false
  loading.value = false
  listKey.value += 1
  // 主动拉第一页，避免 van-list immediate-check 未触发导致空白页
  await onLoad()
}

const onTab = (name) => {
  active.value = name
  router.replace({ query: { ...route.query, status: name === '全部' ? undefined : name } })
  resetAndLoad()
}

watch(() => route.query.status, (status) => {
  const next = status || '全部'
  if (active.value === next) return
  active.value = next
  resetAndLoad()
})

const onPay = async (order) => {
  await payOrder(order.id, '微信支付')
  showToast('支付成功')
  await resetAndLoad()
}
const onCancel = async (order) => {
  await showConfirmDialog({ title: '取消订单' })
  await cancelOrder(order.id)
  showToast('已取消')
  await resetAndLoad()
}
const afterSalePath = (order) => {
  const activeAs = getActiveAfterSale(order.id)
  return activeAs ? `/after-sales/${activeAs.id}` : `/after-sales/apply/${order.id}`
}
const pendingReviews = (order) => getOrderPendingItems(order)
const goReview = (order) => {
  const item = pendingReviews(order)[0]
  if (item) router.push(`/reviews/write/${order.id}/${item.goodsId}`)
}

onMounted(async () => {
  await Promise.all([
    loadAfterSales({ page: 1, size: 50 }),
    loadMyReviews({ page: 1, size: 50 }),
  ])
  await resetAndLoad()
})
</script>

<template>
  <div class="page">
    <van-nav-bar title="我的订单" left-arrow @click="router.back()" />
    <h2 class="pc-title">我的订单</h2>
    <van-tabs :active="active" shrink @change="onTab">
      <van-tab v-for="item in tabs" :key="item" :title="item" :name="item" />
    </van-tabs>
    <van-list
      :key="listKey"
      v-model:loading="loading"
      :finished="finished"
      finished-text="没有更多了"
      :immediate-check="false"
      @load="onLoad"
    >
      <div v-if="list.length" class="list">
        <article v-for="order in list" :key="order.id" class="card" @click="router.push(`/orders/${order.id}`)">
          <div class="head">
            <span>{{ order.orderNo }}</span>
            <em>{{ order.status }}</em>
          </div>
          <div v-for="item in order.goodsList" :key="`${item.goodsId}-${item.spec}`" class="goods">
            <img :src="item.image" :alt="item.name" />
            <div>
              <strong>{{ item.name }}</strong>
              <p>{{ item.spec }} x{{ item.qty }}</p>
            </div>
            <span>¥{{ item.price }}</span>
          </div>
          <div class="foot">
            <span>合计 ¥{{ order.amount }}</span>
            <div @click.stop>
              <van-button v-if="order.status === '待付款'" size="small" @click="onCancel(order)">取消</van-button>
              <van-button v-if="order.status === '待付款'" size="small" type="primary" @click="onPay(order)">去支付</van-button>
              <van-button v-if="canApplyAfterSale(order)" size="small" @click="router.push(afterSalePath(order))">申请售后</van-button>
              <van-button v-if="order.status === '已完成' && pendingReviews(order).length" size="small" type="primary" @click="goReview(order)">去评价</van-button>
              <van-button v-if="order.status === '售后中'" size="small" type="primary" plain @click="router.push(afterSalePath(order))">查看售后</van-button>
            </div>
          </div>
        </article>
      </div>
      <van-empty v-else-if="finished && !list.length" description="暂无相关订单" />
    </van-list>
  </div>
</template>

<style scoped>
.page { min-height: 100vh; }
.list { padding: 12px; display: grid; gap: 10px; }
.card { background: #fff; border-radius: 16px; padding: 12px; }
.head, .foot { display: flex; align-items: center; justify-content: space-between; }
.head em { font-style: normal; color: var(--brand-blue); font-size: 13px; }
.goods {
  display: grid; grid-template-columns: 64px 1fr auto; gap: 10px; align-items: center; padding: 10px 0;
}
.goods img { width: 64px; height: 64px; border-radius: 10px; object-fit: cover; background: #eef2ff; }
.goods p { margin: 6px 0 0; color: var(--text-secondary); font-size: 12px; }
.foot { padding-top: 8px; border-top: 1px solid #f3f5fb; }
.foot div { display: flex; gap: 8px; flex-wrap: wrap; justify-content: flex-end; }
</style>
