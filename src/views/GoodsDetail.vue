<script setup>
import { computed, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { showImagePreview, showToast } from 'vant'
import { getGoodsById } from '@/composables/useGoods'
import { addToCart, prepareBuyNow } from '@/composables/useCart'
import { useUser } from '@/composables/useUser'

const route = useRoute()
const router = useRouter()
const { isLogin } = useUser()
const skuVisible = ref(false)
const skuAction = ref('cart')
const spec = ref('')
const qty = ref(1)

const goods = computed(() => getGoodsById(route.params.id))
const specRows = computed(() => {
  const specs = goods.value?.specs?.[0] || {}
  return [
    { label: '处理器', value: specs.cpu },
    { label: '屏幕', value: specs.screen },
    { label: '内存', value: specs.memory },
    { label: '品牌', value: goods.value?.brand },
    { label: '型号', value: goods.value?.model },
    { label: '存储', value: specs.disk },
    { label: '电池', value: specs.battery },
    { label: '保修', value: specs.warranty, accent: true },
  ].filter((item) => item.value && item.value !== '-')
})

watch(
  goods,
  (item) => {
    const options = item?.skuOptions || []
    if (!options.includes(spec.value)) {
      spec.value = options[0] || ''
    }
    qty.value = 1
  },
  { immediate: true },
)

const openSku = (action) => {
  if (!goods.value) return
  skuAction.value = action
  qty.value = 1
  skuVisible.value = true
}

const confirmSku = () => {
  if (!goods.value) return
  if (skuAction.value === 'cart') {
    addToCart(goods.value, { qty: qty.value, spec: spec.value })
    skuVisible.value = false
    showToast('已加入购物车')
    return
  }
  if (!isLogin.value) {
    skuVisible.value = false
    router.push({ path: '/login', query: { redirect: route.fullPath } })
    return
  }
  prepareBuyNow(goods.value, { qty: qty.value, spec: spec.value })
  skuVisible.value = false
  router.push('/checkout')
}

const previewReview = (images, index) => {
  if (!images?.length) return
  showImagePreview({ images, startPosition: index })
}
</script>

<template>
  <div v-if="goods" class="detail">
    <van-nav-bar title="商品详情" left-arrow @click="router.back()" />
    <h2 class="pc-title">商品详情</h2>
    <div class="detail-main">
    <van-swipe class="gallery" :autoplay="4000" indicator-color="#fff">
      <van-swipe-item v-for="(url, index) in goods.images" :key="index">
        <img :src="url" :alt="goods.name" />
      </van-swipe-item>
    </van-swipe>

    <section class="card price-card">
      <div class="price-row">
        <span class="price"><em>¥</em>{{ goods.salePrice }}</span>
        <del>¥{{ goods.marketPrice }}</del>
      </div>
      <h1>{{ goods.name }}</h1>
      <p>{{ goods.description }}</p>
      <div class="meta">
        <span>{{ goods.shopName }}</span>
        <span>已售 {{ goods.sales }}</span>
        <span>库存 {{ goods.stock }}</span>
      </div>
      <div class="sku-inline">
        <h4>规格</h4>
        <div class="options">
          <button
            v-for="item in goods.skuOptions"
            :key="item"
            type="button"
            :class="{ active: spec === item }"
            @click="spec = item"
          >
            {{ item }}
          </button>
        </div>
      </div>
      <div class="pc-actions">
        <van-button round type="warning" @click="openSku('cart')">加入购物车</van-button>
        <van-button round type="danger" @click="openSku('buy')">立即购买</van-button>
      </div>
    </section>

    <section class="card spec-card">
      <h3>商品参数</h3>
      <div class="param-grid">
        <div v-for="item in specRows" :key="item.label" class="param-item">
          <span>{{ item.label }}</span>
          <strong :class="{ accent: item.accent }">{{ item.value }}</strong>
        </div>
      </div>
    </section>

    <section class="card review-card">
      <h3>用户评价{{ goods.reviews?.length ? `（${goods.reviews.length}）` : '' }}</h3>
      <div v-for="item in goods.reviews" :key="item.id" class="review">
        <div class="review-head">
          <strong>{{ item.userName }}</strong>
          <van-rate :model-value="item.star" size="12" readonly color="#f59e0b" />
        </div>
        <p>{{ item.content }}</p>
        <div v-if="item.images?.length" class="review-photos">
          <button
            v-for="(url, index) in item.images"
            :key="index"
            type="button"
            @click="previewReview(item.images, index)"
          >
            <img :src="url" alt="评价图片" />
          </button>
        </div>
        <span>{{ item.createdAt }}</span>
      </div>
    </section>

    <section class="card intro-card">
      <h3>商品介绍</h3>
      <p class="intro">{{ goods.detailText }}</p>
      <img v-for="(url, index) in goods.images" :key="index" :src="url" :alt="goods.name" />
    </section>
    </div>

    <van-action-bar class="mobile-action-bar">
      <van-action-bar-icon icon="shop-o" text="店铺" @click="router.push('/home')" />
      <van-action-bar-icon icon="cart-o" text="购物车" @click="router.push('/cart')" />
      <van-action-bar-button type="warning" text="加入购物车" @click="openSku('cart')" />
      <van-action-bar-button type="danger" text="立即购买" @click="openSku('buy')" />
    </van-action-bar>

    <van-popup v-model:show="skuVisible" class="sku-popup" round position="bottom">
      <div class="sku">
        <div class="sku-goods">
          <img :src="goods.image" :alt="goods.name" />
          <div>
            <strong>{{ goods.name }}</strong>
            <p class="price"><em>¥</em>{{ goods.salePrice }}</p>
          </div>
        </div>
        <div class="qty">
          <span>数量</span>
          <van-stepper v-model="qty" min="1" :max="goods.stock" />
        </div>
        <van-button type="primary" round block @click="confirmSku">
          {{ skuAction === 'cart' ? '加入购物车' : '立即购买' }}
        </van-button>
      </div>
    </van-popup>
  </div>
  <van-empty v-else description="商品不存在">
    <van-button round type="primary" size="small" to="/home">返回首页</van-button>
  </van-empty>
</template>

<style scoped>
.detail {
  padding-bottom: 64px;
}

.gallery img {
  width: 100%;
  height: 360px;
  object-fit: cover;
  background: #fff;
}

.card {
  margin: 12px;
  padding: 14px;
  background: #fff;
  border-radius: 16px;
}

.price-row {
  display: flex;
  align-items: baseline;
  gap: 8px;
}

.price {
  font-size: 24px;
}

del {
  color: #b4b9c5;
}

h1 {
  margin: 10px 0 8px;
  font-size: 18px;
}

.price-card p,
.intro {
  color: #667085;
  font-size: 13px;
  line-height: 1.6;
}

.meta {
  display: flex;
  justify-content: space-between;
  margin-top: 12px;
  color: var(--text-secondary);
  font-size: 12px;
}

h3 {
  margin: 0 0 8px;
  font-size: 15px;
}

.spec-card h3 {
  font-size: 18px;
}

.param-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 18px 16px;
  padding: 8px 0 4px;
}

