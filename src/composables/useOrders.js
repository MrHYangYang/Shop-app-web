import { computed, ref } from 'vue'
import * as api from '@/api'

const orders = ref([])

const mapItem = (i) => ({
  id: i.id,
  goodsId: i.goodsId,
  name: i.goodsName || i.name || '',
  image: i.goodsImage || i.image || '',
  spec: i.skuName || i.spec || '标准款',
  skuName: i.skuName || i.spec || '标准款',
  qty: Number(i.qty ?? i.quantity ?? 1) || 1,
  quantity: Number(i.qty ?? i.quantity ?? 1) || 1,
  price: Number(i.price ?? 0),
  shopName: i.shopName || '',
})

const mapOrder = (o) => {
  const items = (o.items || o.goodsList || []).map(mapItem)
  const address = o.addressSnapshot
    || [o.receiverName, o.receiverPhone, (o.receiverRegion || '') + (o.receiverDetail || '')].filter(Boolean).join(' ')
  const logs = (o.logs || []).map((l) => (typeof l === 'string' ? l : (l.content || '')))
  return {
    ...o,
    amount: o.payAmount ?? o.totalAmount ?? o.amount,
    address,
    items,
    goodsList: items,
    logs,
  }
}

/** 分页拉取订单，返回 { records, total, page, size }，不改动全局 orders */
export async function fetchOrders(params = {}) {
  const data = await api.getOrders(params)
  const records = (data.records || []).map(mapOrder)
  return {
    page: Number(data.page || params.page || 1),
    size: Number(data.size || params.size || 10),
    total: Number(data.total || 0),
    records,
  }
}

/** 拉取并写入全局 orders（我的页角标等） */
export async function loadOrders(params = {}) {
  const data = await fetchOrders(params)
  orders.value = data.records
  return data
}

export function getOrderById(id) {
  return orders.value.find((o) => String(o.id) === String(id)) || null
}

export async function createOrder(payload) {
  return api.createOrder(payload)
}

export async function getOrderDetail(id) {
  const data = await api.getOrder(id)
  const order = mapOrder({ ...(data.order || data), items: data.items || [], logs: data.logs || [] })
  const idx = orders.value.findIndex((o) => String(o.id) === String(order.id))
  if (idx >= 0) orders.value[idx] = order
  else orders.value.unshift(order)
  return { ...data, order, items: order.items, logs: order.logs }
}

export async function payOrder(id, payType) {
  await api.payOrder(id, { payType })
  await loadOrders({ page: 1, size: 50 })
}

export async function cancelOrder(id) {
  await api.cancelOrder(id)
  await loadOrders({ page: 1, size: 50 })
}

export async function confirmOrder(id) {
  await api.confirmOrder(id)
  await loadOrders({ page: 1, size: 50 })
}

export function canApplyAfterSale(order) {
  return order && ['待发货', '待收货', '已完成'].includes(order.status)
}

export function useOrders() {
  const pendingPay = computed(() => orders.value.filter((o) => o.status === '待付款').length)
  const pendingShip = computed(() => orders.value.filter((o) => o.status === '待发货').length)
  const pendingReceive = computed(() => orders.value.filter((o) => o.status === '待收货').length)
  return { orders, pendingPay, pendingShip, pendingReceive, loadOrders, fetchOrders, createOrder, getOrderDetail, getOrderById, payOrder, cancelOrder, confirmOrder, canApplyAfterSale }
}
