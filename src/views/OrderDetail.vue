<script setup>
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { showConfirmDialog, showToast } from 'vant'
import { cancelOrder, canApplyAfterSale, confirmOrder, getOrderById, payOrder, shipOrder } from '@/composables/useOrders'
import { getActiveAfterSale, getAfterSaleByOrderId } from '@/composables/useAfterSales'
import { getOrderPendingItems } from '@/composables/useReviews'
import { useUser } from '@/composables/useUser'

const route = useRoute()
const router = useRouter()
const { user } = useUser()
const order = computed(() => getOrderById(route.params.id))
const pendingReviews = computed(() => (order.value ? getOrderPendingItems(order.value.id, user.value?.phone) : []))

const onPay = () => {
  payOrder(order.value.id)
  showToast('支付成功，等待商家发货')
}

const onCancel = async () => {
  await showConfirmDialog({ title: '取消订单', message: '确定取消该订单吗？' })
  cancelOrder(order.value.id)
  showToast('订单已取消')
}

const onShip = () => {
  shipOrder(order.value.id)
  showToast('商家已发货')
}

const onConfirm = async () => {
  await showConfirmDialog({ title: '确认收货', message: '确认已收到商品吗？' })
  confirmOrder(order.value.id)
  showToast('交易完成')
}

const buyAgain = () => {
  const first = order.value?.goodsList?.[0]
  if (first) router.push(`/goods/${first.goodsId}`)
}

const goReview = () => {
  const item = pendingReviews.value[0]
  if (!item) {
    router.push({ path: '/reviews', query: { tab: 'done' } })
    return
  }
  router.push({
    path: `/reviews/write/${item.orderId}/${item.goodsId}`,
    query: { spec: item.spec },
  })
}

const afterSalePath = computed(() => {
  const current = order.value
  if (!current) return ''
  const ticket = getActiveAfterSale(current.id) || getAfterSaleByOrderId(current.id)
  if (current.status === '售后中' && ticket) return `/after-sales/${ticket.id}`
  if (canApplyAfterSale(current)) return `/after-sales/apply/${current.id}`
  if (ticket) return `/after-sales/${ticket.id}`
  return ''
})
</script>

<template>
  <div v-if="order" class="page">
    <van-nav-bar title="订单详情" left-arrow @click="router.back()" />
    <h2 class="pc-title">订单详情</h2>
    <section class="status">
      <h2>{{ order.status }}</h2>
      <p>订单号 {{ order.orderNo }}</p>
    </section>

    <section class="card">
      <h3>收货信息</h3>
      <p>{{ order.address }}</p>
    </section>

    <section class="card">
      <div v-for="item in order.goodsList" :key="`${item.goodsId}-${item.spec}`" class="goods" @click="router.push(`/goods/${item.goodsId}`)">
        <img :src="item.image" :alt="item.name" />
        <div>
          <strong>{{ item.name }}</strong>
          <p>{{ item.spec }} x{{ item.qty }}</p>
        </div>
        <span>¥{{ item.price }}</span>
      </div>
      <van-cell title="支付方式" :value="order.payType" />
      <van-cell title="下单时间" :value="order.createdAt" />
      <van-cell v-if="order.expressNo" title="物流单号" :value="`${order.expressName} ${order.expressNo}`" />
      <van-cell title="实付款" :value="`¥${order.amount}`" />
    </section>

    <section class="card">
      <h3>订单跟踪</h3>
      <van-steps direction="vertical" :active="0">
        <van-step v-for="(log, index) in [...order.logs].reverse()" :key="index">{{ log }}</van-step>
      </van-steps>
    </section>

    <div class="bar fixed-bottom-bar">
      <van-button v-if="order.status === '待付款'" @click="onCancel">取消订单</van-button>
      <van-button v-if="order.status === '待付款'" type="primary" @click="onPay">立即支付</van-button>
      <van-button v-if="order.status === '待发货'" @click="onCancel">取消订单</van-button>
      <van-button v-if="order.status === '待发货'" type="primary" @click="onShip">模拟发货</van-button>
      <van-button v-if="order.status === '待收货'" type="primary" @click="onConfirm">确认收货</van-button>
      <van-button v-if="canApplyAfterSale(order)" @click="router.push(afterSalePath)">申请售后</van-button>
      <van-button v-if="order.status === '售后中'" type="primary" @click="router.push(afterSalePath)">查看售后</van-button>
      <van-button v-else-if="afterSalePath && !canApplyAfterSale(order)" @click="router.push(afterSalePath)">售后记录</van-button>
      <van-button v-if="order.status === '已完成' && pendingReviews.length" type="primary" @click="goReview">评价晒单</van-button>
      <van-button v-if="order.status === '已完成'" type="primary" @click="buyAgain">再买一单</van-button>
    </div>
  </div>
  <van-empty v-else description="订单不存在">
    <van-button round type="primary" size="small" to="/orders">返回订单</van-button>
  </van-empty>
</template>

<style scoped>
.page {
  min-height: 100vh;
  padding-bottom: 72px;
}

.status {
  padding: 20px 16px;
  background: var(--brand-gradient);
  color: #fff;
}

.status h2,
.status p {
  margin: 0;
}

.status p {
  margin-top: 6px;
  opacity: 0.86;
}

.card {
  margin: 12px;
  padding: 14px;
  background: #fff;
  border-radius: 16px;
}

h3 {
  margin: 0 0 8px;
}

.card p {
  margin: 0;
  color: #4a5160;
  font-size: 13px;
  line-height: 1.6;
}

.goods {
  display: grid;
  grid-template-columns: 64px 1fr auto;
  gap: 10px;
  padding: 8px 0 12px;
}

.goods img {
  width: 64px;
  height: 64px;
  object-fit: cover;
  border-radius: 10px;
}

.bar {
  position: fixed;
  left: 0;
  right: 0;
  bottom: 0;
  width: 100%;
  display: flex;
  justify-content: flex-end;
  gap: 8px;
  padding: 10px 16px calc(10px + env(safe-area-inset-bottom));
  background: #fff;
}

@media (min-width: 960px) {
  .page {
    width: min(860px, calc(100% - 48px));
    margin: 0 auto;
    padding: 0 0 96px;
  }

  .status {
    border-radius: 16px;
    margin-top: 8px;
    padding: 28px 24px;
  }

  .card {
    margin: 16px 0 0;
    padding: 20px;
  }

  .bar {
    height: 72px;
    align-items: center;
  }
}
</style>
