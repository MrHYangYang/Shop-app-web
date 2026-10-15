import axios from 'axios'
import { showToast } from 'vant'
import router from '@/router'

const TOKEN_KEY = 'shop-app-token'
const USER_KEY = 'shop-app-user'

export function getToken() {
  return localStorage.getItem(TOKEN_KEY) || ''
}

export function getUser() {
  try { return JSON.parse(localStorage.getItem(USER_KEY) || 'null') } catch { return null }
}

export function setAuth(token, user) {
  if (token) localStorage.setItem(TOKEN_KEY, token)
  if (user) localStorage.setItem(USER_KEY, JSON.stringify(user))
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new Event('shop-app-auth-updated'))
  }
}

export function clearAuth() {
  localStorage.removeItem(TOKEN_KEY)
  localStorage.removeItem(USER_KEY)
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new Event('shop-app-auth-cleared'))
  }
}

const request = axios.create({ baseURL: import.meta.env.VITE_API_BASE_URL || '/', timeout: 20000 })

request.interceptors.request.use((config) => {
  const token = getToken()
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

request.interceptors.response.use(
  (res) => {
    const body = res.data
    if (body && typeof body.success === 'boolean') {
      if (body.success) return body.data
      showToast(body.msg || '请求失败')
      if (body.status === 401) {
        clearAuth()
        router.push({ path: '/login', query: { redirect: router.currentRoute.value.fullPath } })
      }
      return Promise.reject(new Error(body.msg || 'fail'))
    }
    return body
  },
  (err) => {
    const msg = err?.response?.data?.msg || err.message || '网络异常'
    if (err?.response?.status === 401) {
      clearAuth()
      router.push('/login')
    }
    showToast(msg)
    return Promise.reject(err)
  },
)

export default request
