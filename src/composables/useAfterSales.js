import { computed, ref } from 'vue'
import { finishOrderAfterSale, getOrderById, markOrderAfterSale } from '@/composables/useOrders'

const STORAGE_KEY = 'shop-app-after-sales'

export const AFTER_SALE_TYPES = ['仅退款', '退货退款', '换货']
export const AFTER_SALE_STATUSES = ['待审核', '待退货', '处理中', '已完成', '已拒绝', '已取消']
export const AFTER_SALE_REASONS = {
  仅退款: ['拍错/多拍', '不想要了', '少件漏发', '质量问题', '其他'],
  退货退款: ['质量问题', '与描述不符', '少件漏发', '不想要了', '其他'],
  换货: ['规格拍错', '质量问题', '收到商品损坏', '其他'],
}

const ACTIVE_STATUSES = ['待审核', '待退货', '处理中']

const readList = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

const tickets = ref(readList())

const persist = () => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(tickets.value))
}

const pad = (n) => String(n).padStart(2, '0')

const nowText = () => {
  const d = new Date()
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`
}

const nextNo = () => `AS-${String(20001 + tickets.value.length)}`

export function getAfterSaleById(id) {
  return tickets.value.find((item) => item.id === id) || null
}

export function getAfterSaleByOrderId(orderId) {
  return tickets.value.find((item) => item.orderId === orderId) || null
}

export function getActiveAfterSale(orderId) {
  return (
    tickets.value.find((item) => item.orderId === orderId && ACTIVE_STATUSES.includes(item.status)) ||
    null
  )
}

export function availableTypes(order) {
  if (!order) return []
  if (order.status === '待发货' || order.prevStatus === '待发货') return ['仅退款']
  return [...AFTER_SALE_TYPES]
}

export function createAfterSale({ orderId, type, reason, description, goodsList, images }) {
  const order = getOrderById(orderId)
  if (!order) return { ok: false, message: '订单不存在' }
  if (!['待发货', '待收货', '已完成'].includes(order.status)) {
    return { ok: false, message: '当前订单状态不可申请售后' }
  }
  if (getActiveAfterSale(orderId)) {
    return { ok: false, message: '该订单已有进行中的售后' }
  }
  const types = availableTypes(order)
  if (!types.includes(type)) {
    return { ok: false, message: '当前订单不支持该售后类型' }
  }
  const lines = (goodsList || [])
    .map((item) => ({
      ...item,
      qty: Math.max(1, Number(item.qty) || 1),
    }))
    .filter((item) => item.goodsId)
  if (!lines.length) return { ok: false, message: '请选择售后商品' }
  if (!reason) return { ok: false, message: '请选择售后原因' }

  const photos = (images || []).filter((url) => typeof url === 'string' && url).slice(0, 6)
  const refundAmount = type === '换货' ? 0 : lines.reduce((sum, item) => sum + item.price * item.qty, 0)
  const createdAt = nowText()
  const ticket = {
    id: `AS${Date.now()}`,
    afterSaleNo: nextNo(),
    orderId: order.id,
    orderNo: order.orderNo,
    shopName: lines[0]?.shopName || order.goodsList?.[0]?.shopName || '',
    type,
    reason,
    description: (description || '').trim(),
    images: photos,
    refundAmount,
    goodsList: lines,
    status: '待审核',
    prevOrderStatus: order.status,
    createdAt,
    returnExpressNo: '',
    returnExpressName: '顺丰速运',
    logs: [`${createdAt} 买家提交售后申请（${type}）。`, '等待商家审核。'],
  }
  tickets.value.unshift(ticket)
  persist()
  markOrderAfterSale(order.id, {
    afterSaleId: ticket.id,
    log: `${createdAt} 买家申请售后，单号 ${ticket.afterSaleNo}。`,
  })
  return { ok: true, ticket }
}

export function cancelAfterSale(id) {
  const ticket = getAfterSaleById(id)
  if (!ticket || ticket.status !== '待审核') return null
  const time = nowText()
  ticket.status = '已取消'
  ticket.logs.push(`${time} 买家取消售后申请。`)
  persist()
  finishOrderAfterSale(ticket.orderId, {
    nextStatus: ticket.prevOrderStatus,
    log: `${time} 售后已取消。`,
  })
  return ticket
}

export function approveAfterSale(id) {
  const ticket = getAfterSaleById(id)
  if (!ticket || ticket.status !== '待审核') return null
  const time = nowText()
  ticket.status = ticket.type === '退货退款' || ticket.type === '换货' ? '待退货' : '处理中'
  ticket.logs = ticket.logs.filter((line) => line !== '等待商家审核。')
  ticket.logs.push(
    ticket.status === '待退货'
      ? `${time} 商家已同意售后，请寄回商品。`
      : `${time} 商家已同意售后，正在处理退款。`,
  )
  persist()
  return ticket
}

export function rejectAfterSale(id, remark = '不符合售后条件') {
  const ticket = getAfterSaleById(id)
  if (!ticket || !ACTIVE_STATUSES.includes(ticket.status)) return null
  const time = nowText()
  ticket.status = '已拒绝'
  ticket.logs.push(`${time} 商家拒绝售后：${remark}。`)
  persist()
  finishOrderAfterSale(ticket.orderId, {
    nextStatus: ticket.prevOrderStatus,
    log: `${time} 售后被拒绝，订单恢复原状态。`,
  })
  return ticket
}

export function submitReturnExpress(id, expressNo) {
  const ticket = getAfterSaleById(id)
  if (!ticket || ticket.status !== '待退货') return { ok: false, message: '当前状态不可填写退货物流' }
  const no = String(expressNo || '').trim()
  if (!no) return { ok: false, message: '请填写退货快递单号' }
  const time = nowText()
  ticket.returnExpressNo = no
  ticket.status = '处理中'
  ticket.logs.push(`${time} 买家已寄回商品，运单号 ${no}。`)
  persist()
  return { ok: true, ticket }
}

export function completeAfterSale(id) {
  const ticket = getAfterSaleById(id)
  if (!ticket || ticket.status !== '处理中') return null
  const time = nowText()
  ticket.status = '已完成'
  ticket.logs.push(
    ticket.type === '换货'
      ? `${time} 换货已完成。`
      : `${time} 退款已原路返回 ¥${ticket.refundAmount}。`,
  )
  persist()
  const nextStatus = ticket.type === '换货' ? '已完成' : '已取消'
  finishOrderAfterSale(ticket.orderId, {
    nextStatus,
    log: `${time} 售后完成（${ticket.type}）。`,
  })
  return ticket
}

export function useAfterSales() {
  const pendingCount = computed(
    () => tickets.value.filter((item) => ACTIVE_STATUSES.includes(item.status)).length,
  )

  return {
    tickets,
    pendingCount,
    getAfterSaleById,
    getAfterSaleByOrderId,
    getActiveAfterSale,
    availableTypes,
    createAfterSale,
    cancelAfterSale,
    approveAfterSale,
    rejectAfterSale,
    submitReturnExpress,
    completeAfterSale,
  }
}
