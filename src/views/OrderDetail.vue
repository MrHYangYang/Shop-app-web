<script setup>
import { computed, onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { showConfirmDialog, showToast } from 'vant'
import { cancelOrder, canApplyAfterSale, confirmOrder, getOrderDetail, payOrder } from '@/composables/useOrders'
import { getActiveAfterSale, loadAfterSales } from '@/composables/useAfterSales'
import { getOrderPendingItems, loadMyReviews } from '@/composables/useReviews'
import { prepareBuyNow } from '@/composables/useCart'

const route = useRoute()
const router = useRouter()
const order = ref(null)
const pendingReviews = computed(() => (order.value ? getOrderPendingItems(order.value) : []))
const activeAfterSale = computed(() => (order.value ? getActiveAfterSale(order.value.id) : null))
const afterSalePath = computed(() => {
  if (!order.value) return '/after-sales'
  if (activeAfterSale.value) return `/after-sales/${activeAfterSale.value.id}`
  return `/after-sales/apply/${order.value.id}`
})
const load = async () => {
  const data = await getOrderDetail(route.params.id)
  order.value = data.order
}
const onPay = async () => { await payOrder(order.value.id, '微信支付'); showToast('支付成功'); await load() }
const onCancel = async () => { await showConfirmDialog({ title: '取消订单' }); await cancelOrder(order.value.id); showToast('已取消'); await load() }
const onConfirm = async () => { await confirmOrder(order.value.id); showToast('已确认收货'); await load() }
const goReview = () => {
  const item = pendingReviews.value[0]
  if (item) router.push(`/reviews/write/${order.value.id}/${item.goodsId}`)
}
const buyAgain = () => {
  const item = order.value?.goodsList?.[0]
  if (!item) return
  prepareBuyNow({
    goodsId: item.goodsId, name: item.name, image: item.image, price: item.price,
    spec: item.spec, quantity: 1, shopName: item.shopName,
  })
  router.push('/checkout')
}
onMounted(async () => {
  await Promise.all([loadAfterSales({ page: 1, size: 50 }), loadMyReviews({ page: 1, size: 50 })])
  await load()
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
      <van-cell title="支付方式" :value="order.payType || '-'" />
      <van-cell title="下单时间" :value="order.createdAt" />
      <van-cell v-if="order.expressNo" title="物流信息" :value="`${order.expressName || ''} ${order.expressNo}`" />
      <van-cell title="实付款" :value="`¥${order.amount}`" />
    </section>

    <section v-if="order.logs?.length" class="card">
      <h3>订单动态</h3>
      <van-steps direction="vertical" :active="0">
        <van-step v-for="(log, index) in [...order.logs].reverse()" :key="index">{{ log }}</van-step>
      </van-steps>
    </section>

    <div class="bar fixed-bottom-bar">
      <van-button v-if="order.status === '待付款'" @click="onCancel">取消订单</van-button>
      <van-button v-if="order.status === '待付款'" type="primary" @click="onPay">立即支付</van-button>
      <van-button v-if="order.status === '待收货'" type="primary" @click="onConfirm">确认收货</van-button>
      <van-button v-if="canApplyAfterSale(order)" @click="router.push(afterSalePath)">申请售后</van-button>
      <van-button v-if="order.status === '售后中'" type="primary" @click="router.push(afterSalePath)">查看售后</van-button>
      <van-button v-if="order.status === '已完成' && pendingReviews.length" type="primary" @click="goReview">评价晒单</van-button>
      <van-button v-if="order.status === '已完成' || order.status === '已取消'" type="primary" plain @click="buyAgain">再来一单</van-button>
    </div>
  </div>
  <van-empty v-else description="订单不存在">
    <van-button round type="primary" size="small" to="/orders">返回订单</van-button>
  </van-empty>
</template>

<style scoped>
.page { min-height: 100vh; padding-bottom: 72px; }
.status { padding: 20px 16px; background: var(--brand-gradient); color: #fff; }
.status h2, .status p { margin: 0; }
.status p { margin-top: 6px; opacity: .86; }
.card { margin: 12px; padding: 14px; background: #fff; border-radius: 16px; }
h3 { margin: 0 0 8px; }
.card > p { margin: 0; color: #4a5160; font-size: 13px; line-height: 1.6; }
.goods { display: grid; grid-template-columns: 64px 1fr auto; gap: 10px; padding: 8px 0 12px; }
.goods img { width: 64px; height: 64px; object-fit: cover; border-radius: 10px; background: #eef2ff; }
.goods p { margin: 6px 0 0; color: #98a0b3; font-size: 12px; }
.bar {
  position: fixed; left: 0; right: 0; bottom: 0; width: 100%;
  display: flex; justify-content: flex-end; gap: 8px;
  padding: 10px 16px calc(10px + env(safe-area-inset-bottom)); background: #fff;
}
</style>
