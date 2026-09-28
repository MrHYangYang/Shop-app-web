<script setup>
import { computed, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { showToast } from 'vant'
import { createReview, getOrderPendingItems, hasReviewed } from '@/composables/useReviews'
import { getOrderById } from '@/composables/useOrders'
import { useUser } from '@/composables/useUser'

const route = useRoute()
const router = useRouter()
const { user } = useUser()
const star = ref(5)
const content = ref('')
const anonymous = ref(false)
const fileList = ref([])

const order = computed(() => getOrderById(route.params.orderId))
const spec = computed(() => String(route.query.spec || ''))
const goods = computed(() => {
  const list = order.value?.goodsList || []
  const goodsId = route.params.goodsId
  return (
    list.find((item) => item.goodsId === goodsId && item.spec === spec.value) ||
    list.find((item) => item.goodsId === goodsId) ||
    null
  )
})

const labels = ['非常差', '差', '一般', '满意', '非常满意']

watch(
  [order, goods],
  () => {
    if (!order.value) return
    if (order.value.status !== '已完成') {
      showToast('当前订单不可评价')
      router.replace(`/orders/${order.value.id}`)
      return
    }
    if (!goods.value) {
      showToast('订单中没有该商品')
      router.replace('/reviews')
      return
    }
    if (hasReviewed(order.value.id, goods.value.goodsId, goods.value.spec, user.value?.phone)) {
      showToast('该商品已经评价过了')
      router.replace({ path: '/reviews', query: { tab: 'done' } })
    }
  },
  { immediate: true },
)

const afterRead = (file) => {
  const items = Array.isArray(file) ? file : [file]
  items.forEach((item) => {
    if (!item.file) return
    item.status = 'uploading'
    const reader = new FileReader()
    reader.onload = () => {
      item.content = reader.result
      item.url = reader.result
      item.status = 'done'
    }
    reader.onerror = () => {
      item.status = 'failed'
      item.message = '上传失败'
    }
    reader.readAsDataURL(item.file)
  })
}

const onOversize = () => {
  showToast('单张图片不能超过 2MB')
}

const submit = () => {
  const result = createReview({
    orderId: order.value.id,
    goodsId: goods.value.goodsId,
    spec: goods.value.spec,
    star: star.value,
    content: content.value,
    images: fileList.value.map((item) => item.url || item.content).filter(Boolean),
    anonymous: anonymous.value,
  })
  if (!result.ok) {
    showToast(result.message)
    return
  }
  const remain = getOrderPendingItems(order.value.id, user.value?.phone)
  showToast('评价成功')
  if (remain.length) {
    router.replace('/reviews')
    return
  }
  router.replace({ path: '/reviews', query: { tab: 'done' } })
}
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
        <van-rate v-model="star" color="#f59e0b" />
        <span>{{ labels[star - 1] }}</span>
      </div>
    </section>

    <section class="card">
      <h3>评价内容</h3>
      <van-field
        v-model="content"
        rows="4"
        autosize
        type="textarea"
        maxlength="200"
        show-word-limit
        placeholder="分享你的使用体验，至少 5 个字"
      />
    </section>

    <section class="card">
      <h3>晒图</h3>
      <p class="tip">最多上传 6 张，单张不超过 2MB</p>
      <van-uploader
        v-model="fileList"
        multiple
        accept="image/*"
        :max-count="6"
        :max-size="2 * 1024 * 1024"
        :after-read="afterRead"
        @oversize="onOversize"
      />
    </section>

    <section class="card">
      <van-cell center title="匿名评价">
        <template #right-icon>
          <van-switch v-model="anonymous" size="20px" />
        </template>
      </van-cell>
    </section>

    <div class="bar fixed-bottom-bar">
      <van-button type="primary" round block @click="submit">提交评价</van-button>
    </div>
  </div>
  <van-empty v-else description="评价信息不存在">
    <van-button round type="primary" size="small" to="/reviews">返回评价</van-button>
  </van-empty>
</template>

<style scoped>
.page {
  min-height: 100vh;
  padding-bottom: 80px;
}

.card {
  margin: 12px;
  padding: 14px;
  background: #fff;
  border-radius: 16px;
}

.goods-card {
  display: grid;
  grid-template-columns: 72px 1fr;
  gap: 12px;
  align-items: center;
}

.goods-card img {
  width: 72px;
  height: 72px;
  border-radius: 10px;
  object-fit: cover;
}

.goods-card p {
  margin: 6px 0 0;
  color: var(--text-secondary);
  font-size: 12px;
}

h3 {
  margin: 0 0 12px;
  font-size: 15px;
}

.rate-row {
  display: flex;
  align-items: center;
  gap: 12px;
}

.rate-row span {
  color: #f59e0b;
  font-size: 14px;
}

.tip {
  margin: -4px 0 12px;
  color: var(--text-secondary);
  font-size: 12px;
}

.bar {
  position: fixed;
  left: 0;
  right: 0;
  bottom: 0;
  width: 100%;
  padding: 10px 16px calc(10px + env(safe-area-inset-bottom));
  background: #fff;
  box-shadow: 0 -6px 18px rgba(31, 36, 48, 0.06);
}

@media (min-width: 960px) {
  .page {
    width: min(860px, calc(100% - 48px));
    margin: 0 auto;
    padding-bottom: 96px;
  }

  .card {
    margin: 16px 0 0;
    padding: 20px;
  }

  .bar {
    height: 72px;
    display: flex;
    align-items: center;
  }
}
</style>