.param-item span {
  display: block;
  color: #9aa1ae;
  font-size: 13px;
}

.param-item strong {
  display: block;
  margin-top: 8px;
  color: #1f2430;
  font-size: 18px;
  font-weight: 700;
  line-height: 1.3;
  word-break: break-all;
}

.param-item strong.accent {
  color: #6d6ef6;
}

.review {
  padding: 10px 0;
  border-top: 1px solid #f3f5fb;
}

.review-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.review p {
  margin: 8px 0 6px;
  font-size: 13px;
}

.review span {
  color: #a0a6b3;
  font-size: 12px;
}

.review-photos {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin: 8px 0;
}

.review-photos button {
  padding: 0;
  border: 0;
  background: transparent;
}

.review-photos img {
  width: 64px;
  height: 64px;
  margin-top: 0;
  border-radius: 8px;
  object-fit: cover;
}

.card img {
  width: 100%;
  border-radius: 12px;
  margin-top: 10px;
}

:deep(.van-action-bar) {
  left: 0;
  right: 0;
  transform: none;
  max-width: none;
}

.sku-inline {
  margin-top: 16px;
  padding-top: 16px;
  border-top: 1px solid #f3f5fb;
}

.sku-inline h4,
.sku h4 {
  margin: 0 0 10px;
  font-size: 14px;
}

.sku {
  padding: 20px 16px 24px;
}

.sku-goods {
  display: grid;
  grid-template-columns: 84px 1fr;
  gap: 12px;
  margin-bottom: 16px;
}

.sku-goods img {
  width: 84px;
  height: 84px;
  border-radius: 10px;
  object-fit: cover;
}

.options {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.options button {
  border: 0;
  background: #f4f7ff;
  border-radius: 999px;
  padding: 6px 12px;
}

.options button.active {
  background: #e8eeff;
  color: var(--brand-blue);
  font-weight: 700;
}

.qty {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin: 18px 0;
}

.pc-actions {
  display: none;
}

@media (min-width: 960px) {
  .detail {
    width: min(var(--app-max), calc(100% - 48px));
    margin: 0 auto;
    padding: 0 0 48px;
  }

  .detail-main {
    display: grid;
    grid-template-columns: minmax(360px, 480px) 1fr;
    gap: 20px;
    align-items: start;
  }

  .gallery {
    grid-column: 1;
    grid-row: 1 / span 2;
    border-radius: 16px;
    overflow: hidden;
  }

  .gallery img {
    height: 480px;
  }

  .card {
    margin: 0;
  }

  .price-card {
    grid-column: 2;
    grid-row: 1;
  }

  .spec-card {
    grid-column: 2;
    grid-row: 2;
  }

  .review-card,
  .intro-card {
    grid-column: 1 / -1;
  }

  .spec-card h3 {
    margin-bottom: 12px;
    font-size: 24px;
  }

  .param-grid {
    grid-template-columns: repeat(4, 1fr);
    gap: 28px 24px;
    padding: 12px 8px 8px;
  }

  .param-item span {
    font-size: 14px;
  }

  .param-item strong {
    font-size: 22px;
  }

  h1 {
    font-size: 28px;
  }

  .sku-inline h4 {
    font-size: 16px;
  }

  .pc-actions {
    display: flex;
    gap: 12px;
    margin-top: 24px;
  }

  .pc-actions .van-button {
    width: 160px;
    height: 44px;
  }

  .mobile-action-bar {
    display: none !important;
  }

  :deep(.sku-popup) {
    width: 480px;
    left: 50%;
    right: auto;
    transform: translateX(-50%);
  }
}

</style>
