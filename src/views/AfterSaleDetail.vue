<script setup>
import { computed, onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { getAfterSaleDetail, cancelAfterSale, submitReturnExpress } from '@/composables/useAfterSales'
import { showConfirmDialog, showToast } from 'vant'

const route = useRoute()
const router = useRouter()
const ticket = ref(null)
const expressName = ref('顺丰速运')
const expressNo = ref('')

const statusTip = computed(() => {
  const s = ticket.value?.status
  if (s === '待审核') return '商家正在审核您的售后申请'
  if (s === '待退货') return '请按要求寄回商品并填写快递单号'
  if (s === '处理中') return '商家正在处理您的售后'
  if (s === '已完成') return '售后已完成'
  if (s === '已拒绝') return '售后申请已被拒绝'
  if (s === '已取消') return '您已取消该售后'
  return ''
})

const load = async () => {
  const data = await getAfterSaleDetail(route.params.id)
  ticket.value = data.ticket
}

const onCancel = async () => {
  await showConfirmDialog({ title: '取消售后' })
  await cancelAfterSale(route.params.id)
  showToast('已取消')
  await load()
}

const onReturn = async () => {
  if (!expressNo.value.trim()) { showToast('请填写快递单号'); return }
  await submitReturnExpress(route.params.id, {
    returnExpressName: expressName.value,
    returnExpressNo: expressNo.value.trim(),
  })
  showToast('已提交物流')
  await load()
}

onMounted(load)
</script>

<template>
  <div v-if="ticket" class="page">
    <van-nav-bar title="售后详情" left-arrow @click="router.back()" />
    <h2 class="pc-title">售后详情</h2>
    <section class="status">
      <h2>{{ ticket.status }}</h2>
      <p>{{ statusTip }}</p>
    </section>

    <section class="card">
      <h3>售后信息</h3>
      <van-cell title="售后单号" :value="ticket.afterSaleNo" />
      <van-cell title="关联订单" :value="ticket.orderNo" is-link @click="router.push(`/orders/${ticket.orderId}`)" />
      <van-cell title="售后类型" :value="ticket.type" />
      <van-cell title="申请原因" :value="ticket.reason" />
      <van-cell v-if="ticket.description" title="补充说明" :value="ticket.description" />
      <van-cell v-if="ticket.refundAmount" title="退款金额" :value="`¥${ticket.refundAmount}`" />
      <van-cell v-if="ticket.returnExpressNo" title="退货物流" :value="`${ticket.returnExpressName || ''} ${ticket.returnExpressNo}`" />
    </section>

    <section class="card">
      <h3>售后商品</h3>
      <div v-for="item in (ticket.goodsList || [])" :key="`${item.goodsId}-${item.spec}`" class="goods" @click="router.push(`/goods/${item.goodsId}`)">
        <img :src="item.image" :alt="item.name" />
        <div>
          <strong>{{ item.name }}</strong>
          <p>{{ item.spec }} x{{ item.qty }}</p>
        </div>
        <span>¥{{ item.price }}</span>
      </div>
    </section>

    <section v-if="ticket.status === '待退货'" class="card">
      <h3>填写退货物流</h3>
      <van-field v-model="expressName" label="快递公司" placeholder="如：顺丰速运" />
      <van-field v-model="expressNo" label="快递单号" placeholder="请输入寄回单号" />
    </section>

    <section v-if="ticket.logs?.length" class="card">
      <h3>售后进度</h3>
      <van-steps direction="vertical" :active="0">
        <van-step v-for="(log, index) in [...ticket.logs].reverse()" :key="index">{{ log }}</van-step>
      </van-steps>
    </section>

    <div class="bar fixed-bottom-bar">
      <van-button v-if="ticket.status === '待审核' || ticket.status === '待退货'" @click="onCancel">取消申请</van-button>
      <van-button v-if="ticket.status === '待退货'" type="primary" @click="onReturn">提交物流</van-button>
      <van-button v-else-if="['已完成', '已拒绝', '已取消'].includes(ticket.status)" type="primary" @click="router.push('/after-sales')">返回列表</van-button>
    </div>
  </div>
  <van-empty v-else description="售后单不存在">
    <van-button round type="primary" size="small" to="/after-sales">返回售后</van-button>
  </van-empty>
</template>

<style scoped>
.page { min-height: 100vh; padding-bottom: 72px; }
.status { padding: 20px 16px; background: var(--brand-gradient); color: #fff; }
.status h2, .status p { margin: 0; }
.status p { margin-top: 6px; opacity: .86; }
.card { margin: 12px; padding: 14px; background: #fff; border-radius: 16px; }
h3 { margin: 0 0 8px; }
.goods { display: grid; grid-template-columns: 64px 1fr auto; gap: 10px; padding: 8px 0; }
.goods img { width: 64px; height: 64px; border-radius: 10px; object-fit: cover; background: #eef2ff; }
.goods p { margin: 6px 0 0; color: #98a0b3; font-size: 12px; }
.bar {
  position: fixed; left: 0; right: 0; bottom: 0; display: flex; justify-content: flex-end; gap: 8px;
  padding: 10px 16px calc(10px + env(safe-area-inset-bottom)); background: #fff;
}
</style>
