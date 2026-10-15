<script setup>
import { computed, nextTick, onMounted, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { categories, categoryBanners, fetchGoods, loadCategories, loadBanners } from '@/composables/useGoods'
import GoodsCard from '@/components/GoodsCard.vue'

defineOptions({ name: 'Category' })
const route = useRoute()
const router = useRouter()
const active = ref('')
const tabsRef = ref(null)
const list = ref([])
const current = computed(() => categories.value.find((item) => item.name === active.value) || categories.value[0] || { name: '', color: '#4d7cff' })
const heroBg = computed(() => `linear-gradient(135deg, ${current.value.color || '#4d7cff'} 0%, ${current.value.color || '#4d7cff'}cc 100%)`)
const scrollActiveIntoView = () => {
  nextTick(() => {
    const wrap = tabsRef.value
    const chip = wrap?.querySelector('.cat-chip.active')
    chip?.scrollIntoView({ inline: 'center', block: 'nearest', behavior: 'smooth' })
  })
}
const onSelect = (name) => {
  active.value = name
  const hit = categories.value.find((c) => c.name === name)
  const query = { name }
  if (hit?.id != null) query.categoryId = String(hit.id)
  router.replace({ path: '/category', query })
}
const goSearch = () => router.push('/search')
const loadList = async () => {
  if (!current.value?.id && !active.value) { list.value = []; return }
  const data = await fetchGoods({ page: 1, size: 50, categoryId: current.value.id })
  list.value = data.records || []
}
watch(active, () => { scrollActiveIntoView(); loadList() })
const goBanner = (item) => {
  if (item?.link) {
    if (String(item.link).startsWith('http')) window.location.href = item.link
    else router.push(item.link)
    return
  }
}
const syncActiveFromRoute = () => {
  const categoryId = route.query.categoryId
  if (categoryId != null && categoryId !== '') {
    const hit = categories.value.find((c) => String(c.id) === String(categoryId))
    if (hit) {
      active.value = hit.name
      return
    }
  }
  const name = route.query.name || route.query.category
  if (name) {
    active.value = String(name)
    return
  }
  if (!active.value) active.value = categories.value[0]?.name || ''
}

watch(
  () => [route.query.name, route.query.category, route.query.categoryId],
  () => {
    if (!route.path.startsWith('/category')) return
    syncActiveFromRoute()
  },
)

onMounted(async () => {
  await Promise.all([loadCategories(), loadBanners('分类页')])
  syncActiveFromRoute()
  await loadList()
})
</script>

<template>
  <div class="category">
    <van-nav-bar title="全部分类" />
    <h2 class="pc-title">全部分类</h2>
    <div ref="tabsRef" class="cat-tabs">
      <button
        v-for="item in categories"
        :key="item.id || item.name"
        class="cat-chip"
        type="button"
        :class="{ active: active === item.name }"
        :style="{ '--cat-color': item.color, '--cat-soft': (item.color || '#4d7cff') + '22' }"
        @click="onSelect(item.name)"
      >
        <span class="chip-icon">{{ item.emoji || item.icon || '📦' }}</span>
        <em>{{ item.name }}</em>
      </button>
    </div>
    <section class="panel">
      <van-swipe v-if="categoryBanners.length" class="cat-banners" :autoplay="3800" indicator-color="#fff">
        <van-swipe-item v-for="item in categoryBanners" :key="item.id" @click="goBanner(item)">
          <div class="cat-banner" :style="item.image ? { backgroundImage: 'url(' + item.image + ')' } : { background: heroBg }">
            <p>{{ item.subtitle || '精选好物' }}</p>
            <h3>{{ item.title || current.name }}</h3>
          </div>
        </van-swipe-item>
      </van-swipe>
      <div v-if="!categoryBanners.length" class="hero" :style="{ background: heroBg }">
        <span class="hero-icon">{{ current.emoji || current.icon || '📦' }}</span>
        <div>
          <h3>{{ current.name }}</h3>
          <p>精选好物，尽情挑选</p>
        </div>
      </div>
      <div v-if="list.length" class="grid">
        <GoodsCard v-for="item in list" :key="item.id" :goods="item" />
      </div>
      <van-empty v-else description="该分类暂无商品" />
    </section>
    <button class="search-fab" type="button" aria-label="搜索" :style="{ background: heroBg }" @click="goSearch">
      <van-icon name="search" />
    </button>
  </div>
</template>

<style scoped>
.category { min-height: calc(100vh - 50px); padding-bottom: 16px; }
.cat-tabs {
  display: flex; gap: 8px; overflow-x: auto; padding: 12px 16px;
  background: #fff; position: sticky; top: 0; z-index: 5;
}
.cat-chip {
  flex: 0 0 auto; display: flex; align-items: center; gap: 6px;
  border: 0; border-radius: 999px; padding: 8px 12px; background: var(--cat-soft, #eef2ff);
  color: #4a5160;
}
.cat-chip.active { background: var(--cat-color, #4d7cff); color: #fff; }
.chip-icon { font-size: 16px; }
.cat-chip em { font-style: normal; font-size: 13px; }
.panel { padding: 12px 16px; }
.cat-banners { margin-bottom: 12px; border-radius: 16px; overflow: hidden; }
.cat-banner {
  height: 120px; padding: 18px; color: #fff;
  background: linear-gradient(135deg, #4d7cff, #7c5cff);
  background-size: cover; background-position: center;
}
.cat-banner p { margin: 0; opacity: .9; font-size: 13px; }
.cat-banner h3 { margin: 8px 0 0; font-size: 20px; }
.hero {
  display: flex; align-items: center; gap: 12px; color: #fff;
  border-radius: 16px; padding: 16px; margin-bottom: 12px;
}
.hero-icon { font-size: 28px; }
.hero h3 { margin: 0 0 4px; }
.hero p { margin: 0; opacity: .9; font-size: 13px; }
.grid { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
.search-fab {
  position: fixed; right: 16px; bottom: 72px; width: 48px; height: 48px;
  border: 0; border-radius: 50%; color: #fff; box-shadow: 0 8px 20px rgba(77,124,255,.35);
}
@media (min-width: 960px) {
  .category { width: min(var(--app-max), calc(100% - 48px)); margin: 0 auto; }
  .grid { grid-template-columns: repeat(4, 1fr); }
}
</style>
