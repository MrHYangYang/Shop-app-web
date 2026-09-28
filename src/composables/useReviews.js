import { computed, ref } from 'vue'
import { addGoodsReview, removeGoodsReview } from '@/composables/useGoods'
import { getAllOrders, getOrderById } from '@/composables/useOrders'
import { useUser } from '@/composables/useUser'

const STORAGE_KEY = 'shop-app-reviews'

const typeByStar = (star) => {
  if (star >= 4) return '好评'
  if (star === 3) return '中评'
  return '差评'
}

const pad = (n) => String(n).padStart(2, '0')

const nowText = () => {
  const d = new Date()
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`
}

const toGoodsReview = (review) => ({
  id: review.id,
  userName: review.anonymous ? '匿名用户' : review.userName,
  content: review.content,
  star: review.star,
  images: review.images || [],
  createdAt: review.createdAt.slice(0, 10),
})

const readList = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

const reviews = ref(readList())

const persist = () => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(reviews.value))
}

const hydrateGoods = () => {
  reviews.value.forEach((review) => {
    addGoodsReview(review.goodsId, toGoodsReview(review))
  })
}

hydrateGoods()

const reviewKey = (orderId, goodsId, spec) => `${orderId}-${goodsId}-${spec}`

export function hasReviewed(orderId, goodsId, spec, phone) {
  return reviews.value.some(
    (item) =>
      item.orderId === orderId &&
      item.goodsId === goodsId &&
      item.spec === spec &&
      (!phone || item.userPhone === phone),
  )
}

export function getPendingReviewItems(phone) {
  return getAllOrders()
    .filter((order) => order.status === '已完成')
    .flatMap((order) =>
      (order.goodsList || []).map((item) => ({
        orderId: order.id,
        orderNo: order.orderNo,
        goodsId: item.goodsId,
        spec: item.spec,
        name: item.name,
        image: item.image,
        price: item.price,
        shopName: item.shopName,
      })),
    )
    .filter((item) => !hasReviewed(item.orderId, item.goodsId, item.spec, phone))
}

export function getOrderPendingItems(orderId, phone) {
  return getPendingReviewItems(phone).filter((item) => item.orderId === orderId)
}

export function getReviewById(id) {
  return reviews.value.find((item) => item.id === id) || null
}

export function createReview({ orderId, goodsId, spec, star, content, images, anonymous }) {
  const { user } = useUser()
  if (!user.value) return { ok: false, message: '请先登录' }
  const order = getOrderById(orderId)
  if (!order || order.status !== '已完成') return { ok: false, message: '当前订单不可评价' }
  const line = order.goodsList?.find((item) => item.goodsId === goodsId && item.spec === spec)
  if (!line) return { ok: false, message: '订单中没有该商品' }
  if (hasReviewed(orderId, goodsId, spec, user.value.phone)) {
    return { ok: false, message: '该商品已经评价过了' }
  }
  const nextStar = Math.min(5, Math.max(1, Number(star) || 5))
  const text = String(content || '').trim()
  if (text.length < 5) return { ok: false, message: '评价内容至少 5 个字' }
  const photos = (images || []).filter((url) => typeof url === 'string' && url).slice(0, 6)
  const createdAt = nowText()
  const review = {
    id: `UR${Date.now()}`,
    orderId: order.id,
    orderNo: order.orderNo,
    goodsId: line.goodsId,
    spec: line.spec,
    goodsName: line.name,
    goodsImage: line.image,
    shopName: line.shopName || '',
    userName: user.value.name,
    userPhone: user.value.phone,
    star: nextStar,
    type: typeByStar(nextStar),
    content: text,
    images: photos,
    anonymous: Boolean(anonymous),
    createdAt,
    key: reviewKey(order.id, line.goodsId, line.spec),
  }
  reviews.value.unshift(review)
  persist()
  addGoodsReview(review.goodsId, toGoodsReview(review))
  return { ok: true, review }
}

export function removeReview(id) {
  const { user } = useUser()
  const review = getReviewById(id)
  if (!review) return null
  if (user.value && review.userPhone !== user.value.phone) return null
  reviews.value = reviews.value.filter((item) => item.id !== id)
  persist()
  removeGoodsReview(id)
  return review
}

export function useReviews() {
  const { user } = useUser()
  const myReviews = computed(() =>
    reviews.value.filter((item) => !user.value || item.userPhone === user.value.phone),
  )
  const pendingItems = computed(() => getPendingReviewItems(user.value?.phone))
  const pendingCount = computed(() => pendingItems.value.length)

  return {
    reviews,
    myReviews,
    pendingItems,
    pendingCount,
    hasReviewed,
    getPendingReviewItems,
    getOrderPendingItems,
    getReviewById,
    createReview,
    removeReview,
  }
}
