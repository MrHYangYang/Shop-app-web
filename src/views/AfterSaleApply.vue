<script setup>
import { computed, onMounted, reactive, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { showToast } from 'vant'
import { applyAfterSale } from '@/composables/useAfterSales'
import { getOrderDetail } from '@/composables/useOrders'

const route = useRoute()
const router = useRouter()
const types = ['仅退款', '退货退款', '换货']
const reasons = ['不想要了', '商品质量问题', '物流破损', '少件/漏发', '与描述不符', '其他']
const order = ref(null)
const submitting = ref(false)
const form = reactive({
  orderId: Number(route.params.orderId),
  type: '仅退款',
  reason: '',
  description: '',
  images: [],
})

const refundAmount = computed(() => order.value?.amount || 0)

const submit = async () => {
  if (!form.reason) { showToast('请选择售后原因'); return }
  submitting.value = true
  try {
    await applyAfterSale({
      orderId: form.orderId,
      type: form.type,
      reason: form.reason,
      description: form.description,
      refundAmount: refundAmount.value,
      images: form.images,
    })
    showToast('已提交')
    router.replace('/after-sales')
  } finally {
    submitting.value = false
  }
}

onMounted(async () => {
  const data = await getOrderDetail(form.orderId)
  order.value = data.order
})
</script>

<template>
  <div v-if="order" class="page">
    <van-nav-bar title="申请售后" left-arrow @click="router.back()" />
    <h2 class="pc-title">申请售后</h2>

    <section class="card">
      <h3>售后商品</h3>
      <div v-for="item in order.goodsList" :key="`${item.goodsId}-${item.spec}`" class="goods">
        <img :src="item.image" :alt="item.name" />
        <div>
          <strong>{{ item.name }}</strong>
          <p>{{ item.spec }} · 数量 {{ item.qty }}</p>
        </div>
        <span class="price"><em>¥</em>{{ item.price }}</span>
      </div>
    </section>

    <section class="card">
      <h3>售后类型</h3>
      <van-radio-group v-model="form.type" direction="horizontal">
        <van-radio v-for="item in types" :key="item" :name="item">{{ item }}</van-radio>
      </van-radio-group>
    </section>

    <section class="card">
      <h3>售后原因</h3>
      <div class="reasons">
        <button
          v-for="item in reasons"
          :key="item"
          type="button"
          :class="{ active: form.reason === item }"
          @click="form.reason = item"
        >{{ item }}</button>
      </div>
      <van-field
        v-model="form.description"
        rows="3"
        autosize
        type="textarea"
        maxlength="120"
        show-word-limit
        placeholder="补充说明（选填）"
      />
    </section>

    <section class="card summary">
      <van-cell title="关联订单" :value="order.orderNo" />
      <van-cell title="退款金额" :value="`¥${refundAmount}`" />
    </section>

    <div class="bar fixed-bottom-bar">
      <van-button type="primary" round block :loading="submitting" @click="submit">提交申请</van-button>
    </div>
  </div>
  <van-empty v-else description="订单不存在">
    <van-button round type="primary" size="small" to="/orders">返回订单</van-button>
  </van-empty>
</template>

<style scoped>
.page { min-height: 100vh; padding-bottom: 80px; }
.card { margin: 12px; background: #fff; border-radius: 16px; padding: 14px; }
h3 { margin: 0 0 12px; }
.goods { display: grid; grid-template-columns: 64px 1fr auto; gap: 10px; align-items: center; }
.goods img { width: 64px; height: 64px; border-radius: 10px; object-fit: cover; background: #eef2ff; }
.goods p { margin: 6px 0 0; color: #98a0b3; font-size: 12px; }
.price { color: #ef4444; }
.price em { font-style: normal; }
.reasons { display: flex; flex-wrap: wrap; gap: 8px; margin-bottom: 12px; }
.reasons button {
  border: 0; background: #f4f7ff; border-radius: 999px; padding: 6px 12px; font-size: 13px;
}
.reasons button.active { background: #4d7cff; color: #fff; }
.bar {
  position: fixed; left: 0; right: 0; bottom: 0;
  padding: 10px 16px calc(10px + env(safe-area-inset-bottom)); background: #fff;
}
</style>
