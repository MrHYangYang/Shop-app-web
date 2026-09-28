<script setup>
import { computed, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { showConfirmDialog, showToast } from 'vant'
import { cancelOrder, canApplyAfterSale, payOrder, useOrders } from '@/composables/useOrders'
import { getActiveAfterSale, getAfterSaleByOrderId } from '@/composables/useAfterSales'
import { getOrderPendingItems } from '@/composables/useReviews'
import { useUser } from '@/composables/useUser'

const route = useRoute()
const router = useRouter()
const { user } = useUser()
const { orders } = useOrders()
const tabs = ['全部', '待付款', '待发货', '待收货', '已完成', '售后中', '已取消']
const active = ref(route.query.status || '全部')

watch(
  () => route.query.status,
  (status) => {
    active.value = status || '全部'
  },
)

const list = computed(() => {
  if (active.value === '全部') return orders.value
  return orders.value.filter((item) => item.status === active.value)
})

const onTab = (name) => {
  router.replace({ path: '/orders', query: name === '全部' ? {} : { status: name } })
}

const onPay = (order) => {
  payOrder(order.id)
  showToast('支付成功')
}

const onCancel = async (order) => {
  await showConfirmDialog({ title: '取消订单', message: '确定取消该订单吗？' })
  cancelOrder(order.id)
  showToast('订单已取消')
}

const afterSalePath = (order) => {
  const ticket = getActiveAfterSale(order.id) || getAfterSaleByOrderId(order.id)
  if (order.status === '售后中' && ticket) return `/after-sales/${ticket.id}`
  if (canApplyAfterSale(order)) return `/after-sales/apply/${order.id}`
  if (ticket) return `/after-sales/${ticket.id}`
  return ''
}

const pendingReviews = (order) => getOrderPendingItems(order.id, user.value?.phone)

const goReview = (order) => {
  const items = pendingReviews(order)
  if (!items.length) {
    router.push({ path: '/reviews', query: { tab: 'done' } })
    return
  }
  const item = items[0]
  router.push({
    path: `/reviews/write/${item.orderId}/${item.goodsId}`,
    query: { spec: item.spec },
  })
}
</script>

<template>
  <div class="page">
    <van-nav-bar title="我的订单" left-arrow @click="router.back()" />
    <h2 class="pc-title">我的订单</h2>
    <van-tabs v-model:active="active" shrink @change="onTab">
      <van-tab v-for="item in tabs" :key="item" :title="item" :name="item" />
    </van-tabs>
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
            <van-button v-if="order.status === '已完成' && pendingReviews(order).length" size="small" type="primary" @click="goReview(order)">评价</van-button>
            <van-button v-if="order.status === '售后中'" size="small" type="primary" plain @click="router.push(afterSalePath(order))">查看售后</van-button>
            <van-button v-else-if="order.status !== '待付款'" size="small" type="primary" plain>查看详情</van-button>
          </div>
        </div>
      </article>
    </div>
    <van-empty v-else description="暂无相关订单" />
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
  color: var(--brand-blue);
  font-size: 13px;
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
}

.foot div {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
  justify-content: flex-end;
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
