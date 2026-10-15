import { computed, ref } from 'vue'
import * as api from '@/api'
import { getToken } from '@/utils/request'

const items = ref([])
const buyNow = ref(null)

const mapItem = (raw) => {
  const cart = raw?.cart || raw || {}
  const goods = raw?.goods || {}
  const qty = Number(cart.qty ?? cart.quantity ?? raw.quantity ?? 1) || 1
  const goodsId = cart.goodsId ?? goods.id ?? raw.goodsId
  const skuName = cart.skuName || raw.skuName || raw.spec || '标准版'
  return {
    id: cart.id ?? raw.id,
    goodsId,
    skuId: cart.skuId ?? raw.skuId,
    name: goods.name || raw.goodsName || raw.name || '',
    image: goods.coverImage || raw.goodsImage || raw.image || '',
    price: Number(goods.salePrice ?? raw.price ?? raw.salePrice ?? 0),
    stock: Number(goods.stock ?? raw.stock ?? 99),
    shopName: raw.shopName || goods.shopName || '',
    spec: skuName,
    skuName,
    selected: (cart.selected ?? raw.selected ?? 1) !== 0,
    quantity: qty,
    qty,
  }
}

export async function loadCart() {
  if (!getToken()) { items.value = []; return items.value }
  const list = (await api.getCart()) || []
  items.value = list.map(mapItem)
  return items.value
}

export async function addToCart(payload) {
  await api.addCart({
    goodsId: payload.goodsId,
    skuName: payload.spec || payload.skuName || '标准版',
    qty: payload.quantity || payload.qty || 1,
  })
  await loadCart()
}

export function prepareBuyNow(payload) {
  buyNow.value = mapItem({
    goodsId: payload.goodsId,
    skuId: payload.skuId,
    goodsName: payload.name,
    name: payload.name,
    goodsImage: payload.image,
    image: payload.image,
    price: payload.price,
    salePrice: payload.price,
    stock: payload.stock,
    shopName: payload.shopName,
    skuName: payload.spec || payload.skuName || '标准版',
    quantity: payload.quantity || payload.qty || 1,
    qty: payload.quantity || payload.qty || 1,
    selected: 1,
  })
}

export function clearBuyNow() { buyNow.value = null }

export async function updateQty(goodsId, spec, quantity) {
  const item = items.value.find((i) => String(i.goodsId) === String(goodsId) && i.spec === spec)
  if (!item?.id) return
  await api.updateCart(item.id, { qty: quantity })
  await loadCart()
}

export async function removeItem(goodsId, spec) {
  const item = items.value.find((i) => String(i.goodsId) === String(goodsId) && i.spec === spec)
  if (!item?.id) return
  await api.deleteCart(item.id)
  await loadCart()
}

export async function toggleItem(goodsId, spec) {
  const item = items.value.find((i) => String(i.goodsId) === String(goodsId) && i.spec === spec)
  if (!item) return
  const next = !item.selected
  item.selected = next
  if (item.id) {
    try { await api.updateCart(item.id, { selected: next ? 1 : 0 }) } catch (e) { /* ignore */ }
  }
}

export async function toggleAll(val) {
  items.value.forEach((i) => { i.selected = val })
  await Promise.all(items.value.filter((i) => i.id).map((i) => api.updateCart(i.id, { selected: val ? 1 : 0 }).catch(() => {})))
}

export async function completeCheckout() {
  const targets = buyNow.value ? [] : items.value.filter((i) => i.selected && i.id)
  clearBuyNow()
  for (const item of targets) {
    try { await api.deleteCart(item.id) } catch (e) { /* ignore */ }
  }
  if (targets.length) await loadCart()
}

export function updateCheckoutQty(goodsId, spec, quantity) {
  if (buyNow.value && String(buyNow.value.goodsId) === String(goodsId)) {
    buyNow.value.quantity = quantity
    buyNow.value.qty = quantity
    return
  }
  updateQty(goodsId, spec, quantity)
}

export function useCart() {
  const count = computed(() => items.value.filter((i) => i.selected).length)
  const allSelected = computed(() => items.value.length > 0 && items.value.every((i) => i.selected))
  const selectedItems = computed(() => items.value.filter((i) => i.selected))
  const selectedCount = computed(() => selectedItems.value.reduce((s, i) => s + i.quantity, 0))
  const selectedAmount = computed(() => selectedItems.value.reduce((s, i) => s + Number(i.price) * i.quantity, 0))
  const checkoutItems = computed(() => (buyNow.value ? [buyNow.value] : selectedItems.value))
  const checkoutAmount = computed(() => checkoutItems.value.reduce((s, i) => s + Number(i.price) * i.quantity, 0))
  return {
    items, count, allSelected, selectedCount, selectedAmount, checkoutItems, checkoutAmount,
    loadCart, addToCart, prepareBuyNow, clearBuyNow, updateQty, removeItem, toggleItem, toggleAll,
    completeCheckout, updateCheckoutQty,
  }
}
