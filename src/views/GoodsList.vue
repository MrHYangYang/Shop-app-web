<script setup>
import { computed, onMounted, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { categories, fetchGoods, loadCategories, loadBanners } from '@/composables/useGoods'
import GoodsCard from '@/components/GoodsCard.vue'
import { normalizeSearchKeyword } from '@/utils/search'

const route = useRoute()
const router = useRouter()
const list = ref([])
const page = ref(1)
const pageSize = 10
const loading = ref(false)
const finished = ref(false)
const listKey = ref(0)
const pageBanners = ref([])

const titleMap = { hot: '热销爆款', new: '新品速递', renew: '精选推荐' }
const title = computed(() => {
  if (route.query.keyword) return '搜索：' + route.query.keyword
  if (route.query.category) return route.query.category
  return titleMap[route.query.tag] || '全部商品'
})
/** 热销/新品更多页不展示任何标签 */
const hideAllTags = computed(() => route.query.tag === 'hot' || route.query.tag === 'new')

const buildParams = (p) => {
  const kw = normalizeSearchKeyword(route.query.keyword)
  const params = {
    page: p,
    size: pageSize,
    keyword: kw || undefined,
    // 更多页全量分页，禁止随机
    random: 0,
  }
  if (route.query.tag === 'hot') params.hot = 1
  if (route.query.tag === 'new') params.isNew = 1
  if (route.query.tag === 'renew') params.recommend = 1
  if (route.query.categoryId) params.categoryId = Number(route.query.categoryId)
  else if (route.query.category) {
    const hit = categories.value.find((c) => c.name === route.query.category)
    if (hit) params.categoryId = hit.id
    else {
      // 分类名未命中时也走模糊关键词搜索
      const fallback = normalizeSearchKeyword(route.query.category)
      if (fallback) params.keyword = fallback
    }
  }
  return params
}

const onLoad = async () => {
  if (finished.value) {
    loading.value = false
    return
  }
  loading.value = true
  try {
    const cur = page.value
    const data = await fetchGoods(buildParams(cur))
    const records = data.records || []
    if (cur <= 1) {
      list.value = records
    } else {
      const seen = new Set(list.value.map((g) => String(g.id)))
      for (const g of records) {
        if (!seen.has(String(g.id))) {
          seen.add(String(g.id))
          list.value.push(g)
        }
      }
    }
    const total = Number(data.total || 0)
    if (!records.length || list.value.length >= total) {
      finished.value = true
    } else {
      page.value = cur + 1
    }
  } catch (e) {
    finished.value = true
  } finally {
    loading.value = false
  }
}

const goBanner = (item) => {
  if (item?.link) {
    if (String(item.link).startsWith('http')) window.location.href = item.link
    else router.push(item.link)
  }
}

const loadPageBanners = async () => {
  pageBanners.value = []
  if (route.query.tag === 'new') {
    pageBanners.value = (await loadBanners('新品速递页')) || []
  } else if (route.query.tag === 'hot') {
    pageBanners.value = (await loadBanners('热销爆款页')) || []
  }
}

const resetAndLoad = async () => {
  list.value = []
  page.value = 1
  finished.value = false
  loading.value = false
  await loadCategories()
  await loadPageBanners()
  listKey.value += 1
  await onLoad()
}

watch(() => route.query, resetAndLoad, { deep: true })
onMounted(resetAndLoad)
</script>

<template>
  <div class="page">
    <van-nav-bar :title="title" left-arrow @click="router.back()" />
    <h2 class="pc-title">{{ title }}</h2>
    <van-swipe v-if="pageBanners.length" class="page-banners" :autoplay="3800" indicator-color="#fff">
      <van-swipe-item v-for="item in pageBanners" :key="item.id" @click="goBanner(item)">
        <div class="page-banner" :style="item.image ? { backgroundImage: 'url(' + item.image + ')' } : {}">
          <p>{{ item.subtitle || title }}</p>
          <h3>{{ item.title || title }}</h3>
        </div>
      </van-swipe-item>
    </van-swipe>
    <van-list
      :key="listKey"
      v-model:loading="loading"
      :finished="finished"
      finished-text="没有更多了"
      :immediate-check="false"
      @load="onLoad"
    >
      <div v-if="list.length" class="grid goods-grid">
        <GoodsCard v-for="item in list" :key="item.id" :goods="item" :hide-tags="hideAllTags" />
      </div>
      <van-empty v-else-if="finished && !list.length" description="没有找到相关商品" />
    </van-list>
  </div>
</template>

<style scoped>
.page { min-height: 100vh; }
.page-banners { margin: 12px 12px 0; border-radius: 16px; overflow: hidden; }
.page-banner {
  height: 120px; padding: 18px; color: #fff;
  background: linear-gradient(135deg, #4d7cff, #7c5cff);
  background-size: cover; background-position: center;
}
.page-banner p { margin: 0; opacity: .9; font-size: 13px; }
.page-banner h3 { margin: 8px 0 0; font-size: 20px; }
.grid { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; padding: 12px; }
@media (min-width: 640px) { .grid { grid-template-columns: repeat(3, 1fr); } }
@media (min-width: 960px) {
  .page { width: min(var(--app-max), calc(100% - 48px)); margin: 0 auto; padding-bottom: 40px; }
  .grid { padding: 0 0 24px; gap: 16px; grid-template-columns: repeat(4, 1fr); }
}
</style>