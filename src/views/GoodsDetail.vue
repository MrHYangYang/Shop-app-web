<script setup>
import { computed, onMounted, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { showImagePreview, showToast } from 'vant'
import { fetchGoodsDetail } from '@/composables/useGoods'
import { addToCart, prepareBuyNow } from '@/composables/useCart'
import { useUser } from '@/composables/useUser'

const route = useRoute()
const router = useRouter()
const { isLogin } = useUser()
const skuVisible = ref(false)
const skuAction = ref('cart')
const spec = ref('')
const qty = ref(1)
const detail = ref(null)
const paramsExpanded = ref(false)
const goods = computed(() => detail.value?.goods || null)
const images = computed(() => {
  const imgs = detail.value?.images || []
  if (imgs.length) return imgs.map((i) => i.url || i).filter(Boolean)
  return goods.value?.coverImage ? [goods.value.coverImage] : []
})
const skus = computed(() => detail.value?.skus || [])
const reviews = computed(() => detail.value?.reviews || [])
const shopName = computed(() => detail.value?.shopName || goods.value?.shopName || '')

/** 解析商品参数：兼容数组 [{label,value}] / 扁平对象 / {items:[]} */
const parseParams = (raw) => {
  if (!raw) return []
  let data = raw
  if (typeof raw === 'string') {
    const t = raw.trim()
    if (!t || t === '[]' || t === '{}' || t.toLowerCase() === 'null') return []
    try { data = JSON.parse(t) } catch { return [] }
  }
  if (Array.isArray(data)) {
    return data
      .map((p, i) => {
        if (!p || typeof p !== 'object') return null
        const label = String(p.label || p.key || p.name || '').trim()
        const value = p.value == null ? '' : String(p.value).trim()
        if (!label && !value) return null
        return { key: String(p.key || `p${i}`), label: label || `参数${i + 1}`, value }
      })
      .filter(Boolean)
  }
  if (data && typeof data === 'object') {
    if (Array.isArray(data.items)) return parseParams(data.items)
    return Object.entries(data)
      .filter(([k, v]) => k !== 'items' && v != null && typeof v !== 'object')
      .map(([k, v]) => ({ key: k, label: k, value: String(v).trim() }))
      .filter((p) => p.label || p.value)
  }
  return []
}

const goodsParams = computed(() => {
  const g = goods.value
  if (!g) return []
  if (Array.isArray(g.params) && g.params.length) return parseParams(g.params)
  return parseParams(g.specJson)
})

/** 图文详情去掉内嵌的「核心参数/商品参数」表格，避免与独立卡片重复 */
const detailHtml = computed(() => {
  const html = goods.value?.detailText || ''
  if (!html) return ''
  return html
    .replace(/<h3[^>]*>\s*(核心参数|商品参数)\s*<\/h3>\s*<table[\s\S]*?<\/table>/gi, '')
    .replace(/<(h3|h2|p|div)[^>]*>\s*(核心参数|商品参数)\s*<\/\1>/gi, '')
})

const skuOptions = computed(() => skus.value.map((s) => s.skuName).filter(Boolean))
const currentPrice = computed(() => {
  const sku = skus.value.find((s) => s.skuName === spec.value)
  return sku?.price ?? goods.value?.salePrice ?? 0
})

const openSku = (action) => {
  if (!isLogin.value) {
    router.push({ path: '/login', query: { redirect: route.fullPath } })
    return
  }
  skuAction.value = action
  if (!spec.value && skuOptions.value[0]) spec.value = skuOptions.value[0]
  if (!spec.value) spec.value = '标准款'
  skuVisible.value = true
}
const confirmSku = async () => {
  if (!goods.value) return
  const sku = skus.value.find((s) => s.skuName === spec.value) || skus.value[0]
  const payload = {
    goodsId: goods.value.id,
    skuId: sku?.id,
    spec: sku?.skuName || spec.value || '标准款',
    quantity: qty.value,
    name: goods.value.name,
    image: goods.value.coverImage,
    price: sku?.price || goods.value.salePrice,
    stock: sku?.stock ?? goods.value.stock,
    shopName: shopName.value,
  }
  if (skuAction.value === 'cart') {
    await addToCart(payload)
    showToast('已加入购物车')
  } else {
    prepareBuyNow(payload)
    router.push('/checkout')
  }
  skuVisible.value = false
}
const preview = (i) => showImagePreview({ images: images.value, startPosition: i })
const load = async () => {
  paramsExpanded.value = false
  detail.value = await fetchGoodsDetail(route.params.id)
  if (!spec.value && skuOptions.value[0]) spec.value = skuOptions.value[0]
}
watch(() => route.params.id, load)
onMounted(load)
</script>

<template>
  <div v-if="goods" class="detail">
    <van-nav-bar title="商品详情" left-arrow @click="router.back()" />
    <h2 class="pc-title">商品详情</h2>
    <van-swipe class="gallery" :autoplay="4000" indicator-color="#fff">
      <van-swipe-item v-for="(url, index) in images" :key="index" @click="preview(index)">
        <img :src="url" :alt="goods.name" />
      </van-swipe-item>
    </van-swipe>

    <section class="card price-card">
      <div class="price-row">
        <span class="price"><em>¥</em>{{ currentPrice }}</span>
        <del v-if="goods.marketPrice">¥{{ goods.marketPrice }}</del>
      </div>
      <h1>{{ goods.name }}</h1>
      <p>{{ goods.description }}</p>
      <div class="meta">
        <span>{{ shopName }}</span>
        <span>销量 {{ goods.sales || 0 }}</span>
        <span>库存 {{ goods.stock || 0 }}</span>
      </div>
    </section>

    <section class="card">
      <van-cell title="已选规格" :value="spec || '请选择'" is-link @click="openSku('cart')" />
    </section>

    <section v-if="reviews.length" class="card">
      <div class="block-head">
        <h3>用户评价</h3>
        <span>{{ reviews.length }}+条</span>
      </div>
      <div v-for="r in reviews.slice(0, 3)" :key="r.id" class="review">
        <strong>{{ r.anonymous === 1 ? '匿名用户' : (r.userName || '用户') }}</strong>
        <van-rate :model-value="r.star || 5" readonly size="12" />
        <p>{{ r.content }}</p>
      </div>
    </section>

    <section class="card params-card" v-if="goodsParams.length">
      <h3>商品参数</h3>
      <div class="param-list" :class="{ collapsed: !paramsExpanded && goodsParams.length > 2 }">
        <div v-for="(p, idx) in goodsParams" :key="p.key || idx" class="param-row">
          <span class="param-label">{{ p.label }}</span>
          <span class="param-value">{{ p.value || '-' }}</span>
        </div>
      </div>
      <button
        v-if="!paramsExpanded && goodsParams.length > 2"
        type="button"
        class="param-expand-hint"
        @click="paramsExpanded = true"
        aria-label="展开全部参数"
      >
        <span class="chevron"></span>
      </button>
    </section>

    <section class="card" v-if="detailHtml">
      <h3>图文详情</h3>
      <div class="rich" v-html="detailHtml"></div>
    </section>

    <div class="bar fixed-bottom-bar">
      <van-button round type="warning" @click="openSku('cart')">加入购物车</van-button>
      <van-button round type="danger" @click="openSku('buy')">立即购买</van-button>
    </div>

    <van-action-sheet v-model:show="skuVisible" title="选择规格">
      <div class="sku-panel">
        <div class="options">
          <button
            v-for="item in (skuOptions.length ? skuOptions : ['标准款'])"
            :key="item"
            type="button"
            :class="{ active: spec === item }"
            @click="spec = item"
          >{{ item }}</button>
        </div>
        <div class="qty-row">
          <span>数量</span>
          <van-stepper v-model="qty" min="1" :max="Math.max(1, goods.stock || 99)" />
        </div>
        <van-button type="primary" block round @click="confirmSku">
          {{ skuAction === 'cart' ? '加入购物车' : '立即购买' }}
        </van-button>
      </div>
    </van-action-sheet>
  </div>
  <van-empty v-else description="商品不存在或已下架" />
</template>

<style scoped>
.detail { min-height: 100vh; padding-bottom: 72px; }
.gallery { height: 360px; background: #fff; }
.gallery img { width: 100%; height: 360px; object-fit: cover; }
.card { margin: 12px; background: #fff; border-radius: 16px; padding: 14px; }
.price { color: #ef4444; font-size: 24px; font-weight: 700; }
.price em { font-style: normal; font-size: 14px; }
.price-row { display: flex; align-items: baseline; gap: 10px; }
.price-row del { color: #98a0b3; font-size: 13px; }
h1 { margin: 10px 0 8px; font-size: 18px; }
.card > p, .review p { margin: 0; color: #4a5160; font-size: 13px; line-height: 1.6; }
.meta { display: flex; gap: 12px; margin-top: 10px; color: #98a0b3; font-size: 12px; }
.block-head { display: flex; justify-content: space-between; margin-bottom: 10px; }
.block-head h3, .card h3 { margin: 0 0 10px; }
.review { padding: 8px 0; border-top: 1px solid #f3f5fb; }
.review strong { margin-right: 8px; font-size: 13px; }
.rich :deep(img) { max-width: 100%; border-radius: 8px; }
.params-card h3 { margin: 0 0 12px; font-size: 16px; }
.params-card { position: relative; }
.param-list { display: flex; flex-direction: column; gap: 0; }
.param-list.collapsed {
  max-height: 100px; /* ~2.5 rows */
  overflow: hidden;
  mask-image: linear-gradient(to bottom, #000 55%, transparent 100%);
  -webkit-mask-image: linear-gradient(to bottom, #000 55%, transparent 100%);
}
.param-row {
  display: flex; justify-content: space-between; gap: 12px;
  padding: 10px 0; border-bottom: 1px solid #f3f5fb; font-size: 13px;
  min-height: 20px; box-sizing: content-box;
}
.param-row:last-child { border-bottom: none; padding-bottom: 0; }
.param-label { color: #98a0b3; flex: 0 0 36%; }
.param-value { color: #1f2937; text-align: right; flex: 1; word-break: break-all; }
.param-expand-hint {
  display: flex; align-items: center; justify-content: center;
  width: 100%; margin-top: 4px; padding: 6px 0 0;
  border: none; background: transparent; cursor: pointer;
}
.param-expand-hint .chevron {
  width: 12px; height: 12px;
  border-right: 2px solid #98a0b3;
  border-bottom: 2px solid #98a0b3;
  transform: rotate(45deg);
  transform-origin: center;
  animation: param-chevron-bounce 1.1s ease-in-out infinite;
}
@keyframes param-chevron-bounce {
  0%, 100% { transform: rotate(45deg) scale(0.85) translateY(-1px); opacity: 0.55; }
  50% { transform: rotate(45deg) scale(1.25) translateY(2px); opacity: 1; }
}
.bar {
  position: fixed; left: 0; right: 0; bottom: 0; display: flex; gap: 10px;
  padding: 10px 16px calc(10px + env(safe-area-inset-bottom)); background: #fff;
}
.bar .van-button { flex: 1; }
.sku-panel { padding: 12px 16px 24px; }
.options { display: flex; flex-wrap: wrap; gap: 8px; margin-bottom: 16px; }
.options button {
  border: 1px solid #e5e7ef; background: #f7f8fc; border-radius: 999px; padding: 6px 12px;
}
.options button.active { border-color: #4d7cff; color: #4d7cff; background: #eef2ff; }
.qty-row { display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; }
</style>
