import { ref } from 'vue'
import * as api from '@/api'

export const categories = ref([])
export const banners = ref([])
export const homeMidBanners = ref([])
export const categoryBanners = ref([])
export const goodsList = ref([])
export const hotGoods = ref([])
export const newGoods = ref([])
export const recommendGoods = ref([])
/** Refresh diversity seed: new on page reset, reused for pagination */
let recommendSeed = 0

const ICON_EMOJI = {
  Box: '📦',
  Iphone: '📱',
  Monitor: '💻',
  Headset: '🎧',
  Camera: '📷',
  Watch: '⌚',
  House: '🏠',
  SetUp: '📚',
}

function mapGoods(g) {
  if (!g) return null
  const rawPrice = g.price ?? g.salePrice ?? 0
  const price = typeof rawPrice === 'number' ? rawPrice : Number(rawPrice) || 0
  return {
    ...g,
    id: g.id,
    name: g.name || '',
    image: g.image || g.coverImage || '',
    coverImage: g.coverImage || g.image || '',
    price,
    sales: Number(g.sales || 0),
    shopName: g.shopName || '',
    recommend: Number(g.recommend) === 1 || g.recommend === true,
    hot: Number(g.hot) === 1 || g.hot === true,
    isNew: Number(g.isNew) === 1 || g.isNew === true,
  }
}

function mapCategory(c) {
  const icon = c.icon || ''
  return {
    ...c,
    emoji: c.emoji || ICON_EMOJI[icon] || (icon && /[\u{1F300}-\u{1FAFF}]/u.test(icon) ? icon : '📦'),
    color: c.color || '#4d7cff',
  }
}

export async function loadCategories() {
  const list = (await api.getCategories()) || []
  // 首页/分类页展示二级分类；若无二级则退回全部启用分类
  const level2 = list.filter((c) => Number(c.level) === 2 && Number(c.enabled) !== 0)
  const source = level2.length ? level2 : list.filter((c) => Number(c.enabled) !== 0)
  categories.value = source.map(mapCategory)
  return categories.value
}

export async function loadBanners(position) {
  const params = position ? { position } : undefined
  const list = (await api.getBanners(params)) || []
  if (position === '分类页' || position === 'category' || position === 'cate') {
    categoryBanners.value = list
  }
  return list
}

export async function loadHomeBanners() {
  const [top, mid] = await Promise.all([
    api.getBanners({ position: '首页顶部' }),
    api.getBanners({ position: '首页中部' }),
  ])
  banners.value = top || []
  homeMidBanners.value = mid || []
  return { banners: banners.value, homeMidBanners: homeMidBanners.value }
}

export async function fetchGoods(params = {}) {
  const data = (await api.getGoods(params)) || {}
  const records = (data.records || []).map(mapGoods).filter(Boolean)
  return { ...data, records }
}

export async function loadHomeGoods() {
  const [hot, neu] = await Promise.all([
    api.getGoods({ page: 1, size: 4, hot: 1, random: 1 }),
    api.getGoods({ page: 1, size: 4, isNew: 1, random: 1 }),
  ])
  hotGoods.value = (hot?.records || []).map(mapGoods).filter(Boolean)
  newGoods.value = (neu?.records || []).map(mapGoods).filter(Boolean)
  return { hotGoods: hotGoods.value, newGoods: newGoods.value }
}

/** Home recommend list via weighted collaborative filtering (/goods/recommend) */
export async function loadRecommendGoods(page = 1, size = 10, reset = false) {
  if (reset || page <= 1 || !recommendSeed) {
    // new seed each full refresh / first page so lists differ; same seed keeps pagination stable
    recommendSeed = (Date.now() ^ (Math.floor(Math.random() * 0x7fffffff))) >>> 0
    if (recommendSeed === 0) recommendSeed = 1
  }
  const data = (await api.getRecommendGoods({ page, size, seed: recommendSeed })) || {}
  const records = (data.records || []).map(mapGoods).filter(Boolean)
  if (reset || page <= 1) {
    recommendGoods.value = records
  } else {
    const seen = new Set(recommendGoods.value.map((g) => String(g.id)))
    const merged = [...recommendGoods.value]
    for (const g of records) {
      if (!seen.has(String(g.id))) {
        seen.add(String(g.id))
        merged.push(g)
      }
    }
    recommendGoods.value = merged
  }
  goodsList.value = [...recommendGoods.value]

  const total = Number(data.total ?? 0)
  const pageNum = Number(data.page || page || 1)
  const pageSize = Number(data.size || size || 10) || size || 10
  const loaded = recommendGoods.value.length
  const got = records.length

  // 以 total / 空页为准；不要仅因本页 < pageSize 就结束（后端可能跳过下架 ID）
  let finished = false
  if (got === 0) {
    finished = true
  } else if (total > 0) {
    finished = loaded >= total || pageNum * pageSize >= total
  } else {
    // 无 total 时：只有空页或明确不足一页才结束
    finished = got < pageSize
  }

  return {
    ...data,
    records,
    total,
    page: pageNum,
    size: pageSize,
    loaded,
    finished,
  }
}

export async function fetchGoodsDetail(id) {
  const data = await api.getGoodsDetail(id)
  const goods = mapGoods(data.goods || data)
  goods.shopName = data.shopName || goods.shopName || ''
  return { ...data, goods, images: data.images || [], skus: data.skus || [], reviews: data.reviews || [] }
}

export async function fetchGoodsReviews(id, params) {
  return api.getGoodsReviews(id, params)
}

export function getGoodsById(id) {
  return goodsList.value.find((g) => String(g.id) === String(id)) || null
}

export function useGoods() {
  return {
    categories, banners, homeMidBanners, categoryBanners, goodsList, hotGoods, newGoods, recommendGoods,
    loadCategories, loadBanners, loadHomeBanners, fetchGoods, loadHomeGoods, loadRecommendGoods, fetchGoodsDetail, fetchGoodsReviews, getGoodsById,
  }
}
