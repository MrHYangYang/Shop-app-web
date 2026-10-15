<script setup>
import { nextTick, onActivated, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useGoods } from '@/composables/useGoods'
import GoodsCard from '@/components/GoodsCard.vue'

defineOptions({ name: 'Home' })
const router = useRouter()
const {
  banners, homeMidBanners, categories, hotGoods, newGoods, recommendGoods,
  loadHomeBanners, loadCategories, loadHomeGoods, loadRecommendGoods,
} = useGoods()

const recListRef = ref(null)
const recPage = ref(1)
const recSize = 12
const recLoading = ref(false)
const recFinished = ref(false)
const homeReady = ref(false)
let recInFlight = false

const scheduleListCheck = async () => {
  await nextTick()
  recListRef.value?.check?.()
}

const goSearch = () => router.push('/search')
const goBanner = (item) => {
  if (item?.link) {
    if (String(item.link).startsWith('http')) window.location.href = item.link
    else router.push(item.link)
    return
  }
  router.push({ path: '/goods', query: { tag: 'hot' } })
}
const goCategory = (item) => router.push({ path: '/goods', query: { categoryId: item.id, category: item.name } })

// van-list sets loading=true before @load; do NOT short-circuit on recLoading
const onLoadRecommend = async () => {
  if (!homeReady.value || recFinished.value || recInFlight) {
    recLoading.value = false
    return
  }
  recInFlight = true
  recLoading.value = true
  try {
    const next = recPage.value
    const data = await loadRecommendGoods(next, recSize, next === 1)
    const got = (data.records || []).length
    // 请求成功后翻页；结束与否看 total/loaded
    if (got > 0) {
      recPage.value = next + 1
    }
    recFinished.value = !!data.finished || got === 0
  } catch (e) {
    console.warn('recommend load failed', e)
  } finally {
    recInFlight = false
    recLoading.value = false
    if (!recFinished.value) {
      scheduleListCheck()
    }
  }
}

onMounted(async () => {
  await Promise.all([loadHomeBanners(), loadCategories(), loadHomeGoods()])
  homeReady.value = true
  await nextTick()
  await onLoadRecommend()
})

onActivated(() => {
  if (homeReady.value && !recFinished.value) {
    scheduleListCheck()
  }
})
</script>

<template>
  <div class="home">
    <header class="hero">
      <div class="brand">
        <img src="/favicon.svg" alt="智选好物" />
        <div>
          <strong>智选好物</strong>
          <span>精选数码好物</span>
        </div>
      </div>
      <div class="search" @click="goSearch">
        <van-icon name="search" />
        <span>模糊搜索名称/品牌/型号</span>
      </div>
    </header>

    <van-swipe v-if="banners.length" class="banners" :autoplay="3800" indicator-color="#fff">
      <van-swipe-item v-for="item in banners" :key="item.id" @click="goBanner(item)">
        <div class="banner" :style="item.image ? { backgroundImage: 'url(' + item.image + ')' } : {}">
          <p>{{ item.subtitle || item.position || '精选推荐' }}</p>
          <h2>{{ item.title || '智选好物' }}</h2>
          <span>立即选购</span>
        </div>
      </van-swipe-item>
    </van-swipe>

    <section class="cats">
      <button v-for="item in categories" :key="item.id" type="button" class="cat-item" @click="goCategory(item)">
        <span class="cat-icon" :style="{ background: (item.color || '#4d7cff') + '18', color: item.color || '#4d7cff' }">
          <span class="cat-emoji">{{ item.emoji || item.icon || '📦' }}</span>
        </span>
        <em class="cat-label">{{ item.name }}</em>
      </button>
    </section>

    <van-swipe v-if="homeMidBanners.length" class="banners mid-banners" :autoplay="3800" indicator-color="#fff">
      <van-swipe-item v-for="item in homeMidBanners" :key="'mid-' + item.id" @click="goBanner(item)">
        <div class="banner mid" :style="item.image ? { backgroundImage: 'url(' + item.image + ')' } : {}">
          <p>{{ item.subtitle || '精选推荐' }}</p>
          <h2>{{ item.title || '数码优选' }}</h2>
          <span>立即选购</span>
        </div>
      </van-swipe-item>
    </van-swipe>

    <section class="block">
      <div class="new-card">
        <div class="block-head">
          <h3>新品速递</h3>
          <router-link to="/goods?tag=new">更多 <van-icon name="arrow" /></router-link>
        </div>
        <div class="new-row">
          <router-link v-for="item in newGoods" :key="item.id" class="new-item" :to="`/goods/${item.id}`">
            <img :src="item.image" :alt="item.name" />
            <strong>{{ item.name }}</strong>
            <span class="price"><em>¥</em>{{ item.price }}</span>
          </router-link>
        </div>
      </div>
    </section>

    <section class="block">
      <div class="new-card">
        <div class="block-head">
          <h3>热销爆款</h3>
          <router-link to="/goods?tag=hot">更多 <van-icon name="arrow" /></router-link>
        </div>
        <div class="new-row">
          <router-link v-for="item in hotGoods" :key="item.id" class="new-item" :to="`/goods/${item.id}`">
            <img :src="item.image" :alt="item.name" />
            <strong>{{ item.name }}</strong>
            <span class="price"><em>¥</em>{{ item.price }}</span>
          </router-link>
        </div>
      </div>
    </section>

    <section class="block">
      <div class="block-head">
        <h3>为你推荐</h3>
      </div>
      <van-list
        ref="recListRef"
        v-if="homeReady"
        v-model:loading="recLoading"
        :finished="recFinished"
        finished-text="没有更多了"
        :immediate-check="false"
        :offset="300"
        @load="onLoadRecommend"
      >
        <div class="grid goods-grid">
          <GoodsCard v-for="item in recommendGoods" :key="item.id" :goods="item" />
        </div>
      </van-list>
    </section>
  </div>
