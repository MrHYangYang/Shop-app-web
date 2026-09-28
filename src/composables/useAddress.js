import { computed, ref } from 'vue'

const STORAGE_KEY = 'shop-app-address'

const seed = [
  {
    id: 'A1001',
    name: '陈浩然',
    phone: '13800000000',
    region: '上海市黄浦区',
    detail: '南京东路88号',
    isDefault: true,
  },
  {
    id: 'A1002',
    name: '李思远',
    phone: '15800001111',
    region: '杭州市西湖区',
    detail: '文三路120号',
    isDefault: false,
  },
]

const readList = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : seed
  } catch {
    return seed
  }
}

const addresses = ref(readList())

const persist = () => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(addresses.value))
}

const defaultAddress = computed(() => addresses.value.find((item) => item.isDefault) || addresses.value[0] || null)

const nextId = () => {
  const nums = addresses.value.map((item) => Number(String(item.id).replace(/\D/g, '')) || 1000)
  return `A${Math.max(1000, ...nums) + 1}`
}

export function getAddressById(id) {
  return addresses.value.find((item) => item.id === id) || null
}

export function saveAddress(payload) {
  const isDefault = Boolean(payload.isDefault) || addresses.value.length === 0
  if (isDefault) {
    addresses.value.forEach((item) => {
      item.isDefault = false
    })
  }
  if (payload.id) {
    const index = addresses.value.findIndex((item) => item.id === payload.id)
    if (index >= 0) {
      addresses.value[index] = { ...addresses.value[index], ...payload, isDefault }
    }
  } else {
    addresses.value.unshift({
      id: nextId(),
      name: payload.name,
      phone: payload.phone,
      region: payload.region,
      detail: payload.detail,
      isDefault,
    })
  }
  persist()
}

export function removeAddress(id) {
  const wasDefault = addresses.value.find((item) => item.id === id)?.isDefault
  addresses.value = addresses.value.filter((item) => item.id !== id)
  if (wasDefault && addresses.value[0]) addresses.value[0].isDefault = true
  persist()
}

export function setDefaultAddress(id) {
  addresses.value.forEach((item) => {
    item.isDefault = item.id === id
  })
  persist()
}

export function useAddress() {
  return {
    addresses,
    defaultAddress,
    getAddressById,
    saveAddress,
    removeAddress,
    setDefaultAddress,
  }
}
