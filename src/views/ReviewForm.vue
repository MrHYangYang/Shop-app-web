<script setup>
import { onMounted, reactive, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { showToast } from 'vant'
import { submitReview } from '@/composables/useReviews'
import { getOrderDetail } from '@/composables/useOrders'

const route = useRoute()
const router = useRouter()
const labels = ['很差', '较差', '一般', '满意', '超赞']
const order = ref(null)
const goods = ref(null)
const submitting = ref(false)
const form = reactive({
  orderId: Number(route.params.orderId),
  goodsId: Number(route.params.goodsId),
  star: 5,
  content: '',
  anonymous: 0,
  images: [],
  skuName: '',
})

const submit = async () => {
  if (!form.content.trim()) { showToast('请填写评价内容'); return }
  submitting.value = true
  try {
    await submitReview({
      orderId: form.orderId,
      goodsId: form.goodsId,
      skuName: form.skuName,
      star: form.star,
      content: form.content,
      anonymous: form.anonymous ? 1 : 0,
      images: form.images,
    })
    showToast('评价成功')
    router.replace('/reviews')
  } finally {
    submitting.value = false
  }
}

onMounted(async () => {
  try {
    const data = await getOrderDetail(form.orderId)
    order.value = data.order
    const item = (data.order?.goodsList || data.items || []).find((i) => String(i.goodsId) === String(form.goodsId))
    if (item) {
      goods.value = item
      form.skuName = item.skuName || item.spec || ''
    }
  } catch (e) {}
})
</script>

<template>
  <div v-if="order && goods" class="page">
    <van-nav-bar title="发表评价" left-arrow @click="router.back()" />
    <h2 class="pc-title">发表评价</h2>

    <section class="card goods-card">
      <img :src="goods.image" :alt="goods.name" />
      <div>
        <strong>{{ goods.name }}</strong>
        <p>{{ goods.spec }} · {{ order.orderNo }}</p>
      </div>
    </section>

    <section class="card">
      <h3>商品评分</h3>
      <div class="rate-row">
        <van-rate v-model="form.star" color="#f59e0b" />
        <span>{{ labels[form.star - 1] }}</span>
      </div>
    </section>

    <section class="card">
      <h3>评价内容</h3>
      <van-field
        v-model="form.content"
        rows="4"
        autosize
        type="textarea"
        maxlength="200"
        show-word-limit
        placeholder="分享你的使用体验"
      />
    </section>

    <section class="card">
      <van-cell center title="匿名评价">
        <template #right-icon>
          <van-switch v-model="form.anonymous" :active-value="1" :inactive-value="0" size="20" />
        </template>
      </van-cell>
    </section>

    <div class="bar fixed-bottom-bar">
      <van-button type="primary" round block :loading="submitting" @click="submit">提交评价</van-button>
    </div>
  </div>
  <van-empty v-else description="订单商品不存在">
    <van-button round type="primary" size="small" to="/orders">返回订单</van-button>
  </van-empty>
</template>

<style scoped>
.page { min-height: 100vh; padding-bottom: 80px; }
.card { margin: 12px; background: #fff; border-radius: 16px; padding: 14px; }
.goods-card { display: grid; grid-template-columns: 64px 1fr; gap: 10px; align-items: center; }
.goods-card img { width: 64px; height: 64px; border-radius: 10px; object-fit: cover; background: #eef2ff; }
.goods-card p { margin: 6px 0 0; color: #98a0b3; font-size: 12px; }
h3 { margin: 0 0 12px; }
.rate-row { display: flex; align-items: center; gap: 10px; }
.bar {
  position: fixed; left: 0; right: 0; bottom: 0;
  padding: 10px 16px calc(10px + env(safe-area-inset-bottom)); background: #fff;
}
</style>