</template>

<style scoped>
.home { padding-bottom: 16px; }
.hero {
  padding: 18px 16px 12px;
  background: linear-gradient(180deg, #5b7cff 0%, #8b6cf6 48%, #f4f7ff 100%);
  color: #fff;
}
.brand { display: flex; align-items: center; gap: 10px; margin-bottom: 14px; }
.brand img { width: 36px; height: 36px; }
.brand strong { display: block; font-size: 16px; }
.brand span { font-size: 12px; opacity: .85; }
.search {
  display: flex; align-items: center; gap: 8px; height: 40px; padding: 0 14px;
  background: rgba(255,255,255,.95); border-radius: 999px; color: #98a0b3; font-size: 13px;
}
.banners { margin: 12px 16px 0; border-radius: 16px; overflow: hidden; }
.mid-banners { margin-top: 12px; }
.banner.mid { height: 110px; }
.banner {
  height: 140px; padding: 20px; color: #fff;
  background: linear-gradient(135deg, #4d7cff, #7c5cff);
  background-size: cover; background-position: center;
}
.banner p { margin: 0; opacity: .9; font-size: 13px; }
.banner h2 { margin: 8px 0 12px; font-size: 22px; }
.banner span {
  display: inline-block; padding: 4px 10px; border-radius: 999px;
  background: rgba(255,255,255,.2); font-size: 12px;
}
.cats {
  display: flex;
  flex-wrap: nowrap;
  gap: 8px;
  overflow-x: auto;
  -webkit-overflow-scrolling: touch;
  scrollbar-width: none;
  padding: 14px 16px;
  background: #fff;
  margin: 12px 16px 0;
  border-radius: 16px;
}
.cats::-webkit-scrollbar { display: none; }
.cat-item {
  flex: 0 0 auto;
  width: 64px;
  border: 0;
  background: transparent;
  padding: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
}
.cat-icon {
  display: flex; align-items: center; justify-content: center;
  width: 48px; height: 48px; margin: 0 auto 6px; border-radius: 14px; font-size: 22px;
}
.cat-emoji { line-height: 1; }
.cat-label {
  font-style: normal;
  font-size: 12px;
  color: #4a5160;
  width: 100%;
  text-align: center;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.block { padding: 16px 16px 0; }
.block-head { display: flex; align-items: center; justify-content: space-between; margin-bottom: 12px; }
.block-head h3 { margin: 0; font-size: 16px; }
.block-head a { color: #98a0b3; font-size: 13px; text-decoration: none; }
.new-card { background: #fff; border-radius: 16px; padding: 14px; }
.new-row { display: grid; grid-template-columns: repeat(4, 1fr); gap: 10px; }
.new-item { text-decoration: none; color: inherit; }
.new-item img { width: 100%; aspect-ratio: 1; border-radius: 10px; object-fit: cover; background: #eef2ff; }
.new-item strong {
  display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical;
  overflow: hidden; margin-top: 6px; font-size: 12px; font-weight: 500;
}
.price { color: #ef4444; font-weight: 600; }
.price em { font-style: normal; font-size: 12px; }
.grid { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
@media (min-width: 960px) {
  .home { width: min(var(--app-max), calc(100% - 48px)); margin: 0 auto; }
  .grid { grid-template-columns: repeat(4, 1fr); }
}
</style>