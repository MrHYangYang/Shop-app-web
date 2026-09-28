import { computed, ref } from 'vue'

const STORAGE_KEY = 'shop-app-user'
const USERS_KEY = 'shop-app-users'

const demoUser = {
  name: '陈浩然',
  phone: '13800000000',
  password: '123456',
  avatar: '',
  gender: '男',
}

const readJson = (key, fallback) => {
  try {
    const raw = localStorage.getItem(key)
    return raw ? JSON.parse(raw) : fallback
  } catch {
    return fallback
  }
}

const user = ref(readJson(STORAGE_KEY, null))
const users = ref(readJson(USERS_KEY, [demoUser]))

const persist = () => {
  if (user.value) localStorage.setItem(STORAGE_KEY, JSON.stringify(user.value))
  else localStorage.removeItem(STORAGE_KEY)
  localStorage.setItem(USERS_KEY, JSON.stringify(users.value))
}

const isLogin = computed(() => Boolean(user.value))

export function login({ phone, password }) {
  const found = users.value.find((item) => item.phone === phone && item.password === password)
  if (!found) return { ok: false, message: '账号或密码错误' }
  user.value = { name: found.name, phone: found.phone, avatar: found.avatar || '', gender: found.gender || '男' }
  persist()
  return { ok: true }
}

export function register({ name, phone, password }) {
  if (users.value.some((item) => item.phone === phone)) {
    return { ok: false, message: '该手机号已注册' }
  }
  const next = { name, phone, password, avatar: '', gender: '男' }
  users.value.push(next)
  user.value = { name, phone, avatar: '', gender: '男' }
  persist()
  return { ok: true }
}

export function logout() {
  user.value = null
  persist()
}

export function updateProfile(payload) {
  if (!user.value) return
  user.value = { ...user.value, ...payload }
  const index = users.value.findIndex((item) => item.phone === user.value.phone)
  if (index >= 0) {
    users.value[index] = { ...users.value[index], ...payload }
  }
  persist()
}

export function useUser() {
  return {
    user,
    isLogin,
    login,
    register,
    logout,
    updateProfile,
  }
}
