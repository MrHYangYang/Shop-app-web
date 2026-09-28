import { computed, ref } from 'vue'

const STORAGE_KEY = 'shop-app-cart'

const readCart = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

const items = ref(readCart())

const persist = () => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(items.value))
}

const count = computed(() => items.value.length)
const selectedItems = computed(() => items.value.filter((item) => item.selected))
const selectedCount = computed(() => selectedItems.value.reduce((sum, item) => sum + item.qty, 0))
const selectedAmount = computed(() =>
  selectedItems.value.reduce((sum, item) => sum + item.price * item.qty, 0),
)
const allSelected = computed(() => items.value.length > 0 && items.value.every((item) => item.selected))

export function addToCart(goods, { qty = 1, spec = '标准版' } = {}) {
  const nextQty = Math.max(1, Number(qty) || 1)
  const exist = items.value.find((item) => item.goodsId === goods.id && item.spec === spec)
  if (exist) {
    exist.qty += nextQty
    exist.selected = true
  } else {
    items.value.unshift({
      goodsId: goods.id,
      name: goods.name,
      image: goods.image,
      price: goods.salePrice || goods.price,
      shopName: goods.shopName,
      spec,
      qty: nextQty,
      selected: true,
    })
  }
  persist()
}

const BUY_NOW_KEY = 'shop-app-buynow'

const readBuyNow = () => {
  try {
    const raw = sessionStorage.getItem(BUY_NOW_KEY)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

const buyNowItems = ref(readBuyNow())

const persistBuyNow = () => {
  if (buyNowItems.value.length) {
    sessionStorage.setItem(BUY_NOW_KEY, JSON.stringify(buyNowItems.value))
  } else {
    sessionStorage.removeItem(BUY_NOW_KEY)
  }
}

const toLine = (goods, qty, spec) => ({
  goodsId: goods.id,
  name: goods.name,
  image: goods.image,
  price: goods.salePrice || goods.price,
  shopName: goods.shopName,
  spec,
  qty,
  selected: true,
})

export function prepareBuyNow(goods, { qty = 1, spec = '标准版' } = {}) {
  buyNowItems.value = [toLine(goods, Math.max(1, Number(qty) || 1), spec)]
  persistBuyNow()
}

export function clearBuyNow() {
  buyNowItems.value = []
  persistBuyNow()
}

const checkoutItems = computed(() => (buyNowItems.value.length ? buyNowItems.value : selectedItems.value))
const checkoutAmount = computed(() =>
  checkoutItems.value.reduce((sum, item) => sum + item.price * item.qty, 0),
)

export function updateCheckoutQty(goodsId, spec, qty) {
  const nextQty = Math.max(1, Number(qty) || 1)
  if (buyNowItems.value.length) {
    const item = buyNowItems.value.find((row) => row.goodsId === goodsId && row.spec === spec)
    if (!item) return
    item.qty = nextQty
    persistBuyNow()
    return
  }
  updateQty(goodsId, spec, nextQty)
}

export function completeCheckout() {
  if (!buyNowItems.value.length) {
    clearSelected()
  }
  clearBuyNow()
}

export function updateQty(goodsId, spec, qty) {
  const item = items.value.find((row) => row.goodsId === goodsId && row.spec === spec)
  if (!item) return
  item.qty = Math.max(1, qty)
  persist()
}

export function removeItem(goodsId, spec) {
  items.value = items.value.filter((item) => !(item.goodsId === goodsId && item.spec === spec))
  persist()
}

export function toggleItem(goodsId, spec) {
  const item = items.value.find((row) => row.goodsId === goodsId && row.spec === spec)
  if (!item) return
  item.selected = !item.selected
  persist()
}

export function toggleAll(checked) {
  items.value.forEach((item) => {
    item.selected = checked
  })
  persist()
}

export function clearSelected() {
  items.value = items.value.filter((item) => !item.selected)
  persist()
}

export function useCart() {
  return {
    items,
    count,
    selectedItems,
    selectedCount,
    selectedAmount,
    allSelected,
    addToCart,
    prepareBuyNow,
    clearBuyNow,
    checkoutItems,
    checkoutAmount,
    updateCheckoutQty,
    completeCheckout,
    updateQty,
    removeItem,
    toggleItem,
    toggleAll,
    clearSelected,
  }
}
