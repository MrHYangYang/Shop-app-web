import { computed, ref } from 'vue'
import * as api from '@/api'

const tickets = ref([])

const mapItem = (i) => ({
  goodsId: i.goodsId,
  name: i.goodsName || i.name || '',
  image: i.goodsImage || i.image || '',
  spec: i.skuName || i.spec || '标准款',
  qty: Number(i.qty ?? i.quantity ?? 1) || 1,
  price: Number(i.price ?? 0),
})

const mapTicket = (t, extra = {}) => {
  const items = (extra.items || t.items || t.goodsList || []).map(mapItem)
  const images = (extra.images || t.images || []).map((img) => (typeof img === 'string' ? img : img.url)).filter(Boolean)
  const logs = (extra.logs || t.logs || []).map((l) => (typeof l === 'string' ? l : (l.content || '')))
  return { ...t, goodsList: items, items, images, logs }
}

export async function loadAfterSales(params = {}) {
  const data = await api.getAfterSales(params)
  tickets.value = (data.records || []).map((t) => mapTicket(t))
  return tickets.value
}

export async function applyAfterSale(payload) {
  return api.applyAfterSale(payload)
}

export async function getAfterSaleDetail(id) {
  const data = await api.getAfterSale(id)
  const ticket = mapTicket(data.afterSale || data, data)
  const idx = tickets.value.findIndex((t) => String(t.id) === String(ticket.id))
  if (idx >= 0) tickets.value[idx] = ticket
  return { ...data, ticket, afterSale: ticket }
}

export function getAfterSaleByOrderId(orderId) {
  return tickets.value.find((t) => String(t.orderId) === String(orderId)) || null
}

export function getActiveAfterSale(orderId) {
  return tickets.value.find((t) => String(t.orderId) === String(orderId) && t.status !== '已取消' && t.status !== '已完成' && t.status !== '已拒绝') || null
}

export async function cancelAfterSale(id) {
  await api.cancelAfterSale(id)
  await loadAfterSales()
}

export async function submitReturnExpress(id, data) {
  await api.returnExpress(id, data)
  await loadAfterSales()
}

export function useAfterSales() {
  const pendingCount = computed(() => tickets.value.filter((t) => t.status === '待审核' || t.status === '待退货' || t.status === '处理中').length)
  return { tickets, pendingCount, loadAfterSales, applyAfterSale, getAfterSaleDetail, getAfterSaleByOrderId, getActiveAfterSale, cancelAfterSale, submitReturnExpress }
}
