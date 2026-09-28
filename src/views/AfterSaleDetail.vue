<script setup>
import { computed, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { showConfirmDialog, showImagePreview, showToast } from 'vant'
import {
  approveAfterSale,
  cancelAfterSale,
  completeAfterSale,
  getAfterSaleById,
  rejectAfterSale,
  submitReturnExpress,
} from '@/composables/useAfterSales'

const route = useRoute()
const router = useRouter()
const expressNo = ref('')
const ticket = computed(() => getAfterSaleById(route.params.id))

const onCancel = async () => {
  await showConfirmDialog({ title: '取消申请', message: '确定取消该售后申请吗？' })
  cancelAfterSale(ticket.value.id)
  showToast('已取消申请')
}

const onApprove = () => {
  approveAfterSale(ticket.value.id)
  showToast(ticket.value.type === '仅退款' ? '商家已同意，正在退款' : '商家已同意，请寄回商品')
}

const onReject = async () => {
  await showConfirmDialog({ title: '模拟拒绝', message: '将模拟商家拒绝该售后申请' })
  rejectAfterSale(ticket.value.id)
  showToast('商家已拒绝')
}

const onReturn = () => {
  const result = submitReturnExpress(ticket.value.id, expressNo.value)
  if (!result.ok) {
    showToast(result.message)
    return
  }
  showToast('已提交退货物流')
}

const onComplete = () => {
  completeAfterSale(ticket.value.id)
  showToast(ticket.value.type === '换货' ? '换货已完成' : '退款已完成')
}

const previewImages = (index) => {
  const images = ticket.value?.images || []
  if (!images.length) return
  showImagePreview({ images, startPosition: index })
}

const statusTip = computed(() => {
  const map = {
    待审核: '商家正在审核你的售后申请',
    待退货: '请按提示寄回商品并填写运单号',
    处理中: '商家正在处理售后',
    已完成: '本次售后已完成',
    已拒绝: '商家未通过本次售后申请',
    已取消: '你已取消本次售后申请',
  }
  return map[ticket.value?.status] || ''
})
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
      <van-cell v-if="ticket.returnExpressNo" title="退货物流" :value="`${ticket.returnExpressName} ${ticket.returnExpressNo}`" />
    </section>

    <section v-if="ticket.images?.length" class="card">
      <h3>凭证图片</h3>
      <div class="photos">
        <button
          v-for="(url, index) in ticket.images"
          :key="index"
          type="button"
          class="photo"
          @click="previewImages(index)"
        >
          <img :src="url" alt="售后凭证" />
        </button>
      </div>
    </section>

    <section class="card">
      <h3>售后商品</h3>
      <div v-for="item in ticket.goodsList" :key="`${item.goodsId}-${item.spec}`" class="goods" @click="router.push(`/goods/${item.goodsId}`)">
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
      <van-field v-model="expressNo" label="快递单号" placeholder="请输入寄回运单号" />
    </section>

    <section class="card">
      <h3>售后跟踪</h3>
      <van-steps direction="vertical" :active="0">
        <van-step v-for="(log, index) in [...ticket.logs].reverse()" :key="index">{{ log }}</van-step>
      </van-steps>
    </section>

    <div class="bar fixed-bottom-bar">
      <van-button v-if="ticket.status === '待审核'" @click="onCancel">取消申请</van-button>
      <van-button v-if="ticket.status === '待审核'" @click="onReject">模拟拒绝</van-button>
      <van-button v-if="ticket.status === '待审核'" type="primary" @click="onApprove">模拟通过</van-button>
      <van-button v-if="ticket.status === '待退货'" @click="onReject">模拟拒绝</van-button>
      <van-button v-if="ticket.status === '待退货'" type="primary" @click="onReturn">提交物流</van-button>
      <van-button v-if="ticket.status === '处理中'" type="primary" @click="onComplete">模拟完成</van-button>
      <van-button v-else-if="['已完成', '已拒绝', '已取消'].includes(ticket.status)" type="primary" @click="router.push('/after-sales')">
        返回列表
      </van-button>
    </div>
  </div>
  <van-empty v-else description="售后单不存在">
    <van-button round type="primary" size="small" to="/after-sales">返回售后</van-button>
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

.goods p {
  margin: 6px 0 0;
  color: var(--text-secondary);
  font-size: 12px;
}

.photos {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.photo {
  padding: 0;
  border: 0;
  background: transparent;
}

.photo img {
  width: 72px;
  height: 72px;
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
