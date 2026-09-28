import { computed, ref } from 'vue'

const STORAGE_KEY = 'shop-app-orders'

const readList = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

const orders = ref(readList())

const persist = () => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(orders.value))
}

const pad = (n) => String(n).padStart(2, '0')

const nowText = () => {
  const d = new Date()
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`
}

const nextNo = () => `103-${String(8000 + orders.value.length + 1)}`

export function createOrder({ goodsList, address, payType = '微信支付' }) {
  const createdAt = nowText()
  const amount = goodsList.reduce((sum, item) => sum + item.price * item.qty, 0)
  const order = {
    id: `O${Date.now()}`,
    orderNo: nextNo(),
    status: '待付款',
    payType,
    amount,
    createdAt,
    payTime: '',
    address: `${address.name} ${address.phone} ${address.region}${address.detail}`,
    addressInfo: { ...address },
    goodsList: goodsList.map((item) => ({ ...item })),
    expressNo: '',
    expressName: '顺丰速运',
    logs: [`${createdAt} 买家提交订单。`, '等待买家付款。'],
  }
  orders.value.unshift(order)
  persist()
  return order
}

export function payOrder(id) {
  const order = orders.value.find((item) => item.id === id)
  if (!order || order.status !== '待付款') return null
  const time = nowText()
  order.status = '待发货'
  order.payTime = time
  order.logs = order.logs.filter((line) => line !== '等待买家付款。')
  order.logs.push(`${time} 买家已完成支付（${order.payType}）。`)
  persist()
  return order
}

export function cancelOrder(id) {
  const order = orders.value.find((item) => item.id === id)
  if (!order || !['待付款', '待发货'].includes(order.status)) return null
  order.status = '已取消'
  order.logs.push(`${nowText()} 买家取消订单。`)
  persist()
  return order
}

export function shipOrder(id) {
  const order = orders.value.find((item) => item.id === id)
  if (!order || order.status !== '待发货') return null
  const time = nowText()
  order.status = '待收货'
  order.expressNo = `SF${100086000 + orders.value.length}`
  order.logs.push(`${time} 商家已发货，运单号 ${order.expressNo}。`)
  persist()
  return order
}

export function confirmOrder(id) {
  const order = orders.value.find((item) => item.id === id)
  if (!order || order.status !== '待收货') return null
  order.status = '已完成'
  order.logs.push(`${nowText()} 买家确认收货。`)
  persist()
  return order
}

export function removeOrder(id) {
  orders.value = orders.value.filter((item) => item.id !== id)
  persist()
}

export function getOrderById(id) {
  return orders.value.find((item) => item.id === id) || null
}

export function getAllOrders() {
  return orders.value
}

export const AFTER_SALE_APPLY_STATUSES = ['待发货', '待收货', '已完成']

export function canApplyAfterSale(order) {
  return Boolean(order && AFTER_SALE_APPLY_STATUSES.includes(order.status))
}

export function markOrderAfterSale(id, { afterSaleId, log } = {}) {
  const order = orders.value.find((item) => item.id === id)
  if (!order) return null
  if (!order.prevStatus) order.prevStatus = order.status
  order.status = '售后中'
  order.afterSaleId = afterSaleId || order.afterSaleId || ''
  if (log) order.logs.push(log)
  persist()
  return order
}

export function finishOrderAfterSale(id, { nextStatus, log } = {}) {
  const order = orders.value.find((item) => item.id === id)
  if (!order) return null
  order.status = nextStatus || order.prevStatus || '已完成'
  order.afterSaleId = ''
  order.prevStatus = ''
  if (log) order.logs.push(log)
  persist()
  return order
}

export function useOrders() {
  const pendingPay = computed(() => orders.value.filter((item) => item.status === '待付款').length)
  const pendingShip = computed(() => orders.value.filter((item) => item.status === '待发货').length)
  const pendingReceive = computed(() => orders.value.filter((item) => item.status === '待收货').length)
  const completed = computed(() => orders.value.filter((item) => item.status === '已完成').length)

  return {
    orders,
    pendingPay,
    pendingShip,
    pendingReceive,
    completed,
    createOrder,
    payOrder,
    cancelOrder,
    shipOrder,
    confirmOrder,
    removeOrder,
    getOrderById,
  }
}
