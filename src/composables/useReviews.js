import { computed, ref } from 'vue'
import * as api from '@/api'

const reviews = ref([])

export async function loadMyReviews(params = {}) {
  const data = await api.myReviews(params)
  reviews.value = data.records || []
  return reviews.value
}

export async function submitReview(payload) {
  return api.createReview(payload)
}

export function getOrderPendingItems(order) {
  if (!order?.items) return []
  const reviewed = new Set(reviews.value.filter((r) => String(r.orderId) === String(order.id)).map((r) => String(r.goodsId) + (r.skuName || '')))
  return order.items.filter((it) => !reviewed.has(String(it.goodsId) + (it.skuName || '')))
}

export function useReviews() {
  const pendingCount = computed(() => 0)
  return { reviews, pendingCount, loadMyReviews, submitReview, getOrderPendingItems }
}
