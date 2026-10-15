import { computed, ref } from 'vue'
import * as api from '@/api'

const addresses = ref([])

export async function loadAddresses() {
  addresses.value = (await api.getAddresses()) || []
  return addresses.value
}

export function getAddressById(id) {
  return addresses.value.find((a) => String(a.id) === String(id)) || null
}

export async function saveAddress(form) {
  if (form.id) await api.updateAddress(form.id, form)
  else await api.createAddress(form)
  await loadAddresses()
}

export async function removeAddress(id) {
  await api.deleteAddress(id)
  await loadAddresses()
}

export async function makeDefault(id) {
  await api.setDefaultAddress(id)
  await loadAddresses()
}

export function useAddress() {
  const defaultAddress = computed(() => addresses.value.find((a) => a.isDefault === 1 || a.defaultFlag === 1) || addresses.value[0] || null)
  return { addresses, defaultAddress, loadAddresses, saveAddress, removeAddress, makeDefault, getAddressById }
}
