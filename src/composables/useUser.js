import { computed, ref } from 'vue'
import * as api from '@/api'
import { clearAuth, getToken, getUser, setAuth } from '@/utils/request'
import { loadCart } from '@/composables/useCart'

const token = ref(getToken())
const user = ref(getUser())
const isLogin = computed(() => Boolean(token.value && user.value))

function syncAuthState(nextToken, nextUser) {
  token.value = nextToken || ''
  user.value = nextUser || null
}

/** Hydrate reactive auth from localStorage (keep-alive / 401 sync). */
export function hydrateFromStorage() {
  const t = getToken()
  const u = getUser()
  token.value = t || ''
  if (t && u) {
    user.value = u
  } else if (!t) {
    user.value = null
  }
}

if (typeof window !== 'undefined') {
  window.addEventListener('shop-app-auth-cleared', () => {
    syncAuthState('', null)
  })
  window.addEventListener('shop-app-auth-updated', () => {
    hydrateFromStorage()
  })
}

export function useUser() {
  return { user, isLogin, token }
}

function buildUserFromLogin(data, form) {
  return {
    id: data.userId ?? data.id,
    name: data.name || '',
    phone: data.phone || form.phone || '',
    avatar: data.avatar || '',
    gender: data.gender || '保密',
    token: data.token,
  }
}

function buildUserFromProfile(p) {
  const prev = user.value || {}
  return {
    ...prev,
    id: p.id ?? p.userId ?? prev.id,
    name: p.name ?? prev.name ?? '',
    phone: p.phone ?? prev.phone ?? '',
    avatar: p.avatar ?? prev.avatar ?? '',
    gender: p.gender ?? prev.gender ?? '保密',
    addressText: p.addressText ?? prev.addressText ?? '',
  }
}

export async function login(form) {
  const data = await api.login({
    phone: form.phone,
    password: form.password,
    captchaId: form.captchaId,
    captchaCode: form.captchaCode,
  })
  const u = buildUserFromLogin(data, form)
  setAuth(data.token, u)
  syncAuthState(data.token, u)
  try {
    await refreshProfile()
  } catch (e) {
    /* login state already saved; profile can reload on Mine */
  }
  try {
    await loadCart()
  } catch (e) {
    /* ignore */
  }
  return { ok: true, data }
}

export async function register(form) {
  await api.register({ phone: form.phone, password: form.password, name: form.name })
  return { ok: true }
}

export function logout() {
  clearAuth()
  syncAuthState('', null)
  loadCart().catch(() => {})
}

export async function refreshProfile() {
  const t = getToken()
  if (!t) {
    syncAuthState('', null)
    return null
  }
  token.value = t
  if (!user.value) {
    user.value = getUser()
  }
  const p = await api.getProfile()
  const u = buildUserFromProfile(p || {})
  setAuth(t, u)
  syncAuthState(t, u)
  return u
}

export async function updateProfile(body) {
  const p = await api.updateProfile(body)
  const u = buildUserFromProfile(p || {})
  setAuth(getToken(), u)
  syncAuthState(getToken(), u)
  return u
}

export async function changePassword(body) {
  await api.changePassword(body)
}
